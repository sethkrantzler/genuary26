import{aC as ne,m as le,V as L,aD as ce,aE as w,aF as V,aG as ee,K as k,aH as me,aI as ue,a1 as fe,z as K,a3 as de,M as he,r as n,aJ as pe,u as j,aK as te,e as P,w as Y,aL as q,a8 as ve,aM as _e,aN as xe,aO as ge,d as re,aP as Se,_ as Me,aQ as X,j as c,aR as Te,c as Ae,aS as ye,q as Re,aT as Ee,aU as De}from"./main-DbonhsYA.js";import{P as we}from"./PromptHint-G8hQDWI_.js";import{m as Ie}from"./BufferGeometryUtils-DnRFN2ih.js";import{O as Ce}from"./OrbitControls-MiiCBjsh.js";import{E as be}from"./Environment-2EahUl3d.js";const Pe=()=>parseInt(ne.replace(/\D+/g,"")),Be=Pe();class Ue extends le{constructor(e=new L){super({uniforms:{inputBuffer:new w(null),depthBuffer:new w(null),resolution:new w(new L),texelSize:new w(new L),halfTexelSize:new w(new L),kernel:new w(0),scale:new w(1),cameraNear:new w(0),cameraFar:new w(1),minDepthThreshold:new w(0),maxDepthThreshold:new w(1),depthScale:new w(0),depthToBlurRatioBias:new w(.25)},fragmentShader:`#include <common>
        #include <dithering_pars_fragment>      
        uniform sampler2D inputBuffer;
        uniform sampler2D depthBuffer;
        uniform float cameraNear;
        uniform float cameraFar;
        uniform float minDepthThreshold;
        uniform float maxDepthThreshold;
        uniform float depthScale;
        uniform float depthToBlurRatioBias;
        varying vec2 vUv;
        varying vec2 vUv0;
        varying vec2 vUv1;
        varying vec2 vUv2;
        varying vec2 vUv3;

        void main() {
          float depthFactor = 0.0;
          
          #ifdef USE_DEPTH
            vec4 depth = texture2D(depthBuffer, vUv);
            depthFactor = smoothstep(minDepthThreshold, maxDepthThreshold, 1.0-(depth.r * depth.a));
            depthFactor *= depthScale;
            depthFactor = max(0.0, min(1.0, depthFactor + 0.25));
          #endif
          
          vec4 sum = texture2D(inputBuffer, mix(vUv0, vUv, depthFactor));
          sum += texture2D(inputBuffer, mix(vUv1, vUv, depthFactor));
          sum += texture2D(inputBuffer, mix(vUv2, vUv, depthFactor));
          sum += texture2D(inputBuffer, mix(vUv3, vUv, depthFactor));
          gl_FragColor = sum * 0.25 ;

          #include <dithering_fragment>
          #include <tonemapping_fragment>
          #include <${Be>=154?"colorspace_fragment":"encodings_fragment"}>
        }`,vertexShader:`uniform vec2 texelSize;
        uniform vec2 halfTexelSize;
        uniform float kernel;
        uniform float scale;
        varying vec2 vUv;
        varying vec2 vUv0;
        varying vec2 vUv1;
        varying vec2 vUv2;
        varying vec2 vUv3;

        void main() {
          vec2 uv = position.xy * 0.5 + 0.5;
          vUv = uv;

          vec2 dUv = (texelSize * vec2(kernel) + halfTexelSize) * scale;
          vUv0 = vec2(uv.x - dUv.x, uv.y + dUv.y);
          vUv1 = vec2(uv.x + dUv.x, uv.y + dUv.y);
          vUv2 = vec2(uv.x + dUv.x, uv.y - dUv.y);
          vUv3 = vec2(uv.x - dUv.x, uv.y - dUv.y);

          gl_Position = vec4(position.xy, 1.0, 1.0);
        }`,blending:ce,depthWrite:!1,depthTest:!1}),this.toneMapped=!1,this.setTexelSize(e.x,e.y),this.kernel=new Float32Array([0,1,2,2,3])}setTexelSize(e,a){this.uniforms.texelSize.value.set(e,a),this.uniforms.halfTexelSize.value.set(e,a).multiplyScalar(.5)}setResolution(e){this.uniforms.resolution.value.copy(e)}}class Fe{constructor({gl:e,resolution:a,width:o=500,height:h=500,minDepthThreshold:v=0,maxDepthThreshold:d=1,depthScale:f=0,depthToBlurRatioBias:i=.25}){this.renderToScreen=!1,this.renderTargetA=new V(a,a,{minFilter:k,magFilter:k,stencilBuffer:!1,depthBuffer:!1,type:ee}),this.renderTargetB=this.renderTargetA.clone(),this.convolutionMaterial=new Ue,this.convolutionMaterial.setTexelSize(1/o,1/h),this.convolutionMaterial.setResolution(new L(o,h)),this.scene=new me,this.camera=new ue,this.convolutionMaterial.uniforms.minDepthThreshold.value=v,this.convolutionMaterial.uniforms.maxDepthThreshold.value=d,this.convolutionMaterial.uniforms.depthScale.value=f,this.convolutionMaterial.uniforms.depthToBlurRatioBias.value=i,this.convolutionMaterial.defines.USE_DEPTH=f>0;const s=new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),g=new Float32Array([0,0,2,0,0,2]),p=new fe;p.setAttribute("position",new K(s,3)),p.setAttribute("uv",new K(g,2)),this.screen=new de(p,this.convolutionMaterial),this.screen.frustumCulled=!1,this.scene.add(this.screen)}render(e,a,o){const h=this.scene,v=this.camera,d=this.renderTargetA,f=this.renderTargetB;let i=this.convolutionMaterial,s=i.uniforms;s.depthBuffer.value=a.depthTexture;const g=i.kernel;let p=a,r,m,I;for(m=0,I=g.length-1;m<I;++m)r=(m&1)===0?d:f,s.kernel.value=g[m],s.inputBuffer.value=p.texture,e.setRenderTarget(r),e.render(h,v),p=r;s.kernel.value=g[m],s.inputBuffer.value=p.texture,e.setRenderTarget(this.renderToScreen?null:o),e.render(h,v)}}let Ne=class extends he{constructor(e={}){super(e),this._tDepth={value:null},this._distortionMap={value:null},this._tDiffuse={value:null},this._tDiffuseBlur={value:null},this._textureMatrix={value:null},this._hasBlur={value:!1},this._mirror={value:0},this._mixBlur={value:0},this._blurStrength={value:.5},this._minDepthThreshold={value:.9},this._maxDepthThreshold={value:1},this._depthScale={value:0},this._depthToBlurRatioBias={value:.25},this._distortion={value:1},this._mixContrast={value:1},this.setValues(e)}onBeforeCompile(e){var a;(a=e.defines)!=null&&a.USE_UV||(e.defines.USE_UV=""),e.uniforms.hasBlur=this._hasBlur,e.uniforms.tDiffuse=this._tDiffuse,e.uniforms.tDepth=this._tDepth,e.uniforms.distortionMap=this._distortionMap,e.uniforms.tDiffuseBlur=this._tDiffuseBlur,e.uniforms.textureMatrix=this._textureMatrix,e.uniforms.mirror=this._mirror,e.uniforms.mixBlur=this._mixBlur,e.uniforms.mixStrength=this._blurStrength,e.uniforms.minDepthThreshold=this._minDepthThreshold,e.uniforms.maxDepthThreshold=this._maxDepthThreshold,e.uniforms.depthScale=this._depthScale,e.uniforms.depthToBlurRatioBias=this._depthToBlurRatioBias,e.uniforms.distortion=this._distortion,e.uniforms.mixContrast=this._mixContrast,e.vertexShader=`
        uniform mat4 textureMatrix;
        varying vec4 my_vUv;
      ${e.vertexShader}`,e.vertexShader=e.vertexShader.replace("#include <project_vertex>",`#include <project_vertex>
        my_vUv = textureMatrix * vec4( position, 1.0 );
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );`),e.fragmentShader=`
        uniform sampler2D tDiffuse;
        uniform sampler2D tDiffuseBlur;
        uniform sampler2D tDepth;
        uniform sampler2D distortionMap;
        uniform float distortion;
        uniform float cameraNear;
			  uniform float cameraFar;
        uniform bool hasBlur;
        uniform float mixBlur;
        uniform float mirror;
        uniform float mixStrength;
        uniform float minDepthThreshold;
        uniform float maxDepthThreshold;
        uniform float mixContrast;
        uniform float depthScale;
        uniform float depthToBlurRatioBias;
        varying vec4 my_vUv;
        ${e.fragmentShader}`,e.fragmentShader=e.fragmentShader.replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>

      float distortionFactor = 0.0;
      #ifdef USE_DISTORTION
        distortionFactor = texture2D(distortionMap, vUv).r * distortion;
      #endif

      vec4 new_vUv = my_vUv;
      new_vUv.x += distortionFactor;
      new_vUv.y += distortionFactor;

      vec4 base = texture2DProj(tDiffuse, new_vUv);
      vec4 blur = texture2DProj(tDiffuseBlur, new_vUv);

      vec4 merge = base;

      #ifdef USE_NORMALMAP
        vec2 normal_uv = vec2(0.0);
        vec4 normalColor = texture2D(normalMap, vUv * normalScale);
        vec3 my_normal = normalize( vec3( normalColor.r * 2.0 - 1.0, normalColor.b,  normalColor.g * 2.0 - 1.0 ) );
        vec3 coord = new_vUv.xyz / new_vUv.w;
        normal_uv = coord.xy + coord.z * my_normal.xz * 0.05;
        vec4 base_normal = texture2D(tDiffuse, normal_uv);
        vec4 blur_normal = texture2D(tDiffuseBlur, normal_uv);
        merge = base_normal;
        blur = blur_normal;
      #endif

      float depthFactor = 0.0001;
      float blurFactor = 0.0;

      #ifdef USE_DEPTH
        vec4 depth = texture2DProj(tDepth, new_vUv);
        depthFactor = smoothstep(minDepthThreshold, maxDepthThreshold, 1.0-(depth.r * depth.a));
        depthFactor *= depthScale;
        depthFactor = max(0.0001, min(1.0, depthFactor));

        #ifdef USE_BLUR
          blur = blur * min(1.0, depthFactor + depthToBlurRatioBias);
          merge = merge * min(1.0, depthFactor + 0.5);
        #else
          merge = merge * depthFactor;
        #endif

      #endif

      float reflectorRoughnessFactor = roughness;
      #ifdef USE_ROUGHNESSMAP
        vec4 reflectorTexelRoughness = texture2D( roughnessMap, vUv );
        reflectorRoughnessFactor *= reflectorTexelRoughness.g;
      #endif

      #ifdef USE_BLUR
        blurFactor = min(1.0, mixBlur * reflectorRoughnessFactor);
        merge = mix(merge, blur, blurFactor);
      #endif

      vec4 newMerge = vec4(0.0, 0.0, 0.0, 1.0);
      newMerge.r = (merge.r - 0.5) * mixContrast + 0.5;
      newMerge.g = (merge.g - 0.5) * mixContrast + 0.5;
      newMerge.b = (merge.b - 0.5) * mixContrast + 0.5;

      diffuseColor.rgb = diffuseColor.rgb * ((1.0 - min(1.0, mirror)) + newMerge.rgb * mixStrength);
      `)}get tDiffuse(){return this._tDiffuse.value}set tDiffuse(e){this._tDiffuse.value=e}get tDepth(){return this._tDepth.value}set tDepth(e){this._tDepth.value=e}get distortionMap(){return this._distortionMap.value}set distortionMap(e){this._distortionMap.value=e}get tDiffuseBlur(){return this._tDiffuseBlur.value}set tDiffuseBlur(e){this._tDiffuseBlur.value=e}get textureMatrix(){return this._textureMatrix.value}set textureMatrix(e){this._textureMatrix.value=e}get hasBlur(){return this._hasBlur.value}set hasBlur(e){this._hasBlur.value=e}get mirror(){return this._mirror.value}set mirror(e){this._mirror.value=e}get mixBlur(){return this._mixBlur.value}set mixBlur(e){this._mixBlur.value=e}get mixStrength(){return this._blurStrength.value}set mixStrength(e){this._blurStrength.value=e}get minDepthThreshold(){return this._minDepthThreshold.value}set minDepthThreshold(e){this._minDepthThreshold.value=e}get maxDepthThreshold(){return this._maxDepthThreshold.value}set maxDepthThreshold(e){this._maxDepthThreshold.value=e}get depthScale(){return this._depthScale.value}set depthScale(e){this._depthScale.value=e}get depthToBlurRatioBias(){return this._depthToBlurRatioBias.value}set depthToBlurRatioBias(e){this._depthToBlurRatioBias.value=e}get distortion(){return this._distortion.value}set distortion(e){this._distortion.value=e}get mixContrast(){return this._mixContrast.value}set mixContrast(e){this._mixContrast.value=e}};const $e=n.forwardRef(({mixBlur:u=0,mixStrength:e=1,resolution:a=256,blur:o=[0,0],minDepthThreshold:h=.9,maxDepthThreshold:v=1,depthScale:d=0,depthToBlurRatioBias:f=.25,mirror:i=0,distortion:s=1,mixContrast:g=1,distortionMap:p,reflectorOffset:r=0,...m},I)=>{pe({MeshReflectorMaterialImpl:Ne});const l=j(({gl:x})=>x),R=j(({camera:x})=>x),T=j(({scene:x})=>x);o=Array.isArray(o)?o:[o,o];const E=o[0]+o[1]>0,_=n.useRef(null);n.useImperativeHandle(I,()=>_.current,[]);const[S]=n.useState(()=>new te),[y]=n.useState(()=>new P),[B]=n.useState(()=>new P),[U]=n.useState(()=>new P),[C]=n.useState(()=>new Y),[F]=n.useState(()=>new P(0,0,-1)),[b]=n.useState(()=>new q),[$]=n.useState(()=>new P),[O]=n.useState(()=>new P),[z]=n.useState(()=>new q),[N]=n.useState(()=>new Y),[D]=n.useState(()=>new ve),ae=n.useCallback(()=>{var x;const M=_.current.parent||((x=_.current)==null||(x=x.__r3f.parent)==null?void 0:x.object);if(!M||(B.setFromMatrixPosition(M.matrixWorld),U.setFromMatrixPosition(R.matrixWorld),C.extractRotation(M.matrixWorld),y.set(0,0,1),y.applyMatrix4(C),B.addScaledVector(y,r),$.subVectors(B,U),$.dot(y)>0))return;$.reflect(y).negate(),$.add(B),C.extractRotation(R.matrixWorld),F.set(0,0,-1),F.applyMatrix4(C),F.add(U),O.subVectors(B,F),O.reflect(y).negate(),O.add(B),D.position.copy($),D.up.set(0,1,0),D.up.applyMatrix4(C),D.up.reflect(y),D.lookAt(O),D.far=R.far,D.updateMatrixWorld(),D.projectionMatrix.copy(R.projectionMatrix),N.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),N.multiply(D.projectionMatrix),N.multiply(D.matrixWorldInverse),N.multiply(M.matrixWorld),S.setFromNormalAndCoplanarPoint(y,B),S.applyMatrix4(D.matrixWorldInverse),b.set(S.normal.x,S.normal.y,S.normal.z,S.constant);const A=D.projectionMatrix;z.x=(Math.sign(b.x)+A.elements[8])/A.elements[0],z.y=(Math.sign(b.y)+A.elements[9])/A.elements[5],z.z=-1,z.w=(1+A.elements[10])/A.elements[14],b.multiplyScalar(2/b.dot(z)),A.elements[2]=b.x,A.elements[6]=b.y,A.elements[10]=b.z+1,A.elements[14]=b.w},[R,r]),[G,ie,se,H]=n.useMemo(()=>{const x={minFilter:k,magFilter:k,type:ee},M=new V(a,a,x);M.depthBuffer=!0,M.depthTexture=new _e(a,a),M.depthTexture.format=xe,M.depthTexture.type=ge;const A=new V(a,a,x),W=new Fe({gl:l,resolution:a,width:o[0],height:o[1],minDepthThreshold:h,maxDepthThreshold:v,depthScale:d,depthToBlurRatioBias:f}),oe={mirror:i,textureMatrix:N,mixBlur:u,tDiffuse:M.texture,tDepth:M.depthTexture,tDiffuseBlur:A.texture,hasBlur:E,mixStrength:e,minDepthThreshold:h,maxDepthThreshold:v,depthScale:d,depthToBlurRatioBias:f,distortion:s,distortionMap:p,mixContrast:g,"defines-USE_BLUR":E?"":void 0,"defines-USE_DEPTH":d>0?"":void 0,"defines-USE_DISTORTION":p?"":void 0};return[M,A,W,oe]},[l,o,N,a,i,E,u,e,h,v,d,f,s,p,g]);return re(()=>{var x;const M=_.current.parent||((x=_.current)==null||(x=x.__r3f.parent)==null?void 0:x.object);if(!M)return;M.visible=!1;const A=l.xr.enabled,W=l.shadowMap.autoUpdate;ae(),l.xr.enabled=!1,l.shadowMap.autoUpdate=!1,l.setRenderTarget(G),l.state.buffers.depth.setMask(!0),l.autoClear||l.clear(),l.render(T,D),E&&se.render(l,G,ie),l.xr.enabled=A,l.shadowMap.autoUpdate=W,M.visible=!0,l.setRenderTarget(null)}),n.createElement("meshReflectorMaterialImpl",Se({attach:"material",key:"key"+H["defines-USE_BLUR"]+H["defines-USE_DEPTH"]+H["defines-USE_DISTORTION"],ref:_},H,m))}),ze=`
    
#ifdef IS_VERTEX
    vec3 csm_Position;
    vec4 csm_PositionRaw;
    vec3 csm_Normal;

    // csm_PointSize
    #ifdef IS_POINTSMATERIAL
        float csm_PointSize;
    #endif
#else
    vec4 csm_DiffuseColor;
    vec4 csm_FragColor;
    float csm_UnlitFac;

    // csm_Emissive, csm_Roughness, csm_Metalness
    #if defined IS_MESHSTANDARDMATERIAL || defined IS_MESHPHYSICALMATERIAL
        vec3 csm_Emissive;
        float csm_Roughness;
        float csm_Metalness;
        float csm_Iridescence;
        
        #if defined IS_MESHPHYSICALMATERIAL
            float csm_Clearcoat;
            float csm_ClearcoatRoughness;
            vec3 csm_ClearcoatNormal;
            float csm_Transmission;
            float csm_Thickness;
        #endif
    #endif

    // csm_AO
    #if defined IS_MESHSTANDARDMATERIAL || defined IS_MESHPHYSICALMATERIAL || defined IS_MESHBASICMATERIAL || defined IS_MESHLAMBERTMATERIAL || defined IS_MESHPHONGMATERIAL || defined IS_MESHTOONMATERIAL
        float csm_AO;
    #endif

    // csm_Bump
    #if defined IS_MESHLAMBERTMATERIAL || defined IS_MESHMATCAPMATERIAL || defined IS_MESHNORMALMATERIAL || defined IS_MESHPHONGMATERIAL || defined IS_MESHPHYSICALMATERIAL || defined IS_MESHSTANDARDMATERIAL || defined IS_MESHTOONMATERIAL || defined IS_SHADOWMATERIAL 
        vec3 csm_Bump;
        vec3 csm_FragNormal;
    #endif

    float csm_DepthAlpha;
#endif
`,Le=`

#ifdef IS_VERTEX
    // csm_Position & csm_PositionRaw
    #ifdef IS_UNKNOWN
        csm_Position = vec3(0.0);
        csm_PositionRaw = vec4(0.0);
        csm_Normal = vec3(0.0);
    #else
        csm_Position = position;
        csm_PositionRaw = projectionMatrix * modelViewMatrix * vec4(position, 1.);
        csm_Normal = normal;
    #endif

    // csm_PointSize
    #ifdef IS_POINTSMATERIAL
        csm_PointSize = size;
    #endif
#else
    csm_UnlitFac = 0.0;

    // csm_DiffuseColor & csm_FragColor
    #if defined IS_UNKNOWN || defined IS_SHADERMATERIAL || defined IS_MESHDEPTHMATERIAL || defined IS_MESHDISTANCEMATERIAL || defined IS_MESHNORMALMATERIAL || defined IS_SHADOWMATERIAL
        csm_DiffuseColor = vec4(1.0, 0.0, 1.0, 1.0);
        csm_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
    #else
        #ifdef USE_MAP
            vec4 _csm_sampledDiffuseColor = texture2D(map, vMapUv);

            #ifdef DECODE_VIDEO_TEXTURE
            // inline sRGB decode (TODO: Remove this code when https://crbug.com/1256340 is solved)
            _csm_sampledDiffuseColor = vec4(mix(pow(_csm_sampledDiffuseColor.rgb * 0.9478672986 + vec3(0.0521327014), vec3(2.4)), _csm_sampledDiffuseColor.rgb * 0.0773993808, vec3(lessThanEqual(_csm_sampledDiffuseColor.rgb, vec3(0.04045)))), _csm_sampledDiffuseColor.w);
            #endif

            csm_DiffuseColor = vec4(diffuse, opacity) * _csm_sampledDiffuseColor;
            csm_FragColor = vec4(diffuse, opacity) * _csm_sampledDiffuseColor;
        #else
            csm_DiffuseColor = vec4(diffuse, opacity);
            csm_FragColor = vec4(diffuse, opacity);
        #endif
    #endif

    // csm_Emissive, csm_Roughness, csm_Metalness
    #if defined IS_MESHSTANDARDMATERIAL || defined IS_MESHPHYSICALMATERIAL
        csm_Emissive = emissive;
        csm_Roughness = roughness;
        csm_Metalness = metalness;

        #ifdef USE_IRIDESCENCE
            csm_Iridescence = iridescence;
        #else
            csm_Iridescence = 0.0;
        #endif

        #if defined IS_MESHPHYSICALMATERIAL
            #ifdef USE_CLEARCOAT
                csm_Clearcoat = clearcoat;
                csm_ClearcoatRoughness = clearcoatRoughness;
            #else
                csm_Clearcoat = 0.0;
                csm_ClearcoatRoughness = 0.0;
            #endif

            #ifdef USE_TRANSMISSION
                csm_Transmission = transmission;
                csm_Thickness = thickness;
            #else
                csm_Transmission = 0.0;
                csm_Thickness = 0.0;
            #endif
        #endif
    #endif

    // csm_AO
    #if defined IS_MESHSTANDARDMATERIAL || defined IS_MESHPHYSICALMATERIAL || defined IS_MESHBASICMATERIAL || defined IS_MESHLAMBERTMATERIAL || defined IS_MESHPHONGMATERIAL || defined IS_MESHTOONMATERIAL
        csm_AO = 0.0;
    #endif

    // csm_Bump
    #if defined IS_MESHLAMBERTMATERIAL || defined IS_MESHMATCAPMATERIAL || defined IS_MESHNORMALMATERIAL || defined IS_MESHPHONGMATERIAL || defined IS_MESHPHYSICALMATERIAL || defined IS_MESHSTANDARDMATERIAL || defined IS_MESHTOONMATERIAL || defined IS_SHADOWMATERIAL 
        csm_Bump = vec3(0.0);
        #ifdef FLAT_SHADED
            vec3 fdx = dFdx( vViewPosition );
            vec3 fdy = dFdy( vViewPosition );
            csm_FragNormal = normalize( cross( fdx, fdy ) );
        #else
            csm_FragNormal = normalize(vNormal);
            #ifdef DOUBLE_SIDED
                csm_FragNormal *= gl_FrontFacing ? 1.0 : - 1.0;
            #endif
        #endif
    #endif

    csm_DepthAlpha = 1.0;
#endif
`,je=`
    varying mat4 csm_internal_vModelViewMatrix;
`,Oe=`
    csm_internal_vModelViewMatrix = modelViewMatrix;
`,He=`
    varying mat4 csm_internal_vModelViewMatrix;
`,ke=`
    
`,t={diffuse:"csm_DiffuseColor",roughness:"csm_Roughness",metalness:"csm_Metalness",emissive:"csm_Emissive",ao:"csm_AO",bump:"csm_Bump",fragNormal:"csm_FragNormal",clearcoat:"csm_Clearcoat",clearcoatRoughness:"csm_ClearcoatRoughness",clearcoatNormal:"csm_ClearcoatNormal",transmission:"csm_Transmission",thickness:"csm_Thickness",iridescence:"csm_Iridescence",pointSize:"csm_PointSize",fragColor:"csm_FragColor",depthAlpha:"csm_DepthAlpha",unlitFac:"csm_UnlitFac",position:"csm_Position",positionRaw:"csm_PositionRaw",normal:"csm_Normal"},We={[`${t.position}`]:"*",[`${t.positionRaw}`]:"*",[`${t.normal}`]:"*",[`${t.depthAlpha}`]:"*",[`${t.pointSize}`]:["PointsMaterial"],[`${t.diffuse}`]:"*",[`${t.fragColor}`]:"*",[`${t.fragNormal}`]:"*",[`${t.unlitFac}`]:"*",[`${t.emissive}`]:["MeshStandardMaterial","MeshPhysicalMaterial"],[`${t.roughness}`]:["MeshStandardMaterial","MeshPhysicalMaterial"],[`${t.metalness}`]:["MeshStandardMaterial","MeshPhysicalMaterial"],[`${t.iridescence}`]:["MeshStandardMaterial","MeshPhysicalMaterial"],[`${t.ao}`]:["MeshStandardMaterial","MeshPhysicalMaterial","MeshBasicMaterial","MeshLambertMaterial","MeshPhongMaterial","MeshToonMaterial"],[`${t.bump}`]:["MeshLambertMaterial","MeshMatcapMaterial","MeshNormalMaterial","MeshPhongMaterial","MeshPhysicalMaterial","MeshStandardMaterial","MeshToonMaterial","ShadowMaterial"],[`${t.clearcoat}`]:["MeshPhysicalMaterial"],[`${t.clearcoatRoughness}`]:["MeshPhysicalMaterial"],[`${t.clearcoatNormal}`]:["MeshPhysicalMaterial"],[`${t.transmission}`]:["MeshPhysicalMaterial"],[`${t.thickness}`]:["MeshPhysicalMaterial"]},Ve={"*":{"#include <lights_physical_fragment>":X.lights_physical_fragment,"#include <transmission_fragment>":X.transmission_fragment},[`${t.normal}`]:{"#include <beginnormal_vertex>":`
    vec3 objectNormal = ${t.normal};
    #ifdef USE_TANGENT
	    vec3 objectTangent = vec3( tangent.xyz );
    #endif
    `},[`${t.position}`]:{"#include <begin_vertex>":`
    vec3 transformed = ${t.position};
  `},[`${t.positionRaw}`]:{"#include <project_vertex>":`
    #include <project_vertex>
    gl_Position = ${t.positionRaw};
  `},[`${t.pointSize}`]:{"gl_PointSize = size;":`
    gl_PointSize = ${t.pointSize};
    `},[`${t.diffuse}`]:{"#include <color_fragment>":`
    #include <color_fragment>
    diffuseColor = ${t.diffuse};
  `},[`${t.fragColor}`]:{"#include <opaque_fragment>":`
    #include <opaque_fragment>
    gl_FragColor = mix(gl_FragColor, ${t.fragColor}, ${t.unlitFac});
  `},[`${t.emissive}`]:{"vec3 totalEmissiveRadiance = emissive;":`
    vec3 totalEmissiveRadiance = ${t.emissive};
    `},[`${t.roughness}`]:{"#include <roughnessmap_fragment>":`
    #include <roughnessmap_fragment>
    roughnessFactor = ${t.roughness};
    `},[`${t.metalness}`]:{"#include <metalnessmap_fragment>":`
    #include <metalnessmap_fragment>
    metalnessFactor = ${t.metalness};
    `},[`${t.ao}`]:{"#include <aomap_fragment>":`
    #include <aomap_fragment>
    reflectedLight.indirectDiffuse *= 1. - ${t.ao};
    `},[`${t.bump}`]:{"#include <normal_fragment_maps>":`
    #include <normal_fragment_maps>

    vec3 csm_internal_orthogonal = ${t.bump} - (dot(${t.bump}, normal) * normal);
    vec3 csm_internal_projectedbump = mat3(csm_internal_vModelViewMatrix) * csm_internal_orthogonal;
    normal = normalize(normal - csm_internal_projectedbump);
    `},[`${t.fragNormal}`]:{"#include <normal_fragment_maps>":`
      #include <normal_fragment_maps>
      normal = ${t.fragNormal};
    `},[`${t.depthAlpha}`]:{"gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );":`
      gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity * 1.0 - ${t.depthAlpha} );
    `,"gl_FragColor = packDepthToRGBA( fragCoordZ );":`
      if(${t.depthAlpha} < 1.0) discard;
      gl_FragColor = packDepthToRGBA( dist );
    `,"gl_FragColor = packDepthToRGBA( dist );":`
      if(${t.depthAlpha} < 1.0) discard;
      gl_FragColor = packDepthToRGBA( dist );
    `},[`${t.clearcoat}`]:{"material.clearcoat = clearcoat;":`material.clearcoat = ${t.clearcoat};`},[`${t.clearcoatRoughness}`]:{"material.clearcoatRoughness = clearcoatRoughness;":`material.clearcoatRoughness = ${t.clearcoatRoughness};`},[`${t.clearcoatNormal}`]:{"#include <clearcoat_normal_fragment_begin>":`
      vec3 csm_coat_internal_orthogonal = csm_ClearcoatNormal - (dot(csm_ClearcoatNormal, nonPerturbedNormal) * nonPerturbedNormal);
      vec3 csm_coat_internal_projectedbump = mat3(csm_internal_vModelViewMatrix) * csm_coat_internal_orthogonal;
      vec3 clearcoatNormal = normalize(nonPerturbedNormal - csm_coat_internal_projectedbump);
    `},[`${t.transmission}`]:{"material.transmission = transmission;":`
      material.transmission = ${t.transmission};
    `},[`${t.thickness}`]:{"material.thickness = thickness;":`
      material.thickness = ${t.thickness};
    `},[`${t.iridescence}`]:{"material.iridescence = iridescence;":`
      material.iridescence = ${t.iridescence};
    `}},Ge={clearcoat:[t.clearcoat,t.clearcoatNormal,t.clearcoatRoughness],transmission:[t.transmission],iridescence:[t.iridescence]};function Ke(u){let e=0;for(let o=0;o<u.length;o++)e=u.charCodeAt(o)+(e<<6)+(e<<16)-e;const a=e>>>0;return String(a)}function Ye(u){try{new u}catch(e){if(e.message.indexOf("is not a constructor")>=0)return!1}return!0}function Z(u){return u.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g,"")}class qe extends Me{constructor({baseMaterial:e,vertexShader:a,fragmentShader:o,uniforms:h,patchMap:v,cacheKey:d,...f}){if(!e)throw new Error("CustomShaderMaterial: baseMaterial is required.");let i;if(Ye(e)){const r=Object.keys(f).length===0;i=new e(r?void 0:f)}else i=e,Object.assign(i,f);if(["ShaderMaterial","RawShaderMaterial"].includes(i.type))throw new Error(`CustomShaderMaterial does not support ${i.type} as a base material.`);super(),this.uniforms={},this.vertexShader="",this.fragmentShader="";const s=i;s.name=`CustomShaderMaterial<${i.name||i.type}>`,s.update=this.update,s.__csm={prevOnBeforeCompile:i.onBeforeCompile,baseMaterial:i,vertexShader:a,fragmentShader:o,uniforms:h,patchMap:v,cacheKey:d};const g={...s.uniforms||{},...h||{}};s.uniforms=this.uniforms=g,s.vertexShader=this.vertexShader=a||"",s.fragmentShader=this.fragmentShader=o||"",s.update({fragmentShader:s.fragmentShader,vertexShader:s.vertexShader,uniforms:s.uniforms,patchMap:v,cacheKey:d}),Object.assign(this,s);const p=Object.getOwnPropertyDescriptors(Object.getPrototypeOf(s));for(const r in p){const m=p[r];(m.get||m.set)&&Object.defineProperty(this,r,m)}return Object.defineProperty(this,"type",{get(){return i.type},set(r){i.type=r}}),this}update({fragmentShader:e,vertexShader:a,uniforms:o,cacheKey:h,patchMap:v}){const d=Z(a||""),f=Z(e||""),i=this;o&&(i.uniforms=o),a&&(i.vertexShader=a),e&&(i.fragmentShader=e),Object.entries(Ge).forEach(([r,m])=>{for(const I in m){const l=m[I];(f&&f.includes(l)||d&&d.includes(l))&&(i[r]||(i[r]=1))}});const s=i.__csm.prevOnBeforeCompile,g=(r,m,I)=>{let l,R="";if(m){const T=m.search(/void\s+main\s*\(\s*\)\s*{/);if(T!==-1){R=m.slice(0,T);let E=0,_=-1;for(let S=T;S<m.length;S++)if(m[S]==="{"&&E++,m[S]==="}"&&(E--,E===0)){_=S;break}if(_!==-1){const S=m.slice(T,_+1);l=S.slice(S.indexOf("{")+1,-1)}}else R=m}if(I&&m&&m.includes(t.fragColor)&&l&&(l=`csm_UnlitFac = 1.0;
`+l),r.includes("//~CSM_DEFAULTS")){r=r.replace("void main() {",`
          // THREE-CustomShaderMaterial by Faraz Shaikh: https://github.com/FarazzShaikh/THREE-CustomShaderMaterial
  
          ${R}
          
          void main() {
          `);const T=r.lastIndexOf("//~CSM_MAIN_END");if(T!==-1){const E=`
            ${l?`${l}`:""}
            //~CSM_MAIN_END
          `;r=r.slice(0,T)+E+r.slice(T)}}else{const T=/void\s*main\s*\(\s*\)\s*{/gm;r=r.replace(T,`
          // THREE-CustomShaderMaterial by Faraz Shaikh: https://github.com/FarazzShaikh/THREE-CustomShaderMaterial
  
          //~CSM_DEFAULTS
          ${I?He:je}
          ${ze}
  
          ${R}
          
          void main() {
            {
              ${Le}
            }
            ${I?ke:Oe}

            ${l?`${l}`:""}
            //~CSM_MAIN_END
          `)}return r};i.onBeforeCompile=(r,m)=>{s==null||s(r,m);const I=v||{},l=i.type,R=l?`#define IS_${l.toUpperCase()};
`:`#define IS_UNKNOWN;
`;r.vertexShader=R+`#define IS_VERTEX
`+r.vertexShader,r.fragmentShader=R+`#define IS_FRAGMENT
`+r.fragmentShader;const T=E=>{for(const _ in E){const S=_==="*"||d&&d.includes(_);if(_==="*"||f&&f.includes(_)||S){const y=We[_];if(y&&y!=="*"&&(Array.isArray(y)?!y.includes(l):y!==l)){console.error(`CustomShaderMaterial: ${_} is not available in ${l}. Shader cannot compile.`);return}const B=E[_];for(const U in B){const C=B[U];if(typeof C=="object"){const F=C.type,b=C.value;F==="fs"?r.fragmentShader=r.fragmentShader.replace(U,b):F==="vs"&&(r.vertexShader=r.vertexShader.replace(U,b))}else C&&(r.vertexShader=r.vertexShader.replace(U,C),r.fragmentShader=r.fragmentShader.replace(U,C))}}}};T(Ve),T(I),r.vertexShader=g(r.vertexShader,d,!1),r.fragmentShader=g(r.fragmentShader,f,!0),o&&(r.uniforms={...r.uniforms,...i.uniforms}),i.uniforms=r.uniforms};const p=i.customProgramCacheKey;i.customProgramCacheKey=()=>((h==null?void 0:h())||Ke((d||"")+(f||"")))+(p==null?void 0:p.call(i)),i.needsUpdate=!0}clone(){const e=this;return new e.constructor({baseMaterial:e.__csm.baseMaterial.clone(),vertexShader:e.__csm.vertexShader,fragmentShader:e.__csm.fragmentShader,uniforms:e.__csm.uniforms,patchMap:e.__csm.patchMap,cacheKey:e.__csm.cacheKey})}}function Xe(u,e){const a=n.useRef(!1);n.useEffect(()=>{if(a.current)return u();a.current=!0},e)}function Ze({baseMaterial:u,vertexShader:e,fragmentShader:a,uniforms:o,cacheKey:h,patchMap:v,attach:d,...f},i){const s=n.useMemo(()=>new qe({baseMaterial:u,vertexShader:e,fragmentShader:a,uniforms:o,cacheKey:h,patchMap:v,...f}),[u]);return Xe(()=>{s.dispose(),s.update({vertexShader:e,fragmentShader:a,uniforms:o,patchMap:v,cacheKey:h})},[e,a,o,v,h]),n.useEffect(()=>()=>s.dispose(),[s]),c.jsx("primitive",{ref:i,attach:d??"material",object:s,...f})}const J=n.forwardRef(Ze),Q=`
precision highp float;

attribute vec4 tangent;

uniform float uTime;
uniform vec3 uMouseOnPlane;

varying vec2 vUv;
varying float vWobble;


float getDirectionalStrength(vec3 pos) {
    // distance on the plane
    float dist = length(uMouseOnPlane - pos);

    // large radius
    float radius = 4.0;

    // smooth falloff
    float falloff = 1.0 - smoothstep(0.0, radius, dist);

    // optional sharpening
    return pow(falloff, 1.5);
}

//	Simplex 4D Noise 
//	by Ian McEwan, Ashima Arts
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
float permute(float x){return floor(mod(((x*34.0)+1.0)*x, 289.0));}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float taylorInvSqrt(float r){return 1.79284291400159 - 0.85373472095314 * r;}

vec4 grad4(float j, vec4 ip){
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p,s;

  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www; 

  return p;
}

float simplexNoise4d(vec4 v){
  const vec2  C = vec2( 0.138196601125010504,  // (5 - sqrt(5))/20  G4
                        0.309016994374947451); // (sqrt(5) - 1)/4   F4
// First corner
  vec4 i  = floor(v + dot(v, C.yyyy) );
  vec4 x0 = v -   i + dot(i, C.xxxx);

// Other corners

// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
  vec4 i0;

  vec3 isX = step( x0.yzw, x0.xxx );
  vec3 isYZ = step( x0.zww, x0.yyz );
//  i0.x = dot( isX, vec3( 1.0 ) );
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;

//  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;

  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;

  // i0 now contains the unique values 0,1,2,3 in each channel
  vec4 i3 = clamp( i0, 0.0, 1.0 );
  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

  //  x0 = x0 - 0.0 + 0.0 * C 
  vec4 x1 = x0 - i1 + 1.0 * C.xxxx;
  vec4 x2 = x0 - i2 + 2.0 * C.xxxx;
  vec4 x3 = x0 - i3 + 3.0 * C.xxxx;
  vec4 x4 = x0 - 1.0 + 4.0 * C.xxxx;

// Permutations
  i = mod(i, 289.0); 
  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute( permute( permute( permute (
             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));
// Gradients
// ( 7*7*6 points uniformly over a cube, mapped onto a 4-octahedron.)
// 7*7*6 = 294, which is close to the ring size 17*17 = 289.

  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

  vec4 p0 = grad4(j0,   ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);

// Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4,p4));

// Mix contributions from the five corners
  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
               + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;

}

float getWobble(vec3 position)
{
    return simplexNoise4d(vec4(
        csm_Position, // XYZ
        0.0  + uTime        // W
    ));
}

void main()
{
    vUv = uv;
    vec3 biTangent = cross(normal, tangent.xyz);
    float shift = 0.01;
    vec3 positionA = csm_Position + tangent.xyz * shift;
    vec3 positionB = csm_Position + biTangent * shift;

    // Directional influence toward mouse
    vec3 toMouse = normalize(uMouseOnPlane - csm_Position);
    float dirStrength = max(dot(normalize(csm_Position), normalize(toMouse)), 0.0);
    dirStrength = pow(dirStrength, 2.0); // sharpen lobe

    float wobble = getWobble(csm_Position) * mix(0.1, 1.8, getDirectionalStrength(csm_Position));
    csm_Position += wobble * normal;
    positionA    += getWobble(positionA) * normal;
    positionB    += getWobble(positionB) * normal;

    vec3 toA = normalize(positionA - csm_Position);
    vec3 toB = normalize(positionB - csm_Position);
    csm_Normal = cross(toA, toB);

    vWobble = wobble;

}
`,Je=`
precision highp float;

uniform float uTime;
varying vec2 vUv;
varying float vWobble;

#define colorA vec3(0.)
#define colorB vec3(0.4)


void main()
{
    float colorMix = smoothstep(-0.3, -1., vWobble);
    csm_DiffuseColor.rgb = mix(colorA, colorB, colorMix);
    csm_Metalness = colorMix;
    csm_Roughness = 0.3 + clamp(0., .7, colorMix);
}
`;function Qe(){const u=n.useRef(),e=n.useRef(),a=n.useRef(null),{camera:o,mouse:h,size:v}=j(),d=n.useRef(new ye).current,f=n.useRef(new te).current,i=n.useRef(new P(0,0,0)).current,s=n.useRef(new P).current,g=n.useRef(new P).current;return n.useEffect(()=>{if(!a.current)return;const p=a.current,r=Ie(p);r.computeTangents(),a.current.copy(r)},[]),re(p=>{if(!u.current||!e.current)return;const r=p.clock.elapsedTime;o.getWorldDirection(s).negate(),f.setFromNormalAndCoplanarPoint(s,i),d.setFromCamera(h,o),d.ray.intersectPlane(f,g),u.current&&(u.current.uniforms.uTime.value=r,u.current.uniforms.uMouseOnPlane.value.copy(g)),e.current&&(e.current.uniforms.uTime.value=r,e.current.uniforms.uMouseOnPlane.value.copy(g))}),c.jsx("group",{children:c.jsxs("mesh",{castShadow:!0,children:[c.jsx("icosahedronGeometry",{ref:a,args:[2.5,150]}),c.jsx(J,{ref:u,fragmentShader:Je,vertexShader:Q,baseMaterial:Re,metalness:0,roughness:.5,transmission:0,ior:1.5,thickness:1.5,transparent:!0,flatShading:!0,color:"white",uniforms:{uTime:{value:0},uMouseOnPlane:{value:new P(0,0,5)}}}),c.jsx(J,{attach:"customDepthMaterial",ref:e,baseMaterial:De,vertexShader:Q,depthPacking:Ee,uniforms:{uTime:{value:0},uMouseOnPlane:{value:new P(0,0,5)}}})]})})}function et(){return c.jsxs(c.Fragment,{children:[c.jsxs("mesh",{receiveShadow:!0,position:[0,-4,0],rotation:[-Math.PI/2,0,0],children:[c.jsx("planeGeometry",{args:[20,20]}),c.jsx($e,{resolution:1024,mirror:.6,mixBlur:.1,mixStrength:1.5,blur:[300,100],depthScale:1.2,minDepthThreshold:.8,maxDepthThreshold:1.2,roughness:.5,color:"#6c6c6c",metalness:.4})]}),c.jsxs("mesh",{receiveShadow:!0,position:[0,6,-10],rotation:[0,0,0],children:[c.jsx("planeGeometry",{args:[20,20]}),c.jsx("meshPhysicalMaterial",{side:2,color:"white"})]}),c.jsxs("mesh",{receiveShadow:!0,position:[-10,6,0],rotation:[0,Math.PI/2,0],children:[c.jsx("planeGeometry",{args:[20,20]}),c.jsx("meshPhysicalMaterial",{side:2,color:"white"})]})]})}function tt(){return c.jsxs(c.Fragment,{children:[c.jsx("ambientLight",{intensity:.1}),c.jsx("directionalLight",{castShadow:!0,intensity:.8,position:[0,5,0],"shadow-mapSize":[1024,1024],"shadow-camera-far":15,"shadow-normalBias":.05}),c.jsx(Ce,{enableZoom:!0,enableRotate:!1}),c.jsx(et,{}),c.jsx(be,{preset:"studio",environmentIntensity:.3}),c.jsx(Qe,{})]})}const lt=()=>{const{camera:u,gl:e}=j(),[a,o]=n.useState(!1);return n.useEffect(()=>{u.position.set(10,2,10),e.shadowMap.enabled=!0,e.shadowMap.type=Te,o(!0)},[]),c.jsxs(c.Fragment,{children:[c.jsx(we,{prompt:"lifeform",hint:"touch",color:"aliceblue"}),c.jsx(Ae,{day:27}),a&&c.jsx(tt,{})]})};export{lt as default};
