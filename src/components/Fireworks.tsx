import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { getVisitedSketches, smoothstepRange } from '../utils/utils';

function createRandomFirework(textures: THREE.Texture[]) {
    const x = (Math.random()-0.5) * 2;
    const z = 2;
    const y = Math.random() * 0.25;
  
    const size = 0.1 + Math.random() * 0.1;
    const radius = 0.5 + Math.random();
  
    const texture = textures[Math.floor(Math.random() * textures.length)];
  
    const color = new THREE.Color();
    color.setHSL(Math.random(), 1, 0.5);
  
    return {
      position: [x, y, z] as [number, number, number],
      size,
      radius,
      texture,
      color,
    };
  }

export function Fireworks() {
  const fireworkFreq = 0.75;
  const {scene} = useThree();
  const [fireworks, setFireworks] = useState<
    { id: number; config: ReturnType<typeof createRandomFirework> }[]
  >([]);
  const [showFireworks, setShowFireworks] = useState(false);

    useEffect(() => {
        const existing = document.cookie
            .split("; ")
            .find((row) => row.startsWith("visitedSketches="));

        if (!existing) {
            document.cookie = `visitedSketches=${JSON.stringify([])}; path=/; max-age=31536000`;
        } else {
        const visited = getVisitedSketches();
        if (visited.length === 31) {
            setShowFireworks(true);
        }
        }
    }, []);

    useFrame(({clock})=> {
        if (showFireworks) {
            scene.background = new THREE.Color("black");
            return;
        }
        const b = (Math.sin(clock.elapsedTime*0.25) + 1) / 2;
        const s = smoothstepRange(b, 0, 1, 0.005, 0.6);

        scene.background = new THREE.Color(s, s, s);      
    })

    const textures = useLoader(THREE.TextureLoader, [
        `${import.meta.env.BASE_URL}textures/1.png`,
        `${import.meta.env.BASE_URL}textures/2.png`,
        `${import.meta.env.BASE_URL}textures/4.png`,
        `${import.meta.env.BASE_URL}textures/5.png`,
        `${import.meta.env.BASE_URL}textures/6.png`,
        `${import.meta.env.BASE_URL}textures/7.png`,
        `${import.meta.env.BASE_URL}textures/8.png`,
    ]);


  // Spawn fireworks on interval
  useEffect(() => {
    const interval = setInterval(() => {
      setFireworks((prev) => [
        ...prev,
        {
          id: Date.now(),
          config: createRandomFirework(textures),
        },
      ]);
    }, fireworkFreq * 1000);

    return () => clearInterval(interval);
  }, [textures]);

  // Remove firework when it finishes
  const handleDestroy = (id: number) => {
    setFireworks((prev) => prev.filter((fw) => fw.id !== id));
  };

  if (!showFireworks || !textures.length) return null;

  return (
    <>
      {fireworks.map(({ id, config }) => (
        <Firework
          key={id}
          id={id}
          onDestroy={handleDestroy}
          {...config}
        />
      ))}
    </>
  );
}
  
  function Firework({
    id,
    onDestroy,
    count = 100,
    size = 0.5,
    position = [0, 0, 0],
    texture,
    radius = 1,
    color = new THREE.Color('#00f'),
  }: {
    id: number;
    onDestroy: (id: number) => void;
    count?: number;
    size?: number;
    position?: [number, number, number];
    texture: THREE.Texture;
    radius?: number;
    color?: THREE.Color;
  }) {
    const { gl } = useThree();
  
    const pointsRef = useRef<THREE.Points>(null!);
    const geometryRef = useRef<THREE.BufferGeometry>(null!);
    const materialRef = useRef<THREE.ShaderMaterial>(null!);
  
    const [vertexShader, fragmentShader] = useLoader(
      THREE.FileLoader,
      [
        `${import.meta.env.BASE_URL}shaders/fireworks_v.glsl`,
        `${import.meta.env.BASE_URL}shaders/fireworks_f.glsl`,
      ],
      (loader) => loader.setResponseType('text')
    ) as unknown as [string, string];
  
    // Generate particle positions
    const positionsArray = useMemo(() => {
      const arr = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const spherical = new THREE.Spherical(
          radius * (0.75 + Math.random() * 0.25),
          Math.random() * Math.PI,
          Math.random() * Math.PI * 2
        );
        const pos = new THREE.Vector3().setFromSpherical(spherical);
        arr[i3] = pos.x;
        arr[i3 + 1] = pos.y;
        arr[i3 + 2] = pos.z;
      }
      return arr;
    }, [count]);
  
    // Random per‑particle sizes
    const sizesArray = useMemo(() => {
      const arr = new Float32Array(count);
      for (let i = 0; i < count; i++) arr[i] = Math.random();
      return arr;
    }, [count]);

    // Random per particle time
    const timeMultiplierArray = useMemo(() => {
        const arr = new Float32Array(count);
        for (let i = 0; i < count; i++) arr[i] = 1 + Math.random();
        return arr;
      }, [count]);
  
    // Destroy logic
    const destroy = () => {
      geometryRef.current?.dispose();
      materialRef.current?.dispose();
  
      if (pointsRef.current?.parent) {
        pointsRef.current.parent.remove(pointsRef.current);
      }
  
      onDestroy(id);
    };
  
    // Animate explosion
    useEffect(() => {
      if (!materialRef.current) return;
  
      gsap.to(materialRef.current.uniforms.uProgress, {
        value: 1,
        duration: 3,
        ease: 'linear',
        onComplete: destroy,
      });
    }, []);
  
    // Handle resize
    useEffect(() => {
      const handleResize = () => {
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
  
    if (!vertexShader || !fragmentShader) return null;
  
    texture.flipY = false;
  
    return (
      <points ref={pointsRef} position={position}>
        <bufferGeometry ref={geometryRef}>
          <bufferAttribute
            attach="attributes-position"
            array={positionsArray}
            count={count}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-aSize"
            array={sizesArray}
            count={count}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-aTimeMultiplier"
            array={timeMultiplierArray}
            count={count}
            itemSize={1}
          />
        </bufferGeometry>
  
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={{
            uSize: new THREE.Uniform(size),
            uResolution: new THREE.Uniform(
              new THREE.Vector2(window.innerWidth, window.innerHeight)
            ),
            uTexture: new THREE.Uniform(texture),
            uColor: new THREE.Uniform(color),
            uProgress: new THREE.Uniform(0),
          }}
        />
      </points>
    );
  }