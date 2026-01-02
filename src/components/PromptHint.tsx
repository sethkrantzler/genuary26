import { Html } from "@react-three/drei";
import React, { useEffect } from "react";

export function PromptHint({prompt, hint, color}: {prompt: string; hint?: string, color?: string}) {
    const [showHint, setShowHint] = React.useState(true);
    
    useEffect(() => {
        const timer = setTimeout(() => setShowHint(false), 3000); // hide after 3s
        return () => clearTimeout(timer);
    }, []);
    
    return (
        <Html center>
            <h1
                style={{ 
                    textAlign: 'center',
                    opacity: showHint ? 1 : 0,
                    transition: 'opacity 1s ease-out',
                    color: color || 'white',
                    fontSize: '18px',           // scales with viewport
                    fontFamily: 'Arial, sans-serif', // cleaner font
                    pointerEvents: 'none',
                    width: '100vw'
                  }}              
            >
                {prompt.toLocaleUpperCase()}
            </h1>
            {hint && <h2
                style={{ 
                    textAlign: 'center',
                    opacity: showHint ? 1 : 0,
                    transition: 'opacity 2.5s ease-out',
                    color: color || 'white',
                    fontSize: '14px',           // scales with viewport
                    fontFamily: 'Arial, sans-serif', // cleaner font
                    pointerEvents: 'none',
                    width: '100vw'
                  }}              
            >
                {hint.toLocaleUpperCase()}
            </h2>}
        </Html>
    );

}