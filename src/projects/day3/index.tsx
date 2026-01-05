import React, { useEffect, useRef } from 'react';
import { Html, OrbitControls } from '@react-three/drei';
import { PromptHint } from '../../components/PromptHint';
import { useFrame, useThree } from '@react-three/fiber';
import { Color, Group, Mesh, MeshBasicMaterial } from 'three';
import { CompletedSketch } from '../../utils/utils';

const sharedMaterial = new MeshBasicMaterial({ wireframe: true, color: 'black' });

function FibonacciCircle({ number, removeMaterial }: { number: number; removeMaterial?: boolean }) {
    const groupRef = React.useRef<Group>(null);
    const cubeRef = React.useRef<Mesh>(null);
    const circleRef = React.useRef<Mesh>(null);
    const radius = number;
    const diameter = 2 * radius;
    const side = radius * Math.sqrt(2);
    
    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.rotation.z += 0.01 / (number + 1);
        }
        if (cubeRef.current) {
            cubeRef.current.rotation.x += 0.02 / (number + 1);
            cubeRef.current.rotation.y += 0.015 / (number + 1);
        }
    });
    
    return (
        <group ref={groupRef}>
            { removeMaterial ? 
            <mesh position={[diameter, 0, 0]}>
                <circleGeometry args={[radius, number]}/>
            </mesh> 
            : <mesh ref={circleRef} position={[diameter, 0, 0]} material={sharedMaterial}> <circleGeometry args={[radius, number]}/>
            </mesh>}
            <mesh ref={cubeRef} position={[diameter, 0, 0]} material={sharedMaterial}>
                <boxGeometry args={[side, side, side]} />
            </mesh>
        </group>
        
    );
}

const Day3Project = () => {
  const { scene } = useThree();
  const [removeMaterial, setRemoveMaterial] = React.useState(false);
  const controlsRef = useRef<any>(null);
  const scale = 0.015;

  // Toggle material on tap/click
  useEffect(() => {
    const toggle = () => setRemoveMaterial(prev => !prev);

    window.addEventListener('click', toggle);

    return () => {
      window.removeEventListener('click', toggle);
    };
  }, []);

  // Set background
  useEffect(() => {
    scene.background = new Color('tan');
  }, [scene]);

  // Double‑tap / double‑click reset
  useEffect(() => {
    let lastTap = 0;

    const handleTap = () => {
      const now = Date.now();
      const delta = now - lastTap;

      if (delta < 300 && controlsRef.current) {
        controlsRef.current.reset();
      }

      lastTap = now;
    };

    window.addEventListener('click', handleTap);

    return () => {
      window.removeEventListener('click', handleTap);
    };
  }, []);

  return (
    <>
      <CompletedSketch day={3} />

      {Array.from({ length: 1000 }, (_, i) => (
        <FibonacciCircle
          key={i}
          number={i * scale}
          removeMaterial={removeMaterial}
        />
      ))}

      <OrbitControls ref={controlsRef} />

      <PromptHint
        prompt={'Fibonacci'}
        hint={'tap to change style / double tap to reset view'}
        color={'blue'}
      />
    </>
  );
};

export default Day3Project;