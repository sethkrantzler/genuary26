import * as THREE from "three";
import React, { useState, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { FontLoader, TextGeometry } from "three/examples/jsm/Addons.js";
import gsap from "gsap";

// Shared matcap for text
export const sharedMatcapMaterial = new THREE.MeshMatcapMaterial();
const textureLoader = new THREE.TextureLoader();
textureLoader.load(`${import.meta.env.BASE_URL}textures/3.png`, (texture) => {
  sharedMatcapMaterial.matcap = texture;
});

// ---------------------------
// SHARED SHAPE GEOMETRIES
// ---------------------------

// Proper 5-point star in 2D
const starShape = new THREE.Shape();
const outerRadius = 0.6;
const innerRadius = 0.3;
const numPoints = 5;

for (let i = 0; i < numPoints * 2; i++) {
  const isOuter = i % 2 === 0;
  const r = isOuter ? outerRadius : innerRadius;
  const angle = (i * Math.PI) / numPoints - Math.PI / 2;
  const x = Math.cos(angle) * r;
  const y = Math.sin(angle) * r;
  if (i === 0) starShape.moveTo(x, y);
  else starShape.lineTo(x, y);
}
starShape.closePath();

const starGeometry = new THREE.ExtrudeGeometry(starShape, {
  depth: 0.05,
  bevelEnabled: true,
  bevelThickness: 0.02,
  bevelSize: 0.02,
  bevelSegments: 2,
});

const diskGeometry = new THREE.CircleGeometry(0.55, 3);
const diamondGeometry = new THREE.CircleGeometry(0.5, 4);

// ---------------------------
// SHARED MATERIALS
// ---------------------------
const goldMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#FFD700"),
  metalness: 1,
  roughness: 0.2,
});

const blueMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#50C878"),
  metalness: 0.6,
  roughness: 0.4,
});

const silverMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#fc8b8f"),
  metalness: 0.3,
  roughness: 0.4,
});

// ---------------------------
// COOKIE HELPER
// ---------------------------
function getVisitedSketches(): number[] {
  try {
    const raw = document.cookie
      .split("; ")
      .find((row) => row.startsWith("visitedSketches="));
    if (!raw) return [];
    return JSON.parse(raw.split("=")[1]);
  } catch {
    return [];
  }
}

export function ProjectLink({ day, onPointerDown }: { day: number; onPointerDown: () => void }) {
  const textRef = useRef<THREE.Group>(null);
  const lastTriggerRef = useRef<number | null>(null);
  const isAnimating = useRef(false);

  // GSAP-controlled rotation values
  const spinX = useRef(0);
  const spinY = useRef(0);
  const spinZ = useRef(0);

  // GSAP-controlled squash/stretch
  const spinScale = useRef(1);

  const boxRef = useRef<THREE.Mesh>(null);
  const shapeRef = useRef<THREE.Mesh>(null);

  const [geometry, setGeometry] = useState<TextGeometry | undefined>(undefined);
  const [boxGeometry, setBoxGeometry] = useState<THREE.BoxGeometry | undefined>(undefined);
  const [localPosition, setLocalPosition] = useState<[number, number, number]>([0, 0, 0]);

  const { viewport } = useThree();

  useEffect(() => {
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
    
    setLocalPosition([x, y, 0]);
  }, [viewport.width, viewport.height, day]);
  // ---------------------------
  // LOAD TEXT GEOMETRY
  // ---------------------------
  useEffect(() => {
    const fontLoader = new FontLoader();
    fontLoader.load(
      `${import.meta.env.BASE_URL}fonts/helvetiker_regular.typeface.json`,
      (font) => {
        const textGeo = new TextGeometry(day.toString(), {
          font,
          size: 0.05 * viewport.width,
          depth: 0.0025 * viewport.width,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.02,
          bevelOffset: 0,
          bevelSegments: 5,
        });

        textGeo.computeBoundingBox();
        if (textGeo.boundingBox) {
          const center = new THREE.Vector3();
          textGeo.boundingBox.getCenter(center);
          textGeo.translate(-center.x, -center.y, -center.z);

          const size = new THREE.Vector3();
          textGeo.boundingBox.getSize(size);

          const boxGeo = new THREE.BoxGeometry(size.x * 1.2, size.y, size.z * 1.2);
          setBoxGeometry(boxGeo);
        }

        setGeometry(textGeo);
      }
    );
  }, [day, viewport.width]);

  // ---------------------------
  // DETERMINE SHAPE TYPE
  // ---------------------------
  const visited = getVisitedSketches();
  const isVisited = visited.includes(day);

  const now = new Date();
  const sketchDate = new Date(2026, 0, day);
  const isAvailable = now >= sketchDate;

  let shapeType: "star" | "disk" | "diamond";
  if (isVisited) shapeType = "star";
  else if (isAvailable) shapeType = "disk";
  else shapeType = "diamond";

  const shapeGeometry =
    shapeType === "star" ? starGeometry : shapeType === "disk" ? diskGeometry : diamondGeometry;

  const shapeMaterial =
    shapeType === "star" || sketchDate.getDate() === now.getDate()
      ? goldMaterial
      : shapeType === "disk"
      ? blueMaterial
      : silverMaterial;

  // ---------------------------
  // WOBBLE ANIMATION
  // ---------------------------
  useFrame(({ clock }) => {
    if (!textRef.current) return;

    if (isAnimating.current) {
      // Apply GSAP-driven rotation + squash/stretch
      textRef.current.rotation.x = spinX.current;
      textRef.current.rotation.y = spinY.current;
      textRef.current.rotation.z = spinZ.current;
      textRef.current.scale.set(spinScale.current, spinScale.current, spinScale.current);
      return;
    }

    // Normal wobble
    const t = clock.getElapsedTime();
    textRef.current.rotation.y = Math.sin(t * 2 + day) * 0.2;
    textRef.current.rotation.x = Math.sin(t * 1.5 + day) * 0.05;
    textRef.current.rotation.z = Math.cos(t * 1.5 + day) * 0.05;

    textRef.current.scale.set(1, 1, 1);
  });
  
  // ---------------------------
  // GATE RENDER UNTIL TEXT READY
  // ---------------------------
  const ready = geometry && boxGeometry;
  if (!ready) return null;

  return (
    <group ref={textRef} position={localPosition}>
      {/* BACKGROUND SHAPE */}
      <mesh
        ref={shapeRef}
        geometry={shapeGeometry}
        material={shapeMaterial}
        position={[0, 0, -0.01]}
        rotation={
          shapeType === "diamond"
            ? [0, 0, Math.PI / 2]
            : shapeType === "star"
            ? [0, 0, Math.PI]
            : [0, 0, 0]
        }
        scale={0.12 * viewport.width}
      />

      {/* TEXT */}
      <mesh geometry={geometry!} material={sharedMatcapMaterial} />

      {/* CLICK BOX */}
      <mesh
        ref={boxRef}
        geometry={boxGeometry!}
        onPointerDown={onPointerDown}
        material={new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })}
      />
    </group>
  );
}