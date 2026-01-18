precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uImpact;


varying vec2 vUv;

#define HEX vec2(1., 1.73)

// ------------------------------------------------------------
// Hash & helpers
// ------------------------------------------------------------
float hash(vec2 p) {
    // simple but decent 2D hash
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

vec2 fade(vec2 t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

// ------------------------------------------------------------
// 2D Perlin noise
// ------------------------------------------------------------
float perlinNoise(vec2 p) {
    vec2 pi = floor(p);
    vec2 pf = fract(p);

    // corners
    float a = hash(pi + vec2(0.0, 0.0));
    float b = hash(pi + vec2(1.0, 0.0));
    float c = hash(pi + vec2(0.0, 1.0));
    float d = hash(pi + vec2(1.0, 1.0));

    // gradients (map hash to gradient directions)
    vec2 ga = normalize(vec2(cos(a * 6.2831), sin(a * 6.2831)));
    vec2 gb = normalize(vec2(cos(b * 6.2831), sin(b * 6.2831)));
    vec2 gc = normalize(vec2(cos(c * 6.2831), sin(c * 6.2831)));
    vec2 gd = normalize(vec2(cos(d * 6.2831), sin(d * 6.2831)));

    float va = dot(ga, pf - vec2(0.0, 0.0));
    float vb = dot(gb, pf - vec2(1.0, 0.0));
    float vc = dot(gc, pf - vec2(0.0, 1.0));
    float vd = dot(gd, pf - vec2(1.0, 1.0));

    vec2 w = fade(pf);

    float x1 = mix(va, vb, w.x);
    float x2 = mix(vc, vd, w.x);
    float n  = mix(x1, x2, w.y);

    // map from [-1,1] to [0,1]
    return 0.5 * n + 0.5;
}

// ------------------------------------------------------------
// Anti-aliased step (Shadertoy-safe)
// ------------------------------------------------------------
float aastep(float threshold, float value) {
    float afwidth = 0.7 * length(vec2(dFdx(value), dFdy(value)));
    return smoothstep(threshold - afwidth, threshold + afwidth, value);
}

// ------------------------------------------------------------
// Basic stroke: draws a band around x = size with width w
// ------------------------------------------------------------
float stroke(float x, float size, float w) {
    float d = aastep(size, x + w * 0.5) - aastep(size, x - w * 0.5);
    return clamp(d, 0.0, 1.0);
}

// ------------------------------------------------------------
// Stroke for SDFs: outline around distance = 0
// ------------------------------------------------------------
float strokeSDF(float sdf, float w) {
    return stroke(sdf, 0.0, w);
}

// ------------------------------------------------------------
// Stroke for arbitrary ranges: outline around [a, b]
// ------------------------------------------------------------
float strokeRange(float x, float a, float b, float w) {
    float mid = (a + b) * 0.5;
    float size = (b - a) * 0.5;
    return stroke(x - mid, size, w);
}

float sdMoon(vec2 p, float d, float ra, float rb) {
    p.y = abs(p.y);
    float a = (ra*ra - rb*rb + d*d)/(2.0*d);
    float b = sqrt(max(ra*ra-a*a,0.0));
    if (d*(p.x*b-p.y*a) > d*d*max(b-p.y,0.0))
        return length(p-vec2(a,b));
    return max( (length(p)-ra),
               -(length(p-vec2(d,0.0))-rb));
}

float sdBlobbyCross(in vec2 pos, float he) {
    pos = abs(pos);
    pos = vec2(abs(pos.x-pos.y),1.0-pos.x-pos.y)/sqrt(2.0);

    float p = (he-pos.y-0.25/he)/(6.0*he);
    float q = pos.x/(he*he*16.0);
    float h = q*q - p*p*p;

    float x;
    if (h>0.0) {
        float r = sqrt(h);
        x = pow(q+r,1.0/3.0)-pow(abs(q-r),1.0/3.0)*sign(r-q);
    } else {
        float r = sqrt(p);
        x = 2.0*r*cos(acos(q/(p*r))/3.0);
    }
    x = min(x,sqrt(2.0)/2.0);

    vec2 z = vec2(x,he*(1.0-2.0*x*x)) - pos;
    return length(z) * sign(z.y);
}

float HexDist(vec2 p) {
    p = abs(p);
    float c = dot(p, normalize(HEX));
    c = max(c, p.x);
    return c;
}

vec4 HexCoords(vec2 uv) {
    vec2 r = HEX;
    vec2 h = r * 0.5;

    vec2 a = mod(uv, r) - h;
    vec2 b = mod(uv - h, r) - h;
    vec2 gv = (length(a) < length(b)) ? a : b;
    vec2 id = uv - gv;
    return vec4(gv, id);
}

vec2 rot60(vec2 p) {
    float a = 3.14159265 / 3.0;
    float c = cos(a), s = sin(a);
    return vec2(c*p.x - s*p.y, s*p.x + c*p.y);
}

vec2 hexSym(vec2 p) {
    float angle = atan(p.y, p.x)+sin(uTime);
    float radius = length(p);
    float sector = floor((angle + 3.14159265) / (3.14159265/3.0));
    angle -= sector * (3.14159265/3.0);
    return vec2(cos(angle), sin(angle)) * radius;
}

void main() {
    // --- 1. Centered, aspect-correct UVs ---
    vec2 uv = vUv - 0.5;
    uv.x *= uResolution.x / uResolution.y;

    // --- 2. Global time + breathing grid scale ---
    float t = uTime * 0.5;
    float grid = 12.0 + 3. * sin(0.5 * t);
    uv *= grid;

    // --- 3. Hex tiling: local coords + tile ID ---
    vec4 h = HexCoords(uv);
    vec2 gv = h.xy;
    vec2 id = h.zw;

    // --- 4. Mouse in same space ---
    vec2 m = uMouse - 0.5;
    m.x *= uResolution.x / uResolution.y;

    // --- 5. Distance from tile center to mouse ---
    float dist = length(id - m * grid);

    // --- 6. Falloff: only tiles near mouse grow ---
    float influence = smoothstep(4.5, 0.0, dist);

    // --- 7. Scale tile-local coords (enlarge tile) ---
    float scale = 1.0 + influence * uImpact;
    gv /= scale;

    // --- 8. 6-way symmetry ---
    vec2 p = hexSym(gv);

    // --- 9. Original animated offset ---
    p += smoothstep(cos(sin(length(h.wz)) + t), 1.0, 0.1);

    // --- 10. SDF motif ---
    float d1 = sdMoon(p, 0.4, 0.5, 0.55);
    float d2 = sdBlobbyCross(p * 2.0, 0.9);
    float d  = min(d1, d2);

    // --- 11. Fill + outline ---
    float fill    = smoothstep(0.9, -0.9, d);
    float outline = strokeSDF(d, 0.1);

    // --- 12. Mask to hex tile ---
    float hexMask = smoothstep(0.9, -0.91, -HexDist(gv));

    // --- 13. Color ---
    vec3 col = vec3(0.0);
    col += fill * vec3(0.8, 0.4, 0.9);
    col += outline * vec3(1.0, 0.9, 0.2);
    col *= hexMask;

    gl_FragColor = vec4(col, 1.0);
}