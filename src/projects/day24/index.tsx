import React, { useEffect, useRef } from 'react';
import { Html } from '@react-three/drei';
import { PromptHint } from '../../components/PromptHint';
import { CompletedSketch, FullScreenShader } from '../../utils/utils';

const Day24Project = () => {
     // Stable uniform object
     const pattern = useRef({ value: 0 });
  
    const maxPattern = 3;
   
     const handleDoubleClick = () => {
        pattern.current.value = (pattern.current.value + 1 ) % maxPattern;
     };

     useEffect(() => {
        window.addEventListener("dblclick", handleDoubleClick);

        return () => window.removeEventListener("dblclick", handleDoubleClick)

     }, [])
    return (
        <>
            <PromptHint prompt="perfectionist's nightmare" hint="drag to overlap all dots"/>
            <CompletedSketch day={24} />
            <FullScreenShader 
                uniforms={{
                    uPattern: pattern.current,
                }}
                fragmentPath={`${import.meta.env.BASE_URL}shaders/day24.glsl`}
            />
        </>
    );
};

export default Day24Project;