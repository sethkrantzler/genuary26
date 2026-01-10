import React, { useMemo, useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { Bloom, EffectComposer, Pixelation } from '@react-three/postprocessing'
import { PromptHint } from '../../components/PromptHint'
import { CompletedSketch } from '../../utils/utils'

/* -------------------------------------------------------
   BACKGROUND BLISS
------------------------------------------------------- */
function BackgroundBliss() {
  const meshRef = useRef<THREE.Mesh>(null)

  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader()
    const tex = loader.load(`${import.meta.env.BASE_URL}images/bliss.png`)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  const geometry = useMemo(() => {
    const w = 12
    const h = w * (texture.image?.height / texture.image?.width || 1)
    return new THREE.PlaneGeometry(w, h)
  }, [texture])

  useEffect(() => {
    if (!meshRef.current) return
    meshRef.current.position.set(0, 0, -6)
  }, [])

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshBasicMaterial map={texture} />
    </mesh>
  )
}

/* -------------------------------------------------------
   RECYCLE BIN (CENTER WOBBLE)
------------------------------------------------------- */
function RecycleBin() {
  const groupRef = useRef<THREE.Group>(null)

  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader()
    const tex = loader.load(`${import.meta.env.BASE_URL}images/recyclebin.png`)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  const geometry = useMemo(() => {
    const w = 0.7
    const h = w * (texture.image?.height / texture.image?.width || 1)
    return new THREE.PlaneGeometry(w, h)
  }, [texture])

  useEffect(() => {
    if (!groupRef.current) return
    const g = groupRef.current

    g.position.set(0, 0, 0)

    const tl = gsap.timeline({ repeat: -1, yoyo: true })
    tl.to(
      g.scale,
      {
        x: 1.1,
        y: 1.1,
        duration: 1.2,
        ease: "sine.inOut"
      },
      0
    )

    return () => {tl.kill()}
  }, [])

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry} position={[0, 0, -0.02]}>
        <meshBasicMaterial
          map={texture}
          transparent
        />
      </mesh>
    </group>
  )
}

/* -------------------------------------------------------
   MOVING OBJECT (METALLIC + SPINNING)
------------------------------------------------------- */
export function MovingObject({
  index,
  ringCount = 12,
  outerDistance = 6,
  stepSize = 0.5,
  stepTime = 0.3,
  spawnRing
}) {
  const groupRef = useRef<THREE.Group>()
  const planeRef = useRef<THREE.Mesh>()

  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader()
    const tex = loader.load(`${import.meta.env.BASE_URL}images/cursor.png`)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  const geometry = useMemo(() => {
    const w = 0.4
    const h = w * (texture.image?.height / texture.image?.width || 1)
    return new THREE.PlaneGeometry(w, h)
  }, [texture])

  useEffect(() => {
    if (!groupRef.current) return

    const angle = (index / ringCount) * Math.PI * 2
    const x = Math.cos(angle) * outerDistance
    const y = Math.sin(angle) * outerDistance

    groupRef.current.position.set(x, y, 0)

    const dirToCenter = new THREE.Vector2(-x, -y).normalize()
    const angleToCenter = Math.atan2(dirToCenter.y, dirToCenter.x)
    groupRef.current.rotation.z = angleToCenter - Math.PI / 2

    startStepping()
  }, [])

  const disposeSelf = () => {
    if (!groupRef.current) return

    groupRef.current.traverse(obj => {
      if ((obj as any).geometry) (obj as any).geometry.dispose()
      if ((obj as any).material) {
        const mat = (obj as any).material
        if (Array.isArray(mat)) mat.forEach(m => m.dispose())
        else mat.dispose()
      }
    })

    groupRef.current.parent?.remove(groupRef.current)
  }

  const startStepping = () => {
    const step = () => {
      if (!groupRef.current) return

      const pos = groupRef.current.position
      const radius = Math.sqrt(pos.x * pos.x + pos.y * pos.y)

      if (radius <= stepSize) {
        gsap.to(groupRef.current.scale, {
          x: 0.1,
          y: 0.1,
          z: 0.1,
          duration: 0.2,
          ease: "power2.in",
          onComplete: () => {
            disposeSelf()
            spawnRing()
          }
        })
        return
      }

      if (radius <= stepSize * 2) {
        gsap.to(groupRef.current.rotation, {
          z: "+=" + Math.PI / 2,
          duration: 0.5,
          ease: "power2.in"
        })
      }

      const dir = new THREE.Vector3(-pos.x, -pos.y, 0).normalize()
      const nextPos = pos.clone().add(dir.multiplyScalar(stepSize))

      // Position tween
      gsap.to(groupRef.current.position, {
        x: nextPos.x,
        y: nextPos.y,
        duration: stepTime,
        ease: "power2.out",
        onComplete: step
      })
    }

    step()
  }

  return (
    <group ref={groupRef}>
      <mesh ref={planeRef} position={[0.05, -0.15, 0]} geometry={geometry}>
        <meshBasicMaterial
          transparent
          map={texture}
        />
      </mesh>
    </group>
  )
}

/* -------------------------------------------------------
   MAIN PROJECT
------------------------------------------------------- */
const Day10Project = () => {
  const ringCount = 12
  const [ringKeys, setRingKeys] = useState([0, 0, 0, 0])
  const radii = [1, 2, 2.1, 3, 3.1, 3.2, 4, 4.1, 4.2, 4.3, 5, 5.1, 5.2, 5.3, 5.4, 6, 6.1, 6.2, 6.3, 6.4, 6.5]

  const spawnRing = ringIndex => {
    setRingKeys(keys =>
      keys.map((k, i) => (i === ringIndex ? k + 1 : k))
    )
  }

  return (
    <>
      <PromptHint prompt={'Polar Coordinates'} color={'black'}/>
      <CompletedSketch day={10} />

      <BackgroundBliss />
      <RecycleBin />

      {radii.map((radius, ringIndex) =>
        Array.from({ length: ringCount }).map((_, i) => (
          <MovingObject
            key={`${ringKeys[ringIndex]}-${ringIndex}-${i}`}
            index={i}
            ringCount={ringCount}
            outerDistance={radius}
            stepSize={0.5}
            stepTime={0.3}
            spawnRing={() => spawnRing(ringIndex)}
          />
        ))
      )}

      {/* Dynamic lighting */}
      <ambientLight intensity={1} />

      {/* Pixelation effect */}
      <EffectComposer>
        <Pixelation granularity={5} />
      </EffectComposer>
    </>
  )
}

export default Day10Project