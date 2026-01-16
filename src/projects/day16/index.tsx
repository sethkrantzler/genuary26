import React, { useRef, useMemo, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { PromptHint } from "../../components/PromptHint";
import { CompletedSketch } from "../../utils/utils";

const g = 9.81;
const m1 = 1;
const m2 = 1;
const L1 = 1.5;
const L2 = 1.5;

// ---------------------------------------------------------
// GEOMETRY MODES
// ---------------------------------------------------------
const GEOMETRY_MODES = ["cylinder", "cone", "torus", 'bell'];

// Mass per geometry type
const MASS_BY_GEOMETRY = {
    cylinder: { m1: 1,   m2: 1   },
    cone:     { m1: 1.5, m2: 0.8 },
    torus:    { m1: 2.2, m2: 2.2 },
    bell:     { m1: 2.8, m2: 1.5 }
  };
  
  function DoublePendulum({ x, y, spacing = 2, geometryMode }) {
    const arm1 = useRef<THREE.Mesh>();
    const arm2 = useRef<THREE.Mesh>();
    const pivot2 = useRef<THREE.Mesh>();
  
    const mat1 = useMemo(() => new THREE.MeshStandardMaterial(), []);
    const mat2 = useMemo(() => new THREE.MeshStandardMaterial(), []);
  
    // dynamic masses
    const { m1, m2 } = MASS_BY_GEOMETRY[geometryMode];
  
    const state = useRef({
      theta1: Math.PI / 2 + (Math.random() - 0.5) * 0.4,
      theta2: Math.PI / 2 + (Math.random() - 0.5) * 0.4,
      omega1: 0,
      omega2: 0,
    });

    useEffect(() => {
        const s = state.current;
      
        // fresh random initial conditions
        s.theta1 = Math.PI / 2 + (Math.random() - 0.5) * 0.4;
        s.theta2 = Math.PI / 2 + (Math.random() - 0.5) * 0.4;
        s.omega1 = 0;
        s.omega2 = 0;
      
        // immediately update rotations
        if (arm1.current) arm1.current.rotation.z = s.theta1;
        if (pivot2.current) pivot2.current.rotation.z = s.theta2 - s.theta1;
      
        // reset colors
        const hue1 = ((s.theta1 / Math.PI) + 1) * 0.5;
        const hue2 = ((s.theta2 / Math.PI) + 1) * 0.5;
        mat1.color.setHSL(hue1, 0.7, 0.5);
        mat2.color.setHSL(hue2, 0.7, 0.5);
      }, [geometryMode]);
  
    useFrame((_, delta) => {
      const s = state.current;
      const dt = delta * 1.5;
  
      const { theta1, theta2, omega1, omega2 } = s;
  
      const sin1 = Math.sin(theta1);
      const sin2 = Math.sin(theta2);
      const sin12 = Math.sin(theta1 - theta2);
      const cos12 = Math.cos(theta1 - theta2);
  
      // use dynamic masses
      const denom = 2 * m1 + m2 - m2 * Math.cos(2 * theta1 - 2 * theta2);
  
      const alpha1 =
        (-g * (2 * m1 + m2) * sin1 -
          m2 * g * Math.sin(theta1 - 2 * theta2) -
          2 *
            sin12 *
            m2 *
            (omega2 * omega2 * L2 + omega1 * omega1 * L1 * cos12)) /
        (L1 * denom);
  
      const alpha2 =
        (2 *
          sin12 *
          (omega1 * omega1 * L1 * (m1 + m2) +
            g * (m1 + m2) * Math.cos(theta1) +
            omega2 * omega2 * L2 * m2 * cos12)) /
        (L2 * denom);
  
      s.omega1 += alpha1 * dt;
      s.omega2 += alpha2 * dt;
      s.theta1 += s.omega1 * dt;
      s.theta2 += s.omega2 * dt;
  
      arm1.current.rotation.z = s.theta1;
      pivot2.current.rotation.z = s.theta2 - s.theta1;
  
      const hue1 = ((s.theta1 / Math.PI) + 1) * 0.5;
      const hue2 = ((s.theta2 / Math.PI) + 1) * 0.5;
  
      mat1.color.setHSL(hue1, 0.7, 0.5);
      mat2.color.setHSL(hue2, 0.7, 0.5);
    });
  

  // ---------------------------------------------------------
  // GEOMETRY SWITCHER
  // ---------------------------------------------------------
  const getGeometry = (mode, isArm1) => {
    switch (mode) {
      case "cylinder":
        return (
          <cylinderGeometry
            args={
              isArm1
                ? [0.07, 0.07, L1, 16]
                : [0.07, 0.07, L2, 16]
            }
          />
        );

      case "cone":
        return (
          <cylinderGeometry
            args={
              isArm1
                ? [0.7, 0.07, L1, 16] // fat → thin
                : [0.07, 0.7, L2, 16] // thin → fat
            }
          />
        );

      case "torus":
        return (
          <torusKnotGeometry
            args={
              isArm1
                ? [0.4, 0.1, 80, 16, 2, 3]
                : [0.4, 0.1, 80, 16, 2, 3]
            }
          />
        );

    case "bell":
        return (
          <cylinderGeometry
            args={
              isArm1
                ? [0.27, 0.77, L1, 16] // fat → thin
                : [0.07, 0.07, L2, 16] // thin → fat
            }
          />
        );

      default:
        return null;
    }
  };

  return (
    <group position={[x * spacing, y * spacing, 0]}>
      {/* First arm */}
      <mesh ref={arm1} material={mat1} position={[0, -L1 / 2, 0]}>
        {getGeometry(geometryMode, true)}

        {/* pivot for second arm */}
        <group ref={pivot2} position={[0, -L1 / 2, 0]}>
          <mesh ref={arm2} material={mat2} position={[0, geometryMode === 'torus' ? -L2 / 6 : -L2 / 2, 0]}>
            {getGeometry(geometryMode, false)}
          </mesh>
        </group>
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------
// GRID
// ---------------------------------------------------------
function PendulumGrid({ geometryMode }) {
  const size = 5;
  const offset = -(size - 1) / 2;

  const items = [];
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      items.push(
        <DoublePendulum
          key={`${i}-${j}`}
          x={i + offset}
          y={j + offset}
          spacing={5}
          geometryMode={geometryMode}
        />
      );
    }
  }

  return <group>{items}</group>;
}

// ---------------------------------------------------------
// MAIN PROJECT
// ---------------------------------------------------------
const Day16Project = () => {
  const { camera } = useThree();
  const [geometryMode, setGeometryMode] = useState("cylinder");

  useEffect(() => {
    camera.position.set(0, 0, 70);
  }, []);

  // DOUBLE CLICK HANDLER
  const handleDoubleClick = useCallback(() => {
    setGeometryMode((prev) => {
      const idx = GEOMETRY_MODES.indexOf(prev);
      return GEOMETRY_MODES[(idx + 1) % GEOMETRY_MODES.length];
    });
  }, []);

  useEffect(() => {
    window.addEventListener("dblclick", handleDoubleClick);
    return () => window.removeEventListener("dblclick", handleDoubleClick);
  }, [handleDoubleClick]);

  return (
    <>
      <PromptHint prompt={"Order & Disorder"} hint={'double click to change shape'} color={'pink'}/>
      <CompletedSketch day={16} />

      <color attach="background" args={["#0f0509"]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} />

      <PendulumGrid geometryMode={geometryMode} />

      <OrbitControls />
    </>
  );
};

export default Day16Project;