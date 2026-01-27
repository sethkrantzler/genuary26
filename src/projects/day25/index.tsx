import React, { useEffect, useRef } from 'react';
import { PromptHint } from '../../components/PromptHint';
import { CompletedSketch, FullScreenShader } from '../../utils/utils';

const Day25Project = () => {
     // Stable uniform object
     const pattern = useRef({ value: 1 });
  
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
            <PromptHint prompt="Organic Geometry" hint="double tap"/>
            <FullScreenShader
                fragmentPath={`${import.meta.env.BASE_URL}shaders/day25.glsl`}
                uniforms={{
                    uPattern: pattern.current,
                }}
            />
            <CompletedSketch day={25} />
        </>
    );
};

export default Day25Project;