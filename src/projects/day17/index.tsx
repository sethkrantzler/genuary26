import React from 'react';
import { Html } from '@react-three/drei';
import { PromptHint } from '../../components/PromptHint';
import { CompletedSketch, FullScreenShader } from '../../utils/utils';

const Day17Project = () => {
    return (
        <>
            <PromptHint prompt="Wallpaper Group" color="black"/>
            <CompletedSketch day={17} />
            <FullScreenShader fragmentPath={`${import.meta.env.BASE_URL}shaders/day17.glsl`} />
        </>
    );
};

export default Day17Project;