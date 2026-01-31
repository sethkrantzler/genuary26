import * as THREE from "three";
import React, { useState, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ProjectLink, sharedMatcapMaterial } from "./ProjectLink";
import { MouseIcon } from "./MouseIcon";
import { useNavigate } from "react-router-dom";
import { TextGeometry, FontLoader } from "three/examples/jsm/Addons.js";
import { getVisitedSketches, smoothstepRange } from "../utils/utils";
import { Html } from "@react-three/drei";
import { Fireworks } from "./Fireworks";

function Title() {
    const textRef = useRef<THREE.Mesh>(null);
    const [geometry, setGeometry] = useState<TextGeometry | undefined>(undefined);

    const { viewport } = useThree();
    
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
    });
    
    const handleClick = () => {
        const a = document.createElement('a');
        a.href = 'https://genuary.art';
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
    
    return (
        <mesh
            position={[0, (viewport.height/2) - 0.5, 0]}
            ref={textRef}
            geometry={geometry}
            material={sharedMatcapMaterial}
            onPointerDown={handleClick}
        />
    );
}

const Experience = (showFireworks) => {
  const state = useThree();
  const { camera, size, scene } = state;
  const navigate = useNavigate();
  const [cameraReady, setCameraReady] = useState(false);
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(
    navigator.userAgent
  )

  useEffect(() => {
    camera.position.set(0, 0, 5);
    camera.rotation.set(0, 0, 0);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();
    
    // Manually update viewport in the state
    const aspect = size.width / size.height;
    if (camera instanceof THREE.PerspectiveCamera) {
      const distance = camera.position.z;
      const fov = (camera.fov * Math.PI) / 180;
      const h = 2 * Math.tan(fov / 2) * distance;
      const w = h * aspect;
      
      state.viewport.width = w;
      state.viewport.height = h;
      camera.fov = 45;
    }
    setCameraReady(true);
}, [camera, size, state]);

  useFrame(({clock})=> {
    if (showFireworks) return;
    const b = (Math.sin(clock.elapsedTime*0.25) + 1) / 2;
    const s = smoothstepRange(b, 0, 1, 0.005, 0.6);

    scene.background = new THREE.Color(s, s, s);      
  })

  useEffect(()=> {
    scene.background = new THREE.Color("black");
  }, [showFireworks])

  const handleClick = (day: number) => {
    setTimeout(() => {
      navigate(`/${day}`);
    }, isMobile ? 0: 250);
  };

  return (
    <>
      <directionalLight position={[5, 1, 8]} intensity={1.5} castShadow />
      <ambientLight intensity={0.3} />
      {showFireworks && <Fireworks />}
      <Title />
      {!isMobile && <MouseIcon />}
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