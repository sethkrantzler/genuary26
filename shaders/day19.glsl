precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;

varying vec2 vUv;

// ------------------------------------------------------------
// IQ Palette
// ------------------------------------------------------------
vec3 iqPalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(6.28318 * (c * t + d));
}

float dot2(vec2 v) { return dot(v, v); }

// ------------------------------------------------------------
// Noise helpers
// ------------------------------------------------------------
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec2 hash2(vec2 p) {
    return vec2(hash(p), hash(p + 13.37));
}

vec2 rotate(vec2 p, float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c) * p;
}

// ------------------------------------------------------------
// SDF: Rotating Cube
// ------------------------------------------------------------
float sdfRotatingCube(vec2 p, float t) {
    p = rotate(p, t * 1.5);
    vec2 b = vec2(0.6);
    vec2 d = abs(p) - b;
    return max(d.x, d.y);
}

// ------------------------------------------------------------
// SDF: Cool S (center shape)
// ------------------------------------------------------------
float sdfCoolS(vec2 p) {
    float six = (p.y < 0.0) ? -p.x : p.x;
    p.x = abs(p.x);
    p.y = abs(p.y) - 0.2;
    float rex = p.x - min(round(p.x / 0.4), 0.4);
    float aby = abs(p.y - 0.2) - 0.6;

    float d = dot2(vec2(six, -p.y) - clamp(0.5 * (six - p.y), 0.0, 0.2));
    d = min(d, dot2(vec2(p.x, -aby) - clamp(0.5 * (p.x - aby), 0.0, 0.4)));
    d = min(d, dot2(vec2(rex, p.y - clamp(p.y, 0.0, 0.4))));

    float s = 2.0 * p.x + aby + abs(aby + 0.4) - 0.4;
    return sqrt(d) * sign(s);
}

// ------------------------------------------------------------
// SDF: Bobbly Cross
// ------------------------------------------------------------
float sdfBobblyCross(vec2 p, float t) {
    float wob = sin(p.x * 6.0 + t * 3.0) * 0.15;
    p.y += wob;

    float v = max(abs(p.x) - 0.15, abs(p.y) - 0.55);
    float h = max(abs(p.x) - 0.55, abs(p.y) - 0.15);
    return min(v, h);
}

// ------------------------------------------------------------
// Smooth morph helper
// ------------------------------------------------------------
float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

// ------------------------------------------------------------
// Mouse-controlled morph: cube → cool S → cross
// ------------------------------------------------------------
float pickSDF(vec2 p, float t, float mx) {
    float d0 = sdfRotatingCube(p, t);
    float d1 = sdfCoolS(p);
    float d2 = sdfBobblyCross(p, t);

    float x = clamp(mx, 0.0, 1.0);

    // Blend cube → cool S
    float a = smoothstep(0.0, 0.5, x);
    float d01 = mix(d0, d1, a);

    // Blend cool S → cross
    float b = smoothstep(0.5, 1.0, x);
    float d12 = mix(d1, d2, b);

    // Crossfade between the two blends
    float c = smoothstep(0.25, 0.75, x);
    return mix(d01, d12, c);
}

// ------------------------------------------------------------
// Main
// ------------------------------------------------------------
void main() {
    vec2 uv = vUv - 0.5;
    uv.x *= uResolution.x / uResolution.y;

    float t = uTime * 0.4;

    // Mouse mapping
    vec2 m = uMouse - 0.5;

    float dist = length(uv - m);
    float influence = smoothstep(1.0, 0.0, dist);

    float scale = mix(0.0, 1.0, influence);
    vec2 warpedUv = (uv - m) * scale + m;

    // Grid
    vec2 gridSize = vec2(16.0);
    vec2 gridUv = warpedUv * gridSize;
    vec2 id = floor(gridUv);

    // Local UV inside tile
    vec2 f = fract(gridUv - 0.5 * sin(t + length(uv - m)));
    vec2 p = (f - 0.5) * 2.5;

    // Smoothly morphed SDF
    float d = pickSDF(p, t, uMouse.x);

    // Anti-aliased fill + outline
    float px = fwidth(d);
    float fill = smoothstep(0.0 + px, 0.0 - px, d);
    float outline = smoothstep(px * 3.0, px * 1.0, abs(d)) - fill;

    // Color per tile
    float paletteT = fract(hash(id * 0.123) + t * 0.05 + 5.0 * length(uv - m));

    vec3 fillColor = iqPalette(
        paletteT,
        vec3(0.5),
        vec3(0.5),
        vec3(1.0),
        vec3(0.0, 0.33, 0.67)
    );

    vec3 outlineColor = vec3(1.0);

    vec3 col = vec3(0.0);
    col -= fill * fillColor;
    col -= outline * outlineColor;

    gl_FragColor = vec4(col, 1.0);
}