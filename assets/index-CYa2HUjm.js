import{r as t,j as s,c as l,az as c}from"./main-D1RQi7x-.js";import{P as h}from"./PromptHint-D2Y4MiJw.js";const f=()=>{const[a,r]=t.useState(0),o=3,i=t.useCallback(e=>{r(n=>(n+1)%o)},[]);return s.jsxs(s.Fragment,{children:[s.jsx(l,{day:28}),s.jsxs(c,{fullscreen:!0,style:{pointerEvents:"none"},children:[s.jsx("style",{children:`
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
      `}),a===0&&s.jsx("style",{children:`
            .ascii-box {
        corner-shape: notch;
          border-radius: 20px;
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
      `}),a===1&&s.jsx("style",{children:`
      .ascii-box {
          font-family: monospace;
          background: black;
          corner-shape: scoop;
          border-radius: 30px;
          font-size: 1.6vmin;
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
      `}),a===2&&s.jsx("style",{children:`
    .ascii-box {
        corner-shape: bevel;
        border-radius: 50px;
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
  `}),s.jsx("div",{className:"ascii-wrapper",onClick:i,children:s.jsxs("div",{className:"ascii-box",children:[Array.from({length:20},(e,n)=>s.jsxs("p",{style:{margin:0},children:[Array.from({length:n+1},()=>s.jsx("span",{children:"/"})),Array.from({length:20-n},()=>s.jsx("span",{className:"h",children:"h"})),Array.from({length:n+1},()=>s.jsx("span",{children:a===2?"_":"\\"})),Array.from({length:20-n+1},()=>s.jsx("span",{children:a===2?"_":"\\"})),Array.from({length:n},()=>s.jsx("span",{className:"t",children:"t"})),Array.from({length:20-n+1},()=>s.jsx("span",{children:"/"}))]},`top-${n}`)),Array.from({length:20},(e,n)=>s.jsxs("p",{style:{margin:0},children:[Array.from({length:20-n+1},()=>s.jsx("span",{children:"/"})),Array.from({length:n},()=>s.jsx("span",{className:"m",children:"m"})),Array.from({length:20-n+1},()=>s.jsx("span",{children:a===2?"_":"\\"})),Array.from({length:n+1},()=>s.jsx("span",{children:a===2?"_":"\\"})),Array.from({length:20-n},()=>s.jsx("span",{className:"l",children:"l"})),Array.from({length:n+1},()=>s.jsx("span",{children:"/"}))]},`bottom-${n}`))]})})]}),s.jsx(h,{prompt:"html/css only",hint:"tap",color:"white"})]})};export{f as default};
