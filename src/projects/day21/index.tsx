import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PromptHint } from '../../components/PromptHint';
import { OrbitControls } from '@react-three/drei';
import { UseOrthoCamera } from '../../utils/utils';
import gsap from 'gsap';
import { useThree } from '@react-three/fiber';

function Arrow({
    length = 2,
    thickness = 0.08,
    color = "lightgrey",
    planeColors = ["blue", "red", "yellow"],
    phase = 0,          // ← NEW
    ...props
}) {
    const groupRef = useRef<THREE.Group>();
    const shaftRef = useRef<THREE.Mesh>();
    const capStartRef = useRef<THREE.Mesh>();
    const capEndRef = useRef<THREE.Mesh>();
    const planeRefs = [useRef<THREE.Mesh>(), useRef<THREE.Mesh>(), useRef<THREE.Mesh>()];

    const [scale] = useState(0.25);
    const half = length / 2;

    // ------------------------------------------
    // GSAP ANIMATION
    // ------------------------------------------
    useEffect(() => {
        if (!groupRef.current) return;

        const tl = gsap.timeline({
            delay: phase * 1.2,   // ← stagger based on phase
            defaults: { duration: 1.2, ease: "elastic.out(1.25, 0.5)" },
            yoyo: true,
            repeat: -1
        });

        // Animate the shaft length by scaling X
        tl.fromTo(
            groupRef.current.scale,
            { x: 0.25 },
            { x: 1 },
            0
        );

        // Rotate planes around Y with elastic motion
        planeRefs.forEach((ref, i) => {
            if (!ref.current) return;
            tl.fromTo(
                ref.current.rotation,
                { x: 0 },
                { x: Math.PI /2 },
                0.1 + i * 0.05 // slight internal stagger
            );
        });

        return () => {tl.kill()};
    }, [phase, length, thickness]);

    // ------------------------------------------
    // RENDER
    // ------------------------------------------
    return (
        <group ref={groupRef} {...props}>

            {/* Shaft */}
            <mesh ref={shaftRef}>
                <boxGeometry args={[length, thickness, thickness]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Pyramid cap (start) */}
            <mesh
                ref={capStartRef}
                position={[-half - thickness, 0, 0]}
                rotation={[Math.PI / 4, 0, Math.PI / 2]}
            >
                <coneGeometry args={[thickness, thickness * 2.5, 4]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Pyramid cap (end) */}
            <mesh
                ref={capEndRef}
                position={[half + thickness, 0, 0]}
                rotation={[Math.PI / 4, 0, -Math.PI / 2]}
            >
                <coneGeometry args={[thickness, thickness * 2.5, 4]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Bauhaus planes */}
            <mesh
                ref={planeRefs[0]}
                position={[-length * scale, 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
            >
                <planeGeometry args={[0.6, 0.6]} />
                <meshStandardMaterial color={planeColors[0]} side={THREE.DoubleSide} />
            </mesh>

            <mesh
                ref={planeRefs[1]}
                position={[0, 0, 0]}
                rotation={[0, Math.PI / 2, Math.PI / 4]}
            >
                <planeGeometry args={[0.6, 0.6]} />
                <meshStandardMaterial color={planeColors[1]} side={THREE.DoubleSide} />
            </mesh>

            <mesh
                ref={planeRefs[2]}
                position={[length * scale, 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
            >
                <planeGeometry args={[0.6, 0.6]} />
                <meshStandardMaterial color={planeColors[2]} side={THREE.DoubleSide} />
            </mesh>

        </group>
    );
}

function ArrowCube({ size = 4, padding = 0.8 }) {
    const s = size / 2;

    const edges = [
        [[-s, -s, -s], [ s, -s, -s]],
        [[ s, -s, -s], [ s, -s,  s]],
        [[ s, -s,  s], [-s, -s,  s]],
        [[-s, -s,  s], [-s, -s, -s]],

        [[-s,  s, -s], [ s,  s, -s]],
        [[ s,  s, -s], [ s,  s,  s]],
        [[ s,  s,  s], [-s,  s,  s]],
        [[-s,  s,  s], [-s,  s, -s]],

        [[-s, -s, -s], [-s,  s, -s]],
        [[ s, -s, -s], [ s,  s, -s]],
        [[ s, -s,  s], [ s,  s,  s]], // front side
        [[-s, -s,  s], [-s,  s,  s]],
    ];

    return (
        <group>
            {edges.map(([a, b], i) => {
                const start = new THREE.Vector3(...a);
                const end = new THREE.Vector3(...b);
                const dir = new THREE.Vector3().subVectors(end, start);

                const fullLength = dir.length();
                const length = fullLength - padding * 2;

                // midpoint shifted inward by padding
                const mid = start.clone().add(
                    dir.clone().setLength(padding + length / 2)
                );

                // rotation: align +X to direction
                const quat = new THREE.Quaternion();
                quat.setFromUnitVectors(
                    new THREE.Vector3(1, 0, 0),
                    dir.clone().normalize()
                );

                return (
                    <Arrow
                        key={i}
                        length={length}
                        position={mid}
                        rotation={new THREE.Euler().setFromQuaternion(quat)}
                        phase={i * 0.2}
                    />
                );
            })}
        </group>
    );
}

function Scene() {
    const { camera } = useThree();

    useEffect(() => {
        camera.position.set(6,6,6);
    }, []);
    
    return (
        <>
            <ambientLight intensity={0.2} />

            <directionalLight
                intensity={1.9}
                position={[10, 5, 5]}
                target-position={[0,0,0]}
            />

            <ArrowCube size={4} />


            {/* Floor */}
            <mesh
                rotation={[0, Math.PI/4, 0]}
                position={[0, 0, -5]}
            >
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="cornflowerblue" />
            </mesh>
        </>
    );
}

const Day21Project = () => {
    
    return (
        <>
            <PromptHint prompt="Bauhaus Poster" color="orange" />
            <Scene />
            <OrbitControls />
        </>
    );
};

export default Day21Project;