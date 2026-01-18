import React from 'react';
import { Html, OrbitControls } from '@react-three/drei';
import { PromptHint } from '../../components/PromptHint';
import { CompletedSketch, FullScreenShader } from '../../utils/utils';

const Day18Project = () => {
    return (
        <>
            <PromptHint prompt={"unexpected path following one rule"} hint={"drag to change spirograph"} color="white" />
            <CompletedSketch day={18} />
            <FullScreenShader fragmentPath={`${import.meta.env.BASE_URL}shaders/day18.glsl`}/>
        </>
    );
};

export default Day18Project;