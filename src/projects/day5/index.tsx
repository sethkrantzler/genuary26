import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { PromptHint } from "../../components/PromptHint";
import { OrbitControls } from "@react-three/drei";
import { MicroFontLetterMap, MicroFontLetter } from "../../utils/utils";
import React from "react";
import gsap from "gsap";

const Day5Project = () => {
    const displayString = "Genuary";
    const letterSpacing = 0.7;
    const pixelSpacing = 0.18;

    const { scene, camera } = useThree();
    const wordRef = React.useRef<THREE.Group>(null);

    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.4);
    const material = new THREE.MeshStandardMaterial({
        color: "white",
        metalness: 0.3,
        roughness: 0.4,
    });

    useEffect(() => {
        if (!wordRef.current) return;
    
        // Reset scale so bounding box is accurate
        wordRef.current.scale.set(1, 1, 1);
    
        // --- CENTER THE GROUP ---
        let box = new THREE.Box3().setFromObject(wordRef.current);
        const center = new THREE.Vector3();
        box.getCenter(center);
        wordRef.current.position.sub(center);
    
        // --- RECOMPUTE BOUNDS AFTER CENTERING ---
        box = new THREE.Box3().setFromObject(wordRef.current);
        const size = new THREE.Vector3();
        box.getSize(size);
    
        const wordWidth = size.x;
    
        // --- CORRECT HORIZONTAL FOV ---
        const vFOV = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180); // vertical fov in radians
        const aspect = (camera as THREE.PerspectiveCamera).aspect;
    
        // horizontal fov in radians
        const hFOV = 2 * Math.atan(Math.tan(vFOV / 2) * aspect);
    
        // --- REQUIRED DISTANCE USING HORIZONTAL FOV ---
        const padding = 1.8;
        const requiredDistance = (wordWidth * padding) / (2 * Math.tan(hFOV / 2));
    
        camera.position.set(0, 0, requiredDistance);
        camera.updateProjectionMatrix();
    }, [displayString, camera]);

    useEffect(() => {
        scene.background = new THREE.Color("black");
    }, [scene]);

//   const onRotate = React.useCallback((ref: React.RefObject<THREE.Group>) => {
//     if (!ref.current) return;
  
//     // Collect all pixel meshes
//     const pixels: THREE.Mesh[] = [];
//     ref.current.traverse((child) => {
//       if (child instanceof THREE.Mesh) {
//         pixels.push(child);
//       }
//     });
  
//     if (pixels.length === 0) return;
  
//     // Give each pixel a unique noise offset
//     const offsets = pixels.map(() => Math.random() * 1000);
  
//     // Animation loop using GSAP ticker (runs at ~60fps)
//     const tick = () => {
//       const t = performance.now() * 0.0005; // time factor
  
//       pixels.forEach((mesh, i) => {
//         const noise = Math.sin(t + offsets[i]); // organic oscillation
  
//         // Trigger threshold
//         if (noise > 0.95 && !mesh.userData.rotating) {
//             mesh.userData.rotating = true;
        
//             // Pick a random axis: 0 = x, 1 = y, 2 = z
//             const axisIndex = Math.floor(Math.random() * 3);
//             const axis = ["x", "y", "z"][axisIndex] as "x" | "y" | "z";
        
//             // Pick a random direction: +90° or -90°
//             const direction = Math.random() < 0.5 ? 1 : -1;
        
//             // Compute the target rotation
//             const delta = direction * (Math.PI / 2);
        
//             gsap.to(mesh.rotation, {
//                 duration: 0.4,
//                 [axis]: mesh.rotation[axis] + delta,
//                 ease: "power2.inOut",
//                 onComplete: () => {
//                     mesh.userData.rotating = false;
//                 }
//             });
//         }
//       });
//     };
  
//     gsap.ticker.add(tick);
  
//     // Cleanup
//     return () => gsap.ticker.remove(tick);
//   }, []);
const onRotate = React.useCallback((ref) => {
    if (!ref.current) return;
  
    // Collect all pixel meshes inside this letter
    const pixels = [];
    ref.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        pixels.push(child);
      }
    });
  
    if (pixels.length === 0) return;
  
    const randomRotation = () => {
      const axis = ["x", "y", "z"][Math.floor(Math.random() * 3)];
      const direction = Math.random() < 0.5 ? 1 : -1;
      const delta = direction * (Math.PI / 2);
      return { axis, delta };
    };
  
    let tl; // current timeline instance
  
    const buildTimeline = () => {
      // Kill any existing tweens on all meshes
      pixels.forEach((mesh) => gsap.killTweensOf(mesh.rotation));
  
      const moves = [];
      tl = gsap.timeline({
        delay: 5,
        yoyo: true,
        repeatDelay: 5,
        repeat: 1,
        onComplete: () => {
          // When solve finishes, build a brand new timeline
          buildTimeline();
        }
      });
  
      // --- SCRAMBLE ---
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
  
      // --- SOLVE ---
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
  
    // Start the first cycle
    buildTimeline();
  
    return () => {
      if (tl) tl.kill();
      pixels.forEach((mesh) => gsap.killTweensOf(mesh.rotation));
    };
  }, []);

  return (
    <>
      <PromptHint prompt={"Write Genuary Without a font"} color="white" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <group ref={wordRef}>
        {displayString.split("").map((char, index) => {
          const upper = char.toUpperCase();
          const data = MicroFontLetterMap[upper];
          if (!data) return null;

          return (
            <MicroFontLetter
              key={index}
              position={[index * letterSpacing, 0, 0]}
              rotation={[0, 0, 0]}
              onRotate={onRotate}
              data={data}
              spacing={pixelSpacing}
              geometry={geometry}
              material={material}
            />
          );
        })}
      </group>

      <OrbitControls />
    </>
  );
};

export default Day5Project;