import React from 'react';
import { Html } from '@react-three/drei';

const Day15Project = () => {
    return (
        <Html position={[0, 0, 0]} center>
            <div style={{ color: 'black', background: 'white', padding: '10px', borderRadius: '5px' }}>
                <h1>Project for Day 15</h1>
                <p>This is an HTML overlay rendered inside the 3D scene.</p>
            </div>
        </Html>
    );
};

export default Day15Project;