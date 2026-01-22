import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Environment, Html, OrbitControls } from '@react-three/drei';
import { PromptHint } from '../../components/PromptHint';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { noise } from '../../utils/utils';

function Panel({ index, total, radius = 5.5, thickness, randomizeColor }) {
    const groupRef = useRef<THREE.Group>();
  
    // Circular placement
    const angle = (index / total) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
  
    // Base orientation (facing outward)
    const tilt = angle + Math.PI / 2;
  
    // Möbius twist: 0 → π over the loop
    const twist = Math.PI*4 * (index / total);
  
    // Color gradient
    const hue = randomizeColor ? noise((index / total) * 360, index) : (index / total) * 360;
    const color = `hsl(${hue}, 80%, 60%)`;
  
    useFrame(() => {
      if (!groupRef.current) return;
      groupRef.current.rotation.y += 0.01;
    });
  
    return (
      <group
        ref={groupRef}
        position={[x, y, 0]}
        rotation={[
          tilt + angle, // your existing tilt
          Math.PI / 2,         // facing outward
          twist                // Möbius twist
        ]}
      >
        <mesh>
          <boxGeometry args={[thickness, 5 + 1.5 * Math.sin(angle), thickness]} />
          <meshPhysicalMaterial
            color={color}
            transmission={1}
            transparent
            opacity={0.33}
            thickness={0.1}
            roughness={0.05}
            metalness={0.9}
            clearcoat={1}
            clearcoatRoughness={0.1}
            iridescence={1}
            iridescenceIOR={1.33}
            iridescenceThicknessRange={[0.5, 100]}
            emissive={color}
            emissiveIntensity={0.15}
            envMapIntensity={0.01}
          />
        </mesh>
      </group>
    );
}

function Sculpture({ count }) {
  const panels = Array.from({ length: count })
  const groupRef = useRef<THREE.Group>()
  const [thickness, setThickness] = useState<number>(0);
  const [randomizeColor, setRandomizeColor] = useState(false);
  const thicknesses = [0.5, 0.1, 0.05];

  const baseQuat = useRef(new THREE.Quaternion())
  const spinQuat = new THREE.Quaternion()
  const wobbleQuat = new THREE.Quaternion()

  useEffect(() => {
    if (groupRef.current) {
      baseQuat.current.copy(groupRef.current.quaternion)
    }
  }, [])

  const changeThickness = useCallback((e) => {
    e.stopPropagation();
    setThickness((p) => (p+1) % thicknesses.length)
    setRandomizeColor((p) => !p);
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    if (groupRef.current) {
      // 1. Constant spin around Z
      spinQuat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), t * 0.4)
      // 3. Combine: base → spin → wobble
      groupRef.current.quaternion
        .copy(baseQuat.current)
        .multiply(spinQuat)
        .multiply(wobbleQuat)
    }
  })

  return (
    <group rotation={[0, Math.PI/2, 0]}>
        <mesh
            position={[0, 0, 0]}
            rotation={[0, Math.PI/2, 0]}
            onDoubleClick={(e) => changeThickness(e)}
        >
        <boxGeometry args={[10,10,10]} /> {/* adjust size as needed */}
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

        <group ref={groupRef} rotation={[0, 0, 0]}>
            {panels.map((_, i) => (
                <Panel key={i} index={i} total={count} thickness={thicknesses[thickness]} randomizeColor={randomizeColor} />
            ))}
        </group>
    </group>
    
  )
}

const Day23Project = () => {

    const {camera, scene} = useThree();

    useEffect(() => {
        camera.position.set(0, 0, 25);
        camera.lookAt(0, 0, 0);
        scene.background = new THREE.Color('#00120f');
    }, []);

    return (
        <>
            <PromptHint prompt="transparency" />
            {/* Ambient + directional for subtle fill */}
            <ambientLight intensity={1} />
            <Environment preset='studio' />
            {/* The sculpture */}
            <Sculpture count={100} />
            <OrbitControls/>
        </>
    );
};

export default Day23Project;