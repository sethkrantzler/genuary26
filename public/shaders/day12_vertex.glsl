precision highp float;
precision highp int;

uniform float uTime;
uniform float uRadius;

// grid uniforms
uniform float uGridX;
uniform float uGridY;
uniform float uGridW;
uniform float uGridH;

// ⭐ NEW: world position of this box
uniform vec3 uWorldPos;

varying vec3 vPos;
varying vec2 vUv;

// ⭐ NEW: pass world position to fragment shader
varying vec3 vWorldPos;

void main() {
    vec3 p = position;

    // your existing vertex deformation logic stays here
    // (rounded corners, morphing, whatever you already have)

    vPos = p;
    vUv = uv;

    // ⭐ NEW: forward world position
    vWorldPos = uWorldPos;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}