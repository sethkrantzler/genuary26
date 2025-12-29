import React from 'react';
import { Html } from '@react-three/drei';

const Day29Project = () => {
    return (
        <Html position={[0, 0, 0]} center>
            <div style={{ color: 'black', background: 'white', padding: '10px', borderRadius: '5px' }}>
                <h1>Project for Day 29</h1>
                <p>This is an HTML overlay rendered inside the 3D scene.</p>
            </div>
        </Html>
    );
};

export default Day29Project;