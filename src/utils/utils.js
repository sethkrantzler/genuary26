import * as THREE from 'three';

/**
 * Smoothstep remap helper
 * @param {number} value - The input value
 * @param {number} inMin - Input range minimum
 * @param {number} inMax - Input range maximum
 * @param {number} outMin - Output range minimum
 * @param {number} outMax - Output range maximum
 * @returns {number} - Smoothly remapped value
 */
export function smoothstepRange(value, inMin, inMax, outMin, outMax) {
  // First clamp and ease the input into [0,1]
  const raw = THREE.MathUtils.smoothstep(value, inMin, inMax);

  // Then remap to the desired output range
  return outMin + raw * (outMax - outMin);
}