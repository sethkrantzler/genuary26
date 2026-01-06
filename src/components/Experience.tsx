import * as THREE from "three";
import React, { useState, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ProjectLink, sharedMatcapMaterial } from "./ProjectLink";
import { useNavigate } from "react-router-dom";
import { TextGeometry, FontLoader } from "three/examples/jsm/Addons.js";
import { smoothstepRange } from "../utils/utils";
import { OrbitControls } from "@react-three/drei";

function Title() {
    const textRef = useRef<THREE.Mesh>(null);
    const [geometry, setGeometry] = useState<TextGeometry | undefined>(undefined);

    const { viewport, scene } = useThree();
    
    useEffect(() => {
        const fontLoader = new FontLoader();
        fontLoader.load(`${import.meta.env.BASE_URL}fonts/helvetiker_regular.typeface.json`, (font) => {
        const textGeo = new TextGeometry('GENUARY \'26', {
            font: font,
            size: 0.1 * viewport.width,
            depth: 0.0025 * viewport.width,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.05,
            bevelOffset: 0.002,
            bevelSegments: 15
        });

        textGeo.computeBoundingBox();
        if (textGeo.boundingBox) {
            const center = new THREE.Vector3();
            textGeo.boundingBox.getCenter(center);
            textGeo.translate(-center.x, -center.y, -center.z);
        }

        setGeometry(textGeo);
        });
    }, []);

    useFrame(({ clock }) => {
        if (!textRef.current) return;
    
        const t = clock.getElapsedTime();
        textRef.current.rotation.y = Math.sin(t * 2) * 0.2;
        textRef.current.rotation.x = Math.sin(t * 1.5) * 0.05;
        textRef.current.rotation.z = Math.cos(t * 1.5) * 0.05;
    
        const b = (Math.sin(t*0.25) + 1) / 2;
        const s = smoothstepRange(b, 0, 1, 0.005, 0.6);
      
        scene.background = new THREE.Color(s, s, s);      
    });
    
    return (
        <mesh
            position={[0, (viewport.height/2) - 0.5, 0]}
            ref={textRef}
            geometry={geometry}
            material={sharedMatcapMaterial}
            onPointerDown={() => window.open('https://genuary.art', '_blank')}
        />
    );
}

const Experience = () => {
  const state = useThree();
  const { camera, size, viewport } = state;
  const navigate = useNavigate();
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
      const existing = document.cookie
          .split("; ")
          .find((row) => row.startsWith("visitedSketches="));

      if (!existing) {
          document.cookie = `visitedSketches=${JSON.stringify([])}; path=/; max-age=31536000`;
      }
  }, []);

  useEffect(() => {
    if (location.pathname === "/") {
      setCameraReady(false);
      
      // Reset camera
      camera.position.set(0, 0, 5);
      camera.rotation.set(0, 0, 0);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();
      camera.updateProjectionMatrix();
      
      // Force R3F to update its internal state
      // This recalculates the viewport based on the new camera position
      state.gl.render(state.scene, camera);
      
      // Manually update viewport in the state
      const aspect = size.width / size.height;
      if (camera instanceof THREE.PerspectiveCamera) {
        const distance = camera.position.z;
        const fov = (camera.fov * Math.PI) / 180;
        const h = 2 * Math.tan(fov / 2) * distance;
        const w = h * aspect;
        
        state.viewport.width = w;
        state.viewport.height = h;
      }

      setCameraReady(true);
    }
  }, [location.pathname, camera, size, state]);

  const handleClick = (day: number) => {
    navigate(`/${day}`);
  };

  return (
    <>
      <directionalLight position={[5, 1, 8]} intensity={1.5} castShadow />
      <ambientLight intensity={0.3} />
      <Title />
      {cameraReady && Array.from({ length: 31 }, (_, i) => (
        <ProjectLink
          key={i}
          day={i + 1}
          onPointerDown={() => handleClick(i + 1)}
        />
      ))}
    </>
  );
};

export default Experience;