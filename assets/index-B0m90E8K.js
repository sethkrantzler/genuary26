import{u as g,b as f,r as a,B as x,f as d,i as y,j as e,c as E,g as C,h as w,k as S}from"./main-BE6XRKit.js";import{P as v}from"./PromptHint-k3DoLO02.js";const M=`import {useEffect as E,useLayoutEffect as L,useRef as R,useState as U} from 'react'
import {PromptHint as P} from '../../components/PromptHint'
import {CachedLetter as C,CompletedSketch as K,initLetterCache as I,MicroFontLetterMap as M} from '../../utils/utils'
import {useThree as T} from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import {rawSource as S0} from './sourceCode.ts'

const S=({text,y,i,ls=.5,sy})=>{
  const r=R<THREE.Group>()
  L(()=>{if(!r.current)return;r.current.position.y=sy;gsap.to(r.current.position,{y,duration:.02,ease:"power3.out",delay:i*.025})},[y])
  return(
    <group ref={r} scale={[.05,.05,.05]}>
      {text.split("").map((c,j)=>M[c=c.toUpperCase()]&&<C key={j} char={c} position={[j*ls,0,0]}/>)}
    </group>
  )
}

const D=()=>{
  const src=S0.trim().split("
")
  const {viewport:v,gl}=T()
  gl.setClearColor(new THREE.Color('#001900'))

  const [a,sA]=U([])
  const h=.05
  const m=Math.floor(v.height/h)-1
  const g=new THREE.BoxGeometry(.1,.1,.1)
  const t=new THREE.MeshBasicMaterial({color:"lime"})

  E(()=>I(g,t,.1),[])

  const n=()=>sA(p=>{
    const i=p.length
    return i>=m||i>=src.length?[]:[...p,{text:src[i],i}]
  })

  E(()=>{const x=setInterval(n,100);return()=>clearInterval(x)},[])

  return(
    <>
      <P prompt="Quine" hint="A Program that outputs its own source code" color="orange"/>
      <K day={11}/>
      {a.map((l,i)=>
        <group key={i} position={[-v.width/2+.2,-.5,0]}>
          <S text={l.text} i={i} y={v.height/2-(i+1)*h} sy={-v.height/2-1}/>
        </group>
      )}
    </>
  )
}

export default D
`,j=({text:i,y:r,i:p,ls:u=.5,sy:l})=>{const o=a.useRef();return a.useLayoutEffect(()=>{o.current&&(o.current.position.y=l,C.to(o.current.position,{y:r,duration:.02,ease:"power3.out",delay:p*.025}))},[r]),e.jsx("group",{ref:o,scale:[.05,.05,.05],children:i.split("").map((n,c)=>w[n=n.toUpperCase()]&&e.jsx(S,{char:n,position:[c*u,0,0]},c))})},T=()=>{const i=M.trim().split(`
`),{viewport:r,gl:p}=g();p.setClearColor(new f("#001900"));const[u,l]=a.useState([]),o=.05,n=Math.floor(r.height/o)-1,c=new x(.1,.1,.1),h=new d({color:"lime"});a.useEffect(()=>y(c,h,.1),[]);const m=()=>l(s=>{const t=s.length;return t>=n||t>=i.length?[]:[...s,{text:i[t],i:t}]});return a.useEffect(()=>{const s=setInterval(m,100);return()=>clearInterval(s)},[]),e.jsxs(e.Fragment,{children:[e.jsx(v,{prompt:"Quine",hint:"A Program that outputs its own source code",color:"orange"}),e.jsx(E,{day:11}),u.map((s,t)=>e.jsx("group",{position:[-r.width/2+.2,-.5,0],children:e.jsx(j,{text:s.text,i:t,y:r.height/2-(t+1)*o,sy:-r.height/2-1})},t))]})};export{T as default};
