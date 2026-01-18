import { useRef } from "react";
import { PromptHint } from "../../components/PromptHint";
import { CompletedSketch, FullScreenShader } from "../../utils/utils";

const Day17Project = () => {
    // Stable uniform object
    const impact = useRef({ value: 0.0 });
  
    // Array of impact strengths
    const impactValues = [1.0, 3.0, 0.5, 10.0,0.1, 5.0, 0.0];
    const index = useRef(0);
  
    const handleDoubleClick = () => {
      index.current = (index.current + 1) % impactValues.length;
      impact.current.value = impactValues[index.current];
    };
  
    return (
      <>
        <PromptHint prompt="Wallpaper Group" hint={"double click to change mouse influence"} color="white" />
        <CompletedSketch day={17} />
  
        <FullScreenShader
          fragmentPath={`${import.meta.env.BASE_URL}shaders/day17.glsl`}
          uniforms={{
            uImpact: impact.current,
          }}
          onClick={handleDoubleClick}
        />
      </>
    );
  };
  
  export default Day17Project;