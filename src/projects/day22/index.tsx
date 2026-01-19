import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { Html } from '@react-three/drei';
import { PromptHint } from '../../components/PromptHint';
import { CompletedSketch, noise } from '../../utils/utils';

const generateSpiral = ({
    turns = 4,
    pointsPerTurn = 100,
    radiusStart = 10,
    radiusEnd = 180,
    circleRadius = 3,
    spirals = 3,
    spacing = 2
}) => {
    const circles = [];
    const totalPoints = turns * pointsPerTurn;
    const palette = ["#000000", "#0099CC", "#CC0066"];

    for (let s = 0; s < spirals; s++) {
        const color = palette[s % palette.length];
        for (let i = 0; i < totalPoints; i++) {
            const t = i / totalPoints;
            const angle = s * spacing + t * turns * Math.PI * 2;
            const r = radiusStart + t * (radiusEnd - radiusStart);
            circles.push({ x: r * Math.cos(angle), y: r * Math.sin(angle), r: circleRadius, color });
        }
    }
    return circles;
};

const generateCircleGrid = ({
    rows = 16,
    cols = 16,
    spacing = 20,
    circleRadius = 3,
    copies = 3
}) => {
    const circles = [];
    const palette = ["#000000", "#0099CC", "#CC0066", "#FFDD00"];

    for (let i = 0; i < copies; i++) {
        const color = palette[i % palette.length];
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const n = 1.5 * i * (noise(x + i, y + i));
                circles.push({
                    x: (x - cols / 2) * spacing + n,
                    y: (y - rows / 2) * spacing + n,
                    r: circleRadius,
                    color
                });
            }
        }
    }
    return circles;
};

const PATTERNS = [
    () => generateSpiral({}),
    () => generateCircleGrid({}),
    () => generateSpiral({
        turns: 3,
        pointsPerTurn: 50,
        radiusStart: 20,
        radiusEnd: 100,
        circleRadius: 10,
        spirals: 3,
        spacing: 2
    })
];

const Day22Project = () => {
    const [patternIndex, setPatternIndex] = useState(0);
    const [visibleCount, setVisibleCount] = useState(0);
    const [isAnimating, setIsAnimating] = useState(true);
    const [isReady, setIsReady] = useState(false);

    const clickTimeout = useRef(null);

    const circles = useMemo(() => {
        setIsReady(false);     // prevent flicker
        return PATTERNS[patternIndex % PATTERNS.length]();
    }, [patternIndex]);

    // Animate circles in
    useEffect(() => {
        if (!isAnimating) {
            setVisibleCount(circles.length);
            setIsReady(true);
            return;
        }

        setVisibleCount(0);

        // allow React to commit the empty state before animation starts
        requestAnimationFrame(() => {
            setIsReady(true);
        });

        const interval = setInterval(() => {
            setVisibleCount((v) => {
                if (v >= circles.length) {
                    clearInterval(interval);
                    return v;
                }
                return v + 1;
            });
        }, 10);

        return () => clearInterval(interval);
    }, [circles, isAnimating]);

    // Single click → change shape
    const handleClick = useCallback(() => {
        clickTimeout.current = setTimeout(() => {
            setPatternIndex((i) => i + 1);
        }, 10);
    }, []);

    // Double click → toggle animation
    const handleDoubleClick = useCallback(() => {
        clearTimeout(clickTimeout.current);
        setIsAnimating((a) => !a);
    }, []);

    return (
        <>
            <PromptHint
                prompt="Plotter Ready"
                hint="tap to change pattern, double tap to turn off animation"
                color="black"
            />

            <CompletedSketch day={22} />

            <Html fullscreen>
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        background: "antiquewhite",
                        fontFamily: "sans-serif",
                        cursor: "pointer",
                        fontWeight: "bold"
                    }}
                >
                    {!isAnimating && <div>SHAPE COUNT: {circles.length}</div>}

                    <svg
                        onClick={handleClick}
                        onDoubleClick={handleDoubleClick}
                        width="80%"
                        height="80%"
                        viewBox="-200 -200 400 400"
                        stroke="black"
                        fill="none"
                    >
                        {isReady &&
                            circles.slice(0, visibleCount).map((c, i) => (
                                <circle
                                    key={i}
                                    cx={c.x}
                                    cy={c.y}
                                    r={c.r}
                                    stroke={c.color}
                                    fill="none"
                                />
                            ))}
                    </svg>
                </div>
            </Html>
        </>
    );
};

export default Day22Project;