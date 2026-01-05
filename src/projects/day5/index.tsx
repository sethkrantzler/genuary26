import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useEffect, useState, useRef, useCallback } from "react";
import { PromptHint } from "../../components/PromptHint";
import { OrbitControls } from "@react-three/drei";
import { MicroFontLetterMap, MicroFontLetter, CompletedSketch } from "../../utils/utils";
import React from "react";
import gsap from "gsap";


// --------------------------------------------------
// SHAPE MODES REGISTRY
// --------------------------------------------------

const shapeModes = [
  // --------------------------------------------------
  // MODE 1 — BARS (your original)
  // --------------------------------------------------
  {
    name: "bars",
    geometry: new THREE.BoxGeometry(0.1, 0.1, 0.4),
    material: new THREE.MeshStandardMaterial({
      color: "white",
      metalness: 0.3,
      roughness: 0.4,
    }),
    initialRotation: [0, 0, 0] as [number, number, number],

    onRotate: (ref) => {
      if (!ref.current) return;
    
      const pixels = [];
      ref.current.traverse((child) => {
        if (child instanceof THREE.Mesh) pixels.push(child);
      });
    
      if (pixels.length === 0) return;
    
      const randomRotation = () => {
        const axis = ["x", "y", "z"][Math.floor(Math.random() * 3)];
        const direction = Math.random() < 0.5 ? 1 : -1;
        return { axis, delta: direction * (Math.PI / 2) };
      };
    
      let tl;
    
      const buildTimeline = () => {
        // Kill any existing tweens
        pixels.forEach((m) => gsap.killTweensOf(m.rotation));
    
        const moves = [];
    
        tl = gsap.timeline({
          delay: 5,          // wait before starting
          yoyo: true,        // reverse the scramble
          repeat: 1,         // do scramble → reverse
          repeatDelay: 5,    // wait before reversing
          onComplete: buildTimeline, // restart whole cycle
        });
    
        // SCRAMBLE
        for (let i = 0; i < 15; i++) {
          const mesh = pixels[Math.floor(Math.random() * pixels.length)];
          const { axis, delta } = randomRotation();
          moves.push({ mesh, axis, delta });
    
          tl.to(
            mesh.rotation,
            {
              duration: 0.25,
              [axis]: mesh.rotation[axis] + delta,
              ease: "power2.inOut",
            },
            "+=0"
          );
        }
    
        // SOLVE (after yoyo)
        for (let i = moves.length - 1; i >= 0; i--) {
          const { mesh, axis, delta } = moves[i];
    
          tl.to(
            mesh.rotation,
            {
              duration: 0.25,
              [axis]: mesh.rotation[axis] - delta,
              ease: "power2.inOut",
            },
            "+=0"
          );
        }
      };
    
      buildTimeline();
    
      return () => tl?.kill();
    },
  },

  // --------------------------------------------------
  // MODE 2 — SHINY ICOSAHEDRONS
  // --------------------------------------------------
  {
    name: "icosa",
    geometry: new THREE.TetrahedronGeometry(0.08),
    material: new THREE.MeshStandardMaterial({
      color: "#88ccff",
      metalness: 0.7,
      roughness: 0.05,
    }),
    initialRotation: [0, 0, 0] as [number, number, number],

    onRotate: (ref) => {
      if (!ref.current) return;

      const meshes = [];
      ref.current.traverse((c) => c instanceof THREE.Mesh && meshes.push(c));

      const tick = () => {
        const t = performance.now() * 0.0003;
        meshes.forEach((m) => {
          m.rotation.x += 0.002 + Math.sin(t + m.id) * 0.02;
          m.rotation.y += 0.003 + Math.cos(t + m.id) * 0.02;
          m.rotation.z += 0.015;
        });
      };

      gsap.ticker.add(tick);
      return () => gsap.ticker.remove(tick);
    },
  },

  // --------------------------------------------------
  // MODE 3 — BRONZE COINS (CYLINDERS)
  // --------------------------------------------------
  {
    name: "coins",
    geometry: new THREE.CylinderGeometry(0.08, 0.08, 0.02, 32),
    material: new THREE.MeshStandardMaterial({
      color: "#cd7f32",
      metalness: 0.8,
      roughness: 0.3,
    }),

    // Rotate so the flat face points toward the camera
    initialRotation: [-Math.PI / 2, 0, 0] as [number, number, number],

    onRotate: (ref) => {
      if (!ref.current) return;
    
      const meshes = [];
      ref.current.traverse((c) => c instanceof THREE.Mesh && meshes.push(c));
    
      const offsets = meshes.map(() => Math.random() * 1000);
    
      const tick = () => {
        const t = performance.now() * 0.001;
    
        meshes.forEach((m, i) => {
          const noise = Math.sin(t + offsets[i]);
    
          if (noise > 0.92 && !m.userData.flipping) {
            m.userData.flipping = true;
    
            gsap.to(m.rotation, {
              x: m.rotation.x + Math.PI,
              duration: 0.4,
              ease: "power2.inOut",
              onComplete: () => {
                // Snap relative to initial rotation (-90°)
                const base = -Math.PI / 2;
                const delta = m.rotation.x - base;
                m.rotation.x = base + Math.round(delta / Math.PI) * Math.PI;
    
                // Cooldown
                gsap.delayedCall(1, () => {
                  m.userData.flipping = false;
                });
              },
            });
          }
        });
      };
    
      gsap.ticker.add(tick);
      return () => gsap.ticker.remove(tick);
    },
  },
];


// --------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------

const Day5Project = () => {
  const displayString = "Genuary";
  const letterSpacing = 0.7;
  const pixelSpacing = 0.18;

  const { scene, camera } = useThree();
  const wordRef = useRef<THREE.Group>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);

  const [modeIndex, setModeIndex] = useState(0);

  const cycleMode = () => {
    setModeIndex((i) => (i + 1) % shapeModes.length);
  };

  useEffect(() => {
    window.addEventListener("click", cycleMode);
    return () => {
      window.removeEventListener("click", cycleMode);
    };
  }, []);

  // --------------------------------------------------
  // CENTER + CAMERA FIT
  // --------------------------------------------------
  useEffect(() => {
    if (!wordRef.current) return;

    wordRef.current.scale.set(1, 1, 1);

    let box = new THREE.Box3().setFromObject(wordRef.current);
    const center = new THREE.Vector3();
    box.getCenter(center);
    wordRef.current.position.sub(center);

    box = new THREE.Box3().setFromObject(wordRef.current);
    const size = new THREE.Vector3();
    box.getSize(size);

    const wordWidth = size.x;

    const vFOV = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    const aspect = (camera as THREE.PerspectiveCamera).aspect;
    const hFOV = 2 * Math.atan(Math.tan(vFOV / 2) * aspect);

    const padding = 1.2;
    const requiredDistance = (wordWidth * padding) / (2 * Math.tan(hFOV / 2));

    camera.position.set(0, 0, requiredDistance);
    camera.updateProjectionMatrix();
  }, [displayString, camera, modeIndex]);

  useEffect(() => {
    if (!pointLightRef.current) return;
  
    pointLightRef.current.position.set(-2.5, 0, 1.2);
  
    gsap.to(pointLightRef.current.position, {
      x: 2.5,
      duration: 12,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  }, []);

  useEffect(() => { scene.background = [
    new THREE.Color("black"),
    new THREE.Color("lightblue"),
    new THREE.Color("#7a3f1c"),
  ][modeIndex]; }, [modeIndex]);

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------
  return (
    <>
      <PromptHint
        prompt={"Write Genuary Without a font"}
        hint={"tap to change geometry"}
        color="white"
      />

    <ambientLight intensity={0.5} />
    <directionalLight position={[5, 5, 5]} intensity={3} />

    {/* Moving reflection light */}
    <pointLight
      ref={pointLightRef}
      intensity={0.1}
      distance={8}
      color={"white"}
    />

      <group ref={wordRef} onClick={cycleMode}>
        {displayString.split("").map((char, index) => {
          const upper = char.toUpperCase();
          const data = MicroFontLetterMap[upper];
          if (!data) return null;

          const mode = shapeModes[modeIndex];

          return (
            <MicroFontLetter
              key={index}
              position={[index * letterSpacing, 0, 0]}
              rotation={mode.initialRotation}
              onRotate={mode.onRotate}
              data={data}
              spacing={pixelSpacing}
              geometry={mode.geometry}
              material={mode.material}
            />
          );
        })}
      </group>

      <CompletedSketch day={5} />
      <OrbitControls />
    </>
  );
};

export default Day5Project;