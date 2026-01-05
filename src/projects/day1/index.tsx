import React, { useEffect, useRef } from 'react';
import { Html } from '@react-three/drei';
import { AmbientLight, CircleGeometry, Color, CylinderGeometry, DirectionalLight, DoubleSide, Material, MathUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial } from 'three';
import GUI from 'lil-gui';
import { useFrame, useThree } from '@react-three/fiber';
import { PromptHint } from '../../components/PromptHint';
import { CompletedSketch } from '../../utils/utils';

function Circle({index, outerSize, shapeSize, geometry, material}: { index: number; outerSize: number; shapeSize: number; geometry: CircleGeometry; material: Material }) {
    const meshRef = useRef<Mesh>(null);
    const angleIncrement = (Math.PI*2) / Math.floor(Math.PI*(outerSize/shapeSize));
    const theta = angleIncrement+index*angleIncrement;
    const x = outerSize*Math.cos(theta);
    const y = outerSize*Math.sin(theta);
  
    useFrame(() => {
      if (!meshRef.current) return;
      meshRef.current.rotation.y += 0.01;
      meshRef.current.scale.x = 0.55+0.4*(Math.cos(2*meshRef.current.rotation.y));
      meshRef.current.scale.y = 0.55+0.4*(Math.cos(2*meshRef.current.rotation.y));
      meshRef.current.scale.z = 0.55+0.4*(Math.cos(2*meshRef.current.rotation.y));
    });
  
    return (
        <mesh
            position={[x,y,0]}
            rotation={[0,(theta+0.0012)*.5, 0]}
            ref={meshRef}
            geometry={geometry}
            material={material}
        />
    );
  }

  function Cylinder({index, outerSize, shapeSize, geometry, material}: { index: number; outerSize: number; shapeSize: number; geometry: CylinderGeometry; material: Material }) {
    const meshRef = useRef<Mesh>(null);
    //const theta = index*2*Math.tan(shapeSize/outerSize);
    const angleIncrement = (Math.PI*2) / Math.floor(Math.PI*(outerSize/shapeSize));
    const theta = angleIncrement+index*angleIncrement;
    const x = outerSize*Math.cos(theta);
    const y = outerSize*Math.sin(theta);
  
    useFrame(() => {
      if (!meshRef.current) return;
      meshRef.current.rotation.z += 0.005;
      meshRef.current.scale.x = 0.6+0.4*(Math.sin(2*meshRef.current.rotation.z));
      meshRef.current.scale.y = 0.6+0.4*(Math.sin(2*meshRef.current.rotation.z));
      meshRef.current.scale.z = 0.6+0.4*(Math.sin(2*meshRef.current.rotation.z));

    });
  
    return (
        <mesh
            position={[x,y,0]}
            rotation={[(Math.PI/2), 0, (Math.PI/2)]}
            ref={meshRef}
            geometry={geometry}
            material={material}
        />
    );
  }

const Day1Project = () => {
    const { scene, viewport } = useThree();
    // make an array of circles of radius r spread out in a circle of size s, rotate them using some wave like pattern
    const [cylinderMode, setCylinderMode] = React.useState(false);
    const [outerSize, setOuterSize] = React.useState(1.51);
    const [shapeSize, setShapeSize] = React.useState(0.11);
    const [geometry, setGeometry] = React.useState<CylinderGeometry | CircleGeometry>(new CylinderGeometry(shapeSize, shapeSize, 0.02));
    const materialRef = useRef(new MeshStandardMaterial({ color: 'white', side: DoubleSide, metalness:0, roughness:0.5}));
    const ambientRef = useRef<AmbientLight>();
    const directionalRef = useRef<DirectionalLight>();
    
    useEffect(() => {
        const gui = new GUI();
        gui.hide();
        gui.add({ shapeSize }, 'shapeSize', 0.1, 2, 0.1).onChange((value => setShapeSize(value)));
        const toggleGUIVisibility = (event: KeyboardEvent) => {
            if (event.key === 'h') {
                gui.domElement.style.display = gui.domElement.style.display === 'none' ? '' : 'none';
            }
        };
    
        window.addEventListener('keydown', toggleGUIVisibility);
        window.addEventListener('click', () => setCylinderMode((prev) => !prev));
        window.addEventListener('touch', () => setCylinderMode((prev) => !prev));
        window.addEventListener('drag', () => setCylinderMode((prev) => !prev));

    
        return () => {
            window.removeEventListener('click', () => setCylinderMode((prev) => !prev));
            window.removeEventListener('touch', () => setCylinderMode((prev) => !prev));
            window.removeEventListener('drag', () => setCylinderMode((prev) => !prev));
            window.removeEventListener('keydown', toggleGUIVisibility);
            gui.destroy();
        };
    }, []); 

    useEffect(() => {
        setOuterSize(Math.min(viewport.height, viewport.width) / 2.5);
    }, [viewport]);

    useEffect(() => {
        setGeometry(new CircleGeometry(shapeSize, 32));// new CylinderGeometry(shapeSize, shapeSize, 0.02)
    }, [shapeSize]);

    useEffect(() => {
        if (cylinderMode)
            setGeometry(new CylinderGeometry(shapeSize, shapeSize, 0.02));
        else
            setGeometry(new CircleGeometry(shapeSize, 32));
    }, [cylinderMode]);

    // function getColor(time: number): Color {
    //     const twoPi = Math.PI * 2;
      
    //     // Define vectors A, B, C, D as Colors with distinct channels
    //     const A = new Color(0.5, 0.5, 0.5);   // base offset
    //     const B = new Color(0.5, 0.5, 0.5);   // amplitude
    //     const C = new Color(0.00005, 0.00005, 0.00005);   // frequency
    //     const D = new Color(0.0, 0.1, 0.20); // phase shift
      
    //     // Apply the palette formula per channel
    //     const r = A.r + B.r * Math.cos(twoPi * (C.r * time + D.r));
    //     const g = A.g + B.g * Math.cos(twoPi * (C.g * time + D.g));
    //     const b = A.b + B.b * Math.cos(twoPi * (C.b * time + D.b));

    //     return new Color(
    //       MathUtils.clamp(r, 0, 1),
    //       MathUtils.clamp(g, 0, 1),
    //       MathUtils.clamp(b, 0, 1)
    //     );
    //   }      

    // useFrame(() => {
    //     if (!materialRef.current || !ambientRef.current || !directionalRef.current) return;
      
    //     const color = getColor(Date.now());
      
    //     // Copy the color into each target
    //     materialRef.current.color.copy(color);
    //     ambientRef.current.color.copy(color);
    //     directionalRef.current.color.copy(color);
      
    //     scene.background = color;
    //   });

      useEffect(() => {
         // blue new Color(56/255, 131/255, 205/255);
        // orange new Color(196/255,119/255,46/255)
        if (!materialRef.current || !ambientRef.current || !directionalRef.current) return;
        
            const color = cylinderMode ? new Color(56/255, 131/255, 205/255) : new Color(212/255,98/255,40/255);
            materialRef.current.color.copy(color);
            ambientRef.current.color.copy(color);
            directionalRef.current.color.copy(color);
        
            scene.background = color;
      }, [cylinderMode]);

    return (
        <>
        <CompletedSketch day={1} />
        <PromptHint prompt={'one color one shape'} hint={'tap to change style'}/>
        <ambientLight ref={ambientRef} intensity={0.5} />
        <directionalLight ref={directionalRef} position={[5, 5, 5]} intensity={1} />
         {Array.from({ length: Math.floor(Math.PI*(outerSize/shapeSize))}, (_, i) => (
                cylinderMode ? <Cylinder key={i} index={i} outerSize={outerSize} shapeSize={shapeSize} geometry={geometry as CylinderGeometry} material={materialRef.current}/>
                : <Circle key={i} index={i} outerSize={outerSize} shapeSize={shapeSize} geometry={geometry as CircleGeometry} material={materialRef.current}/>
            ))}
        </>
    );
};

export default Day1Project;