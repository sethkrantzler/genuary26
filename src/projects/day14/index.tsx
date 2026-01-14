import React, { useEffect, useRef, useState } from 'react'
import { useGLTF, Environment, OrbitControls } from '@react-three/drei'
import { PromptHint } from '../../components/PromptHint'
import { CompletedSketch } from '../../utils/utils'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { GLTF } from 'three-stdlib'
import { gsap } from 'gsap'
import { is } from '@react-three/fiber/dist/declarations/src/core/utils'

/* ------------------------------
   ShapeBox (silvery metal)
--------------------------------*/
function ShapeBox() {
  const { scene } = useGLTF(`${import.meta.env.BASE_URL}models/day14/shapebox.glb`) as GLTF

  // Apply a metallic silver material to everything in the box
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material = new THREE.MeshStandardMaterial({
        color: '#d9d9d9',
        metalness: 1,
        roughness: 0.2,
      })
    }
  })

  return <primitive object={scene} />
}

function Plug({
  url,
  color,
  position = [0, 0, 0],
  direction = [0, 0, 1],
  rotationAmount = new THREE.Vector3(0, Math.PI, 0),
  animationDistance = 2,
  side = 0,              // NEW: which side this plug belongs to
  totalSides = 6,        // NEW: total plugs in the loop
  cycleLength = 2,        // NEW: seconds for full loop
  animate = true,      // NEW: whether to auto-animate
}) {
  const ref = useRef<THREE.Object3D>(null)
  const { scene } = useGLTF(url) as GLTF
  const isAnimating = useRef(false)
  const lastTrigger = useRef(0)

  // Apply bright metallic color
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material = new THREE.MeshStandardMaterial({
        color,
        metalness: 1,
        roughness: 0.15,
      })
    }
  })

  // Center geometry so rotation is correct
  const box = new THREE.Box3().setFromObject(scene)
  const center = new THREE.Vector3()
  box.getCenter(center)
  scene.position.sub(center)
  useEffect(() => {
    if (ref.current) {
        ref.current.position.set(0,0,0)
        isAnimating.current = false
    }
  }, [animate])

  const animateFlip = (e?: THREE.Event) => {
    //@ts-ignore
    e?.stopPropagation()
    if (!ref.current || isAnimating.current) return
    isAnimating.current = true

    const obj = ref.current

    const startPos = new THREE.Vector3(...position)
    const pullPos = startPos.clone().add(
      new THREE.Vector3(...direction).multiplyScalar(animationDistance)
    )

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating.current = false
      }
    })

    tl.to(obj.position, {
      x: pullPos.x,
      y: pullPos.y,
      z: pullPos.z,
      duration: 0.25,
      ease: "power2.out"
    })

    tl.to(obj.rotation, {
      x: "+=" + rotationAmount.x,
      y: "+=" + rotationAmount.y,
      z: "+=" + rotationAmount.z,
      duration: 0.4,
      ease: "power2.inOut"
    })

    tl.to(obj.position, {
      x: startPos.x,
      y: startPos.y,
      z: startPos.z,
      duration: 0.25,
      ease: "power2.in"
    })
  }

  /* ------------------------------
     Sequenced flip trigger
  --------------------------------*/
  useFrame(({ clock }) => {
    if (!ref.current) return

    const t = clock.getElapsedTime()

    // Compute phase offset for this plug
    const offset = (side / totalSides) * cycleLength
    const phase = (t - offset + cycleLength) % cycleLength

    // Trigger window: first 0.1s of each plug's phase
    if (!isAnimating.current && phase < 0.1 && animate) {
      // Prevent double-triggering inside the same window
      if (t - lastTrigger.current > 0.5) {
        lastTrigger.current = t
        animateFlip()
      }
    }
  })

  return (
    <primitive
      ref={ref}
      object={scene}
      position={position}
      onClick={(e) => animateFlip(e)}
    />
  )
}
/* ------------------------------
   Main Scene
--------------------------------*/
function Scene({ animate }: { animate?: boolean }) {
  return (
    <>
      {/* Background */}
      <color attach="background" args={['#d2b48c']} />

      {/* Lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.2}
      />
      <Environment preset="city" />

      <group position={[0, 0, 0]} rotation={[Math.PI / 2, -Math.PI / 2, 0]}>
        <ShapeBox />

        {/* Plugs */}
        <Plug
          url={`${import.meta.env.BASE_URL}models/day14/cube_plug.glb`}
          color="#ff4444"
          position={[0, 0, 0]}
          direction={[1, 0, 0]}
          rotationAmount={new THREE.Vector3(Math.PI / 2, 0, 0)}
          animationDistance={3}
          side={0}
          animate={animate}
        />

        <Plug
          url={`${import.meta.env.BASE_URL}models/day14/cylinder_plug.glb`}
          color="#a640e6"
          position={[0, 0, 0]}
          direction={[0, 0, -1]}
          rotationAmount={new THREE.Vector3(0, 0, Math.PI)}
          animationDistance={1.25}
          side={1}
          animate={animate}
        />

        <Plug
          url={`${import.meta.env.BASE_URL}models/day14/heart_plug.glb`}
          color="#ff66cc"
          position={[0, 0, 0]}
          direction={[-1, 0, 0]}
          rotationAmount={new THREE.Vector3(Math.PI * 2, 0, 0)}
          animationDistance={1.25}
          side={2}
          animate={animate}
        />

        <Plug
          url={`${import.meta.env.BASE_URL}models/day14/plus_plug.glb`}
          color="#66ff66"
          position={[0, 0, 0]}
          direction={[0, 0, 1]}
          rotationAmount={new THREE.Vector3(0, 0, Math.PI / 2)}
          animationDistance={1.5}
          side={3}
          animate={animate}
        />

        <Plug
          url={`${import.meta.env.BASE_URL}models/day14/star_plug.glb`}
          color="#ffee33"
          position={[0, 0, 0]}
          direction={[0, 1, 0]}
          rotationAmount={new THREE.Vector3(0, Math.PI / 2.5, 0)}
          animationDistance={1.5}
          side={4}
          animate={animate}
        />

        <Plug
          url={`${import.meta.env.BASE_URL}models/day14/triangle_plug.glb`}
          color="#44aaff"
          position={[0, 0, 0]}
          direction={[0, -1, 0]}
          rotationAmount={new THREE.Vector3(0, Math.PI / 1.5, 0)}
          animationDistance={1.5}
          side={5}
          animate={animate}
        />
      </group>
    </>
  )
}
const Day14Project = () => {
  const [controlsEnabled, setControlsEnabled] = useState(true)
  const [autoOrbit, setAutoOrbit] = useState(false)
  const { camera } = useThree()

  // Initial camera pull-back
  useEffect(() => {
    camera.position.set(18, 6, 20)   // pulled back further
    camera.lookAt(0, 0, 0)
  }, [])

  // Double-click toggles auto orbit + controls
  useEffect(() => {
    const handler = () => {
      setAutoOrbit(v => !v)
      setControlsEnabled(v => !v)
    }
    window.addEventListener('dblclick', handler)
    return () => window.removeEventListener('dblclick', handler)
  }, [])

  const orbitAxis = new THREE.Vector3(0, 0.4, 0.2).normalize()
  const orbitCenter = new THREE.Vector3(0, 0, 0)

  useFrame(({ clock }) => {
    if (!autoOrbit) return

    const t = clock.getElapsedTime() * 0.3
    const radius = 25 // match the new camera distance

    // Start from a base vector that matches the radius
    const base = new THREE.Vector3(1, 0, 0).multiplyScalar(radius)
    const rotated = base.clone().applyAxisAngle(orbitAxis, t)

    camera.position.copy(rotated)
    camera.lookAt(orbitCenter)
  })

  return (
    <>
      <PromptHint prompt={'Perfect Fit'} hint={'double click to start/stop animation, click shape to animate'} color="black" />
      <Scene animate={autoOrbit} />
      <CompletedSketch day={14} />
      <OrbitControls enabled={controlsEnabled} />
    </>
  )
}

export default Day14Project