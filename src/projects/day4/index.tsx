import React, { useEffect, useRef, useState } from 'react';
import { OrbitControls, useTexture } from '@react-three/drei';
import { PromptHint } from '../../components/PromptHint';
import { useThree } from '@react-three/fiber';
import { Color } from 'three';
import * as THREE from 'three';
import gsap from 'gsap';

// Simple noise function for stagger
function noise(x: number, y: number) {
  return (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
}

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

  const [colors, setColors] = useState<Color[]>([]);
  const [aspect, setAspect] = useState(1);
  const [tilesY, setTilesY] = useState(1);

  // Compute average colors per image load
  useEffect(() => {
    // clear previous state so we don't render with stale data
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

  // Animate tiles falling in Z direction
  useEffect(() => {
    if (!squaresRef.current || colors.length === 0) return;

    const squares = squaresRef.current.children;

    const totalTime = 10.0;
    const fallHeight = 20.5;

    // Kill any existing tweens on these positions before re-creating
    squares.forEach((square: any) => {
      gsap.killTweensOf(square.position);
    });

    squares.forEach((square: THREE.Mesh, i) => {
      const n = noise(i * 0.137, i * 0.731);

      const delay = n * 1.5;
      const fallDuration = Math.max(0.1, totalTime - delay);

      gsap.fromTo(
        square.position,
        { z: fallHeight },
        {
          z: 0.01,
          duration: fallDuration,
          delay,
          repeat: -1,
          repeatDelay: 3.0,
          yoyo: true,
          ease: "power3.inOut",
        }
      );
    });

    // Cleanup: kill tweens when colors/aspect/resolution change or component unmounts
    return () => {
      squares.forEach((square: any) => {
        gsap.killTweensOf(square.position);
      });
    };
  }, [colors, aspect, size, resolution]);

  if (colors.length === 0) return null;

  const tilesX = resolution;
  const tileW = size / tilesX;
  const tileH = (size * aspect) / tilesY;

  return (
    <group position={position}>
      {/* Base image */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[size, size * aspect]} />
        <meshStandardMaterial map={texture} />
      </mesh>

      {/* Falling tiles */}
      <group ref={squaresRef}>
        {colors.map((color, i) => {
          const x = i % tilesX;
          const y = Math.floor(i / tilesX);

          const flippedY = tilesY - 1 - y;

          return (
            <mesh
              key={i}
              position={[
                x * tileW - size / 2 + tileW / 2,
                flippedY * tileH - (size * aspect) / 2 + tileH / 2,
                0.01,
              ]}
            >
              <planeGeometry args={[tileW, tileH]} />
              <meshStandardMaterial color={color} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

const Day4Project = () => {
    const { scene, gl } = useThree();
  const [index, setIndex] = useState(1);

  // Cycle images on click
  const handleClick = () => {
    setIndex((prev) => (prev % 6) + 1);
  };

  useEffect(() => {
    gl.outputColorSpace = THREE.SRGBColorSpace;
}, [scene, gl]);

  return (
    <>
        <ambientLight intensity={1.5} />
      {/* Click catcher in front of everything */}
      <mesh position={[0, 0, -5]} onClick={handleClick}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <LowResImage
        key={index} // force remount on image change to avoid aspect/tween leftovers
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