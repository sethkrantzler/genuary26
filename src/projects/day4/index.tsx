import React, { useEffect, useRef, useState } from 'react';
import { useTexture } from '@react-three/drei';
import { PromptHint } from '../../components/PromptHint';
import { useThree } from '@react-three/fiber';
import { Color } from 'three';
import * as THREE from 'three';
import gsap from 'gsap';
import { CompletedSketch, noise } from '../../utils/utils';

// -----------------------------
// SHARED GEOMETRY + MATERIAL CACHE
// -----------------------------
let sharedTileGeometry: THREE.BoxGeometry | null = null;
const materialCache = new Map<string, THREE.MeshStandardMaterial>();

function LowResImage({
  src,
  resolution = 40,
  size = 4,
  position = [0, 0, 0],
}: {
  src: string;
  resolution?: number;
  size?: number;
  position?: [number, number, number];
}) {
  const texture = useTexture(src);
  const squaresRef = useRef<THREE.Group>(null);
  const baseImageRef = useRef<THREE.Mesh>(null);

  const [colors, setColors] = useState<Color[]>([]);
  const [aspect, setAspect] = useState(1);
  const [tilesY, setTilesY] = useState(1);

  // -----------------------------
  // Extract pixel colors
  // -----------------------------
  useEffect(() => {
    setColors([]);

    if (!texture.image) return;

    const img = texture.image as HTMLImageElement;
    const w = img.width;
    const h = img.height;
    const aspect = h / w;
    setAspect(aspect);

    const tilesX = resolution;
    const tilesY = Math.max(1, Math.floor(tilesX * aspect));
    setTilesY(tilesY);

    const canvas = document.createElement("canvas");
    canvas.width = tilesX;
    canvas.height = tilesY;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, tilesX, tilesY);

    const data = ctx.getImageData(0, 0, tilesX, tilesY).data;

    const out: Color[] = [];
    for (let i = 0; i < tilesX * tilesY; i++) {
      const r = data[i * 4] / 255;
      const g = data[i * 4 + 1] / 255;
      const b = data[i * 4 + 2] / 255;
      out.push(new Color(r, g, b));
    }

    setColors(out);
  }, [texture.image, resolution, src]);

  // -----------------------------
  // Run animation after tiles mount
  // -----------------------------
  useEffect(() => {
    if (!squaresRef.current || colors.length === 0 || !baseImageRef.current) return;

    requestAnimationFrame(() => {
      runTileAnimation();
    });
  }, [colors]);

  // -----------------------------
  // GSAP Animation
  // -----------------------------
  function runTileAnimation() {
    const squares = squaresRef.current!.children as THREE.Mesh[];

    gsap.killTweensOf("*");

    const tl = gsap.timeline();

    // ---- Phase 1: Flip-in (1.5s total) ----
    const flipPhaseTotal = 1.5;
    const flipDuration = 0.6;
    const flipMaxDelay = flipPhaseTotal - flipDuration; // 0.9

    squares.forEach((square, i) => {
      const n = noise(i * 0.137, i * 0.731);
      const delay = n * flipMaxDelay;

      square.rotation.x = Math.PI / 2;
      (square.material as THREE.Material).opacity = 0;

      tl.to(square.material, {
        opacity: 1,
        duration: flipDuration,
        ease: "power2.out",
      }, delay);

      tl.to(square.rotation, {
        x: 0,
        duration: flipDuration,
        ease: "back.out(1.7)",
      }, delay);
    });

    // ---- Phase 2: Fade in base image ----
    tl.to(baseImageRef.current!.material, {
      opacity: 1,
      duration: 0.6,
      ease: "power2.out",
    }, flipPhaseTotal - 0.3);

    // ---- Pause 2s ----
    const pauseDuration = 2;
    const riseStart = flipPhaseTotal + pauseDuration; // 3.5

    // ---- Phase 3: Rise + fade out (7s total) ----
    const risePhaseTotal = 7;
    const riseMaxDelay = 1.0;
    const riseDuration = risePhaseTotal - riseMaxDelay; // 6

    squares.forEach((square, i) => {
      const n = noise(i * 0.237, i * 0.531);
      const delay = n * riseMaxDelay;

      tl.to(square.position, {
        z: 16.5,
        duration: riseDuration,
        ease: "power2.inOut",
      }, riseStart + delay);

      tl.to(square.material, {
        opacity: 0,
        duration: riseDuration,
        ease: "power2.in",
      }, riseStart + delay);
    });
  }

  // -----------------------------
  // Build shared geometry
  // -----------------------------
  if (colors.length === 0) return null;

  const tilesX = resolution;
  const tileW = size / tilesX;
  const tileH = (size * aspect) / tilesY;

  if (!sharedTileGeometry || sharedTileGeometry.parameters.width !== tileW) {
    sharedTileGeometry?.dispose();
    sharedTileGeometry = new THREE.BoxGeometry(tileW, tileH, tileW * 0.2);
  }

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <group position={position}>
      {/* Base image */}
      <mesh ref={baseImageRef} position={[0, 0, 0]}>
        <planeGeometry args={[size, size * aspect]} />
        <meshStandardMaterial map={texture} transparent opacity={0} />
      </mesh>

      {/* Tiles */}
      <group ref={squaresRef}>
        {colors.map((color, i) => {
          const x = i % tilesX;
          const y = Math.floor(i / tilesX);
          const flippedY = tilesY - 1 - y;

          // MATERIAL CACHE (base material)
        const hex = color.getHexString();
        let baseMat = materialCache.get(hex);
        if (!baseMat) {
        baseMat = new THREE.MeshStandardMaterial({
            color,
            transparent: true,
            opacity: 0,
        });
        materialCache.set(hex, baseMat);
        }

        // Clone per tile so opacity animation is independent
        const mat = baseMat.clone();
        mat.opacity = 0;

          return (
            <mesh
              key={i}
              position={[
                x * tileW - size / 2 + tileW / 2,
                flippedY * tileH - (size * aspect) / 2 + tileH / 2,
                0.01,
              ]}
              geometry={sharedTileGeometry!}
              material={mat}
            />
          );
        })}
      </group>
    </group>
  );
}

// -----------------------------
// MAIN PROJECT
// -----------------------------
const Day4Project = () => {
  const { scene, gl } = useThree();
  const [index, setIndex] = useState(7);

  const handleClick = () => {
    setIndex((prev) => (prev % 9) + 1);
  };

  useEffect(() => {
    scene.background = new Color('lightgray');
    gl.outputColorSpace = THREE.SRGBColorSpace;
  }, [scene, gl]);

  return (
    <>
      <CompletedSketch day={4} />

      <ambientLight intensity={1.5} />
    
      {/* Click catcher */}
      <mesh position={[0, 0, -5]} onClick={handleClick}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <LowResImage
        key={index}
        src={`${import.meta.env.BASE_URL}images/day4/img${index}.jpg`}
        resolution={40}
        size={4}
        position={[0, 0, -10]}
      />

      <PromptHint prompt={'Low-Res'} color={'white'} hint={'tap to change image'} />
    </>
  );
};

export default Day4Project;