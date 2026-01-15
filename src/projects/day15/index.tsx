
import { PromptHint } from '../../components/PromptHint';
import { CompletedSketch } from '../../utils/utils';
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';

function BackWall() {
    return (
      <mesh position={[0, 0, -1.5]} receiveShadow>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
    )
  }
  
  function Panel({ index, total, radius = 2.5, height = 3 }) {
    const groupRef = useRef<THREE.Group>();
    const targetRef = useRef()
    const lightRef = useRef<THREE.SpotLight>();
    const angle = (index / total) * Math.PI * 2
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
  
    const tilt = angle + Math.PI / 2
    const hue = (index / total) * 360
    const color = `hsl(${hue}, 80%, 60%)`

    useFrame(()=> {
        if (!groupRef.current) return;
        
        groupRef.current.rotation.y += 0.01;
    })

    useEffect(() => {
        if (lightRef.current && targetRef.current) {
          lightRef.current.target = targetRef.current
        }
      }, [])
    
  
    return (
      <group
        ref={groupRef}
        position={[x, y, 0]}
        rotation={[Math.PI / 2, tilt + angle * 0.03, 0]}
      >
        {/* The panel */}
        <mesh>
          <boxGeometry args={[0.15, height, 1]} />
          <meshStandardMaterial
            color={color}
            roughness={0.1}
            metalness={0.1}
            emissive={color}
            emissiveIntensity={.35}          
          />
        </mesh>

        <spotLight
            ref={lightRef}
            color={color}
            intensity={4}
            distance={8}
            penumbra={0.05}
            decay={2}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            position={[0, 0, -0.6]}   // behind the panel
            target={targetRef.current}
        />

        {/* Target in front of the panel */}
        <object3D ref={targetRef} position={[0, 0, -2]} />

      </group>
    )
  }
  function Sculpture({ count }) {
    const panels = Array.from({ length: count })
    const groupRef = useRef<THREE.Group>();

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime()
        if (groupRef.current) {
            groupRef.current.rotation.z = t * 0.2
        }
    })
  
    return (
      <group ref={groupRef}>
        <mesh position={[0,0,1.51]}>
            <ringGeometry args={[1.6, 3, 64]} />
            <meshStandardMaterial color="#fff" side={THREE.DoubleSide} />
        </mesh>
        {panels.map((_, i) => (
          <Panel key={i} index={i} total={count} />
        ))}
      </group>
    )
  }

  const Day15Project = () => {
    const {camera, scene} = useThree();

    useEffect(() => {
        camera.position.set(0, 0, 20);
        camera.lookAt(0, 0, 0);
        scene.background = new THREE.Color('#222');
    }, []);

    return (
      <>
        <PromptHint prompt={'Invisible object / only shadows'} hint={'drag to explore'} color='white' />
        <CompletedSketch day={15} />
  
        {/* Back wall for shadows */}
        <BackWall />
  
        {/* Ambient + directional for subtle fill */}
        <ambientLight intensity={0.01} />
        <directionalLight position={[5, 5, 5]} intensity={0.1} />
        <pointLight position={[0,0,3.5]} intensity={5} decay={2}/>
  
        {/* The sculpture */}
        <Sculpture count={24} />
        <OrbitControls/>
      </>
    )
  }
  
export default Day15Project;