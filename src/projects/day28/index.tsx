import React, { useCallback, useState } from 'react';
import { Html } from '@react-three/drei';
import { PromptHint } from '../../components/PromptHint';
import { CompletedSketch } from '../../utils/utils';

const Day28Project = () => {
  const count = 20;
  const [style, setStyle] = useState(0);
  const maxStyles = 3;

  const switchVisual = useCallback((e) => {
    setStyle((p) => (p+1) % maxStyles);
  }, [])

  return (
    <>
      <CompletedSketch day={28} />
      <Html fullscreen style={{pointerEvents: 'none'}}>
        {/* Global styles for centering + responsive font */}
      <style>{`
        .ascii-wrapper {
          position: absolute;
          inset: 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .ascii-box {
          background: black;
          padding: 8vmin;
          border-radius: 6px;
          color: black;
          text-align: center;
          line-height: 1;
          font-size: 2.2vmin; /* default for portrait */
          pointer-events: auto;
        }
          
        /* Landscape: width > height */
        @media (min-aspect-ratio: 1/1) {
          .ascii-box {
            font-size: 1.6vmin;
          }
        }
      `}</style>
      {style === 0 && <style>{`
            .ascii-box {
          background: black;
          color: white;
          
        }
            .h {
                color: blue;
            }
            .t {
                color: red;
            }
            .m {
                color: gold;
            }
      `}
      </style>}
      {style === 1 && <style>{`
      .ascii-box {
          font-family: monospace;
          background: black;
        }
          .h {
                color: olive;
            }
            .t {
                color: gold;
            }
            .m {
                color: yellow;
            }
            .l {
                color: orange
            }
                /* Pulse scale + weight for h, m, t, l */
    .ascii-box span.h,
    .ascii-box span.m,
    .ascii-box span.t,
    .ascii-box span.l {
      display: inline-block;
      animation: pulse 1.8s ease-in-out infinite;
    }


    /* Scale + fake weight animation */
    @keyframes pulse {
      0% {
        transform: scale(1);
        font-variation-settings: "wght" 100;
      }
      50% {
        transform: scale(1.4);
        font-variation-settings: "wght" 1000;
      }
      100% {
        transform: scale(1);
        font-variation-settings: "wght" 100;
      }
    }
      `}
      </style>}
      {style === 2 && (
  <style>{`
    .ascii-box {
      color: white;
      font-family: serif;
    }

    .ascii-box span:not(.h):not(.t):not(.m):not(.l) {
      display: inline-block;
      animation: spin 2s linear infinite;
    }

    /* Pulse scale + weight for h, m, t, l */
    .ascii-box span.h,
    .ascii-box span.m,
    .ascii-box span.t,
    .ascii-box span.l {
      display: inline-block;
      animation: pulse 1.8s ease-in-out infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }

    /* Scale + fake weight animation */
    @keyframes pulse {
      0% {
        transform: scale(1);
        font-variation-settings: "wght" 300;
      }
      50% {
        transform: scale(1.4);
        font-variation-settings: "wght" 700;
      }
      100% {
        transform: scale(1);
        font-variation-settings: "wght" 300;
      }
    }

    /* Landscape: width > height */
    @media (min-aspect-ratio: 1/1) {
      .ascii-box {
        font-size: 1.6vmin;
      }
    }
  `}</style>
)}
        <div className="ascii-wrapper" onClick={switchVisual}>
          <div className="ascii-box">
            {Array.from({ length: count }, (_, i) => (
              <p style={{ margin: 0 }} key={`top-${i}`}>
                {Array.from({ length: i + 1 }, () => <span>/</span>)}
                {Array.from({ length: count - i }, () => <span className="h">h</span>)}
                {Array.from({ length: i + 1 }, () => <span>{style === 2 ? '_': '\\'}</span>)}
                {Array.from({ length: count - i + 1 }, () => <span>{style === 2 ? '_': '\\'}</span>)}
                {Array.from({ length: i }, () => <span className="t">t</span>)}
                {Array.from({ length: count - i + 1 }, () => <span>/</span>)}
              </p>
            ))}

            {Array.from({ length: count }, (_, i) => (
              <p style={{ margin: 0 }} key={`bottom-${i}`}>
                {Array.from({ length: count - i + 1 }, () => <span>/</span>)}
                {Array.from({ length: i }, () => <span className="m">m</span>)}
                {Array.from({ length: count - i + 1 }, () => <span>{style === 2 ? '_': '\\'}</span>)}
                {Array.from({ length: i + 1 }, () => <span>{style === 2 ? '_': '\\'}</span>)}
                {Array.from({ length: count - i }, () => <span className="l">l</span>)}
                {Array.from({ length: i + 1 }, () => <span>/</span>)}
              </p>
            ))}
          </div>
        </div>
      </Html>
      <PromptHint prompt="html/css only" hint="tap" color="white" />
    </>
  );
};

export default Day28Project;