import{_ as O,aC as w,r as f,j as t,u as L,aD as H,c as j,aE as z,aF as F,e as T,d as B,q as k,aG as U,aH as G}from"./main-BbWrUkGZ.js";import{P as W}from"./PromptHint-BmBE9JU3.js";import{m as Y}from"./BufferGeometryUtils-DjLO99mW.js";import{O as K}from"./OrbitControls-BoPPP-zm.js";import{E as V}from"./Environment-BpyfzdjD.js";const q=`
    
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
`,Z=`

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
`,X=`
    varying mat4 csm_internal_vModelViewMatrix;
`,J=`
    csm_internal_vModelViewMatrix = modelViewMatrix;
`,Q=`
    varying mat4 csm_internal_vModelViewMatrix;
`,ee=`
    
`,e={diffuse:"csm_DiffuseColor",roughness:"csm_Roughness",metalness:"csm_Metalness",emissive:"csm_Emissive",ao:"csm_AO",bump:"csm_Bump",fragNormal:"csm_FragNormal",clearcoat:"csm_Clearcoat",clearcoatRoughness:"csm_ClearcoatRoughness",clearcoatNormal:"csm_ClearcoatNormal",transmission:"csm_Transmission",thickness:"csm_Thickness",iridescence:"csm_Iridescence",pointSize:"csm_PointSize",fragColor:"csm_FragColor",depthAlpha:"csm_DepthAlpha",unlitFac:"csm_UnlitFac",position:"csm_Position",positionRaw:"csm_PositionRaw",normal:"csm_Normal"},ae={[`${e.position}`]:"*",[`${e.positionRaw}`]:"*",[`${e.normal}`]:"*",[`${e.depthAlpha}`]:"*",[`${e.pointSize}`]:["PointsMaterial"],[`${e.diffuse}`]:"*",[`${e.fragColor}`]:"*",[`${e.fragNormal}`]:"*",[`${e.unlitFac}`]:"*",[`${e.emissive}`]:["MeshStandardMaterial","MeshPhysicalMaterial"],[`${e.roughness}`]:["MeshStandardMaterial","MeshPhysicalMaterial"],[`${e.metalness}`]:["MeshStandardMaterial","MeshPhysicalMaterial"],[`${e.iridescence}`]:["MeshStandardMaterial","MeshPhysicalMaterial"],[`${e.ao}`]:["MeshStandardMaterial","MeshPhysicalMaterial","MeshBasicMaterial","MeshLambertMaterial","MeshPhongMaterial","MeshToonMaterial"],[`${e.bump}`]:["MeshLambertMaterial","MeshMatcapMaterial","MeshNormalMaterial","MeshPhongMaterial","MeshPhysicalMaterial","MeshStandardMaterial","MeshToonMaterial","ShadowMaterial"],[`${e.clearcoat}`]:["MeshPhysicalMaterial"],[`${e.clearcoatRoughness}`]:["MeshPhysicalMaterial"],[`${e.clearcoatNormal}`]:["MeshPhysicalMaterial"],[`${e.transmission}`]:["MeshPhysicalMaterial"],[`${e.thickness}`]:["MeshPhysicalMaterial"]},se={"*":{"#include <lights_physical_fragment>":w.lights_physical_fragment,"#include <transmission_fragment>":w.transmission_fragment},[`${e.normal}`]:{"#include <beginnormal_vertex>":`
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
    `}},re={clearcoat:[e.clearcoat,e.clearcoatNormal,e.clearcoatRoughness],transmission:[e.transmission],iridescence:[e.iridescence]};function te(n){let s=0;for(let c=0;c<n.length;c++)s=n.charCodeAt(c)+(s<<6)+(s<<16)-s;const o=s>>>0;return String(o)}function ie(n){try{new n}catch(s){if(s.message.indexOf("is not a constructor")>=0)return!1}return!0}function N(n){return n.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g,"")}class oe extends O{constructor({baseMaterial:s,vertexShader:o,fragmentShader:c,uniforms:h,patchMap:M,cacheKey:u,...d}){if(!s)throw new Error("CustomShaderMaterial: baseMaterial is required.");let r;if(ie(s)){const a=Object.keys(d).length===0;r=new s(a?void 0:d)}else r=s,Object.assign(r,d);if(["ShaderMaterial","RawShaderMaterial"].includes(r.type))throw new Error(`CustomShaderMaterial does not support ${r.type} as a base material.`);super(),this.uniforms={},this.vertexShader="",this.fragmentShader="";const i=r;i.name=`CustomShaderMaterial<${r.name||r.type}>`,i.update=this.update,i.__csm={prevOnBeforeCompile:r.onBeforeCompile,baseMaterial:r,vertexShader:o,fragmentShader:c,uniforms:h,patchMap:M,cacheKey:u};const g={...i.uniforms||{},...h||{}};i.uniforms=this.uniforms=g,i.vertexShader=this.vertexShader=o||"",i.fragmentShader=this.fragmentShader=c||"",i.update({fragmentShader:i.fragmentShader,vertexShader:i.vertexShader,uniforms:i.uniforms,patchMap:M,cacheKey:u}),Object.assign(this,i);const v=Object.getOwnPropertyDescriptors(Object.getPrototypeOf(i));for(const a in v){const l=v[a];(l.get||l.set)&&Object.defineProperty(this,a,l)}return Object.defineProperty(this,"type",{get(){return r.type},set(a){r.type=a}}),this}update({fragmentShader:s,vertexShader:o,uniforms:c,cacheKey:h,patchMap:M}){const u=N(o||""),d=N(s||""),r=this;c&&(r.uniforms=c),o&&(r.vertexShader=o),s&&(r.fragmentShader=s),Object.entries(re).forEach(([a,l])=>{for(const A in l){const m=l[A];(d&&d.includes(m)||u&&u.includes(m))&&(r[a]||(r[a]=1))}});const i=r.__csm.prevOnBeforeCompile,g=(a,l,A)=>{let m,E="";if(l){const p=l.search(/void\s+main\s*\(\s*\)\s*{/);if(p!==-1){E=l.slice(0,p);let x=0,_=-1;for(let S=p;S<l.length;S++)if(l[S]==="{"&&x++,l[S]==="}"&&(x--,x===0)){_=S;break}if(_!==-1){const S=l.slice(p,_+1);m=S.slice(S.indexOf("{")+1,-1)}}else E=l}if(A&&l&&l.includes(e.fragColor)&&m&&(m=`csm_UnlitFac = 1.0;
`+m),a.includes("//~CSM_DEFAULTS")){a=a.replace("void main() {",`
          // THREE-CustomShaderMaterial by Faraz Shaikh: https://github.com/FarazzShaikh/THREE-CustomShaderMaterial
  
          ${E}
          
          void main() {
          `);const p=a.lastIndexOf("//~CSM_MAIN_END");if(p!==-1){const x=`
            ${m?`${m}`:""}
            //~CSM_MAIN_END
          `;a=a.slice(0,p)+x+a.slice(p)}}else{const p=/void\s*main\s*\(\s*\)\s*{/gm;a=a.replace(p,`
          // THREE-CustomShaderMaterial by Faraz Shaikh: https://github.com/FarazzShaikh/THREE-CustomShaderMaterial
  
          //~CSM_DEFAULTS
          ${A?Q:X}
          ${q}
  
          ${E}
          
          void main() {
            {
              ${Z}
            }
            ${A?ee:J}

            ${m?`${m}`:""}
            //~CSM_MAIN_END
          `)}return a};r.onBeforeCompile=(a,l)=>{i==null||i(a,l);const A=M||{},m=r.type,E=m?`#define IS_${m.toUpperCase()};
`:`#define IS_UNKNOWN;
`;a.vertexShader=E+`#define IS_VERTEX
`+a.vertexShader,a.fragmentShader=E+`#define IS_FRAGMENT
`+a.fragmentShader;const p=x=>{for(const _ in x){const S=_==="*"||u&&u.includes(_);if(_==="*"||d&&d.includes(_)||S){const R=ae[_];if(R&&R!=="*"&&(Array.isArray(R)?!R.includes(m):R!==m)){console.error(`CustomShaderMaterial: ${_} is not available in ${m}. Shader cannot compile.`);return}const C=x[_];for(const y in C){const I=C[y];if(typeof I=="object"){const P=I.type,b=I.value;P==="fs"?a.fragmentShader=a.fragmentShader.replace(y,b):P==="vs"&&(a.vertexShader=a.vertexShader.replace(y,b))}else I&&(a.vertexShader=a.vertexShader.replace(y,I),a.fragmentShader=a.fragmentShader.replace(y,I))}}}};p(se),p(A),a.vertexShader=g(a.vertexShader,u,!1),a.fragmentShader=g(a.fragmentShader,d,!0),c&&(a.uniforms={...a.uniforms,...r.uniforms}),r.uniforms=a.uniforms};const v=r.customProgramCacheKey;r.customProgramCacheKey=()=>((h==null?void 0:h())||te((u||"")+(d||"")))+(v==null?void 0:v.call(r)),r.needsUpdate=!0}clone(){const s=this;return new s.constructor({baseMaterial:s.__csm.baseMaterial.clone(),vertexShader:s.__csm.vertexShader,fragmentShader:s.__csm.fragmentShader,uniforms:s.__csm.uniforms,patchMap:s.__csm.patchMap,cacheKey:s.__csm.cacheKey})}}function ne(n,s){const o=f.useRef(!1);f.useEffect(()=>{if(o.current)return n();o.current=!0},s)}function ce({baseMaterial:n,vertexShader:s,fragmentShader:o,uniforms:c,cacheKey:h,patchMap:M,attach:u,...d},r){const i=f.useMemo(()=>new oe({baseMaterial:n,vertexShader:s,fragmentShader:o,uniforms:c,cacheKey:h,patchMap:M,...d}),[n]);return ne(()=>{i.dispose(),i.update({vertexShader:s,fragmentShader:o,uniforms:c,patchMap:M,cacheKey:h})},[s,o,c,M,h]),f.useEffect(()=>()=>i.dispose(),[i]),t.jsx("primitive",{ref:r,attach:u??"material",object:i,...d})}const $=f.forwardRef(ce),D=`
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
`,le=`
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
`;function me(){const n=f.useRef(),s=f.useRef(),o=f.useRef(null),{camera:c,mouse:h,size:M}=L(),u=f.useRef(new z).current,d=f.useRef(new F).current,r=f.useRef(new T(0,0,0)).current,i=f.useRef(new T).current,g=f.useRef(new T).current;return f.useEffect(()=>{if(!o.current)return;const v=o.current,a=Y(v);a.computeTangents(),o.current.copy(a)},[]),B(v=>{if(!n.current||!s.current)return;const a=v.clock.elapsedTime;c.getWorldDirection(i).negate(),d.setFromNormalAndCoplanarPoint(i,r),u.setFromCamera(h,c),u.ray.intersectPlane(d,g),n.current&&(n.current.uniforms.uTime.value=a,n.current.uniforms.uMouseOnPlane.value.copy(g)),s.current&&(s.current.uniforms.uTime.value=a,s.current.uniforms.uMouseOnPlane.value.copy(g))}),t.jsx("group",{children:t.jsxs("mesh",{castShadow:!0,children:[t.jsx("icosahedronGeometry",{ref:o,args:[2.5,150]}),t.jsx($,{ref:n,fragmentShader:le,vertexShader:D,baseMaterial:k,metalness:0,roughness:.5,transmission:0,ior:1.5,thickness:1.5,transparent:!0,flatShading:!0,color:"white",uniforms:{uTime:{value:0},uMouseOnPlane:{value:new T(0,0,5)}}}),t.jsx($,{attach:"customDepthMaterial",ref:s,baseMaterial:G,vertexShader:D,depthPacking:U,uniforms:{uTime:{value:0},uMouseOnPlane:{value:new T(0,0,5)}}})]})})}function de(){return t.jsxs(t.Fragment,{children:[t.jsxs("mesh",{receiveShadow:!0,position:[0,-6,0],rotation:[-Math.PI/2,0,0],children:[t.jsx("planeGeometry",{args:[100,100]}),t.jsx("meshPhysicalMaterial",{color:"white"})]}),t.jsxs("mesh",{receiveShadow:!0,position:[0,6,-10],rotation:[0,0,0],children:[t.jsx("planeGeometry",{args:[20,20]}),t.jsx("meshPhysicalMaterial",{side:2,color:"white"})]}),t.jsxs("mesh",{receiveShadow:!0,position:[-10,6,0],rotation:[0,Math.PI/2,0],children:[t.jsx("planeGeometry",{args:[20,20]}),t.jsx("meshPhysicalMaterial",{side:2,color:"white"})]})]})}function fe(){return t.jsxs(t.Fragment,{children:[t.jsx("ambientLight",{intensity:1}),t.jsx("directionalLight",{castShadow:!0,intensity:.8,position:[0,5,0],"shadow-mapSize":[1024,1024],"shadow-camera-far":15,"shadow-normalBias":.05}),t.jsx(K,{enableZoom:!0,enableRotate:!1}),t.jsx(de,{}),t.jsx(V,{preset:"studio",environmentIntensity:.1}),t.jsx(me,{})]})}const Me=()=>{const{camera:n,gl:s,scene:o}=L(),[c,h]=f.useState(!1);return f.useEffect(()=>{n.position.set(10,2,10),s.shadowMap.enabled=!0,s.shadowMap.type=H,h(!0)},[]),t.jsxs(t.Fragment,{children:[t.jsx(W,{prompt:"lifeform",hint:"touch",color:"aliceblue"}),t.jsx(j,{day:27}),c&&t.jsx(fe,{})]})};export{Me as default};
