import React, { useState, useMemo } from 'react';
import * as THREE from 'three';
import { PromptHint } from '../../components/PromptHint';
import { CompletedSketch, FullScreenShader } from '../../utils/utils';

type Preset = {
  primaryPetals: number;
  secondaryPetals: number;
  divideSecondary: boolean;
  paletteColor: THREE.Vector3;
};

const PRESETS: Preset[] = [
    { 
      primaryPetals: 2, 
      secondaryPetals: 30, 
      divideSecondary: false,
      paletteColor: new THREE.Vector3(0.0, 0.0, 0.0)
    },
    { 
      primaryPetals: 2, 
      secondaryPetals: 2, 
      divideSecondary: false,
      paletteColor: new THREE.Vector3(0.7, 0.9, 0.2)
    },
    { 
      primaryPetals: 4, 
      secondaryPetals: 24, 
      divideSecondary: true,
      paletteColor: new THREE.Vector3(1.0, 1., 1.)
    },
    { 
      primaryPetals: 12, 
      secondaryPetals: 4, 
      divideSecondary: false,
      paletteColor: new THREE.Vector3(0.2, 0.3, 0.4)
    },
    { 
      primaryPetals: 8, 
      secondaryPetals: 12, 
      divideSecondary: true,
      paletteColor: new THREE.Vector3(1., 0.79, 0.45)
    },
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
        paletteColor: { value: currentPreset.paletteColor },
    }), []);

    // Update the values when preset changes
    uniforms.primaryPetals.value = currentPreset.primaryPetals;
    uniforms.secondaryPetals.value = currentPreset.secondaryPetals;
    uniforms.divideSecondaryPetals.value = currentPreset.divideSecondary;
    uniforms.paletteColor.value = currentPreset.paletteColor;

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