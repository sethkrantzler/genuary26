import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(__dirname);

const projectsDir = path.join(__dirname, 'src', 'projects');

for (let day = 2; day <= 31; day++) {
    const dayDir = path.join(projectsDir, `day${day}`);
    const indexFile = path.join(dayDir, 'index.tsx');

    // Create the folder if it doesn't exist
    if (!fs.existsSync(dayDir)) {
        fs.mkdirSync(dayDir, { recursive: true });
    }

    // Create the index.tsx file with the appropriate content
    const content = `
import React from 'react';
import { Html } from '@react-three/drei';

const Day${day}Project = () => {
    return (
        <Html position={[0, 0, 0]} center>
            <div style={{ color: 'black', background: 'white', padding: '10px', borderRadius: '5px' }}>
                <h1>Project for Day ${day}</h1>
                <p>This is an HTML overlay rendered inside the 3D scene.</p>
            </div>
        </Html>
    );
};

export default Day${day}Project;
`;

    fs.writeFileSync(indexFile, content.trim());
    console.log(`Created: ${indexFile}`);
}