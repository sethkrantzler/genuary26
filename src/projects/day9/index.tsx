import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { PromptHint } from '../../components/PromptHint';
import { useFrame, useThree } from '@react-three/fiber';
import { CompletedSketch } from '../../utils/utils';

const boxWidth = 0.1;
const spacing = 0;

// -----------------------------------------------------
// CELLULAR AUTOMATA (gridWidth × gridWidth slices)
// -----------------------------------------------------
export function CellularAutomata({
  gridWidth = 16,
  stepTime = 0.4,
  rule = rule30,
  aliveColor,
}) {
  const groupRef = useRef<THREE.Group>();

  // Shared geometry + materials
  const boxGeometry = useMemo(
    () => new THREE.BoxGeometry(boxWidth, boxWidth, boxWidth),
    []
  );

  const aliveMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: aliveColor,
        roughness: 0.4,
        metalness: 0.1,
      }),
    [aliveColor]
  );

  const deadMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    []
  );

  const [rows, setRows] = useState<
    { id: number; cells: number[] }[]
  >([]);
  const [currentRow, setCurrentRow] = useState(() => {
    const arr = new Array(gridWidth).fill(0);
    arr[Math.floor(gridWidth / 2)] = 1;
    return arr;
  });

  // Reset CA when rule changes
  useEffect(() => {
    setRows([]);
    setCurrentRow(() => {
      const arr = new Array(gridWidth).fill(0);
      arr[Math.floor(gridWidth / 2)] = 1;
      return arr;
    });
  }, [rule, gridWidth, aliveMaterial]);

  // Compute next row
  const computeNextRow = (row: number[]) => {
    const next = new Array(gridWidth).fill(0);
    for (let i = 0; i < gridWidth; i++) {
      const L = row[(i - 1 + gridWidth) % gridWidth];
      const C = row[i];
      const R = row[(i + 1) % gridWidth];
      next[i] = rule(L, C, R);
    }
    return next;
  };

  // Simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setRows((prev) => {
        if (prev.length >= gridWidth) {
          clearInterval(interval);
          return prev;
        }

        const newRow = currentRow;
        const nextRow = computeNextRow(currentRow);
        setCurrentRow(nextRow);

        return [...prev, { id: Math.random(), cells: newRow }];
      });
    }, stepTime * 1000);

    return () => clearInterval(interval);
  }, [currentRow, gridWidth, stepTime]);

  return (
    <group ref={groupRef} position={[0, 6, 0]}>
      {rows.map((row, rowIndex) => (
        <Layer2D
          key={row.id}
          y={-rowIndex * (boxWidth + spacing)}
          cells={row.cells}
          gridWidth={gridWidth}
          boxGeometry={boxGeometry}
          aliveMaterial={aliveMaterial}
          deadMaterial={deadMaterial}
        />
      ))}
    </group>
  );
}

function Layer2D({
  y,
  cells,
  gridWidth,
  boxGeometry,
  aliveMaterial,
  deadMaterial,
}: {
  y: number;
  cells: number[];
  gridWidth: number;
  boxGeometry: THREE.BoxGeometry;
  aliveMaterial: THREE.Material;
  deadMaterial: THREE.Material;
}) {
  const layerRef = useRef<THREE.Group>(null);
  const aliveRef = useRef<THREE.InstancedMesh>(null);
  const deadRef = useRef<THREE.InstancedMesh>(null);

  const dummy = useMemo(() => {
    const o = new THREE.Object3D() as THREE.Object3D & {
      matrixHidden?: THREE.Matrix4;
    };
    o.matrixHidden = new THREE.Matrix4().makeScale(0, 0, 0); // hide unused instances
    return o;
  }, []);

  const maxInstances = gridWidth * gridWidth;
  const step = boxWidth + spacing;

  // Start each layer offscreen at initial y before paint, then animate in
  useEffect(() => {
    if (!layerRef.current) return;

    // Ensure initial position is at the start of the animation
    layerRef.current.position.set(0, y - step, 0);

    gsap.fromTo(
      layerRef.current.position,
      { y: y - step },
      { y, duration: 0.4, ease: 'power2.out' }
    );
  }, [y, step]);

  // Instanced mesh matrix updates BEFORE paint to avoid phantom instances
  useLayoutEffect(() => {
    if (!aliveRef.current || !deadRef.current) return;

    let aliveIndex = 0;
    let deadIndex = 0;

    for (let x = 0; x < gridWidth; x++) {
      for (let z = 0; z < gridWidth; z++) {
        const alive = cells[x] === 1 || cells[z] === 1;

        dummy.position.set(
          (x - gridWidth / 2) * step,
          0,
          (z - gridWidth / 2) * step
        );
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();

        if (alive) {
          aliveRef.current.setMatrixAt(aliveIndex++, dummy.matrix);
        } else {
          deadRef.current.setMatrixAt(deadIndex++, dummy.matrix);
        }
      }
    }

    // Clear any unused instances by collapsing them
    if (dummy.matrixHidden) {
      for (let i = aliveIndex; i < maxInstances; i++) {
        aliveRef.current.setMatrixAt(i, dummy.matrixHidden);
      }
      for (let i = deadIndex; i < maxInstances; i++) {
        deadRef.current.setMatrixAt(i, dummy.matrixHidden);
      }
    }

    aliveRef.current.count = maxInstances;
    deadRef.current.count = maxInstances;

    aliveRef.current.instanceMatrix.needsUpdate = true;
    deadRef.current.instanceMatrix.needsUpdate = true;
  }, [cells, gridWidth, maxInstances, step, dummy]);

  return (
    <group
      ref={layerRef}
      position={[0, y - step, 0]} // start at initial position to avoid 1-frame jump
    >
      <instancedMesh
        ref={aliveRef}
        args={[boxGeometry, aliveMaterial, maxInstances]}
        count={0}
      />
      <instancedMesh
        ref={deadRef}
        args={[boxGeometry, deadMaterial, maxInstances]}
        count={0}
      />
    </group>
  );
}

// -----------------------------------------------------
// RULES
// -----------------------------------------------------
export const rule30 = (L, C, R) => {
  const index = (L << 2) | (C << 1) | R;
  return [0, 1, 1, 1, 1, 0, 0, 0][index];
};

export const rule73 = (L, C, R) => {
  const index = (L << 2) | (C << 1) | R;
  return [1, 0, 0, 1, 0, 0, 1, 0][index];
};

export const rule90 = (L, C, R) => L ^ R;

export const rule110 = (L, C, R) => {
  const index = (L << 2) | (C << 1) | R;
  return [0, 1, 1, 1, 0, 1, 1, 0][index];
};

const THEMES = [
  {
    name: 'green',
    rule: rule90,
    aliveColor: '#00ff66',
    background: '#003322',
  },
  {
    name: 'blue',
    rule: rule73,
    aliveColor: '#66ccff',
    background: '#001a33',
  },
  {
    name: 'warm',
    rule: rule110,
    aliveColor: '#ffcc00',
    background: '#662200',
  },
  {
    name: 'mono',
    rule: rule30,
    aliveColor: '#ffffff',
    background: '#000000',
  },
];

function DirectionalLightUp() {
  const lightRef = useRef<THREE.DirectionalLight>();
  const targetRef = useRef<THREE.Object3D>();
  const { scene } = useThree();

  useEffect(() => {
    if (!lightRef.current || !targetRef.current) return;

    scene.add(targetRef.current);

    lightRef.current.position.set(0, -100, 0);
    targetRef.current.position.set(0, 0, 0);
    lightRef.current.target = targetRef.current;
  }, [scene]);

  return (
    <>
      <directionalLight
        ref={lightRef}
        intensity={1.0}
        castShadow={false}
      />
      <object3D ref={targetRef} />
    </>
  );
}

// -----------------------------------------------------
// MAIN PROJECT FILE
// -----------------------------------------------------
const Day9Project = () => {
  const { camera, scene, gl } = useThree();
  const [themeIndex, setThemeIndex] = useState(1);

  const theme = THEMES[themeIndex];

  // Background + camera setup
  useEffect(() => {
    scene.background = new THREE.Color(theme.background);
    camera.position.set(-30, -30, -30);
  }, [theme, camera, scene]);

  useEffect(() => {
    const handlePointer = () => {
        setThemeIndex(i => (i + 1) % THEMES.length);
      };
    
    let lastTap = 0;
  
    const handleDoubleTap = () => {
      const now = Date.now();
      if (now - lastTap < 300) handlePointer();
      lastTap = now;
    };
  
    const handleDblClick = () => handlePointer();
  
    gl.domElement.addEventListener("dblclick", handleDblClick);
    gl.domElement.addEventListener("pointerdown", handleDoubleTap);
  
    return () => {
      gl.domElement.removeEventListener("dblclick", handleDblClick);
      gl.domElement.removeEventListener("pointerdown", handleDoubleTap);
    };
  }, [gl]);

  return (
    <>
      <PromptHint
        prompt={'Cellular Automata'}
        hint={'double tap to change rule + colors'}
        color={'lightgreen'}
      />
      <CompletedSketch day={9}/>

      <OrbitControls />
      <DirectionalLightUp />

      <CellularAutomata
        gridWidth={128}
        stepTime={0.25}
        rule={theme.rule}
        aliveColor={theme.aliveColor}
      />
    </>
  );
};

export default Day9Project;