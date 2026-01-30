import { useEffect, useRef } from 'react';
import { PromptHint } from '../../components/PromptHint';
import { CompletedSketch, FullScreenShader } from '../../utils/utils';

const Day31Project = () => {
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
            <PromptHint prompt="GLSL Day" hint="double tap for extreme mode" color="red" />
            <CompletedSketch day={31}/>
            <FullScreenShader 
                fragmentPath={`${import.meta.env.BASE_URL}shaders/day31.glsl`}
                uniforms={{
                    uPattern: pattern.current,
                }} 
            />
        </>
        
    );
};

export default Day31Project;