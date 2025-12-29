import * as THREE from "three";
import React, { useState, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { FontLoader, TextGeometry } from "three/examples/jsm/Addons.js";

// Shared material
export const sharedMatcapMaterial = new THREE.MeshMatcapMaterial();
const textureLoader = new THREE.TextureLoader();
textureLoader.load('/textures/3.png', (texture) => {
  sharedMatcapMaterial.matcap = texture;
});

export function ProjectLink({ day, onClick }: { day: number; onClick: () => void }) {
  const textRef = useRef<THREE.Mesh>(null);
  const boxRef = useRef<THREE.Mesh>(null);
  const [geometry, setGeometry] = useState<TextGeometry | undefined>(undefined);
  const [boxGeometry, setBoxGeometry] = useState<THREE.BoxGeometry | undefined>(undefined);

  const { viewport } = useThree();

  const rows = 6;
  const cols = Math.ceil(31 / rows);

  const paddingX = viewport.width * 0.1;
  const paddingY = viewport.height * 0.1;
  const marginLeft = 0.05 * viewport.width;
  const marginTop = -0.6;

  const row = Math.floor((day - 1) / cols);
  const col = (day - 1) % cols;
  const x = marginLeft + (col - cols / 2) * ((viewport.width - paddingX * 2) / cols);
  const y = marginTop + (rows / 2 - row) * ((viewport.height - paddingY * 2) / rows);

  useEffect(() => {
    const fontLoader = new FontLoader();
    fontLoader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
      const textGeo = new TextGeometry(day.toString(), {
        font: font,
        size: 0.05 * viewport.width,
        depth: 0.0025 * viewport.width,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
      });

      textGeo.computeBoundingBox();
      if (textGeo.boundingBox) {
        const center = new THREE.Vector3();
        textGeo.boundingBox.getCenter(center);
        textGeo.translate(-center.x, -center.y, -center.z);

        // Create invisible box geometry slightly larger than text
        const size = new THREE.Vector3();
        textGeo.boundingBox.getSize(size);
        const boxGeo = new THREE.BoxGeometry(size.x * 1.2, size.y, size.z * 1.2); // scale factors for padding
        setBoxGeometry(boxGeo);
      }

      setGeometry(textGeo);
    });
  }, [day]);

  useFrame(({ clock }) => {
    if (!textRef.current) return;

    const t = clock.getElapsedTime();

    // Wobble around Y axis using sine wave
    textRef.current.rotation.y = Math.sin(t * 2+day) * 0.2; // amplitude 0.2 rad (~11°)

    // Optional: small subtle wobble on X/Z too
    textRef.current.rotation.x = Math.sin(t * 1.5+day) * 0.05;
    textRef.current.rotation.z = Math.cos(t * 1.5+day) * 0.05;
  });


  return (
    <group position={[x, y, 0]}>
      {geometry && (
        <mesh ref={textRef} geometry={geometry} material={sharedMatcapMaterial} />
      )}
      {boxGeometry && (
        <mesh
          ref={boxRef}
          geometry={boxGeometry}
          onClick={onClick}
          material={new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })}
        />
      )}
    </group>
  );
}