import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PromptHint } from '../../components/PromptHint';
import { Environment, Html, OrbitControls, useTexture } from '@react-three/drei';
import gsap from 'gsap';
import { useFrame, useThree } from '@react-three/fiber';
import { BackgroundShader, DifferenceEffect } from '../../utils/utils';
import { EffectComposer } from '@react-three/postprocessing';

// --------------------------------------------------
// ARROW COMPONENT
// --------------------------------------------------
function Arrow({
    length = 2,
    thickness = 0.04,
    color = "orange",
    phase = 0,
    textures,          // ← shared textures injected from parent
    ...props
}) {
    const groupRef = useRef<THREE.Group>();
    const shaftRef = useRef<THREE.Mesh>();
    const capStartRef = useRef<THREE.Mesh>();
    const capEndRef = useRef<THREE.Mesh>();
    const planeRefs = [useRef<THREE.Mesh>(), useRef<THREE.Mesh>(), useRef<THREE.Mesh>()];

    const [scale] = useState(0.25);
    const half = length / 2;

    // --------------------------------------------------
    // GSAP ANIMATION
    // --------------------------------------------------
    useEffect(() => {
        if (!groupRef.current) return;

        const tl = gsap.timeline({
            delay: phase * 1.2,
            defaults: { duration: 1.2, ease: "elastic.out(1.25, 0.5)" },
            yoyo: true,
            repeatDelay: phase + 0.5,
            repeat: -1
        });

        tl.fromTo(groupRef.current.scale, { x: 0.25 }, { x: 1 }, 0);

        planeRefs.forEach((ref, i) => {
            if (!ref.current) return;
            tl.fromTo(
                ref.current.rotation,
                { x: 3*Math.PI / 4 },
                { x: Math.PI / 2 },
                0.1 + i * 0.05
            );
        });

        return () => {tl.kill()};
    }, [phase, length, thickness]);

    useFrame(() => {
        if (!groupRef.current) return;
    })

    // --------------------------------------------------
    // RENDER
    // --------------------------------------------------
    return (
        <group ref={groupRef} {...props}>

            {/* Shaft */}
            <mesh ref={shaftRef}>
                <boxGeometry args={[length, thickness, thickness]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Pyramid caps */}
            <mesh
                ref={capStartRef}
                position={[-half - thickness, 0, 0]}
                rotation={[Math.PI / 4, 0, Math.PI / 2]}
            >
                <coneGeometry args={[thickness*2, thickness * 2.5, 4]} />
                <meshStandardMaterial color={color} />
            </mesh>

            <mesh
                ref={capEndRef}
                position={[half + thickness, 0, 0]}
                rotation={[Math.PI / 4, 0, -Math.PI / 2]}
            >
                <coneGeometry args={[thickness*2, thickness * 2.5, 4]} />
                <meshStandardMaterial color={color} />
            </mesh>

            <mesh
                ref={planeRefs[0]}
                position={[-length * scale, 0, 0]}
                rotation={[0, Math.PI / 2, -Math.PI/2]}
            >
                <planeGeometry args={[0.6, 0.6]} />
                <meshStandardMaterial
                    map={textures.spiral}
                    transparent
                    side={THREE.DoubleSide}
                />
            </mesh>

            <mesh
                ref={planeRefs[1]}
                position={[0, 0, 0]}
                rotation={[0, Math.PI / 2, Math.PI / 4]}
            >
                <boxGeometry args={[0.6, 0.6, 0.15]} />
                <meshStandardMaterial
                    color={"#7796CE"}
                    side={THREE.DoubleSide}
                />
            </mesh>

            <mesh
                ref={planeRefs[2]}
                position={[length * scale, 0, 0]}
                rotation={[0, Math.PI / 2, -Math.PI/2]}
            >
                <planeGeometry args={[0.6, 0.6]} />
                <meshStandardMaterial
                    map={textures.man}
                    transparent
                    side={THREE.DoubleSide}
                />
            </mesh>

        </group>
    );
}

// --------------------------------------------------
// ARROW CUBE
// --------------------------------------------------
function ArrowCube({ size = 4, padding = 0.2, textures }) {
    const groupRef = useRef<THREE.Group>();
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
        [[ s, -s,  s], [ s,  s,  s]],
        [[-s, -s,  s], [-s,  s,  s]],
    ];

    useEffect(() => {
        if (!groupRef.current) return;
    
        const axes = ["x", "y", "z"];
    
        const spin = () => {
            if (!groupRef.current) return;
            const axis = axes[Math.floor(Math.random() * axes.length)];
            const direction = Math.random() < 0.5 ? 1 : -1;
    
            gsap.to(groupRef.current.rotation, {
                [axis]: groupRef.current.rotation[axis] + direction * (Math.PI / 2),
                duration: 2,
                ease: "elastic.out(1.75, 0.75)",
                onComplete: () => {
                    gsap.delayedCall(2, spin);
                }
            });
        };
    
        spin();
    
        return () => gsap.killTweensOf(groupRef?.current?.rotation);
    }, []);

    return (
        <group ref={groupRef}>
            {edges.map(([a, b], i) => {
                const start = new THREE.Vector3(...a);
                const end = new THREE.Vector3(...b);
                const dir = new THREE.Vector3().subVectors(end, start);

                const fullLength = dir.length();
                const length = fullLength - padding * 2;

                const mid = start.clone().add(
                    dir.clone().setLength(padding + length / 2)
                );

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
                        textures={textures}   // ← shared textures passed down
                    />
                );
            })}
        </group>
    );
}

function BillboardLogo() {
    const { camera } = useThree();
    const logoRef = useRef<THREE.Mesh>();
    const isAnimating = useRef(false);

    const logoTex = useTexture(
        `${import.meta.env.BASE_URL}images/day21/RolandLogo.png`
    );
    logoTex.colorSpace = THREE.SRGBColorSpace;
    logoTex.anisotropy = 8;

    // Billboard + float
    useFrame(({ clock }) => {
        if (!logoRef.current) return;

        // Only billboard when NOT animating
        if (!isAnimating.current) {
            logoRef.current.lookAt(camera.position);
        }

        // Floating motion always allowed
        logoRef.current.position.y += 0.005 * Math.sin(clock.elapsedTime * 2);
    });

    // Spin every 5 seconds
    useEffect(() => {
        if (!logoRef.current) return;

        const spin = () => {
            if (!logoRef.current) return;
            // Ensure it starts facing the camera baseline
            logoRef?.current?.lookAt(camera.position.x == 0 ? new THREE.Vector3(1,1,1) : camera.position);
            isAnimating.current = true;
        
            // Randomly choose axis: "y" or "z"
            const axis = Math.random() < 0.5 ? "y" : "z";
        
            gsap.to(logoRef.current.rotation, {
                [axis]: logoRef.current.rotation[axis] - Math.PI * 4, // 720°
                duration: 2,
                ease: "power2.inOut",
                onStart: () => {
                    isAnimating.current = true;
                },
                onComplete: () => {
                    isAnimating.current = false;
                    gsap.delayedCall(2, spin);
                }
            });
        };

        setTimeout(() => spin(), 2000);

        return () => gsap.killTweensOf(logoRef?.current?.rotation);
    }, []);

    return (
        <mesh ref={logoRef} position={[0, 0, 0]}>
            <planeGeometry args={[2.5, 2.5]} />
            <meshStandardMaterial
                map={logoTex}
                transparent
                metalness={0.6}
                roughness={0.3}
                envMapIntensity={1.2}
                side={2}
            />
        </mesh>
    );
}

function Scene() {
    const { camera, scene } = useThree();
  
    const textures = useTexture({
      spiral: `${import.meta.env.BASE_URL}images/day21/RolandSpiral.png`,
      man: `${import.meta.env.BASE_URL}images/day21/RolandMan.png`,
    });
  
    Object.values(textures).forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
    });
  
    useEffect(() => {
      camera.position.set(10, 10, 10);
      scene.background = null; // let shader be the background
    }, []);
  
    return (
      <>
        {/* 🔥 Your fullscreen shader background */}
        <BackgroundShader fragmentPath={`${import.meta.env.BASE_URL}shaders/day21.glsl`} />
  
        <ambientLight intensity={0.2} />
  
        <directionalLight intensity={1.9} position={[10, 5, 5]} />
        <directionalLight intensity={0.5} position={[0, -5, 0]} />
        <directionalLight intensity={0.5} position={[5, 0, 5]} />
        <directionalLight intensity={1.9} position={[-10, 0, -5]} />
  
        <ArrowCube size={4} textures={textures} />
        <BillboardLogo />
      </>
    );
  }

// --------------------------------------------------
// ROOT
// --------------------------------------------------
const Day21Project = () => {
    return (
        <>
            <PromptHint prompt="Bauhaus Poster" color="white" />
            <Scene />
            <OrbitControls />
            <EffectComposer>
                <DifferenceEffect width={0.52} color="orange" />
            </EffectComposer>

            <Html
                fullscreen
                style={{
                    pointerEvents: "none", // overlay shouldn't block OrbitControls
                }}
            >
                <div
                    style={{
                        width: "33vw",
                        height: "100vh",
                        background: "transparent",
                        mixBlendMode: "difference",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flexStart",
                        marginTop: '-32vh',
                        marginLeft: '-1.75vw'
                    }}
                >
                    <img
                        src={`${import.meta.env.BASE_URL}images/day21/RolandText.svg`}
                        alt="Roland"
                        style={{
                            width: "300%",
                            height: "100%",
                        }}
                    />
                </div>
            </Html>
        </>
    );
};

export default Day21Project;