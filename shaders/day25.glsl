precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform int uPattern;

varying vec2 vUv;

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

vec3 palette(float t) {
    return vec3(0.5) + vec3(0.5) *
           cos(6.283185 * (vec3(0.5) * t + vec3(0.2, 0.3, 0.4)));
}

vec2 N22(vec2 p) {
    vec3 a = fract(p.xyx * vec3(123.34, 234.34, 345.65));
    a += dot(a, a + 34.45);
    return fract(vec2(a.x * a.y, a.y * a.z));
}

// ------------------------------------------------------------
// Main
// ------------------------------------------------------------

void main() {
    vec2 fragCoord = vUv * uResolution;
    vec2 uv = (2.0 * fragCoord - uResolution.xy) / uResolution.y;

    float t = uTime;
    float minDist = 100.0;

    vec2 nearestOffset = vec2(0.0);
    vec2 nearestN = vec2(0.0);

    // Dynamic grid
    vec2 grid = vec2(20.0) - 15.0 * smoothstep(0., 1.0, sin(t * 0.5));
    if (uPattern == 2) {
        vec2(5.0) - 3.0 * smoothstep(0., 1.0, sin(t * 0.5));
    }
    vec2 gridPos = uv * grid;
    vec2 ipos = floor(gridPos);
    vec2 fpos = fract(gridPos) - 0.5;

    // Find nearest point
    for (float y = -1.0; y <= 1.0; y++) {
        for (float x = -1.0; x <= 1.0; x++) {

            vec2 offset = vec2(x, y);
            vec2 n = N22(offset + ipos);
            vec2 p;   // declare once

            if (uPattern == 0) {
                p = offset + sin(n * t) * 0.5;
            }
            else if (uPattern == 1) {
                float sx = 0.8 + n.x * 2.0;
                float sy = 1.0 + n.y * 2.0;

                p = offset + vec2(
                    sin(t * sx + n.x * 6.2831),
                    sin(t * sy + n.y * 6.2831)
                ) * 0.4;
            }
            else {
                float w = t * (0.5 + n.x);
                float r = 0.2 + 0.15 * sin(t * 0.7 + n.y * 6.2831);

                p = offset + vec2(cos(w), sin(w)) * r;
            }

            float d = length(fpos - p);

            if (d < minDist) {
                minDist = d;
                nearestOffset = offset;
                nearestN = n;
            }
        }
    }

    vec2 nearestP;

    if (uPattern == 0) {
        nearestP = nearestOffset + sin(nearestN * t) * 0.5;
    }
    else if (uPattern == 1) {
        float sx = 0.8 + nearestN.x * 2.0;
        float sy = 1.0 + nearestN.y * 2.0;

        nearestP = nearestOffset + vec2(
            sin(t * sx + nearestN.x * 6.2831),
            sin(t * sy + nearestN.y * 6.2831)
        ) * 0.4;
    }
    else {
        float w = t * (0.5 + nearestN.x);
        float r = 0.2 + 0.15 * sin(t * 0.7 + nearestN.y * 6.2831);

        nearestP = nearestOffset + vec2(cos(w), sin(w)) * r;
    }

    float d = length(fpos - nearestP);

    // Background gradient
    float bgT = smoothstep(1.2, 0.0, length(uv));
    vec3 bgInner = vec3(0.15, 0.1, 0.2);
    vec3 bgOuter = vec3(0.02, 0.02, 0.05);
    vec3 col = mix(bgInner, bgOuter, bgT);

    // ------------------------------------------------------------
    // PATTERN 0 — EXACTLY WHAT YOU PASTED (with center color)
    // ------------------------------------------------------------
    if (uPattern == 0) {

        // Ring parameters
        float ringCount = 6.0;
        float baseR = 0.35;
        float ringSpacing = 0.1;
        float edge = 0.25;

        // --- NEW: random center color ---
        float centerMask = 1.0 - smoothstep(baseR, baseR + 0.02, d);
        vec3 centerColor = palette(fract(dot(nearestN, vec2(12.9898, 78.233))));
        col += centerMask * centerColor * 1.5;

        // Draw rings (your exact logic)
        for (float i = 0.0; i < 6.0; i++) {
            if (i >= ringCount) break;

            float r1 = baseR + i * ringSpacing;
            float r2 = r1 + ringSpacing * 0.5;

            float ringMask =
                smoothstep(r1, r1 - edge, d) *
                (1.0 - smoothstep(r2, r2 - edge, d));

            vec3 ringColor = palette(fract(i * 0.3 + nearestN.x)+0.3*sin(0.5*t));

            col += ringMask * ringColor;
        }
    }

    // ------------------------------------------------------------
    // PATTERN 1 — EXACTLY WHAT YOU PASTED (no center color)
    // ------------------------------------------------------------
    if (uPattern == 1) {

        // Ring parameters
        float ringCount = 6.0;
        float baseR = 0.65;
        float ringSpacing = 0.1;
        float edge = 0.25;

        float centerMask = 1.0 - smoothstep(baseR, baseR +0.02, d);
        vec3 cInner = vec3(0.62+0.2*sin(0.5*t), 0.5, 0.0);   // orange
        vec3 cOuter = vec3(0.0, 0.6+0.2*sin(0.5*t), 0.3);   // green

        vec3 centerColor = mix(cInner, cOuter+0.5*sin(0.5*t), smoothstep(0.8, 0.08, d));

        col += centerMask * centerColor * 0.5;

        // Draw rings (your exact logic)
        for (float i = 0.0; i < 6.0; i++) {
            if (i >= ringCount) break;

            float r1 = baseR + i * ringSpacing;
            float r2 = r1 + ringSpacing * 0.5;

            float ringMask =
                smoothstep(r1, r1 - edge, d) *
                (1.0 - smoothstep(r2, r2 - edge, d));

            vec3 ringColor = palette(fract(i * 0.3 + nearestN.x)+0.2*sin(0.5*t));

            col +=  ringMask * ringColor;
        }
    }

    if (uPattern == 2) {

        // Ring parameters
        float ringCount   = 10.0;
        float baseR       = 0.35;
        float ringSpacing = 0.2;
        float edge        = 0.3;

        // Time factor for blooming / expansion
        float bloomSpeed = 0.5;
        float phase = t * bloomSpeed;
        // Single bloom color used for all rings
        vec3 bloomColor = mix(vec3(1.), vec3(0.2, 0.3, 0.4), 0.5 + 0.5 * sin(phase));

        // Blooming rings: animate radius in the mask
        for (float i = 0.0; i < ringCount; i++) {

            // Shift each ring outward over time
            float rCenter = baseR + i * ringSpacing + sin(phase) * 0.5;
            float r1 = rCenter;
            float r2 = rCenter + ringSpacing;

            float ringMask =
                smoothstep(r1, r1 - edge, d) *
                (1.0 - smoothstep(r2, r2 - edge, d));

            // Single shared color for all rings
            vec3 ringColor = bloomColor;

            col += 400.0 * ringMask * ringColor;
        }
    }

    gl_FragColor = vec4(col, 1.0);
}