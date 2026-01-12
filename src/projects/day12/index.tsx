import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
    forwardRef,
  } from 'react'
  import { PromptHint } from '../../components/PromptHint'
  import { CompletedSketch, DEFAULT_VERTEX_SHADER } from '../../utils/utils'
  import {
    ShaderMaterial,
    Vector2,
    PlaneGeometry,
    Mesh,
    Vector3,
    BoxGeometry,
    Color,
  } from 'three'
  import { useThree, useFrame } from '@react-three/fiber'
  import { OrbitControls } from '@react-three/drei'
import { Bloom, EffectComposer, Glitch } from '@react-three/postprocessing'
import { GlitchMode } from 'postprocessing'
  
  const geometry = new BoxGeometry(1, 1, 1)

  type BoxProps = {
    fragmentPath: string
    vertexPath?: string
    gridX: number
    gridY: number
    gridW: number
    gridH: number
  }
  
  export const Box = forwardRef<Mesh, BoxProps>(function Box(
    { fragmentPath, vertexPath, gridX, gridY, gridW, gridH },
    ref
  ) {
    const [frag, setFrag] = useState<string | null>(null)
    const [vert, setVert] = useState<string | null>(null)
    const { viewport } = useThree()
    const materialRef = useRef<ShaderMaterial | null>(null)
  
    // Load fragment
    useEffect(() => {
      let cancelled = false
      const load = async () => {
        const res = await fetch(fragmentPath)
        const text = await res.text()
        if (!cancelled) setFrag(text)
      }
      load()
      return () => {
        cancelled = true
      }
    }, [fragmentPath])
  
    // Load vertex
    useEffect(() => {
      if (!vertexPath) {
        setVert(DEFAULT_VERTEX_SHADER)
        return
      }
      let cancelled = false
      const load = async () => {
        const res = await fetch(vertexPath)
        const text = await res.text()
        if (!cancelled) setVert(text)
      }
      load()
      return () => {
        cancelled = true
      }
    }, [vertexPath])
  
    const material = useMemo(() => {
      if (!frag || !vert) return null
  
      const m = new ShaderMaterial({
        fragmentShader: frag,
        vertexShader: vert,
        side: 2,
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: new Vector2(viewport.width, viewport.height) },
  
          uGridX: { value: gridX },
          uGridY: { value: gridY },
          uGridW: { value: gridW },
          uGridH: { value: gridH },
  
          uRadius: { value: 0.2 },
          uWorldPos: { value: new Vector3(0,0,0)}
        },
      })
  
      materialRef.current = m
      return m
    }, [frag, vert, viewport.width, viewport.height, gridX, gridY, gridW, gridH])
  
    useFrame(({ clock }) => {
      const m = materialRef.current
      if (!m) return
  
      const t = clock.getElapsedTime()
      m.uniforms.uTime.value = t + gridX + gridY
      m.uniforms.uResolution.value.set(viewport.width, viewport.height);
      m.uniforms.uRadius.value = 0.2 + 0.15 * Math.sin(t * 2.0);
      (ref as React.MutableRefObject<Mesh | null>)?.current?.getWorldPosition(m.uniforms.uWorldPos.value)
    })
  
    if (!material) return null
  
    return (
      <mesh
        ref={ref}
        geometry={geometry}
        material={material}
        position={[0, 0, 0]}
      />
    )
  })
  
  function buildBoxShape(count: number, spacing = 1.4) {
    const cols = Math.round(Math.sqrt(count))
    const rows = Math.ceil(count / cols)
    const cx = (cols - 1) / 2
    const cy = (rows - 1) / 2
  
    const positions: Vector3[] = []
    let i = 0
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (i++ >= count) break
        positions.push(
          new Vector3((x - cx) * spacing, (y - cy) * spacing, 0)
        )
      }
    }
    return positions
  }
  
  function buildSphereShape(count: number, radius = 6) {
    const positions: Vector3[] = []
    const golden = (1 + Math.sqrt(5)) / 2
    for (let i = 0; i < count; i++) {
      const t = i / count
      const phi = Math.acos(1 - 2 * t)
      const theta = 2 * Math.PI * golden * i
      positions.push(
        new Vector3(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        )
      )
    }
    return positions
  }
  
  function buildInfinityShape(count: number, scale = 5) {
    const positions: Vector3[] = []
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2.0
  
      const denom = 1.0 + Math.sin(t) * Math.sin(t)
      let x = (Math.cos(t) / denom) * scale
      let y = (Math.sin(t) * Math.cos(t) / denom) * scale
  
      // Add tiny jitter based on index to avoid duplicates
      const jitter = (i * 0.0005)
      x += jitter
      y += jitter
  
      positions.push(new Vector3(x, y, 0))
    }
    return positions
  }
  
  // -----------------------------
  // Shape morph system
  // -----------------------------
  
  type ShapeMorphSystemProps = {
    rows: number
    cols: number
    fragmentPath: string
    vertexPath: string
  }
  
  function ShapeMorphSystem({
    rows,
    cols,
    fragmentPath,
    vertexPath,
  }: ShapeMorphSystemProps) {
    const count = rows * cols
    const boxRefs = useRef<Mesh[]>([])
    const [shapeIndex, setShapeIndex] = useState(0)
    const [targets, setTargets] = useState<Vector3[]>([])
  
    // Precompute shapes once
    const shapes = useMemo(
      () => [
        buildBoxShape(count, 1.4),
        buildSphereShape(count, 6),
        buildInfinityShape(count, 4),
      ],
      [count]
    )
  
    useEffect(() => {
      setTargets(shapes[shapeIndex % shapes.length])
    }, [shapeIndex, shapes])
  
    // Cycle shapes
    useEffect(() => {
      const id = setInterval(() => {
        setShapeIndex((i) => i + 1)
      }, 4000)
      return () => clearInterval(id)
    }, [])
  
    // Morph positions
    useFrame(() => {
      if (!targets.length) return
      boxRefs.current.forEach((mesh, i) => {
        if (!mesh || !targets[i]) return
        mesh.position.lerp(targets[i], 0.1)
      })
    })
  
    const boxes = []
    for (let i = 0; i < count; i++) {
      const gx = i % cols + count
      const gy = i % rows + count
      boxes.push(
        <Box
          key={i}
          ref={(el) => {
            if (el) boxRefs.current[i] = el
          }}
          fragmentPath={fragmentPath}
          vertexPath={vertexPath}
          gridX={gx}
          gridY={gy}
          gridW={cols}
          gridH={rows}
        />
      )
    }
  
    return <>{boxes}</>
  }
  
  // -----------------------------
  // Day12Project
  // -----------------------------
  
  const Day12Project = () => {
    const { camera, scene } = useThree()
  
    useEffect(() => {
      camera.position.set(0, 0, 25)
      scene.background = new Color('black');
    }, [])

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime()
      
        const radius = 15 // distance from origin
        const speed = 0.4 // orbit speed
      
        camera.position.x = Math.cos(t * speed) * radius
        camera.position.z = Math.sin(t * speed) * radius
        camera.position.y = 0 // stays on XZ plane
      
        camera.lookAt(0, 0, 0)
      })
  
    return (
      <>
        <ambientLight intensity={0.5} />
        <PromptHint prompt={'Boxes Only'} color={'white'} />
  
        <ShapeMorphSystem
          rows={5}
          cols={4}
          fragmentPath={`${import.meta.env.BASE_URL}shaders/day12.glsl`}
          vertexPath={`${import.meta.env.BASE_URL}shaders/day12_vertex.glsl`}
        />

        <EffectComposer>
            <Bloom luminanceThreshold={0.3} intensity={0.2} />
            <Glitch
                delay={new Vector2(3.8, 3.8)}
                duration={new Vector2(0.1, 0.3)}
                strength={new Vector2(0.02, 0.05)}
                mode={GlitchMode.SPORADIC}
            />

        </EffectComposer>
  
        <CompletedSketch day={12} />
      </>
    )
  }
  
  export default Day12Project