import React, { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { Physics, useBox, useSphere } from '@react-three/cannon';
import * as THREE from 'three';
import { PromptHint } from '../../components/PromptHint';
import { CanvasTexture } from 'three';
import { CompletedSketch } from '../../utils/utils';

// Utility: generate gear shape points
function createGearShape(radius: number, teeth: number, toothDepth: number) {
  const shape = new THREE.Shape();
  const step = (Math.PI * 2) / teeth;

  for (let i = 0; i < teeth; i++) {
    const angle = i * step;
    const nextAngle = angle + step / 2;

    const x1 = Math.cos(angle) * (radius + toothDepth);
    const y1 = Math.sin(angle) * (radius + toothDepth);

    const x2 = Math.cos(nextAngle) * radius;
    const y2 = Math.sin(nextAngle) * radius;

    if (i === 0) {
      shape.moveTo(x1, y1);
    } else {
      shape.lineTo(x1, y1);
    }
    shape.lineTo(x2, y2);
  }

  shape.closePath();
  return shape;
}

// Gear component
function Gear({
  radius,
  teeth,
  toothDepth,
  position,
  rotation,
  rotationRef,
  color,
}: {
  radius: number;
  teeth: number;
  toothDepth: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  rotationRef: React.RefObject<any>;
  color: string;
}) {
  const shape = createGearShape(radius, teeth, toothDepth);
  const extrudeSettings = { depth: 0.5, bevelEnabled: false };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

  return (
    <mesh
      ref={rotationRef}
      position={position}
      rotation={rotation}
      geometry={geometry}
    >
      <meshStandardMaterial color={color} metalness={1.0} roughness={0.3} />
    </mesh>
  );
}

// GearChain
function GearChain() {
  const gears = [
    { ref: useRef<any>(null), direction: 1, speed: 0.02, color: '#cd7f32', radius: 2.2, teeth: 28, toothDepth: 0.4, pos: [0, 0, 0] as [number, number, number], rot: undefined },
    { ref: useRef<any>(null), direction: -1, speed: 0.03, color: '#ffd700', radius: 1.0, teeth: 14, toothDepth: 0.4, pos: [3.65, 0, 0] as [number, number, number], rot: [0, 0, 0.22] as [number, number, number] },
    { ref: useRef<any>(null), direction: 1, speed: 0.015, color: '#c0c0c0', radius: 1.5, teeth: 20, toothDepth: 0.4, pos: [3.16, 3, 0] as [number, number, number], rot: [0, 0, 0.42] as [number, number, number] },
    { ref: useRef<any>(null), direction: -1, speed: 0.025, color: '#b87333', radius: 1.8, teeth: 24, toothDepth: 0.3, pos: [-0.35, 4.5, 0] as [number, number, number], rot: [0, 0, 0.32] as [number, number, number] },
  ];

  const rotatingRef = useRef(false);

  useFrame(() => {
    gears.forEach((gear) => {
        if (gear.ref.current) {
          gear.ref.current.rotation.z += gear.speed * gear.direction;
        }
      });
  });

  return (
    <group
      position={[0, -2, -15]}
    >
      {gears.map((gear, i) => (
        <Gear
          key={i}
          radius={gear.radius}
          teeth={gear.teeth}
          toothDepth={gear.toothDepth}
          position={gear.pos}
          rotation={gear.rot}
          rotationRef={gear.ref}
          color={gear.color}
        />
      ))}
    </group>
  );
}

function Ball() {
    const [ref, api] = useSphere<THREE.Mesh>(() => ({
      mass: 1,
      position: [0, 8, 0], // start above ramps
      velocity: [-1.5, 0, 0], // initial push to the right
      args: [0.3],
      linearDamping: 0.02,
      angularDamping: 0.02,
      material: { restitution: 0.45 }, // bounce
    }));
    const [lastTime, setLastTime] = useState(Date.now());
  
    useEffect(() => {
        // Subscribe to physics position; avoids relying on ref.current being available
        const unsubscribe = api.position.subscribe(([x, y, z]) => {
          if (y < -8) {
            api.velocity.set(-1.5, 0, 0);
            api.angularVelocity.set(0, 0, 0);
            api.position.set(0, 8, 0); // respawn above ramps
            api.wakeUp();
            console.log('Ball Cycled:', Date.now()-lastTime);
            setLastTime(Date.now());
          }
        });
        return unsubscribe;
      }, [api, lastTime]);
  
    return (
      <mesh ref={ref}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1.0} roughness={0.2} />
      </mesh>
    );
  }
  
  // Sloping ramp (wood-like, with bounce)
  function Ramp({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
    const [ref] = useBox<THREE.Mesh>(() => ({
      type: 'Static',
      position,
      rotation,
      args: [4, 0.2, 1],
      material: { restitution: 0.9 }, // add bounce
    }));
  
    return (
      <mesh ref={ref}>
        <boxGeometry args={[4, 0.2, 1]} />
        {/* Wood-like material */}
        <meshStandardMaterial color="#8b5a2b" metalness={0.1} roughness={0.8} />
      </mesh>
    );
  }

function BallSystem() {
  return (
    <group position={[0, 2, -8]}>
      <Ball />
      <Ramp position={[-2, 0, 0]} rotation={[0, 0, -0.2]} />
      <Ramp position={[2, -1.5, 0]} rotation={[0, 0, 0.2]} />
      <Ramp position={[-2, -3, 0]} rotation={[0, 0, -0.2]} />
      <Ramp position={[2, -4.5, 0]} rotation={[0, 0, 0.2]} />
    </group>
  );
}

function BackgroundBalls({
  targetZ = -20,   // depth where the elevators live
  speed = 0.0262    // upward speed
}: {
  targetZ?: number;
  speed?: number;
}) {
  const { viewport, camera } = useThree();
  const groupRefs = useRef<THREE.Group[]>([]);
  const [lastTime, setLastTime] = useState(Date.now());

  // Compute visible vertical span at targetZ
  const distance = Math.abs(camera.position.z - targetZ);
  const span = viewport.height * (distance / camera.position.z);

  // How many groups are needed to fill that span
  const count = 1;

  useFrame(() => {
    groupRefs.current.forEach((group) => {
      if (!group) return;
      const y = group.position.y;

      group.position.y += speed;

      if (y > span / 2 + 0.5) {
        group.position.y = -0.5 -span / 2;
        console.log('Ball Elevated:', Date.now()-lastTime);
        setLastTime(Date.now());
      }
    });
  });

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <group
          key={i}
          ref={(el) => {
            if (el) groupRefs.current[i] = el;
          }}
          position={[-4, -0.5 -span / 2, targetZ]}
        >
          {/* Tiny wooden platform */}
          <mesh>
            <boxGeometry args={[1, 0.1, 1]} />
            <meshStandardMaterial color="#8b5a2b" metalness={0.1} roughness={0.8} />
          </mesh>

          {/* Shiny silver ball */}
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.3, 32, 32]} />
            <meshStandardMaterial color="#c0c0c0" metalness={1.0} roughness={0.05} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function makeBrushedTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#888';
  ctx.fillRect(0, 0, size, size);

  // draw horizontal streaks
  for (let y = 0; y < size; y++) {
    const alpha = Math.random() * 0.2;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(0, y, size, 1);
  }

  return new CanvasTexture(canvas);
}

function SceneBackground() {
  const texture = makeBrushedTexture();
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);

  return (
    <mesh position={[0, 0, -30]} scale={[50, 50, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial
        map={texture}
        metalness={1.0}
        roughness={0.3}
      />
    </mesh>
  );
}
const Day2Project = () => {

  return (
    <>
      <CompletedSketch day={2} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[0, 5, 10]} intensity={1.25} />
      <Environment preset="warehouse"/>
      <SceneBackground />
      <PromptHint prompt={'twelve principles of animation'} color={'black'} />
      <Physics gravity={[0, -9.81, 0]}>
        <GearChain />
        <BallSystem />
        <BackgroundBalls  />
      </Physics>
      <OrbitControls />
    </>
  );
};

export default Day2Project;