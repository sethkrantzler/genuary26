import{r as e,j as s,c as l,az as c}from"./main-DL2W5yJW.js";import{P as m}from"./PromptHint-vzuYRdb3.js";const d=()=>{const[t,i]=e.useState(0),o=3,r=e.useCallback(a=>{i(n=>(n+1)%o)},[]);return s.jsxs(s.Fragment,{children:[s.jsx(l,{day:28}),s.jsxs(c,{fullscreen:!0,style:{pointerEvents:"none"},children:[s.jsx("style",{children:`
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
      `}),t===0&&s.jsx("style",{children:`
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
      `}),t===1&&s.jsx("style",{children:`
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
      `}),t===2&&s.jsx("style",{children:`
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
  `}),s.jsx("div",{className:"ascii-wrapper",onClick:r,children:s.jsxs("div",{className:"ascii-box",children:[Array.from({length:20},(a,n)=>s.jsxs("p",{style:{margin:0},children:[Array.from({length:n+1},()=>s.jsx("span",{children:"/"})),Array.from({length:20-n},()=>s.jsx("span",{className:"h",children:"h"})),Array.from({length:n+1},()=>s.jsx("span",{children:t===2?"_":"\\"})),Array.from({length:20-n+1},()=>s.jsx("span",{children:t===2?"_":"\\"})),Array.from({length:n},()=>s.jsx("span",{className:"t",children:"t"})),Array.from({length:20-n+1},()=>s.jsx("span",{children:"/"}))]},`top-${n}`)),Array.from({length:20},(a,n)=>s.jsxs("p",{style:{margin:0},children:[Array.from({length:20-n+1},()=>s.jsx("span",{children:"/"})),Array.from({length:n},()=>s.jsx("span",{className:"m",children:"m"})),Array.from({length:20-n+1},()=>s.jsx("span",{children:t===2?"_":"\\"})),Array.from({length:n+1},()=>s.jsx("span",{children:t===2?"_":"\\"})),Array.from({length:20-n},()=>s.jsx("span",{className:"l",children:"l"})),Array.from({length:n+1},()=>s.jsx("span",{children:"/"}))]},`bottom-${n}`))]})})]}),s.jsx(m,{prompt:"html/css only",hint:"tap",color:"white"})]})};export{d as default};
