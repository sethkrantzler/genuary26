import React, { useEffect, useRef, useState } from 'react'
import { useGLTF, Environment, OrbitControls } from '@react-three/drei'
import { PromptHint } from '../../components/PromptHint'
import { CompletedSketch } from '../../utils/utils'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { GLTF } from 'three-stdlib'
import { gsap } from 'gsap'

/* ------------------------------
   ShapeBox (silvery metal)
--------------------------------*/
function ShapeBox() {
  const { scene } = useGLTF('/models/day14/shapebox.glb') as GLTF

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
  noiseFrequency = 0.5, // NEW: how often flips happen
}) {
  const ref = useRef<THREE.Object3D>(null)
  const lastFlipTime = useRef(0)
  const { scene } = useGLTF(url) as GLTF

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

  /* ------------------------------
     Center geometry so rotation is correct
  --------------------------------*/
  const box = new THREE.Box3().setFromObject(scene)
  const center = new THREE.Vector3()
  box.getCenter(center)
  scene.position.sub(center)

  const isAnimating = useRef(false)

  /* ------------------------------
     GSAP flip animation
  --------------------------------*/
  const animateFlip = () => {
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

    // Pull out
    tl.to(obj.position, {
      x: pullPos.x,
      y: pullPos.y,
      z: pullPos.z,
      duration: 0.25,
      ease: "power2.out"
    })

    // Rotate using Euler angles from rotationAmount
    tl.to(obj.rotation, {
      x: "+=" + rotationAmount.x,
      y: "+=" + rotationAmount.y,
      z: "+=" + rotationAmount.z,
      duration: 0.4,
      ease: "power2.inOut"
    })

    // Reinsert
    tl.to(obj.position, {
      x: startPos.x,
      y: startPos.y,
      z: startPos.z,
      duration: 0.25,
      ease: "power2.in"
    })
  }

  useFrame(({ clock }) => {
  if (!ref.current) return

  const t = clock.getElapsedTime()

  // Noise-based flip trigger
  if (!isAnimating.current) {
    const noise = Math.sin(t * noiseFrequency + center.x * 10)

    const now = t
    const cooldown = 5 // seconds between flips

    if (noise > 0.95 && now - lastFlipTime.current > cooldown) {
      lastFlipTime.current = now
      animateFlip()
    }
  }

  // Pulse animation (gated)
  if (!isAnimating.current) {
    const raw = Math.sin(t * 1.5)
    const eased = THREE.MathUtils.smoothstep(raw, -1, 1)
    const slide = eased * 0.2

    ref.current.position.set(
      position[0] + direction[0] * slide,
      position[1] + direction[1] * slide,
      position[2] + direction[2] * slide
    )
  }
})

  return (
    <primitive
      ref={ref}
      object={scene}
      position={position}
      onClick={animateFlip}
    />
  )
}
/* ------------------------------
   Main Scene
--------------------------------*/
function Scene() {
  return (
    <>
      {/* Background */}
      <color attach="background" args={['#d2b48c']} /> {/* tan */}

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.2}
        castShadow
      />
      <Environment preset="city" />

      <group position={[0, 0, 0]} rotation={[Math.PI/2, Math.PI/2,0]}>
        <ShapeBox />

        {/* Plugs */}
        <Plug
            url="/models/day14/cube_plug.glb"
            color="#ff4444"
            position={[0, 0, 0]}
            direction={[1, 0, 0]}
            rotationAmount={new THREE.Vector3(Math.PI/2, 0, 0)}
            animationDistance={3}
        />
        <Plug
            url="/models/day14/cylinder_plug.glb"
            color="#44aaff"
            position={[0, 0, 0]}
            direction={[0, 0, -1]}
            rotationAmount={new THREE.Vector3(0, 0, Math.PI)}
            animationDistance={1.5}
        />
        <Plug
            url="/models/day14/heart_plug.glb"
            color="#ff66cc"
            position={[0, 0, 0]}
            direction={[-1, 0, 0]}
            rotationAmount={new THREE.Vector3(Math.PI*2, 0, 0)}
            animationDistance={1.5}
        />
        <Plug
            url="/models/day14/plus_plug.glb"
            color="#ffaa33"
            position={[0, 0, 0]}
            direction={[0, 0, 1]}
            rotationAmount={new THREE.Vector3(0, 0, Math.PI/2)}
            animationDistance={1.5}
        />
        <Plug
            url="/models/day14/star_plug.glb"
            color="#ffee33"
            position={[0, 0, 0]}
            direction={[0, 1, 0]}
            rotationAmount={new THREE.Vector3(0, Math.PI / 2.5, 0)}
            animationDistance={1.5}
        />
        <Plug
            url="/models/day14/triangle_plug.glb"
            color="#66ff66"
            position={[0, 0, 0]}
            direction={[0, -1, 0]}
            rotationAmount={new THREE.Vector3(0, Math.PI/1.5, 0)}
            animationDistance={1.5}
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
    camera.position.set(3, 2, -20)   // pulled back further
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
      <PromptHint prompt={'Perfect Fit'} hint={'click to flip shape'} color="black" />
      <Scene />
      <CompletedSketch day={14} />
      <OrbitControls enabled={controlsEnabled} />
    </>
  )
}

export default Day14Project