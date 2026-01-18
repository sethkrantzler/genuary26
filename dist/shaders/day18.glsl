precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform float uDecay;
uniform vec2 uMouse;

varying vec2 vUv;

// ------------------------------------------------------------
// IQ palette
// ------------------------------------------------------------
vec3 iqPalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(6.28318 * (c * t + d));
}

vec3 rainbow(float t) {
    return iqPalette(
        t,
        vec3(0.5),
        vec3(0.5),
        vec3(1.0),
        vec3(0.0, 0.33, 0.67)
    );
}

// ------------------------------------------------------------
// Spirograph parametric function
// ------------------------------------------------------------
vec2 spirographPoint(float t, float R, float r, float d) {
    float k = (R - r) / r;
    return vec2(
        (R - r) * cos(t) + d * cos(k * t),
        (R - r) * sin(t) - d * sin(k * t)
    );
}

float sdSpirograph(vec2 p, float t, float R, float r, float d) {
    vec2 sp = spirographPoint(t, R, r, d) * 0.5;
    return length(p - sp);
}

void main() {
    vec2 uv = vUv - 0.5;
    uv.x *= uResolution.x / uResolution.y;

    float t = uTime * 0.4;

   // -----------------------------
// Mouse influence (very subtle)
// -----------------------------
vec2 m = uMouse / uResolution;
vec2 mc = m * 2.0 - 1.0; // -1 → 1

// Ease the mouse so it feels smoother
float mx = pow(abs(mc.x), 1.5);  // softer response
float my = pow(abs(mc.y), 1.5);

// Very small influence amounts
float rInfluence = 0.01 * mx;   // was 0.03
float decayInfluence = mix(0.3, 1.0, my); // was 0.5 → 1.0

// Apply influence gently
float r = 0.08 + rInfluence * cos(t * 0.3);
float tailLength = 6.28318 * (10. + decayInfluence * 4. * sin(t * 0.005));
    // R and d stay animated
    float R = 0.25 + 0.1 * cos(t * 0.003 + 0.02 * t);
    float d = 0.12;

    vec3 bg = vec3(0.0);
    vec3 trail = vec3(0.0);
    float trailAlpha = 0.0;

    const int STEPS = 200;
    for (int i = 0; i < STEPS; i++) {
        float f = float(i) / float(STEPS - 1);
        float tt = t - f * tailLength;

        float dCurve = sdSpirograph(uv, tt, R, r, d);
        float line = smoothstep(0.0125, 0.0, dCurve);

        vec3 segColor = rainbow(f);

        trail += segColor * line;
        trailAlpha = max(trailAlpha, line);
    }

    vec3 col = mix(bg, trail, trailAlpha);
    gl_FragColor = vec4(col, 1.0);
}