import {useEffect as E,useRef as R} from 'react'
import {PromptHint as P} from '../../components/PromptHint'
import {CompletedSketch as K,initLetterCache as I,MicroFontLetterMap as M,getLetterInstance as L} from '../../utils/utils'
import {useThree as T} from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import {rawSource as S0} from './sourceCode.ts'

const D=()=>{
  const src=S0.trim().split("\n")
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