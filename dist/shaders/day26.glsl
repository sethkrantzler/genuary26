precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform int uPattern;

varying vec2 vUv;

#define HEX vec2(1., 1.73)

// ------------------------------------------------------------
// IQ Palette
// ------------------------------------------------------------
vec3 iqPalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(6.28318 * (c * t + d));
}

vec3 palette(float d, vec2 id) {
    vec3 c = vec3(0.74, 0.63, 0.91);
    if (uPattern == 1) {
        c = vec3(0.23, 0.32, 0.43);
    }
    return iqPalette(
        d,
        vec3(0.5),
        vec3(0.5),
        vec3(0.75, 0.25, 1.75),
        c
    );
}


float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

vec2 fade(vec2 t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float perlinNoise(vec2 p) {
    vec2 pi = floor(p);
    vec2 pf = fract(p);

    float a = hash(pi + vec2(0.0, 0.0));
    float b = hash(pi + vec2(1.0, 0.0));
    float c = hash(pi + vec2(0.0, 1.0));
    float d = hash(pi + vec2(1.0, 1.0));

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

    return 0.5 * n + 0.5;
}

float aastep(float threshold, float value) {
    float afwidth = 0.7 * length(vec2(dFdx(value), dFdy(value)));
    return smoothstep(threshold - afwidth, threshold + afwidth, value);
}

float sdfBobblyCross1(vec2 p, float t) {
    

    float v = max(abs(p.x) - 0.15, abs(p.y) - 0.55);
    float h = max(abs(p.x) - 0.55, abs(p.y) - 0.15);
    return min(v, h);
}

float sdfBobblyCross(vec2 p, float t) {
    float wob = 0.;
    float v,h = 0.;
    if (uPattern == 1 ) {
        wob = sin(p.y * 6.0 + t * 3.0) * 0.15;
        p.x *= 2.5*wob;
        p.x /= 10.5*cos(p.x*10.+t); 
        v = max(abs(p.x) - 0.15+0.1*cos(uTime), abs(p.y+0.1*perlinNoise(p)) - 0.55);
        h = max(abs(p.x) - 0.55+0.2*cos(uTime), abs(p.y+0.1*perlinNoise(p)) - 0.15);

    } else {
        wob = sin(p.x * 6.0 + t * 3.0) * 0.15;
        p.y += wob;
        v = max(abs(p.x) - 0.15, abs(p.y) - 0.55);
        h = max(abs(p.x) - 0.55, abs(p.y) - 0.15);
    }
    return min(v, h);
}

float stroke(float x, float size, float w) {
    float d = aastep(size, x + w * 0.5) - aastep(size, x - w * 0.5);
    return clamp(d, 0.0, 1.0);
}

float strokeSDF(float sdf, float w) {
    return stroke(sdf, 0.0, w);
}

// ------------------------------------------------------------
// Recursion sampling
// ------------------------------------------------------------
// Sample the bobbly cross at a given recursion level.
// level = 0 → base 4x4 cell
// level = 1 → that cell subdivided into 4x4 (16x16 overall), etc.
float sampleLevel(int level, vec2 uv, float t) {
    float l = float(level);
    float scale = pow(4.0, l);      // 4^level
    vec2 p = uv * scale;
    vec2 f = fract(p) - 0.5;        // local coords in [-0.5, 0.5]
    return sdfBobblyCross(f, t);
}

void main() {
    vec2 uv = vUv - 0.5;
    uv.x *= uResolution.x / uResolution.y;

    float t = uTime * 0.5;

    // --------------------------------------------------------
    // 1. Base 4x4 grid cell ID (for noise / recursion depth)
    // --------------------------------------------------------
    float baseGrid = 4.0;
    vec2 baseUV = uv * baseGrid;
    vec2 baseId = floor(baseUV);

    // --------------------------------------------------------
    // 2. Noise-driven recursion depth in [0, 3], animated
    // --------------------------------------------------------
    float n = perlinNoise(baseId * 0.37 + t * 0.3);
    float depth = n * 3.0;          // continuous 0..3
    float d0 = floor(depth-float(uPattern));        // lower integer level
    float d1 = clamp(d0 + 1.0, 0.0, 4.0);
    float a  = fract(depth);        // blend factor between d0 and d1

    int level0 = int(d0);
    int level1 = int(d1);

    // --------------------------------------------------------
    // 3. Sample SDF at both levels and lerp
    // --------------------------------------------------------
    float sdf0 = sampleLevel(level0, uv, t);
    float sdf1 = sampleLevel(level1, uv, t);
    float sdf  = mix(sdf0, sdf1, a);

    // --------------------------------------------------------
    // 4. Turn SDF into a stroked shape + color
    // --------------------------------------------------------
    float shape = 1.0 - strokeSDF(sdf, 0.05);

    // Use palette based on sdf + base cell id
    float paletteT = smoothstep(-0.2, 0.4, -sdf);
    vec3 col = palette(paletteT, baseId);

    col *= shape;

    gl_FragColor = vec4(col, 1.0);
}