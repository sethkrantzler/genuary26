import { extend, useFrame, useThree } from '@react-three/fiber';
import { BlendFunction, Effect, EffectComposer, RenderPass, ShaderPass } from 'postprocessing';
import { Ref, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';


// ---------------------------
// COOKIE HELPER
// ---------------------------
export function getVisitedSketches(): number[] {
  try {
    const raw = document.cookie
      .split("; ")
      .find((row) => row.startsWith("visitedSketches="));
    if (!raw) return [];
    return JSON.parse(raw.split("=")[1]);
  } catch {
    return [];
  }
}

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

// Simple noise function for stagger
export function noise(x: number, y: number) {
  return (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
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
  "{": [
    [0,1,1],
    [1,1,0],
    [0,1,1],
  ],
  "}": [
    [1,1,0],
    [0,1,1],
    [1,1,0],
  ],
  ";": [
    [0,0,0],
    [0,1,0],
    [0,1,0],
  ],
  "=": [  
    [0,0,0],
    [1,1,1],
    [1,1,1],
  ],
  ">": [  
    [1,0,0],
    [0,1,0],
    [1,0,0],
  ],
  "<": [  
    [0,0,1],
    [0,1,0],
    [0,0,1],
  ],
  "\"": [
    [1,0,1],
    [0,0,0],
    [0,0,0],
  ],
  "[": [
    [1,1,1],
    [1,0,0],
    [1,1,1],
  ],
  "]": [
    [1,1,1],
    [0,0,1],
    [1,1,1],
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

  useEffect(() => {
    if (!ref.current || !onRotate) return;
  
    // Start the animation for this mode
    const cleanup = onRotate(ref);
  
    // Cleanup old animation when onRotate changes
    return () => {
      //@ts-ignore
      if (cleanup) cleanup();
    };
  }, [onRotate]);

  return (
    <group ref={ref} position={position}>
      {data.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          if (!cell) return null;

          return (
            <mesh
              key={`${rowIndex}-${colIndex}`}
              geometry={geometry}
              rotation={rotation}
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

type LetterCacheEntry = {
  mesh: THREE.InstancedMesh;
  count: number;
};

const LetterCache: Record<string, LetterCacheEntry> = {};

export function CachedLetter({
  char,
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  char: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}) {
  const ref = useRef<THREE.Object3D>(null);

  const mesh = getLetterInstance(char);
  if (!mesh) return null;

  return (
    <primitive
      object={mesh}
      ref={ref}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
}

export function initLetterCache(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  pixelSpacing: number
) {
  Object.keys(MicroFontLetterMap).forEach((char) => {
    if (LetterCache[char]) return; // already built

    const data = MicroFontLetterMap[char];
    if (!data) return;

    // Count pixels
    const pixels: Array<[number, number]> = [];
    data.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell) pixels.push([colIndex, rowIndex]);
      });
    });

    const count = pixels.length;
    const instanced = new THREE.InstancedMesh(geometry, material, count);

    pixels.forEach(([col, row], i) => {
      const m = new THREE.Matrix4();
      m.setPosition(
        col * pixelSpacing,
        -row * pixelSpacing,
        0
      );
      instanced.setMatrixAt(i, m);
    });

    instanced.instanceMatrix.needsUpdate = true;

    LetterCache[char] = {
      mesh: instanced,
      count,
    };
  });
}

export function getLetterInstance(char: string) {
  const entry = LetterCache[char];
  if (!entry) return null;

  // Clone the instanced mesh (cheap)
  return entry.mesh.clone();
}

export function CompletedSketch({ day }: { day: number }) {
  useEffect(() => {
    // Read cookie
    const raw = document.cookie
      .split("; ")
      .find((row) => row.startsWith("visitedSketches="));

    let visited: number[] = [];

    try {
      if (raw) {
        visited = JSON.parse(raw.split("=")[1]);
      }
    } catch {
      visited = [];
    }

    // Add day if missing
    if (!visited.includes(day)) {
      const updated = [...visited, day];
      document.cookie = `visitedSketches=${JSON.stringify(updated)}; path=/; max-age=31536000`;
    }
  }, [day]);

  return null;
}

// Simple passthrough vertex shader in clip space
export const DEFAULT_VERTEX_SHADER: string = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// FullScreenShader.tsx
type FullScreenShaderProps = {
  fragmentPath: string;
  uniforms?: Record<string, THREE.IUniform>;
  transparent?: boolean;
  onClick?: (event: THREE.Event) => void;
};

export const FullScreenShader: React.FC<FullScreenShaderProps> = ({
  fragmentPath,
  uniforms = {},
  transparent = false,
  onClick
}) => {
  const { viewport, gl } = useThree();
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const mouse = useRef(new THREE.Vector2());
  const [fragmentShader, setFragmentShader] = useState<string | null>(null);

  // Load fragment shader
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const res = await fetch(fragmentPath);
      const text = await res.text();
      if (!cancelled) setFragmentShader(text);
    };

    load();
    return () => { cancelled = true };
  }, [fragmentPath]);

  // Merge uniforms
  const mergedUniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(viewport.width, viewport.height),
      },
      uMouse: { value: new THREE.Vector2(0, 0) },
      ...uniforms, // user-provided uniforms override defaults
    };
  }, [viewport.width, viewport.height, uniforms]);

  // Animate time + resolution
  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;

    u.uTime.value = clock.getElapsedTime();
    u.uResolution.value.set(viewport.width, viewport.height);
  });

  // Smooth mouse
  useFrame(() => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uMouse.value.lerp(mouse.current, 0.15);
  });

  // Track mouse globally
  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      mouse.current.set(x, y);
    };

    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  if (!fragmentShader) return null;

  return (
    <mesh position={[0, 0, 0]} onDoubleClick={onClick}>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={DEFAULT_VERTEX_SHADER}
        fragmentShader={fragmentShader}
        uniforms={mergedUniforms}
        transparent={transparent}
      />
    </mesh>
  );
};

type BackgroundShaderProps = {
  fragmentPath: string;
  uniforms?: Record<string, THREE.IUniform>;
};

export const BackgroundShader: React.FC<BackgroundShaderProps> = ({
  fragmentPath,
  uniforms = {}
}) => {
  const { camera, viewport, gl } = useThree();
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const mouse = useRef(new THREE.Vector2());
  const [fragmentShader, setFragmentShader] = useState<string | null>(null);

  // Load fragment shader
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const res = await fetch(fragmentPath);
      const text = await res.text();
      if (!cancelled) setFragmentShader(text);
    };

    load();
    return () => { cancelled = true };
  }, [fragmentPath]);

  // Merge uniforms
  const mergedUniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(viewport.width, viewport.height),
      },
      uMouse: { value: new THREE.Vector2(0, 0) },
      ...uniforms,
    };
  }, [viewport.width, viewport.height, uniforms]);

  // Animate time + resolution
  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;

    u.uTime.value = clock.getElapsedTime();
    u.uResolution.value.set(viewport.width, viewport.height);
  });

  useFrame(() => {
  if (!meshRef.current) return;

  const dist = 50; // distance in front of camera

  // 1. Camera forward direction
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);

  // 2. Position plane in front of camera
  meshRef.current.position.copy(camera.position).add(forward.multiplyScalar(dist));

  // 3. Keep it screen-aligned
  meshRef.current.quaternion.copy(camera.quaternion);

  // 4. Compute plane size so it fills the screen
  const height = 2 * Math.tan(((camera as THREE.PerspectiveCamera).fov * Math.PI) / 180 / 2) * dist;
  const width = height * (camera as THREE.PerspectiveCamera).aspect;

  meshRef.current.scale.set(width, height, 1);
});

  // Smooth mouse
  useFrame(() => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uMouse.value.lerp(mouse.current, 0.15);
  });

  // Track mouse globally
  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      mouse.current.set(x, y);
    };

    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  if (!fragmentShader) return null;

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={DEFAULT_VERTEX_SHADER}
        fragmentShader={fragmentShader}
        uniforms={mergedUniforms}
        transparent={false}
      />
    </mesh>
  );
};

// --------------------------------------------------
// ROUNDED RECTANGLE PATH (CurvePath)
// --------------------------------------------------
export function createPathRoundedRect(w = 2, h = 1, r = 0.3) {
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2 + r, -h / 2);
  shape.lineTo(w / 2 - r, -h / 2);
  shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  shape.lineTo(w / 2, h / 2 - r);
  shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  shape.lineTo(-w / 2 + r, h / 2);
  shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  shape.lineTo(-w / 2, -h / 2 + r);
  shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);

  const pts = shape.getPoints(200);
  const path = new THREE.CurvePath<THREE.Vector3>();

  for (let i = 0; i < pts.length - 1; i++) {
    path.add(
      new THREE.LineCurve3(
        new THREE.Vector3(pts[i].x, pts[i].y, 0),
        new THREE.Vector3(pts[i + 1].x, pts[i + 1].y, 0)
      )
    );
  }

  return path;
}

// --------------------------------------------------
// ASTROID CURVE (x = a cos³θ, y = a sin³θ)
// --------------------------------------------------
export function createPathAstroid(size = 1) {
  class AstroidCurve extends THREE.Curve<THREE.Vector3> {
    size: number;
    constructor() {
      super();
      this.size = size;
    }
    getPoint(t: number) {
      const a = this.size;
      const θ = t * Math.PI * 2;
      const x = a * Math.pow(Math.cos(θ), 3);
      const y = a * Math.pow(Math.sin(θ), 3);
      return new THREE.Vector3(x, y, 0);
    }
  }
  return new AstroidCurve();
}

// --------------------------------------------------
// LEMNISCATE OF BERNOULLI
// --------------------------------------------------
export function createPathLemniscate(a = 1) {
  class LemniscateCurve extends THREE.Curve<THREE.Vector3> {
    a: number;
    constructor() {
      super();
      this.a = a;
    }
    getPoint(t: number) {
      const θ = t * Math.PI * 2;
      const denom = 1 + Math.sin(θ) ** 2;
      const x = (this.a * Math.cos(θ)) / denom;
      const y = (this.a * Math.sin(θ) * Math.cos(θ)) / denom;
      return new THREE.Vector3(x, y, 0);
    }
  }
  return new LemniscateCurve();
}

export function createPathDoubleSpring({
  radius = 0.25,
  turns = 4.5,
  height = 1.5,
  bendLength = 0.5,
  samples = 256, // number of samples to compute centroid
}: {
  radius?: number;
  turns?: number;
  height?: number;
  bendLength?: number;
  samples?: number;
} = {}) {
  class DoubleSpringCurve extends THREE.Curve<THREE.Vector3> {
    radius: number;
    turns: number;
    height: number;
    bendLength: number;
    center: THREE.Vector3;

    constructor() {
      super();
      this.radius = radius;
      this.turns = turns;
      this.height = height;
      this.bendLength = bendLength;
      this.center = new THREE.Vector3();

      // compute centroid by sampling the raw curve
      const acc = new THREE.Vector3();
      for (let i = 0; i < samples; i++) {
        const t = i / samples;
        const p = this.sampleRaw(t);
        acc.add(p);
      }
      acc.multiplyScalar(1 / samples);
      this.center.copy(acc);
    }

    // compute the raw point (no centering)
    sampleRaw(t: number) {
      const TWO_PI = Math.PI * 2;

      // Segment boundaries
      const A = 0.33;
      const B = 0.66;

      // Segment A: vertical spring up
      if (t < A) {
        const u = t / A;
        const angle = u * this.turns * TWO_PI;
        const y = u * this.height;
        return new THREE.Vector3(
          Math.cos(angle) * this.radius,
          y,
          Math.sin(angle) * this.radius
        );
      }

      // Common points for segments B/C
      const angleA = this.turns * TWO_PI;
      const start = new THREE.Vector3(
        Math.cos(angleA) * this.radius,
        this.height,
        Math.sin(angleA) * this.radius
      ); // end of first spring

      const end = new THREE.Vector3(
        this.bendLength + this.radius,
        this.height,
        0
      ); // start position of second spring (u = 0)

      // Segment B: half-circle arc
      if (t < B) {
        const u = (t - A) / (B - A);

        const d = new THREE.Vector3().subVectors(end, start);
        const dist = d.length();
        d.normalize();

        const R = dist / 2;
        const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

        const up = new THREE.Vector3(0, 1, 0);
        let perp = new THREE.Vector3().crossVectors(d, up);
        if (perp.lengthSq() < 1e-4) {
          perp = new THREE.Vector3().crossVectors(d, new THREE.Vector3(1, 0, 0));
        }
        perp.normalize();

        const angle = Math.PI * (1 - u);
        const along = d.clone().multiplyScalar(R);

        const pos = new THREE.Vector3()
          .copy(center)
          .addScaledVector(along, Math.cos(angle))
          .addScaledVector(perp, Math.sin(angle) * R);

        return pos;
      }

      // Segment C: descending spring
      const u = (t - B) / (1 - B);
      const angle = u * this.turns * TWO_PI;
      const y = this.height - u * this.height;

      return new THREE.Vector3(
        this.bendLength + Math.cos(angle) * this.radius,
        y,
        Math.sin(angle) * this.radius
      );
    }

    // getPoint returns the centered point
    getPoint(t: number) {
      const p = this.sampleRaw(t);
      return p.sub(this.center);
    }
  }

  return new DoubleSpringCurve();
} 

export function UseOrthoCamera({position}: {position: THREE.Vector3}) {
    const { camera, set, size } = useThree();

    useEffect(() => {
        // Save old camera
        const oldCam = camera;
        const aspect = size.width / size.height;

        // Create orthographic camera
        const orthoCam = new THREE.OrthographicCamera(
            -aspect * 5,  // left
            aspect * 5,   // right
            5,            // top
            -5,           // bottom
            0.1,
            1000
        );
        orthoCam.position.set(position.x, position.y, position.z);
        orthoCam.lookAt(0, 0, 0);

        // Replace active camera
        set({ camera: orthoCam });

        return () => {
            // Restore original perspective camera
            set({ camera: oldCam });
        };
    }, []);

    return null;
}

export class DifferenceEffectImpl extends Effect {
  constructor({ width = 0.5, color = "orange" } = {}) {

    const fragmentShader = /* glsl */ `
      uniform vec3 uColor;
      uniform float uWidth;
      uniform vec2 uMouse;
      uniform float uTime;

      float toothSym(float x) {
        return abs(fract(x) - 0.5) * 2.0;
      }

      void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

        float freq = 15.0;
        float amp  = 0.075;

        // Time‑animated symmetric wobble
        float wob = (toothSym(uv.y * freq + uTime * 0.5) - 0.5) * amp * 2.0;

        wob *= mix(0.5, 1.5, uMouse.x);

        float boundary = uWidth + wob;

        if (uv.x >= boundary) {
          outputColor = inputColor;
          return;
        }

        vec3 diff = abs(inputColor.rgb - uColor);

        float shift = uMouse.x * uWidth;

        float g = smoothstep(0.0 + shift, uWidth + shift, uv.x);

        vec3 grad = mix(
          vec3(0.2, 0.6, 1.0),
          uColor,
          g
        );

        outputColor = vec4(diff * grad, 1.0);
      }
    `;

    super("DifferenceEffect", fragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, THREE.Uniform<any>>([
        ["uColor", new THREE.Uniform(new THREE.Color(color))],
        ["uWidth", new THREE.Uniform(width)],
        ["uMouse", new THREE.Uniform(new THREE.Vector2())],
        ["uTime", new THREE.Uniform(0)],
      ]),
    });
  }
}

extend({ DifferenceEffectImpl });

export function DifferenceEffect(props: { width?: number; color?: string }) {

  return (
    // @ts-ignore
    <differenceEffectImpl {...props} />
  );
}