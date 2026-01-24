precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform int uPattern;

varying vec2 vUv;

// ------------------------------------------------------------
// IQ Palette
// ------------------------------------------------------------
vec3 iqPalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(6.28318 * (c * t + d));
}

float dot2(vec2 v) { return dot(v, v); }

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

    vec2 gridSize = vec2(10.);
    vec2 gridUv = uv * gridSize;
    vec2 id = floor(gridUv);
    vec2 f = fract(gridUv);

    float aspect = gridSize.y / gridSize.x;
    vec2 p = (f - 0.5) * 2.0;
    p.x *= aspect;

    float r = 0.3;

    // Shadow offset
    vec2 shadowOffset = vec2(uMouse-0.5);
    shadowOffset += 0.025*hash(id);
    // Signed distances
    float sdfFront  = sdfCircle(p, r);
    float sdfShadow = sdfCircle(p - shadowOffset, r-0.01);

    // Anti-aliased fill masks
    float edge = fwidth(sdfFront) * 1.5;

    float frontFill  = 1.0 - smoothstep(0.0, edge, sdfFront);
    float shadowFill = 1.0 - smoothstep(0.0, edge, sdfShadow);

    // Colors
    float paletteT = fract(hash(id * 0.123) +  0.05);
    vec3 col = vec3(0.);
    float d = length(shadowOffset);

    // Smooth blend factor (0 → 1 as offset shrinks)
    float blend = smoothstep(0.1, 0.0, d);

    if (uPattern == 0) {
         vec3 frontColor = iqPalette(
            paletteT,
            vec3(0.5),
            vec3(0.5),
            vec3(1.0),
            vec3(0.2, 0.33, 0.4)
        );

        vec3 shadowColor = vec3(1.);
        vec3 bg = vec3(1.0 - d);

        // Smoothly blend toward frontColor
        bg          = mix(bg,          frontColor, blend);

        // Start with background
        col = bg;

        // Draw shadow circle first
        col = mix(col, shadowColor, shadowFill);

        // Draw front circle on top
        col = mix(col, frontColor, frontFill);
    }

    if (uPattern == 1) {
        d = length(shadowOffset);
        blend = smoothstep(0., 0.075, d);
        vec3 frontColor = iqPalette(
            paletteT,
            vec3(0.5),
            vec3(0.5),
            vec3(1.0),
            vec3(0., 0.33, 0.67)
        );
        vec3 shadowColor = vec3(0.);
        vec3 bg = vec3(d);

        bg = mix(bg, frontColor, blend);
        shadowColor = mix(frontColor, shadowColor, blend);
        col = bg;
        col = mix(col, shadowColor, shadowFill);
        col = mix(col, frontColor, frontFill);
    }

    if (uPattern == 2) {
        d = length(shadowOffset);
        blend = smoothstep(0.4, 0.00, d);
        vec3 frontColor = iqPalette(
            paletteT,
            vec3(0.5),
            vec3(0.5),
            vec3(0.5),
            vec3(0., 0., 0.)
        );
        vec3 shadowColor = vec3(0.5);
        vec3 bg = vec3(d);

        bg = mix(bg, shadowColor, blend);
        frontColor = mix(frontColor, shadowColor, blend);
        col = bg;
        col = mix(col, shadowColor, shadowFill);
        col = mix(col, frontColor, frontFill);
    }
    gl_FragColor = vec4(col, 1.0);
}