import{_ as O,aC as w,r as f,j as o,u as L,b as H,aD as z,c as F,aE as j,aF as B,e as T,d as k,q as U,aG as W,aH as G}from"./main-D1RQi7x-.js";import{P as Y}from"./PromptHint-D2Y4MiJw.js";import{m as K}from"./BufferGeometryUtils-DcIxZDWl.js";import{O as V}from"./OrbitControls-CYLbWNVd.js";import{E as q}from"./Environment-D6HXvBKw.js";const Z=`
    
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
`,X=`

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
`,J=`
    varying mat4 csm_internal_vModelViewMatrix;
`,Q=`
    csm_internal_vModelViewMatrix = modelViewMatrix;
`,ee=`
    varying mat4 csm_internal_vModelViewMatrix;
`,ae=`
    
`,e={diffuse:"csm_DiffuseColor",roughness:"csm_Roughness",metalness:"csm_Metalness",emissive:"csm_Emissive",ao:"csm_AO",bump:"csm_Bump",fragNormal:"csm_FragNormal",clearcoat:"csm_Clearcoat",clearcoatRoughness:"csm_ClearcoatRoughness",clearcoatNormal:"csm_ClearcoatNormal",transmission:"csm_Transmission",thickness:"csm_Thickness",iridescence:"csm_Iridescence",pointSize:"csm_PointSize",fragColor:"csm_FragColor",depthAlpha:"csm_DepthAlpha",unlitFac:"csm_UnlitFac",position:"csm_Position",positionRaw:"csm_PositionRaw",normal:"csm_Normal"},se={[`${e.position}`]:"*",[`${e.positionRaw}`]:"*",[`${e.normal}`]:"*",[`${e.depthAlpha}`]:"*",[`${e.pointSize}`]:["PointsMaterial"],[`${e.diffuse}`]:"*",[`${e.fragColor}`]:"*",[`${e.fragNormal}`]:"*",[`${e.unlitFac}`]:"*",[`${e.emissive}`]:["MeshStandardMaterial","MeshPhysicalMaterial"],[`${e.roughness}`]:["MeshStandardMaterial","MeshPhysicalMaterial"],[`${e.metalness}`]:["MeshStandardMaterial","MeshPhysicalMaterial"],[`${e.iridescence}`]:["MeshStandardMaterial","MeshPhysicalMaterial"],[`${e.ao}`]:["MeshStandardMaterial","MeshPhysicalMaterial","MeshBasicMaterial","MeshLambertMaterial","MeshPhongMaterial","MeshToonMaterial"],[`${e.bump}`]:["MeshLambertMaterial","MeshMatcapMaterial","MeshNormalMaterial","MeshPhongMaterial","MeshPhysicalMaterial","MeshStandardMaterial","MeshToonMaterial","ShadowMaterial"],[`${e.clearcoat}`]:["MeshPhysicalMaterial"],[`${e.clearcoatRoughness}`]:["MeshPhysicalMaterial"],[`${e.clearcoatNormal}`]:["MeshPhysicalMaterial"],[`${e.transmission}`]:["MeshPhysicalMaterial"],[`${e.thickness}`]:["MeshPhysicalMaterial"]},re={"*":{"#include <lights_physical_fragment>":w.lights_physical_fragment,"#include <transmission_fragment>":w.transmission_fragment},[`${e.normal}`]:{"#include <beginnormal_vertex>":`
    vec3 objectNormal = ${e.normal};
    #ifdef USE_TANGENT
	    vec3 objectTangent = vec3( tangent.xyz );
    #endif
    `},[`${e.position}`]:{"#include <begin_vertex>":`
    vec3 transformed = ${e.position};
  `},[`${e.positionRaw}`]:{"#include <project_vertex>":`
    #include <project_vertex>
    gl_Position = ${e.positionRaw};
  `},[`${e.pointSize}`]:{"gl_PointSize = size;":`
    gl_PointSize = ${e.pointSize};
    `},[`${e.diffuse}`]:{"#include <color_fragment>":`
    #include <color_fragment>
    diffuseColor = ${e.diffuse};
  `},[`${e.fragColor}`]:{"#include <opaque_fragment>":`
    #include <opaque_fragment>
    gl_FragColor = mix(gl_FragColor, ${e.fragColor}, ${e.unlitFac});
  `},[`${e.emissive}`]:{"vec3 totalEmissiveRadiance = emissive;":`
    vec3 totalEmissiveRadiance = ${e.emissive};
    `},[`${e.roughness}`]:{"#include <roughnessmap_fragment>":`
    #include <roughnessmap_fragment>
    roughnessFactor = ${e.roughness};
    `},[`${e.metalness}`]:{"#include <metalnessmap_fragment>":`
    #include <metalnessmap_fragment>
    metalnessFactor = ${e.metalness};
    `},[`${e.ao}`]:{"#include <aomap_fragment>":`
    #include <aomap_fragment>
    reflectedLight.indirectDiffuse *= 1. - ${e.ao};
    `},[`${e.bump}`]:{"#include <normal_fragment_maps>":`
    #include <normal_fragment_maps>

    vec3 csm_internal_orthogonal = ${e.bump} - (dot(${e.bump}, normal) * normal);
    vec3 csm_internal_projectedbump = mat3(csm_internal_vModelViewMatrix) * csm_internal_orthogonal;
    normal = normalize(normal - csm_internal_projectedbump);
    `},[`${e.fragNormal}`]:{"#include <normal_fragment_maps>":`
      #include <normal_fragment_maps>
      normal = ${e.fragNormal};
    `},[`${e.depthAlpha}`]:{"gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );":`
      gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity * 1.0 - ${e.depthAlpha} );
    `,"gl_FragColor = packDepthToRGBA( fragCoordZ );":`
      if(${e.depthAlpha} < 1.0) discard;
      gl_FragColor = packDepthToRGBA( dist );
    `,"gl_FragColor = packDepthToRGBA( dist );":`
      if(${e.depthAlpha} < 1.0) discard;
      gl_FragColor = packDepthToRGBA( dist );
    `},[`${e.clearcoat}`]:{"material.clearcoat = clearcoat;":`material.clearcoat = ${e.clearcoat};`},[`${e.clearcoatRoughness}`]:{"material.clearcoatRoughness = clearcoatRoughness;":`material.clearcoatRoughness = ${e.clearcoatRoughness};`},[`${e.clearcoatNormal}`]:{"#include <clearcoat_normal_fragment_begin>":`
      vec3 csm_coat_internal_orthogonal = csm_ClearcoatNormal - (dot(csm_ClearcoatNormal, nonPerturbedNormal) * nonPerturbedNormal);
      vec3 csm_coat_internal_projectedbump = mat3(csm_internal_vModelViewMatrix) * csm_coat_internal_orthogonal;
      vec3 clearcoatNormal = normalize(nonPerturbedNormal - csm_coat_internal_projectedbump);
    `},[`${e.transmission}`]:{"material.transmission = transmission;":`
      material.transmission = ${e.transmission};
    `},[`${e.thickness}`]:{"material.thickness = thickness;":`
      material.thickness = ${e.thickness};
    `},[`${e.iridescence}`]:{"material.iridescence = iridescence;":`
      material.iridescence = ${e.iridescence};
    `}},te={clearcoat:[e.clearcoat,e.clearcoatNormal,e.clearcoatRoughness],transmission:[e.transmission],iridescence:[e.iridescence]};function ie(n){let s=0;for(let c=0;c<n.length;c++)s=n.charCodeAt(c)+(s<<6)+(s<<16)-s;const i=s>>>0;return String(i)}function oe(n){try{new n}catch(s){if(s.message.indexOf("is not a constructor")>=0)return!1}return!0}function N(n){return n.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g,"")}class ne extends O{constructor({baseMaterial:s,vertexShader:i,fragmentShader:c,uniforms:h,patchMap:M,cacheKey:u,...d}){if(!s)throw new Error("CustomShaderMaterial: baseMaterial is required.");let r;if(oe(s)){const a=Object.keys(d).length===0;r=new s(a?void 0:d)}else r=s,Object.assign(r,d);if(["ShaderMaterial","RawShaderMaterial"].includes(r.type))throw new Error(`CustomShaderMaterial does not support ${r.type} as a base material.`);super(),this.uniforms={},this.vertexShader="",this.fragmentShader="";const t=r;t.name=`CustomShaderMaterial<${r.name||r.type}>`,t.update=this.update,t.__csm={prevOnBeforeCompile:r.onBeforeCompile,baseMaterial:r,vertexShader:i,fragmentShader:c,uniforms:h,patchMap:M,cacheKey:u};const g={...t.uniforms||{},...h||{}};t.uniforms=this.uniforms=g,t.vertexShader=this.vertexShader=i||"",t.fragmentShader=this.fragmentShader=c||"",t.update({fragmentShader:t.fragmentShader,vertexShader:t.vertexShader,uniforms:t.uniforms,patchMap:M,cacheKey:u}),Object.assign(this,t);const v=Object.getOwnPropertyDescriptors(Object.getPrototypeOf(t));for(const a in v){const l=v[a];(l.get||l.set)&&Object.defineProperty(this,a,l)}return Object.defineProperty(this,"type",{get(){return r.type},set(a){r.type=a}}),this}update({fragmentShader:s,vertexShader:i,uniforms:c,cacheKey:h,patchMap:M}){const u=N(i||""),d=N(s||""),r=this;c&&(r.uniforms=c),i&&(r.vertexShader=i),s&&(r.fragmentShader=s),Object.entries(te).forEach(([a,l])=>{for(const x in l){const m=l[x];(d&&d.includes(m)||u&&u.includes(m))&&(r[a]||(r[a]=1))}});const t=r.__csm.prevOnBeforeCompile,g=(a,l,x)=>{let m,E="";if(l){const p=l.search(/void\s+main\s*\(\s*\)\s*{/);if(p!==-1){E=l.slice(0,p);let A=0,_=-1;for(let S=p;S<l.length;S++)if(l[S]==="{"&&A++,l[S]==="}"&&(A--,A===0)){_=S;break}if(_!==-1){const S=l.slice(p,_+1);m=S.slice(S.indexOf("{")+1,-1)}}else E=l}if(x&&l&&l.includes(e.fragColor)&&m&&(m=`csm_UnlitFac = 1.0;
`+m),a.includes("//~CSM_DEFAULTS")){a=a.replace("void main() {",`
          // THREE-CustomShaderMaterial by Faraz Shaikh: https://github.com/FarazzShaikh/THREE-CustomShaderMaterial
  
          ${E}
          
          void main() {
          `);const p=a.lastIndexOf("//~CSM_MAIN_END");if(p!==-1){const A=`
            ${m?`${m}`:""}
            //~CSM_MAIN_END
          `;a=a.slice(0,p)+A+a.slice(p)}}else{const p=/void\s*main\s*\(\s*\)\s*{/gm;a=a.replace(p,`
          // THREE-CustomShaderMaterial by Faraz Shaikh: https://github.com/FarazzShaikh/THREE-CustomShaderMaterial
  
          //~CSM_DEFAULTS
          ${x?ee:J}
          ${Z}
  
          ${E}
          
          void main() {
            {
              ${X}
            }
            ${x?ae:Q}

            ${m?`${m}`:""}
            //~CSM_MAIN_END
          `)}return a};r.onBeforeCompile=(a,l)=>{t==null||t(a,l);const x=M||{},m=r.type,E=m?`#define IS_${m.toUpperCase()};
`:`#define IS_UNKNOWN;
`;a.vertexShader=E+`#define IS_VERTEX
`+a.vertexShader,a.fragmentShader=E+`#define IS_FRAGMENT
`+a.fragmentShader;const p=A=>{for(const _ in A){const S=_==="*"||u&&u.includes(_);if(_==="*"||d&&d.includes(_)||S){const I=se[_];if(I&&I!=="*"&&(Array.isArray(I)?!I.includes(m):I!==m)){console.error(`CustomShaderMaterial: ${_} is not available in ${m}. Shader cannot compile.`);return}const C=A[_];for(const y in C){const R=C[y];if(typeof R=="object"){const b=R.type,P=R.value;b==="fs"?a.fragmentShader=a.fragmentShader.replace(y,P):b==="vs"&&(a.vertexShader=a.vertexShader.replace(y,P))}else R&&(a.vertexShader=a.vertexShader.replace(y,R),a.fragmentShader=a.fragmentShader.replace(y,R))}}}};p(re),p(x),a.vertexShader=g(a.vertexShader,u,!1),a.fragmentShader=g(a.fragmentShader,d,!0),c&&(a.uniforms={...a.uniforms,...r.uniforms}),r.uniforms=a.uniforms};const v=r.customProgramCacheKey;r.customProgramCacheKey=()=>((h==null?void 0:h())||ie((u||"")+(d||"")))+(v==null?void 0:v.call(r)),r.needsUpdate=!0}clone(){const s=this;return new s.constructor({baseMaterial:s.__csm.baseMaterial.clone(),vertexShader:s.__csm.vertexShader,fragmentShader:s.__csm.fragmentShader,uniforms:s.__csm.uniforms,patchMap:s.__csm.patchMap,cacheKey:s.__csm.cacheKey})}}function ce(n,s){const i=f.useRef(!1);f.useEffect(()=>{if(i.current)return n();i.current=!0},s)}function le({baseMaterial:n,vertexShader:s,fragmentShader:i,uniforms:c,cacheKey:h,patchMap:M,attach:u,...d},r){const t=f.useMemo(()=>new ne({baseMaterial:n,vertexShader:s,fragmentShader:i,uniforms:c,cacheKey:h,patchMap:M,...d}),[n]);return ce(()=>{t.dispose(),t.update({vertexShader:s,fragmentShader:i,uniforms:c,patchMap:M,cacheKey:h})},[s,i,c,M,h]),f.useEffect(()=>()=>t.dispose(),[t]),o.jsx("primitive",{ref:r,attach:u??"material",object:t,...d})}const $=f.forwardRef(le),D=`
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

    float wobble = getWobble(csm_Position) * mix(0.1, 2.8, getDirectionalStrength(csm_Position));
    csm_Position += wobble * normal;
    positionA    += getWobble(positionA) * normal;
    positionB    += getWobble(positionB) * normal;

    vec3 toA = normalize(positionA - csm_Position);
    vec3 toB = normalize(positionB - csm_Position);
    csm_Normal = cross(toA, toB);

    vWobble = wobble;

}
`,me=`
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
`;function de(){const n=f.useRef(),s=f.useRef(),i=f.useRef(null),{camera:c,mouse:h,size:M}=L(),u=f.useRef(new j).current,d=f.useRef(new B).current,r=f.useRef(new T(0,0,0)).current,t=f.useRef(new T).current,g=f.useRef(new T).current;return f.useEffect(()=>{if(!i.current)return;const v=i.current,a=K(v);a.computeTangents(),i.current.copy(a)},[]),k(v=>{if(!n.current||!s.current)return;const a=v.clock.elapsedTime;c.getWorldDirection(t).negate(),d.setFromNormalAndCoplanarPoint(t,r),u.setFromCamera(h,c),u.ray.intersectPlane(d,g),n.current&&(n.current.uniforms.uTime.value=a,n.current.uniforms.uMouseOnPlane.value.copy(g)),s.current&&(s.current.uniforms.uTime.value=a,s.current.uniforms.uMouseOnPlane.value.copy(g))}),o.jsx("group",{children:o.jsxs("mesh",{castShadow:!0,children:[o.jsx("icosahedronGeometry",{ref:i,args:[2.5,150]}),o.jsx($,{ref:n,fragmentShader:me,vertexShader:D,baseMaterial:U,metalness:0,roughness:.5,transmission:0,ior:1.5,thickness:1.5,transparent:!0,flatShading:!0,color:"white",uniforms:{uTime:{value:0},uMouseOnPlane:{value:new T(0,0,5)}}}),o.jsx($,{attach:"customDepthMaterial",ref:s,baseMaterial:G,vertexShader:D,depthPacking:W,uniforms:{uTime:{value:0},uMouseOnPlane:{value:new T(0,0,5)}}})]})})}function fe(){return o.jsx(o.Fragment,{})}function ue(){return o.jsxs(o.Fragment,{children:[o.jsx("ambientLight",{intensity:1}),o.jsx("directionalLight",{castShadow:!0,intensity:.8,position:[0,5,0],"shadow-mapSize":[1024,1024],"shadow-camera-far":15,"shadow-normalBias":.05}),o.jsx(V,{enableZoom:!0,enableRotate:!1}),o.jsx(fe,{}),o.jsx(q,{preset:"studio",environmentIntensity:.3}),o.jsx(de,{})]})}const ve=()=>{const{camera:n,gl:s,scene:i}=L(),[c,h]=f.useState(!1);return f.useEffect(()=>{n.position.set(10,2,10),i.background=new H("#00ff00"),s.shadowMap.enabled=!0,s.shadowMap.type=z,h(!0)},[]),o.jsxs(o.Fragment,{children:[o.jsx(Y,{prompt:"lifeform",hint:"touch",color:"aliceblue"}),o.jsx(F,{day:27}),c&&o.jsx(ue,{})]})};export{ve as default};
