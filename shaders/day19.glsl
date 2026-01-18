precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;

varying vec2 vUv;

// IQ palette (unchanged)
vec3 iqPalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(6.28318 * (c * t + d));
}

vec3 color(float t) {
    return iqPalette(
        t,
        vec3(0.5),
        vec3(0.5),
        vec3(1.0),
        vec3(0.0, 0.33, 0.67)
    );
}
float dot2(vec2 v) {
    return dot(v, v);
}

// --- Noise helpers ---
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


float sdfCoolS( in vec2 p )
{
    float six = (p.y<0.0) ? -p.x : p.x;
    p.x = abs(p.x);
    p.y = abs(p.y) - 0.2;
    float rex = p.x - min(round(p.x/0.4),0.4);
    float aby = abs(p.y-0.2)-0.6;
    
    float d = dot2(vec2(six,-p.y)-clamp(0.5*(six-p.y),0.0,0.2));
    d = min(d,dot2(vec2(p.x,-aby)-clamp(0.5*(p.x-aby),0.0,0.4)));
    d = min(d,dot2(vec2(rex,p.y  -clamp(p.y          ,0.0,0.4))));
    
    float s = 2.0*p.x + aby + abs(aby+0.4) - 0.4;
    return sqrt(d) * sign(s);
}

void main() {
    vec2 uv = vUv - 0.5;
    uv.x *= uResolution.x / uResolution.y;

    float t = uTime * 0.4;

    // Correct mouse mapping
    vec2 m = uMouse-0.5;

    // Distance from mouse
    float dist = length(uv - m);

    // Influence: 1 near mouse, 0 far away
    float influence = smoothstep(1., 0.0, dist);

    // Scale factor: bigger cells near mouse
    float scale = mix(0.0, 1., influence);

    // Warp UVs around mouse
    vec2 warpedUv = (uv - m) * scale + m;

    // --- Grid ---
    vec2 gridSize = vec2(16.0);

    // Noise offset per tile
    vec2 cellNoise = hash2(floor(warpedUv * gridSize) + floor(t * 0.2));
    cellNoise = (cellNoise - 0.5) * 0.3;

    vec2 gridUv = warpedUv * gridSize;
    vec2 id = floor(gridUv);

    // Local cell UV
    vec2 f = fract(gridUv-0.5*sin(t+length(uv-m)));
    // Center and scale for SDF
    vec2 p = (f - 0.5) * 2.5;

    // Evaluate Cool-S
    float d = sdfCoolS(p);

    // SDF fill
    float fill = smoothstep(0.0, -0.02, d);

    // SDF outline
    float outline = smoothstep(0.03, 0.05, abs(d)) - fill;
    // --- Color per tile using IQ palette ---
    float paletteT = fract(hash(id * 0.123) + t * 0.05+5.*length(uv-m));

    vec3 fillColor = iqPalette(
        paletteT,
        vec3(0.5),
        vec3(0.5),
        vec3(1.0),
        vec3(0.0, 0.33, 0.67)
    );

    vec3 outlineColor = vec3(1.0);

    // Final color
    vec3 col = vec3(0.0);
    col -= fill * fillColor;
    col -= outline * outlineColor;

    gl_FragColor = vec4(col, 1.0);
}