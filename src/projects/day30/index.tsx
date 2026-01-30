import React, { useEffect, useRef } from 'react';
import { Html } from '@react-three/drei';
import { PromptHint } from '../../components/PromptHint';
import { CompletedSketch, FullScreenShader } from '../../utils/utils';
import { Color } from 'three';

const Day30Project = () => {
    const pattern = useRef({ value: 8 });
    return (
        <>
            <PromptHint prompt="It's not a bug, it's a feature" color="white" />
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