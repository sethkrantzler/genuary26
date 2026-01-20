import { useTexture } from '@react-three/drei';
import { PromptHint } from '../../components/PromptHint';
import { CompletedSketch, FullScreenShader } from '../../utils/utils';
import * as THREE from 'three';
import { Bloom, EffectComposer, Glitch, Pixelation } from '@react-three/postprocessing';

const Day20Project = () => {

    return (
        <>
            <PromptHint prompt="a single line" hint="drag to break my heart" color="grey" />
            <CompletedSketch day={20} />
            <FullScreenShader
                fragmentPath={`${import.meta.env.BASE_URL}shaders/day20.glsl`}
            />
        </>
    );
};

export default Day20Project;