precision highp float;

uniform float uTime;
uniform vec2 uResolution;

// grid uniforms
uniform float uGridX;
uniform float uGridY;
uniform float uGridW;
uniform float uGridH;

varying vec2 vUv;
varying vec3 vPos;
varying vec3 vWorldPos;

// simple hash for randomness
float hash(float n) {
    return fract(sin(n) * 43758.5453123);
}

float hash2(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// grid‑aware palette
vec3 palette(float t, vec3 d, vec3 offset) {
    float rand = hash2(vec2(uGridX, uGridY));
    return vec3(0.5) + vec3(1.0) * rand*cos(6.283185 * (d * t + offset+0.01*vWorldPos));
}

// FIXED: N must be float for WebGL1
float flowerSDF(vec2 st, float N) {
    st = st * 2.0 - 1.0;
    float r = length(st * 2.0);
    r = sin(1.25 * r + uTime);
    float a = atan(st.y, st.x);
    float v = N * 0.5;
    return 1.0 - (abs(cos(a * v)) * 0.5 + 0.5) / r;
}

void main() {
    vec2 fragCoord = vUv * uResolution;
    vec2 uv = (fragCoord - 0.5 * uResolution) / min(uResolution.x, uResolution.y);

    // -----------------------------
    // GRID‑BASED RANDOMNESS
    // -----------------------------
    float gx = uGridX;
    float gy = uGridY;

    float rndA = hash2(vec2(gx, gy));           
    float rndB = hash(gx * 13.1 + gy * 91.7);   
    float rndC = hash(gx + gy * 17.0);          

    // palette direction vector
    vec3 d = normalize(vec3(
        -1.5 + rndA * 1.2,
        -1.5 + rndB * 1.2,
        -1.5 + rndC * 1.2
    ));

    // grid‑based palette offset (hue shift)
    vec3 paletteOffset = vec3(
        rndA * 0.8,
        rndB * 0.8,
        rndC * 0.8
    );

    // petal counts vary per box (float only)
    float primaryPetals   = 6.0 + floor(rndA * 10.0);
    float secondaryPetals = 8.0 + floor(rndB * 12.0);

    // -----------------------------
    // FLOWER LAYERS
    // -----------------------------
    uv = uv * rndA*0.4;
    uv = fract(uv + rndB) - 0.5*rndB;
    uv = mod(uv + 0.5, rndC) - 0.5*rndB;
    float q = abs(flowerSDF(uv + 0.5, primaryPetals));
    q = 0.05 / q;

    float p = abs(flowerSDF(vec2(uv.x + 0.5, uv.y), secondaryPetals));
    p = 0.05 / p;

    float l = abs(flowerSDF(vec2(uv.x + 0.5, uv.y + 1.0), secondaryPetals));
    l = 0.05 / l;

    // grid‑aware palette
    vec3 layer1 = palette(q, d, paletteOffset);
    vec3 layer2 = palette(p, d, paletteOffset);
    vec3 layer3 = palette(l, d, paletteOffset);

    vec3 b1 = step(0.5, layer1);
    vec3 b2 = step(0.5, layer2);
    vec3 b3 = step(0.5, layer3);

    // XOR operation
    vec3 col = mod(b1 + b2 + b3, 2.0);

    gl_FragColor = vec4(col, 1.0);
}