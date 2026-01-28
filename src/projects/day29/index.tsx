import React, { useEffect, useRef } from 'react';
import { Html } from '@react-three/drei';
import { PromptHint } from '../../components/PromptHint';
import { CompletedSketch, FullScreenShader } from '../../utils/utils';
import { useThree } from '@react-three/fiber';
import { Color } from 'three';

const Day29Project = () => {
    const {scene} = useThree();
    const pattern = useRef({ value: 0 });
  
    const maxPattern = 11;
   
     const handleDoubleClick = () => {
        pattern.current.value = (pattern.current.value + 1 ) % maxPattern;
     };

     useEffect(() => {scene.background = new Color('black')}, []);


     useEffect(() => {
        window.addEventListener("dblclick", handleDoubleClick);

        return () => window.removeEventListener("dblclick", handleDoubleClick)

     }, [])

    return (
        <>
            <PromptHint prompt="genetic mutation/evolution" hint="double tap to change style / drag to influence" color="white" />
            <CompletedSketch day={29} />
            <FullScreenShader 
                fragmentPath={`${import.meta.env.BASE_URL}shaders/day29.glsl`} 
                uniforms={{
                    uPattern: pattern.current,
                }}
            />
        </>
    );
};

export default Day29Project;