precision highp float;

uniform float uTime;
uniform vec2 uResolution;

varying vec2 vUv;

// ----------------------------------------------------
// Parametric Spirograph curve
// ----------------------------------------------------
vec2 spiro(float t, float R, float r, float d) {
    float k = (R - r) / r;
    float x = (R - r) * cos(t) + d * cos(k * t);
    float y = (R - r) * sin(t) - d * sin(k * t);
    return vec2(x, y);
}

// ----------------------------------------------------
// Distance from point p to the Spirograph curve
// ----------------------------------------------------
float spiroDist(vec2 p) {
    // Animated radii
    float R = 0.7 + 0.2 * sin(uTime * 0.04);
    float r = 0.3 + 0.1 * cos(uTime * 0.06);
    float d = 0.4;

    float minDist = 1e6;

    float turns = 8.;
    float tMax = 6.2831853 * turns;
    float dt = 0.01;

    // Traveling head + tail
    float speed = 0.15;
    float window = 2.0;

    float head = mod(uTime * speed * tMax, tMax);
    float tail = head - window;

    for (float t = 0.0; t < tMax; t += dt) {

        // Window masking
        if (tail < 0.0) {
            if (t > head && t < (tMax + tail)) continue;
        } else {
            if (t < tail || t > head) continue;
        }

        vec2 c = spiro(t, R, r, d);
        float dist = length(p - c);
        minDist = min(minDist, dist);
    }

    return minDist;
}

// ----------------------------------------------------
// Main
// ----------------------------------------------------
void main() {
    // Convert vUv to centered coordinates
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * 2.0;
    p.x *= uResolution.x / uResolution.y;
    p *= 1.5;

    float d = spiroDist(p);

    float thickness = 0.03;
    float line = smoothstep(thickness, 0.0, d);

    vec3 bg = vec3(0.02, 0.02, 0.04);
    vec3 col = mix(bg, vec3(1.0), line);

    gl_FragColor = vec4(col, 1.0);
}