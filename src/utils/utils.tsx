import { Ref, useEffect, useRef } from 'react';
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

// Fibonacci helpers
// fibonacci.ts
const fibs = [
  0, 1, 1, 2, 3, 5, 8, 13, 21, 34,
  55, 89, 144, 233, 377, 610, 987,
  1597, 2584, 4181, 6765, 10946,
  17711, 28657, 46368, 75025,
  121393, 196418, 317811, 514229
];

export function fib(n: number) {
  if (n < fibs.length) return fibs[n];

  for (let i = fibs.length; i <= n; i++) {
    fibs[i] = fibs[i - 1] + fibs[i - 2];
  }
  return fibs[n];
}

export function fibTable() {
  return [...fibs]; // safe copy
}

export const MicroFontLetterMap = {
  A: [
    [0,1,1],
    [1,1,1],
    [1,1,1],
  ],
  B: [
    [1,0,0],
    [1,1,1],
    [1,1,1],
  ],
  C: [
    [1,1,1],
    [1,0,0],
    [1,1,1],
  ],
  D: [
    [0,0,1],
    [1,1,1],
    [1,1,1],
  ],
  E: [
    [1,1,1],
    [1,1,0],
    [1,1,1],
  ],
  F: [
    [1,1,1],
    [1,1,0],
    [1,0,0],
  ],
  G: [
    [1,1,0],
    [1,1,1],
    [1,1,1],
  ],
  H: [
    [1,0,1],
    [1,1,1],
    [1,0,1],
  ],
  I: [
    [1,1,1],
    [0,1,0],
    [1,1,1],
  ],
  J: [
    [1,1,1],
    [0,1,0],
    [1,1,0],
  ],
  K: [
    [1,0,1],
    [1,1,0],
    [1,0,1],
  ],
  L: [
    [1,0,0],
    [1,0,0],
    [1,1,1],
  ],
  M: [
    [1,1,1],
    [1,1,1],
    [1,0,1],
  ],
  N: [
    [1,1,1],
    [1,0,1],
    [1,0,1],
  ],
  O: [
    [1,1,1],
    [1,0,1],
    [1,1,1],
  ],
  P: [
    [1,1,1],
    [1,1,1],
    [1,0,0],
  ],
  Q: [
    [1,1,1],
    [1,1,1],
    [0,0,1],
  ],
  R: [
    [1,1,1],
    [1,1,0],
    [1,0,1],
  ],
  S: [
    [0,1,1],
    [0,1,0],
    [1,1,0],
  ],
  T: [
    [1,1,1],
    [0,1,0],
    [0,1,0],
  ],
  U: [
    [1,0,1],
    [1,0,1],
    [1,1,1],
  ],
  V: [
    [1,0,1],
    [1,0,1],
    [0,1,0],
  ],
  W: [
    [1,0,1],
    [1,1,1],
    [1,1,1],
  ],
  X: [
    [1,0,1],
    [0,1,0],
    [1,0,1],
  ],
  Y: [
    [1,0,1],
    [1,1,1],
    [0,1,0],
  ],
  Z: [
    [1,1,0],
    [0,1,0],
    [0,1,1],
  ],

  // DIGITS
  "0": [
    [1,1,1],
    [1,0,1],
    [1,1,1],
  ],
  "1": [
    [1,1,0],
    [0,1,0],
    [0,1,0],
  ],
  "2": [
    [1,1,0],
    [0,1,0],
    [0,1,1],
  ],
  "3": [
    [1,1,1],
    [0,1,1],
    [1,1,1],
  ],
  "4": [
    [1,0,1],
    [1,1,1],
    [0,0,1],
  ],
  "5": [
    [0,1,1],
    [0,1,0],
    [1,1,0],
  ],
  "6": [
    [1,0,0],
    [1,1,0],
    [1,1,1],
  ],
  "7": [
    [1,1,1],
    [0,0,1],
    [0,0,1],
  ],
  "8": [
    [1,1,1],
    [1,1,1],
    [1,1,1],
  ],
  "9": [
    [1,1,1],
    [1,1,1],
    [0,0,1],
  ],
};

export function MicroFontLetter({
  position,
  rotation,
  onRotate,
  data,
  spacing,
  geometry,
  material,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  onRotate?: (ref: React.RefObject<THREE.Group>) => void;
  data: number[][];
  spacing: number;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
}) {
  const ref = useRef<THREE.Group>(null);

  // Call parent hook once ref exists
  useEffect(() => {
    if (onRotate && ref.current) {
      onRotate(ref);
    }
  }, [onRotate]);

  return (
    <group ref={ref} position={position} rotation={rotation}>
      {data.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          if (!cell) return null;

          return (
            <mesh
              key={`${rowIndex}-${colIndex}`}
              geometry={geometry}
              material={material}
              position={[
                colIndex * spacing,
                -rowIndex * spacing,
                0,
              ]}
            />
          );
        })
      )}
    </group>
  );
}