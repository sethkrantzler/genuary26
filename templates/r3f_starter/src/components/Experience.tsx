import * as THREE from "three";
import React, { useState, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { GUI } from 'lil-gui';

function Orange({ z, speed, mouse, strength, falloff }) {
    const ref = useRef<THREE.Group>(null);
    const { viewport, camera } = useThree();
    const { width, height } = viewport.getCurrentViewport(camera, [0, 0, z]);

    const [data] = useState({
        x: THREE.MathUtils.randFloatSpread(2),
        y: THREE.MathUtils.randFloatSpread(height),
    });

    useFrame(() => {
        if (!ref.current) return;

        // Convert mouse NDC to world position at depth z
        const ndc = new THREE.Vector3(mouse.current.x, mouse.current.y, 0);
        ndc.unproject(camera);
        const dir = ndc.sub(camera.position).normalize();
        const distance = (z - camera.position.z) / dir.z;
        const mouseWorldPos = camera.position.clone().add(dir.multiplyScalar(distance));

        // Compute force vector from mouse to orange
        const orangePos = ref.current.position;
        const force = new THREE.Vector3().subVectors(orangePos, mouseWorldPos);

        // Only apply horizontal (X-axis) force
        force.y = 0;
        force.z = 0;

        const dist = Math.abs(force.x);
        const depthDistance = Math.abs(z - camera.position.z);
        const depthFalloff = 1 / (1 + depthDistance * 0.05);

        const scaledForce = force.normalize().multiplyScalar(strength * depthFalloff / (dist + falloff * 100));
        data.x += scaledForce.x;

        // Update position and rotation
        ref.current.position.set(data.x * width, (data.y -= speed), z);
        if (data.y < -height / 1.5) {
            data.y = height / 1.5;
            data.x = THREE.MathUtils.randFloatSpread(1.5); // re-center spawn
        }

        ref.current.rotation.x += data.x * 0.05;
        ref.current.rotation.y += data.x * 0.03;
        ref.current.rotation.z += data.x * 0.02;
    });

    return (
        <group ref={ref}>
            <mesh position={[0, 0.5, 0]} scale={[0.05, 0.1, 0.05]}>
                <cylinderGeometry />
                <meshStandardMaterial color="green" />
            </mesh>
            <mesh position={[0.035, 0.5, 0]} scale={[0.15, 0.01, 0.07]} rotation={[0, 0, Math.PI / 4]}>
                <sphereGeometry />
                <meshStandardMaterial color="green" />
            </mesh>
            <mesh scale={0.5}>
                <sphereGeometry />
                <meshStandardMaterial color="#ff7318" />
            </mesh>
        </group>
    );
}

const Experience = () => {
    const [count, setCount] = useState(100);
    const [speed, setSpeed] = useState(0.03);
    const [falloff, setFalloff] = useState(5.2);
    const [force, setForce] = useState(0.1);
    const [accelStrength, setAccelStrength] = useState(2);
    const mouse = useRef(new THREE.Vector2());
    const prevMouse = useRef(new THREE.Vector2());
    const velocity = useRef(new THREE.Vector2());
    const acceleration = useRef(new THREE.Vector2());

    useEffect(() => {
        const gui = new GUI();
        gui.add({ speed }, 'speed', 0, 1, 0.01).onChange(setSpeed);
        gui.add({ count }, 'count', 1, 1000, 1).onChange(setCount);
        gui.add({ falloff }, 'falloff', 0.01, 10, 0.01).onChange(setFalloff);
        gui.add({ force }, 'force', 0, 100, 0.01).onChange(setForce);
        gui.add({ accelStrength }, 'accelStrength', 0, 10, 0.01).onChange(setAccelStrength);
    
        const toggleGUIVisibility = (event: KeyboardEvent) => {
            if (event.key === 'h') {
                gui.domElement.style.display = gui.domElement.style.display === 'none' ? '' : 'none';
            }
        };
    
        const updatePointer = (x: number, y: number) => {
            const ndcX = (x / window.innerWidth) * 2 - 1;
            const ndcY = -(y / window.innerHeight) * 2 + 1;
    
            const newMouse = new THREE.Vector2(ndcX, ndcY);
            const newVelocity = newMouse.clone().sub(mouse.current);
            const newAcceleration = newVelocity.clone().sub(velocity.current);
    
            velocity.current.copy(newVelocity);
            acceleration.current.copy(newAcceleration);
            prevMouse.current.copy(mouse.current);
            mouse.current.copy(newMouse);
        };
    
        const handleMouseMove = (event: MouseEvent) => {
            updatePointer(event.clientX, event.clientY);
        };
    
        const handleTouchMove = (event: TouchEvent) => {
            if (event.touches.length > 0) {
                const touch = event.touches[0];
                updatePointer(touch.clientX, touch.clientY);
            }
        };
    
        window.addEventListener('keydown', toggleGUIVisibility);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);
    
        return () => {
            window.removeEventListener('keydown', toggleGUIVisibility);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            gui.destroy();
        };
    }, []);

    useFrame(() => {
        const accelMagnitude = acceleration.current.length();
        const newForce = THREE.MathUtils.clamp(0.1 + accelMagnitude * accelStrength , 0.1, 3);
        setForce(newForce);
    });

    return (
        <>
            <directionalLight
                position={[5, 1, 8]}
                intensity={1.5}
                color="#ffcc88"
                castShadow
            />
            <ambientLight intensity={0.3} />
            {Array.from({ length: count }, (_, i) => (
                <Orange key={i} z={-i} speed={speed} mouse={mouse} strength={force} falloff={falloff} />
            ))}
        </>
    );
};

export default Experience;