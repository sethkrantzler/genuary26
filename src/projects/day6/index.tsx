import React, { useRef, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { PromptHint } from "../../components/PromptHint";
import { CompletedSketch, createPathAstroid, createPathLemniscate, createPathRoundedRect, createPathDoubleSpring } from "../../utils/utils";
import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";

function BallGroup({ path, isLit, colors }) {
    const ballRefs = colors.map(() => useRef());
    const lightRefs = colors.map(() => ({
        top: useRef<THREE.PointLight>(null),
        bottom: useRef<THREE.PointLight>(null),
        left: useRef<THREE.PointLight>(null),
        right: useRef<THREE.PointLight>(null),
      }));    
  
    useEffect(() => {
      const obj = { t: 0 };
      const tween = gsap.to(obj, {
        t: 1,
        duration: 4,
        ease: "none",
        repeat: -1,
        onUpdate: () => {
          const baseT = obj.t % 1;
          const offsets = colors.map((_, i) => i / colors.length);
  
          offsets.forEach((offset, i) => {
            const t = (baseT + offset) % 1;
            const pos = path.getPointAt(t);
  
            if (!ballRefs[i].current) return;
            ballRefs[i].current.position.copy(pos);
  
            lightRefs[i].top.current.position.set(pos.x, pos.y + 0.1, pos.z);
            lightRefs[i].bottom.current.position.set(pos.x, pos.y - 0.1, pos.z);
            lightRefs[i].left.current.position.set(pos.x - 0.1, pos.y, pos.z);
            lightRefs[i].right.current.position.set(pos.x + 0.1, pos.y, pos.z);
          });
        },
      });
  
      return () => {tween.kill()};
    }, [path]);
  
    return (
      <>
        {colors.map((color, i) => (
          <React.Fragment key={i}>
            <mesh ref={ballRefs[i]} castShadow>
              <sphereGeometry args={[0.1, 32, 32]} />
              {isLit ? (
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={2}
                />
              ) : (
                <meshBasicMaterial color={color} />
              )}
            </mesh>
  
            {(["top", "bottom", "left", "right"] as const).map((key, j) => (
            <pointLight
                key={j}
                ref={lightRefs[i][key]}
                intensity={isLit ? 3 : 0}
                distance={3}
                color={color}
                castShadow
            />
            ))}
          </React.Fragment>
        ))}
      </>
    );
  }

  function BallTrack({ path, isLit, colors }) {
    const tubeGeometry = useMemo(() => {
      return new THREE.TubeGeometry(path, 300, 0.05, 16, true);
    }, [path]);
  
    return (
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <mesh geometry={tubeGeometry} castShadow receiveShadow>
          <meshStandardMaterial color="#555" metalness={0.4} roughness={0.6} />
        </mesh>
  
        <BallGroup path={path} isLit={isLit} colors={colors} />
      </group>
    );
  }
  
  const Day6Project = () => {
    const { camera, gl } = useThree();
    const [isLit, setIsLit] = useState(false);
    const [pathIndex, setPathIndex] = useState(0);
  
    const paths = useMemo(
      () => [
        createPathRoundedRect(),
        createPathAstroid(),
        createPathLemniscate(),
        createPathDoubleSpring(),
      ],
      []
    );
  
    const path = paths[pathIndex];
    const cameraDistance = 4;
  
    useEffect(() => {
      const canvas = gl.domElement;
        camera.position.set(1 * cameraDistance, 1 * cameraDistance, 1 * cameraDistance);
        camera.lookAt(0, 0, 0);
  
      const toggle = () => {
        setIsLit((prev) => {
          const next = !prev;
          if (!next) {
            console.log("Switching path");
            setPathIndex((i) => (i + 1) % paths.length);
          }
          return next;
        });
      };
  
      canvas.addEventListener("pointerdown", toggle);
  
      return () => {
        canvas.removeEventListener("pointerdown", toggle);
      };
    }, []);
  
    return (
      <>
        <PromptHint prompt="Lights On/off" hint="tap to switch the lights" color="white" />
        <CompletedSketch day={6} />
  
            {/* FLOOR */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
            <planeGeometry args={[30, 30]} />
            <meshStandardMaterial color="#222" />
            </mesh>
    
            {/* BACK WALL */}
            <mesh position={[0, 1, -2]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#111" />
            </mesh>
    
            {/* LEFT WALL */}
            <mesh rotation={[0, Math.PI / 2, 0]} position={[-2, 1, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#111" />
            </mesh>
    
            <BallTrack
            path={path}
            isLit={isLit}
            colors={["yellow", "cyan", "magenta", "lime"]}
            />
        <EffectComposer>
            <Bloom
                intensity={1.5}
                radius={0.5}
                luminanceThreshold={0.2}
                luminanceSmoothing={0.9}
                mipmapBlur
            />
        </EffectComposer>

      </>
    );
  };

export default Day6Project;