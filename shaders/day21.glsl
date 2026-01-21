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
float sdfCircle(vec2 p, float r) {
    return length(p) - r;
}

void main() {
    vec2 uv = vUv - 0.5;
    uv.x *= uResolution.x / uResolution.y;

    float t = uTime * 0.4;

    // Mouse influence (0 → 1)
    float mouseInfluence = 1.0 -  smoothstep(0.0, 1.0, uMouse.x);

    vec2 gridSize = vec2(12., 1.7);
    vec2 gridUv = uv * gridSize;
    vec2 id = floor(gridUv);
    vec2 f = fract(gridUv);

    // Normalize tile so circles stay round
    float aspect = gridSize.y / gridSize.x;
    vec2 p = (f - 0.5) * 2.0;
    p.x *= aspect;

    // ------------------------------------------------------------
    // Horizontal offset based on distance from Y center
    // ------------------------------------------------------------
    float tileYNorm = id.x / gridSize.x;      // 0 → 1
    float centerDist = abs(tileYNorm);  // distance from center row

    // Offset direction: toward the center (positive or negative X)
    float dir = (tileYNorm < 0.) ? 1.0 : -1.0;

    // Mouse controls how strong the drop shadow is
    float maxOffset = 0.2;
    float offsetX = dir * centerDist * mouseInfluence * maxOffset;
    // ------------------------------------------------------------
    // Two circles: background (grey) and foreground (colored)
    // ------------------------------------------------------------
    float r = 0.1;

    float dBack  = sdfCircle(p + vec2(offsetX, 0.0), r);
    float dFront = sdfCircle(p, r);

    float px = fwidth(dFront);

    float backFill  = smoothstep(0.0 + px, 0.0 - px, dBack);
    float frontFill = smoothstep(0.0 + px, 0.0 - px, dFront);

    // ------------------------------------------------------------
    // Colors
    // ------------------------------------------------------------
    float paletteT = fract(hash(id * 0.123) + t * 0.05);

    vec3 frontColor = iqPalette(
        paletteT,
        vec3(0.5),
        vec3(0.5),
        vec3(1.0),
        vec3(0.0, 0.33, 0.67)
    );


    // Moss → Wood gradient
    vec3 moss = vec3(0.54, 0.60, 0.36);
    vec3 wood = vec3(0.40, 0.26, 0.12);

    // Gradient factor (0 → 1)
    float gx = smoothstep(0.5, 1.0, vUv.x);


    // Final background gradient
    vec3 bg = mix(moss, wood, gx);

    vec3 col = bg;

    // Back circle (only where front is NOT visible)
    col = mix(col, wood, backFill * (1.0 - frontFill));

    // Front circle (full strength)
    col = mix(col, frontColor, frontFill);

    gl_FragColor = vec4(col, 1.0);
}