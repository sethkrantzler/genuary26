
import { useRef, useEffect } from 'react';
import { PromptHint } from '../../components/PromptHint';
import { FullScreenShader, CompletedSketch } from '../../utils/utils';

const Day26Project = () => {

     // Stable uniform object
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
            <PromptHint prompt="Recursive Grids" hint="double tap" color="white" />
            <FullScreenShader
                fragmentPath={`${import.meta.env.BASE_URL}shaders/day26.glsl`}
                uniforms={{
                    uPattern: pattern.current,
                }}
            />
            <CompletedSketch day={26} />
        </>
    );
};

export default Day26Project;