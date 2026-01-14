import{u as E,r as s,B as d,f as w,b as v,i as x,G as C,h as M,k as R,g as T,j as n,c as H}from"./main-aaAayI7f.js";import{P as L}from"./PromptHint-C2eXr5uh.js";const P=`import {useEffect as E,useRef as R} from 'react'
import {PromptHint as P} from '../../components/PromptHint'
import {CompletedSketch as K,initLetterCache as I,MicroFontLetterMap as M,getLetterInstance as L} from '../../utils/utils'
import {useThree as T} from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import {rawSource as S0} from './sourceCode.ts'

const D=()=>{
  const src=S0.trim().split("
")
  const {scene:sc,viewport:v}=T()
  const lines=R([])
  const h=.05
  const geo=new THREE.BoxGeometry(.1,.1,.1)
  const mat=new THREE.MeshBasicMaterial({color:"lime"})

  E(()=>{sc.background = new THREE.Color('#001210')},[])
  E(()=>I(geo,mat,.1),[])

  E(()=>{
    src.forEach((t,i)=>{
      const g=new THREE.Group()
      g.scale.set(.05,.05,.05)
      t.split("").forEach((c,j)=>{
        const u=c.toUpperCase()
        if(M[u]){
          const inst=L(u)
          const clone=inst.clone()
          clone.position.set(j*.5,0,0)
          g.add(clone)
        }
      })
      g.position.set(-v.width/2+.2,-v.height/2-1,0)
      sc.add(g)
      lines.current[i]=g
    })

    return()=>{ 
      lines.current.forEach(g=>sc.remove(g))
      lines.current=[]
    }
  },[])

  E(()=>{
    const tl=gsap.timeline({repeat:-1})
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
`,y=()=>{const u=P.trim().split(`
`),{scene:c,viewport:o}=E(),r=s.useRef([]),l=.05,h=new d(.1,.1,.1),m=new w({color:"lime"});return s.useEffect(()=>{c.background=new v("#001210")},[]),s.useEffect(()=>x(h,m,.1),[]),s.useEffect(()=>(u.forEach((e,i)=>{const t=new C;t.scale.set(.05,.05,.05),e.split("").forEach((f,g)=>{const a=f.toUpperCase();if(M[a]){const p=R(a).clone();p.position.set(g*.5,0,0),t.add(p)}}),t.position.set(-o.width/2+.2,-o.height/2-1,0),c.add(t),r.current[i]=t}),()=>{r.current.forEach(e=>c.remove(e)),r.current=[]}),[]),s.useEffect(()=>{const e=T.timeline({repeat:-1});return r.current.forEach((i,t)=>{e.to(i.position,{y:o.height/3-(t+1)*l,duration:.3,ease:"power3.out"},t*.1)}),()=>{e.kill()}},[o.width,o.height]),n.jsxs(n.Fragment,{children:[n.jsx(L,{prompt:"Quine",hint:"A Program that outputs its own source code",color:"orange"}),n.jsx(H,{day:11})]})};export{y as default};
