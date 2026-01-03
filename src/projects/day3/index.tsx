import React, { useEffect } from 'react';
import { Html, OrbitControls } from '@react-three/drei';
import { PromptHint } from '../../components/PromptHint';
import { useFrame, useThree } from '@react-three/fiber';
import { Color, Group, Mesh, MeshBasicMaterial } from 'three';

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
    const {scene} = useThree();
    const [removeMaterial, setRemoveMaterial] = React.useState(false);
    const scale = 0.015;

    useEffect(() => {
        window.addEventListener('click', () => setRemoveMaterial((prev) => !prev));
        window.addEventListener('touch', () => setRemoveMaterial((prev) => !prev));
        window.addEventListener('drag', () => setRemoveMaterial((prev) => !prev));

    
        return () => {
            window.removeEventListener('click', () => setRemoveMaterial((prev) => !prev));
            window.removeEventListener('touch', () => setRemoveMaterial((prev) => !prev));
            window.removeEventListener('drag', () => setRemoveMaterial((prev) => !prev));
        };
    }, []); 

    useEffect(() => {
        scene.background = new Color('tan');
    }
    , []);


    return (
        <>
            {Array.from({ length: 1000}, (_, i) => (
                <FibonacciCircle key={i} number={i*scale} removeMaterial={removeMaterial} />
            ))}
            <OrbitControls />
            <PromptHint prompt={'Fibonacci'} hint={'tap to change style'} color={'black'}/>
        </>
    );
};

export default Day3Project;