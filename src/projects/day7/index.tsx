import React, { useState, useMemo } from 'react';
import { PromptHint } from '../../components/PromptHint';
import { CompletedSketch, FullScreenShader } from '../../utils/utils';

type Preset = {
  primaryPetals: number;
  secondaryPetals: number;
  divideSecondary: boolean;
};

const PRESETS: Preset[] = [
  { primaryPetals: 2, secondaryPetals: 30, divideSecondary: false },
  { primaryPetals: 2, secondaryPetals: 2, divideSecondary: false },
  { primaryPetals: 4, secondaryPetals: 24, divideSecondary: true },
  { primaryPetals: 12, secondaryPetals: 4, divideSecondary: false },
  { primaryPetals: 8, secondaryPetals: 12, divideSecondary: true },
];

const Day7Project = () => {
    const [currentPresetIndex, setCurrentPresetIndex] = useState(0);
    const currentPreset = PRESETS[currentPresetIndex];

    const handleClick = () => {
        setCurrentPresetIndex((prev) => (prev + 1) % PRESETS.length);
    };

    // Create stable uniform objects and update their values
    const uniforms = useMemo(() => ({
        primaryPetals: { value: currentPreset.primaryPetals },
        secondaryPetals: { value: currentPreset.secondaryPetals },
        divideSecondaryPetals: { value: currentPreset.divideSecondary },
    }), []);

    // Update the values when preset changes
    uniforms.primaryPetals.value = currentPreset.primaryPetals;
    uniforms.secondaryPetals.value = currentPreset.secondaryPetals;
    uniforms.divideSecondaryPetals.value = currentPreset.divideSecondary;

    return (
        <>
            <PromptHint prompt={"Boolean Algebra"} hint={'tap to change style'} color="black" />
            <CompletedSketch day={7} />
            <FullScreenShader 
                fragmentPath={`${import.meta.env.BASE_URL}shaders/day7.glsl`}
                uniforms={uniforms}
                onClick={handleClick}
            />
        </>
    );
};

export default Day7Project;