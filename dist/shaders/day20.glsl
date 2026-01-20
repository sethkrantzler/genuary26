precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;

varying vec2 vUv;

float dot2(vec2 v) { return dot(v, v); }

// ----------------------------------------------------
// Cute rounded heart SDF
// ----------------------------------------------------
float sdCuteHeart(vec2 p) {
    p *= 2.0;
    p.y += 0.2;

    float x = p.x;
    float y = p.y;

    float a = x*x + y*y - 1.0;
    return a*a*a - x*x*y*y*y;
}

// ----------------------------------------------------
// Multi-frequency wobble controlled by mouse
// ----------------------------------------------------
vec2 heartWobble(vec2 p, float t, vec2 m) {

    // Mouse strength based on distance from center
    float mouseStrength = smoothstep(0.0, 1.0, length(m));

    float low  = 0.25 * mouseStrength * sin(2.0 * p.y + t * 0.8);
    float mid  = 0.05 * mouseStrength * sin(8.0 * p.x + t * 1.6);
    float high = 0.02 * mouseStrength * sin(20.0 * (p.x + p.y) + t * 2.5);

    float wobble = low + mid + high;

    return p + normalize(p + 0.0001) * wobble;
}

// ----------------------------------------------------
// Proper wrapped angular difference
// ----------------------------------------------------
float angleDiff(float a, float b) {
    float d = a - b;
    d = mod(d + 3.14159265, 6.2831853) - 3.14159265;
    return abs(d);
}

// ----------------------------------------------------
// Smooth-edged rotating wedge mask
// ----------------------------------------------------
float sliceMask(vec2 p, float angle, float width) {
    float a = atan(p.y, p.x);
    float diff = angleDiff(a, angle);
    // Smooth wedge: inside = 1, outside = 0
    return 1.0 - smoothstep(width * 0.01, width, diff);
}

// ----------------------------------------------------
// Main
// ----------------------------------------------------
void main() {
    vec2 uv = vUv;

    // Center UV
    vec2 p = (uv - 0.5) * 2.0;

    // Mobile‑safe aspect correction
    float aspect = uResolution.x / uResolution.y;
    if (aspect > 1.0) {
        p.x *= aspect;
    } else {
        p.y /= aspect;
    }

    // Apply wobble BEFORE SDF
    vec2 pw = heartWobble(p, uTime, uMouse-0.5);

    // Heart SDF
    float d = sdCuteHeart(pw);

    // Heart outline
    float thickness = 0.02;
    float heartLine = smoothstep(thickness, 0.0, abs(d));

    // Rotating wedge
    float angle = mod(uTime , 6.2831853);
    float slice = sliceMask(p, angle, 0.15);

    // Keep the heart outline
    float finalLine = heartLine-slice;

    // Distance from center IN HEART SPACE (correct!)
float r = length(p);

// Normalize radius so center = red, outer = orange
float radiusNorm = smoothstep(0.6, 0.5, r);

    // Red → Orange gradient
    vec3 red    = vec3(1.0, 0.1, 0.1);
    vec3 orange = vec3(1.0, 0.5, 0.1);
    vec3 heartColor = mix(orange, red, radiusNorm);

    // Background
    vec3 bg = vec3(0.02, 0.02, 0.04);

    // Apply color only where the heart line is visible
    vec3 col = mix(bg, heartColor, smoothstep(0.1, 0.4 ,finalLine));

    gl_FragColor = vec4(col, 1.0);
}