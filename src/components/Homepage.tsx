import { useState, useEffect } from "react";
import { getVisitedSketches, smoothstepRange } from "../utils/utils";
import Experience from "./Experience"
import { Fireworks } from "./Fireworks"
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from 'three';

const Homepage = () => {
    const [showFireworks, setShowFireworks] = useState(false);
    const { scene } = useThree();


    useFrame(({clock})=> {
        if (showFireworks) return;
        const b = (Math.sin(clock.elapsedTime*0.25) + 1) / 2;
        const s = smoothstepRange(b, 0, 1, 0.005, 0.6);
    
        scene.background = new THREE.Color(s, s, s);      
      })
    
      useEffect(()=> {
        scene.background = new THREE.Color("black");
      }, [showFireworks])

    useEffect(() => {
        const existing = document.cookie
            .split("; ")
            .find((row) => row.startsWith("visitedSketches="));
  
        if (!existing) {
            document.cookie = `visitedSketches=${JSON.stringify([])}; path=/; max-age=31536000`;
        } else {
          const visited = getVisitedSketches();
          if (visited.length === 31) {
            setShowFireworks(true);
          }
        }
    }, []);


    return (
        <>
            {showFireworks && <Fireworks />}
            <Experience />
        </>
    )
}

export default Homepage;