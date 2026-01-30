import React, { useEffect, useRef } from 'react';
import { Html } from '@react-three/drei';
import { PromptHint } from '../../components/PromptHint';
import { CompletedSketch, FullScreenShader } from '../../utils/utils';
import { Color } from 'three';

const Day30Project = () => {
    const pattern = useRef({ value: 0 });
  
    const maxPattern = 2;
   
     const handleDoubleClick = () => {
        pattern.current.value = (pattern.current.value + 1 ) % maxPattern;
     };

     useEffect(() => {
        window.addEventListener("dblclick", handleDoubleClick);

        return () => window.removeEventListener("dblclick", handleDoubleClick)

     }, [])
    return (
        <>
            <PromptHint prompt="it's not a bug, its a feature" hint="double tap for extreme mode" color="red" />
            <CompletedSketch day={30}/>
            <FullScreenShader 
                fragmentPath={`${import.meta.env.BASE_URL}shaders/day30.glsl`}
                uniforms={{
                    uPattern: pattern.current,
                }} 
            />
        </>
        
    );
};

export default Day30Project;