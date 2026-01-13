import { useRef, useMemo, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import gsap from "gsap"

export function MouseIcon() {
  const { camera, mouse } = useThree()

  const groupRef = useRef<THREE.Group>();
  const planeRef = useRef<THREE.Mesh>();

  const isDown = useRef(false);

  // Track previous world position for velocity-based rotation
  const prevTime = useRef(0)
  const prevPos = useRef(new THREE.Vector3());
  const hasPrev = useRef(false);

  // Load texture once
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader()
    const tex = loader.load(`${import.meta.env.BASE_URL}images/cursor.png`)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  // Plane geometry sized by texture aspect
  const geometry = useMemo(() => {
    const w = 0.4
    const h = w * (texture.image?.height / texture.image?.width || 1)
    return new THREE.PlaneGeometry(w, h)
  }, [texture])

  // Click animation
  useEffect(() => {
    const handleDown = () => {
        isDown.current = true
        if (!planeRef.current) return
      
        // mouse.x is -1 (left) to +1 (right)
        const mx = mouse.x
      
        gsap.to(planeRef.current.rotation, {
          x: -Math.PI / 18,
          y: 0,
          z: 0, // dynamic inward tilt
          duration: 0.25,
          ease: "power3.out",
          yoyo: true,
          repeat: 1
        })
      
        gsap.to(planeRef.current.scale, {
          x: 1.4,
          y: 1.4,
          duration: 0.25,
          yoyo: true,
          ease: "power3.out",
          repeat: 1
        })
      
        gsap.to(planeRef.current.position, {
          z: -0.1,
          duration: 0.25,
          yoyo: true,
          ease: "power3.out",
          repeat: 1,
          onComplete: () => {
            isDown.current = false
          }
        })
      }

    window.addEventListener("pointerdown", handleDown)
    return () => {
      window.removeEventListener("pointerdown", handleDown)
    }
  }, [])

  useFrame(({ clock }) => {
    if (!groupRef.current || !planeRef.current) return
  
    // --- POSITION ---
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, camera)
  
    const targetZ = isDown.current ? 0.2 : 0.3
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -targetZ)
  
    const hit = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, hit)
  
    if (!hit) return
  
    groupRef.current.position.copy(hit)
  
   // --- ORIENTATION: Z-axis lean based on horizontal velocity ---
const now = clock.getElapsedTime()

if (hasPrev.current) {
  const dt = now - prevTime.current
  if (dt > 0) {
    const velocity = hit.clone().sub(prevPos.current).divideScalar(dt)

    // Horizontal movement → Z rotation
    const targetRotZ = THREE.MathUtils.clamp(
      velocity.x * -0.31,   // <-- increase this for stronger influence
      -Math.PI/2,                // <-- max lean left
      Math.PI/2                  // <-- max lean right
    )

    // Smooth spring-like easing
    planeRef.current.rotation.z = THREE.MathUtils.lerp(
      planeRef.current.rotation.z,
      targetRotZ,
      0.15           // <-- increase this for snappier response
    )
  }
}

    prevPos.current.copy(hit)
    prevTime.current = now
    hasPrev.current = true
  })

  return (
    <group ref={groupRef}>
      <mesh ref={planeRef} position={[0.05, -0.15, 0]} geometry={geometry}>
        <meshStandardMaterial
          map={texture}
          transparent
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>
    </group>
  )
}