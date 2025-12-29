import React from 'react';
import { Html } from '@react-three/drei';

const Day5Project = () => {
    return (
        <Html position={[0, 0, 0]} center>
            <div style={{ color: 'black', background: 'white', padding: '10px', borderRadius: '5px' }}>
                <h1>Project for Day 5</h1>
                <p>This is an HTML overlay rendered inside the 3D scene.</p>
            </div>
        </Html>
    );
};

export default Day5Project;