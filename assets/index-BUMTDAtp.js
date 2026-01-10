import{u as E,r as o,B as w,f as C,i as v,G as x,h as M,k as R,g as y,j as r,c as L}from"./main-pDkmniYF.js";import{P}from"./PromptHint-DR36IzkX.js";const S=`import {useEffect as E,useRef as R} from 'react'
import {PromptHint as P} from '../../components/PromptHint'
import {CompletedSketch as K,initLetterCache as I,MicroFontLetterMap as M,getLetterInstance as L} from '../../utils/utils'
import {useThree as T} from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import {rawSource as S0} from './sourceCode.ts'

const D=()=>{
  const src=S0.trim().split("
")
  const {scene,viewport:v,gl}=T()
  const lines=R([])
  const h=.05
  const geo=new THREE.BoxGeometry(.1,.1,.1)
  const mat=new THREE.MeshBasicMaterial({color:"lime"})

  E(()=>gl.setClearColor('#011'),[])
  E(()=>I(geo,mat,.1),[])

  // Build lines once
  E(()=>{
    src.forEach((t,i)=>{
      const g=new THREE.Group()
      g.scale.set(.05,.05,.05)
      t.split("").forEach((c,j)=>{
        const u=c.toUpperCase()
        if(M[u]){
          const inst=L(u)        // get cached instanced mesh
          const clone=inst.clone()
          clone.position.set(j*.5,0,0)
          g.add(clone)
        }
      })
      g.position.set(-v.width/2+.2,-v.height/2,0)
      scene.add(g)
      lines.current[i]=g
    })
  },[])

  // Animate forever
  E(()=>{
    const tl=gsap.timeline({repeat:-1, repeatDelay:2})
    lines.current.forEach((g,i)=>{
      tl.to(g.position,{
        y:v.height/3-(i+1)*h,
        duration:.3,
        ease:"power3.out"
      },i*.1)
    })
    return()=>{tl.kill()}
  },[v.width,v.height])

  return(
    <>
      <P prompt="Quine" hint="A Program that outputs its own source code" color="orange"/>
      <K day={11}/>
    </>
  )
}

export default D
`,B=()=>{const p=S.trim().split(`
`),{scene:l,viewport:e,gl:u}=E(),i=o.useRef([]),h=.05,m=new w(.1,.1,.1),f=new C({color:"lime"});return o.useEffect(()=>u.setClearColor("#011"),[]),o.useEffect(()=>v(m,f,.1),[]),o.useEffect(()=>{p.forEach((s,n)=>{const t=new x;t.scale.set(.05,.05,.05),s.split("").forEach((g,d)=>{const a=g.toUpperCase();if(M[a]){const c=R(a).clone();c.position.set(d*.5,0,0),t.add(c)}}),t.position.set(-e.width/2+.2,-e.height/2,0),l.add(t),i.current[n]=t})},[]),o.useEffect(()=>{const s=y.timeline({repeat:-1,repeatDelay:2});return i.current.forEach((n,t)=>{s.to(n.position,{y:e.height/3-(t+1)*h,duration:.3,ease:"power3.out"},t*.1)}),()=>{s.kill()}},[e.width,e.height]),r.jsxs(r.Fragment,{children:[r.jsx(P,{prompt:"Quine",hint:"A Program that outputs its own source code",color:"orange"}),r.jsx(L,{day:11})]})};export{B as default};
