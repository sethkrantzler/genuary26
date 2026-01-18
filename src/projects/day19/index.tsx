import React from 'react';
import { PromptHint } from '../../components/PromptHint';
import { CompletedSketch, FullScreenShader } from '../../utils/utils';

const Day19Project = () => {
    return (
        <>
            <PromptHint prompt="16x16" hint={"drag to explore"} color="white" />
            <CompletedSketch day={19} />
            <FullScreenShader fragmentPath={`${import.meta.env.BASE_URL}shaders/day19.glsl`} />
        </>
    );
};

export default Day19Project;