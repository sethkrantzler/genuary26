import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Html } from '@react-three/drei';
import { PromptHint } from '../../components/PromptHint';
import { CompletedSketch, createPathAstroid } from '../../utils/utils';
import gsap from 'gsap';

// Parameters
const ROAD_WIDTH = 8;
const BUILDING_SPACING = 0.5;
const DEPTH = 100;
const SPEED = 0.3;
const LANE_OFFSET = 1+ROAD_WIDTH / 2;

// One window geometry (scaled per window)
const baseWindowGeometry = new THREE.PlaneGeometry(1, 1);

// Shared window materials
const litWindowMaterial = new THREE.MeshStandardMaterial({
  color: 0xffff00,
  emissive: 0xffff00,
  emissiveIntensity: 1.5,
});

const darkWindowMaterial = new THREE.MeshBasicMaterial({
  color: 0x003333,
  wireframe: true,
});

// Building templates
const createApartmentBuilding = () => {
  const height = 15 + Math.random() * 10;
  const width = 4 + Math.random() * 3;
  const depth = 4 + Math.random() * 3;
  
  const group = new THREE.Group();
  const wireframeColor = Math.random() > 0.5 ? 0x00ffff : 0x00ff88;
  
  // Main building
  const buildingGeom = new THREE.BoxGeometry(width, height, depth);
  const buildingMat = new THREE.MeshBasicMaterial({ 
    color: wireframeColor, 
    wireframe: true 
  });
  const building = new THREE.Mesh(buildingGeom, buildingMat);
  building.position.y = height / 2;
  group.add(building);
  
  // Windows
  const windowRows = Math.floor(height / 2);
  const windowCols = 3;
  const windowWidth = width / (windowCols + 1);
  const windowHeight = 1.2;
  
  for (let row = 0; row < windowRows; row++) {
    for (let col = 0; col < windowCols; col++) {
      const hasLight = Math.random() > 0.6;
      const windowGeom = new THREE.PlaneGeometry(windowWidth * 0.6, windowHeight * 0.6);
      const windowMat = hasLight 
        ? litWindowMaterial
        : darkWindowMaterial;
      
      const window = new THREE.Mesh(windowGeom, windowMat);
      window.position.set(
        -width / 2 + windowWidth * (col + 1),
        2 + row * 2,
        depth / 2 + 0.01
      );
      group.add(window);
    }
  }
  
  // Roof
  const roofGeom = new THREE.BoxGeometry(width + 0.5, 0.5, depth + 0.5);
  const roofMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
  const roof = new THREE.Mesh(roofGeom, roofMat);
  roof.position.y = height;
  group.add(roof);
  
  // Stairs
  const stairWidth = width * 0.4;
  const stairGeom = new THREE.BoxGeometry(stairWidth, 1, 2);
  const stairMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
  const stairs = new THREE.Mesh(stairGeom, stairMat);
  stairs.position.set(0, 0.5, depth / 2 + 1);
  group.add(stairs);
  
  return { group, width, depth };
};

const createHouseBuilding = () => {
  const wireframeColor = Math.random() > 0.5 ? 0x00ffff : 0x00ff88;
  const height = 6 + Math.random() * 4;
  const width = 5 + Math.random() * 2;
  const depth = 5 + Math.random() * 2;
  
  const group = new THREE.Group();
  
  // Main house
  const houseGeom = new THREE.BoxGeometry(width, height, depth);
  const houseMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
  const house = new THREE.Mesh(houseGeom, houseMat);
  house.position.y = height / 2;
  group.add(house);
  
  // Pyramid roof
  const roofGeom = new THREE.ConeGeometry(width * 0.7, height * 0.4, 4);
  const roofMat = new THREE.MeshBasicMaterial({ color: wireframeColor, wireframe: true });
  const roof = new THREE.Mesh(roofGeom, roofMat);
  roof.position.y = height + height * 0.2;
  roof.rotation.y = Math.PI / 4;
  group.add(roof);
  
  // Windows
  for (let i = 0; i < 2; i++) {
    const hasLight = Math.random() > 0.5;
    const windowGeom = new THREE.PlaneGeometry(1, 1.5);
    const windowMat = hasLight 
        ? litWindowMaterial
        : darkWindowMaterial;
    
    const window = new THREE.Mesh(windowGeom, windowMat);
    window.position.set(
      -width / 4 + (i * width / 2),
      height / 2,
      depth / 2 + 0.01
    );
    group.add(window);
  }
  
  return { group, width, depth };
};

const createTowerBuilding = () => {
  const height = 30 + Math.random() * 20;
  const width = 6 + Math.random() * 4;
  const depth = 6 + Math.random() * 4;
  
  const group = new THREE.Group();
  const wireframeColor = Math.random() > 0.5 ? 0x00ffff : 0x00ff88;
  
  // Main tower
  const towerGeom = new THREE.BoxGeometry(width, height, depth);
  const towerMat = new THREE.MeshBasicMaterial({ color: wireframeColor, wireframe: true });
  const tower = new THREE.Mesh(towerGeom, towerMat);
  tower.position.y = height / 2;
  group.add(tower);
  
  // Many windows
  const windowRows = Math.floor(height / 1.5);
  const windowCols = 4;
  const windowWidth = width / (windowCols + 1);
  const windowHeight = 1;
  
  for (let row = 0; row < windowRows; row++) {
    for (let col = 0; col < windowCols; col++) {
      const hasLight = Math.random() > 0.5;
      const windowGeom = new THREE.PlaneGeometry(windowWidth * 0.7, windowHeight * 0.7);
      const windowMat = hasLight 
        ? litWindowMaterial
        : darkWindowMaterial;
      
      const window = new THREE.Mesh(windowGeom, windowMat);
      window.position.set(
        -width / 2 + windowWidth * (col + 1),
        1 + row * 1.5,
        depth / 2 + 0.01
      );
      group.add(window);
    }
  }
  
  return { group, width, depth };
};

const Building = ({ position, side }) => {
  const ref = useRef<THREE.Group>();
  const buildingData = useMemo(() => {
    const templates = [createApartmentBuilding, createHouseBuilding, createTowerBuilding];
    const template = templates[Math.floor(Math.random() * templates.length)];
    return template();
  }, []);
  
  useEffect(() => {
    if (ref.current && buildingData) {
      ref.current.add(buildingData.group);
      
      // Calculate the bounding box of the building
      const box = new THREE.Box3().setFromObject(buildingData.group);
      const size = new THREE.Vector3();
      box.getSize(size);
      
     // Determine offset based on which edge is closest to 0
      const xOffset = side === 'left' 
        ? -LANE_OFFSET + size.x / 2*LANE_OFFSET  // Left side: move right by half width
        : LANE_OFFSET - size.x / 2*LANE_OFFSET;   // Right side: move left by half width
      
      ref.current.position.set(
        xOffset,
        0,
        position
      );
    }
  }, [buildingData, position, side]);
  
  useFrame(() => {
    if (ref.current) {
      ref.current.position.z += SPEED;
      
      if (ref.current.position.z > 10) {
        ref.current.position.z = -DEPTH;
      }
    }
  });
  
  return <group ref={ref} />;
};

// Shared geometry + materials (created once)
const roadMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
const dashMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });

const dashGeometry = new THREE.PlaneGeometry(0.3, 4);
const roadGeometry = new THREE.PlaneGeometry(ROAD_WIDTH, DEPTH * 2);

export const Road = () => {
  const dashRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (dashRef.current) {
      dashRef.current.position.z += SPEED;
      if (dashRef.current.position.z > 5) {
        dashRef.current.position.z = -5;
      }
    }
  });

  return (
    <group>
      {/* Road surface */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        geometry={roadGeometry}
        material={roadMaterial}
      />

      {/* Dashed center line */}
      <group ref={dashRef}>
        {Array.from({ length: 20 }).map((_, i) => (
          <mesh
            key={i}
            position={[0, 0, -DEPTH + i * 10]}
            rotation={[-Math.PI / 2, 0, 0]}
            geometry={dashGeometry}
            material={dashMaterial}
          />
        ))}
      </group>
    </group>
  );
};

// --------------------------------------------------
// MOON
// --------------------------------------------------
const Moon = () => {
    const moonRef = useRef<THREE.Mesh>();
    
    useEffect(() => {
      if (moonRef.current) {
        // Slow yoyo animation - descends and rises
        const tween = gsap.to(moonRef.current.position, {
          y: 5, // Descend from 30 to 15
          duration: 20, // 20 seconds down
          ease: "power1.inOut",
          yoyo: true,
          repeat: -1 // Infinite loop
        });
        
        return () => {
          tween.kill();
        };
      }
    }, []);
    
    return (
      <mesh ref={moonRef} position={[0, 30, -130]}>
        <sphereGeometry args={[8, 16, 16]} />
        <meshStandardMaterial color={0xffffff} fog={false} emissive={0xffffff} emissiveIntensity={0.4}/>
      </mesh>
    );
  };

// --------------------------------------------------
// PARTICLE STARS
// --------------------------------------------------
const Stars = () => {
  const starsGroup = useMemo(() => {
    const group = new THREE.Group();
    const astroidCurve = createPathAstroid(0.15);
    const count = 200;
    
    for (let i = 0; i < count; i++) {
      const points = [];
      for (let j = 0; j <= 32; j++) {
        points.push(astroidCurve.getPoint(j / 32));
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: Math.random() * 0.5 + 0.3,
        fog: false
      });
      
      const star = new THREE.Line(geometry, material);
      
      star.position.set(
        (Math.random() - 0.5) * 200,
        Math.random() * 80 + 10,
        -150 - Math.random() * 100
      );
      
      star.rotation.z = Math.random() * Math.PI * 2;
      
      group.add(star);
    }
    
    return group;
  }, []);
  
  return <primitive object={starsGroup} />;
};

// --------------------------------------------------
// SHARED RESOURCES
// --------------------------------------------------

// One box geometry, scaled per building
const baseBuildingGeometry = new THREE.BoxGeometry(1, 1, 1);

// One building material
const buildingMaterial = new THREE.MeshBasicMaterial({ color: 'gray' });

// --------------------------------------------------
// SKYLINE
// --------------------------------------------------
const Skyline = () => {
  const skylineGroup = useMemo(() => {
    const group = new THREE.Group();
    const buildingCount = 60;

    for (let i = 0; i < buildingCount; i++) {
      const width = Math.random() * 2 + 1;
      const height = Math.random() * 12 + 3;
      const depth = Math.random() * 1.5 + 0.5;

      const buildingGroup = new THREE.Group();

      // BUILDING (shared geometry + material)
      const building = new THREE.Mesh(baseBuildingGeometry, buildingMaterial);
      building.scale.set(width, height, depth);
      building.position.y = height / 2;
      buildingGroup.add(building);

      // WINDOWS
      const windowRows = Math.floor(height / 1.5);
      const windowCols = Math.max(2, Math.floor(width / 0.8));
      const windowWidth = width / (windowCols + 1);
      const windowHeight = 0.8;

      for (let row = 0; row < windowRows; row++) {
        for (let col = 0; col < windowCols; col++) {
          const hasLight = Math.random() > 0.6;

          const window = new THREE.Mesh(
            baseWindowGeometry,
            hasLight ? litWindowMaterial : darkWindowMaterial
          );

          window.scale.set(windowWidth * 0.6, windowHeight * 0.6, 1);

          window.position.set(
            -width / 2 + windowWidth * (col + 1),
            0.5 + row * 1.5,
            depth / 2 + 0.01
          );

          buildingGroup.add(window);
        }
      }

      // POSITION BUILDING IN WORLD
      const xPosition = (Math.random() - 0.5) * 80;
      const zPosition = -DEPTH + 10 + (Math.random() - 0.5) * 20;

      buildingGroup.position.set(xPosition, 0, zPosition);

      group.add(buildingGroup);
    }

    return group;
  }, []);

  return <primitive object={skylineGroup} />;
};

const Day8Project = () => {
    const {camera} = useThree();
    const buildings = useMemo(() => {
        const result = [];
        let leftZ = -DEPTH;
        let rightZ = -DEPTH;
        
        while (leftZ < 10) {
          result.push({ side: 'left', position: leftZ, key: `left-${leftZ}` });
          leftZ += BUILDING_SPACING + Math.random() * 8;
        }
        
        while (rightZ < 10) {
          result.push({ side: 'right', position: rightZ, key: `right-${rightZ}` });
          rightZ += BUILDING_SPACING + Math.random() * 8;
        }
        
        return result;
    }, []);

    useEffect(() => {
        camera.position.set(0, 5, 8);
        (camera as THREE.PerspectiveCamera).fov = 75;
    }, []);

    return (
        <>
          <PromptHint prompt={'Build a Metropolis'} color={'white'} />
          <CompletedSketch day={8} />
          <color attach="background" args={['#000814']} />
          <fog attach="fog" args={['#000814', 20, DEPTH]} />
          
          <ambientLight intensity={0.3} />
          <pointLight position={[0, 10, 0]} intensity={0.5} />
          
          <Moon />
          <Stars />
          <Skyline />
          <Road />
          
          {buildings.map(({ side, position, key }) => (
              <Building key={key} side={side} position={position} />
          ))}
          
          <EffectComposer>
            <Bloom 
                intensity={1.5}
                luminanceThreshold={0.2}
                luminanceSmoothing={0.9}
            />
          </EffectComposer>
        </>
    );
};

export default Day8Project;