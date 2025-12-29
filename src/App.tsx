import { Canvas } from '@react-three/fiber';
import Experience from './components/Experience';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Html } from '@react-three/drei';

const DayCode = () => {
    const { day } = useParams<{ day: string }>();
    const [ProjectComponent, setProjectComponent] = useState<React.FC | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!day) return;

        const loadProject = async () => {
            try {
                const module = await import(`./projects/day${day}/index.tsx`);
                setProjectComponent(() => module.default);
                setError(null);
            } catch (err) {
                console.error(`Error loading project for day ${day}:`, err);
                setError(`Project for day ${day} not found.`);
            }
        };

        loadProject();
    }, [day]);

    if (error) {
        return (
            <Html center>
                <div>{error}</div>
            </Html>
        );
    }

    if (!ProjectComponent) {
        return (
            <Html center>
                <div>Loading...</div>
            </Html>
        );
    }

    return (
            <ProjectComponent />
    );
};

function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showButton = () => {
      setVisible(true);

      // Hide after 2 seconds of inactivity
      //@ts-ignore
      clearTimeout(window.backButtonTimeout);
      //@ts-ignore
      window.backButtonTimeout = setTimeout(() => setVisible(false), 2000);
    };

    window.addEventListener('touch', showButton);
    window.addEventListener('click', showButton);
    window.addEventListener('mousemove', showButton);

    return () => {
      window.removeEventListener('touch', showButton);
      window.removeEventListener('click', showButton);
      window.removeEventListener('mousemove', showButton);
      //@ts-ignore
      clearTimeout(window.backButtonTimeout);
    };
  }, []);

  if (location.pathname === '/') {
    return null;
  }

  return (
    <button
      onClick={(event) => {
        event.stopPropagation();
        navigate('/')
    }}
      style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        padding: '10px 15px',
        background: 'black',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        zIndex: 1000,
        opacity: visible ? 1 : 0,                // fade in/out
        transition: 'opacity 0.8s ease-in-out',  // smooth animation
        pointerEvents: 'auto' // prevent clicks when hidden
      }}
    >
      Back
    </button>
  );
}

export function App() {
  return (
    <>
        <BrowserRouter basename={import.meta.env.MODE === 'production' ? '/genuary26' : '/'}>
            <BackButton />
            <Canvas
                camera={{
                    fov: 45,
                    near: 0.1,
                    far: 200,
                    position: [0, 0, 5],
                }}
                style={{ width: '100%', height: '100%' }}
            >
                <Routes>
                    <Route path="/" element={<Experience />} />
                    <Route path="/:day" element={<DayCode />} />
                </Routes>
            </Canvas>
          </BrowserRouter>
        </>
  );
}