precision highp float;

uniform float uTime;
uniform vec2 uResolution;

varying vec2 vUv;

#define HEX vec2(1., 1.73)

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
    vec2 uv = vUv - 0.5;
    uv.x *= uResolution.x / uResolution.y;

    float t = uTime * 0.5;
    float grid = 12.0 + 3. * sin(0.5*t);
    uv *= grid;

    vec4 h = HexCoords(uv);
    vec2 gv = h.xy;

    // 6-way symmetry
    vec2 p = hexSym(gv);

    // small animated offset using tile id
    p += smoothstep(cos(sin(length(h.wz)) + t), 1.0, 0.1);

    // SDFs
    float d1 = sdMoon(p, 0.4, 0.5, 0.55);
    float d2 = sdBlobbyCross(p * 2.0, 0.9);
    float d  = min(d1, d2);

    float fill    = smoothstep(0.9, -0.9, d);
    float outline = strokeSDF(d, 0.1);

    float hexMask = smoothstep(0.9, -0.91, -HexDist(gv));

    vec3 col = vec3(0.0);
    col += fill * vec3(0.8, 0.4, 0.9);
    col += outline * vec3(1.0, 0.9, 0.2);
    col *= hexMask;

    gl_FragColor = vec4(col, 1.0);
}