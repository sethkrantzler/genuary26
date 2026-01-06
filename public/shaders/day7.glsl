precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform int primaryPetals;
uniform int secondaryPetals;
uniform bool divideSecondaryPetals;
uniform vec3 paletteColor;
varying vec2 vUv;

vec3 palette(in float t) {
    return vec3(0.5) + vec3(1.0) * cos(6.283185 * (vec3(-1.5) * t + paletteColor));
}

float stroke(float x, float size, float w) {
    float d = smoothstep(size - 0.01, size, x + w * 0.5) - smoothstep(size, size + 0.01, x - w * 0.5);
    return clamp(d, 0.0, 1.0);
}

float flowerSDF(vec2 st, int N) {
    st = st * 2.0 - 1.0;
    float r = length(st * 2.0);
    r = sin(1.25 * r + uTime);
    float a = atan(st.y, st.x);
    float v = float(N) * 0.5;
    return 1.0 - (abs(cos(a * v)) * 0.5 + 0.5) / r;
}

void main() {
    vec2 fragCoord = vUv * uResolution;
    vec2 uv = (fragCoord - 0.5 * uResolution) / min(uResolution.x, uResolution.y);
    vec2 uv0 = uv;
    
    float q = abs(flowerSDF(uv + 0.5, primaryPetals));
    q = 0.05 / q;
    
    float p = abs(flowerSDF(vec2(uv.x + 0.5, uv.y), secondaryPetals));
    if (divideSecondaryPetals) {
        p = 0.05 / p;
    }
    
    float l = abs(flowerSDF(vec2(uv.x + 0.5, uv.y + 1.0), secondaryPetals));
    if (divideSecondaryPetals) {
        l = 0.05 / l;
    }

    vec3 layer1 = palette(q);
    vec3 layer2 = palette(p);
    vec3 layer3 = palette(l);
    
    vec3 b1 = step(0.5, layer1);
    vec3 b2 = step(0.5, layer2);
    vec3 b3 = step(0.5, layer3);

    // XOR operation: (a XOR b XOR c)
    vec3 col = mod(b1 + b2 + b3, 2.0);
    gl_FragColor = vec4(col, 1.0);
}