import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { OrbitControls, useTexture } from '@react-three/drei';
import { PromptHint } from '../../components/PromptHint';
import { useThree, useFrame } from '@react-three/fiber';
import { Color, Vector3 } from 'three';
import * as THREE from 'three';
import { CompletedSketch } from '../../utils/utils';
import gsap from 'gsap';
// --------------------------------------------------
// SHARED GEOMETRY + MATERIAL CACHE
// --------------------------------------------------
let sharedSphereGeometry: THREE.SphereGeometry | null = null;
const materialCache = new Map<string, THREE.MeshStandardMaterial>();

type PointData = {
  color: Color;
  home: Vector3;

  // procedural motion params
  axis: Vector3;
  freq: number;
  phase: number;
  amp: number;
};

// --------------------------------------------------
// POINT CLOUD SELF PORTRAIT
// --------------------------------------------------
const PointCloudPortrait = forwardRef(function PointCloudPortrait(
  {
    src,
    resolution = 6000,
    size = 6,
    position = [0, 0, 0],
  }: {
    src: string;
    resolution?: number;
    size?: number;
    position?: [number, number, number];
  },
  ref
) {
  const texture = useTexture(src);
  const groupRef = useRef<THREE.Group>(null);
  const {camera} = useThree();

  const [points, setPoints] = useState<PointData[]>([]);
  const energyRef = useRef(10.3);

  // expose excite() to parent
  useImperativeHandle(ref, () => ({
    excite() {
      energyRef.current += 5; // big spike
    },
  }));

  // --------------------------------------------------
  // SAMPLE RANDOM POINTS WITH CENTER + BRIGHTNESS BIAS
  // --------------------------------------------------
  useEffect(() => {
    if (!texture.image) return;

    const img = texture.image as HTMLImageElement;
    const w = img.width;
    const h = img.height;
    const aspect = h / w;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    const data = ctx.getImageData(0, 0, w, h).data;

    const out: PointData[] = [];

    for (let i = 0; i < resolution; i++) {
      let u = 0;
      let v = 0;
      let r = 0, g = 0, b = 0;

      for (let attempt = 0; attempt < 10; attempt++) {
        u = Math.random();
        v = Math.random();

        const px = Math.floor(u * w);
        const py = Math.floor(v * h);
        const idx = (py * w + px) * 4;

        r = data[idx] / 255;
        g = data[idx + 1] / 255;
        b = data[idx + 2] / 255;

        const brightness = (r + g + b) / 3;

        const du = u - 0.5;
        const dv = v - 0.5;
        const dist = Math.sqrt(du * du + dv * dv);
        const radial = Math.max(0, 0.5 - dist / 0.7);

        const weight = brightness * 0.007 + radial * 0.85;

        if (Math.random() < Math.min(1, weight)) break;
      }

      const color = new Color(r, g, b);

      // midtone depth
      const brightness = (r + g + b) / 3;
      const mid = Math.abs(brightness - 0.5);
      const z = (0.5 - mid) * -5;

      const x = (u - 0.5) * size;
      const y = (0.5 - v) * size * aspect;

      // procedural orbit params
      const axis = new Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize();

      const freq = 1 + Math.random() * 3;
      const phase = Math.random() * Math.PI * 2;
      const amp = 0.02 + Math.random() * 0.05;

      out.push({
        color,
        home: new Vector3(x, y, z),
        axis,
        freq,
        phase,
        amp,
      });
    }

    setPoints(out);
  }, [texture.image, resolution, size]);

  // --------------------------------------------------
  // SHARED SPHERE GEOMETRY
  // --------------------------------------------------
  if (!sharedSphereGeometry) {
    sharedSphereGeometry = new THREE.SphereGeometry(0.06, 12, 12);
  }

  // --------------------------------------------------
  // PROCEDURAL MOTION (sine-wave orbits)
  // --------------------------------------------------
  useFrame(() => {
    if (!groupRef.current || points.length === 0) return;

    // decay energy
    const baseline = 1;
    const t = performance.now() * 0.001;
    energyRef.current += (baseline - energyRef.current) * 0.03;

    const spheres = groupRef.current.children as THREE.Mesh[];

    spheres.forEach((sphere, i) => {
      const p = points[i];
      const home = p.home;

      const A = p.amp * energyRef.current*Math.sin(t)+0.25*Math.sin(2*Math.PI + 0.05*(15-camera.position.z));
      const angle = t * p.freq + p.phase;

      const offset = new Vector3(A, 0, 0).applyAxisAngle(p.axis, angle);

      sphere.position.copy(home).add(offset);
    });
  });

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------
  return (
    <group position={position} ref={groupRef}>
      {points.map((p, i) => {
        const hex = p.color.getHexString();
        let baseMat = materialCache.get(hex);
        if (!baseMat) {
          baseMat = new THREE.MeshStandardMaterial({
            color: p.color,
            roughness: 0.4,
            metalness: 0.1,
          });
          materialCache.set(hex, baseMat);
        }

        return (
          <mesh
            key={i}
            geometry={sharedSphereGeometry!}
            material={baseMat}
            position={p.home.clone()}
          />
        );
      })}
    </group>
  );
});

const Day13Project = () => {
    const { scene, gl, camera } = useThree();
    const portraitRef = useRef<any>(null);
  
    const cameraTweenRef = useRef<gsap.core.Tween | null>(null);
    const lastTapRef = useRef(0);
  
    const startCameraTween = () => {
      cameraTweenRef.current = gsap.to(camera.position, {
        z: 0.01,
        duration: 5,
        yoyo: true,
        repeat: -1,
        ease: "power2.inOut",
        yoyoEase: "power2.inOut"
      });
    };
  
    const stopCameraTween = () => {
      if (cameraTweenRef.current) {
        cameraTweenRef.current.kill();
        cameraTweenRef.current = null;
      }
    };
  
    const handleDoubleTap = () => {
      const now = performance.now();
      if (now - lastTapRef.current < 300) {
        if (cameraTweenRef.current) stopCameraTween();
        else startCameraTween();
      }
      lastTapRef.current = now;
    };
  
    useEffect(() => {
      scene.background = new Color("black");
      camera.position.set(0, 0, 15);
      camera.near = 0.3;
      gl.outputColorSpace = THREE.SRGBColorSpace;
  
      startCameraTween();
  
      return () => {
        stopCameraTween();
      };
    }, [scene, gl, camera]);
  
    return (
      <>
        <CompletedSketch day={13} />
  
        <ambientLight intensity={1.5} />
  
        <mesh
          position={[0, 0, -5]}
          onPointerDown={(e) => {
            e.stopPropagation();
            portraitRef.current?.excite();
            handleDoubleTap();
          }}
        >
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial transparent opacity={0} side={2} />
        </mesh>
  
        <OrbitControls />
  
        <PointCloudPortrait
          ref={portraitRef}
          src={`${import.meta.env.BASE_URL}images/day13/image.jpg`}
          resolution={5000}
          size={6}
          position={[0, 0, 0]}
        />
  
        <PromptHint
          prompt={"Self Portrait"}
          color={"purple"}
          hint={"tap to excite me, double tap to toggle camera motion"}
        />
      </>
    );
  };

export default Day13Project;