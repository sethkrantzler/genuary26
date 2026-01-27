import { useFrame, useThree } from '@react-three/fiber';
import { PromptHint } from '../../components/PromptHint';
import { CompletedSketch } from '../../utils/utils';
import CustomShaderMaterial from 'three-custom-shader-material'
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Environment, OrbitControls } from '@react-three/drei';
import { mergeVertices } from 'three-stdlib';

const vertexShader = `
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
`;

const fragmentShader = `
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
`;

function MorphBall() {
  const materialRef = useRef<any>();
  const depthRef = useRef<any>();
  const geoRef = useRef<THREE.BufferGeometry>(null!);

  const { camera, mouse, size } = useThree();
  const raycaster = useRef(new THREE.Raycaster()).current;
  const plane = useRef(new THREE.Plane()).current;
  const planePoint = useRef(new THREE.Vector3(0, 0, 0)).current; // ball center
  const planeNormal = useRef(new THREE.Vector3()).current;
  const mouseWorld = useRef(new THREE.Vector3()).current;

  useEffect(() => {
    if (!geoRef.current) return;
    const geometry = geoRef.current;
    const merged = mergeVertices(geometry);
    merged.computeTangents();
    geoRef.current.copy(merged);
  }, []);

  useFrame((state) => {
    if (!materialRef.current || !depthRef.current) return;
    const t = state.clock.elapsedTime;

    // 1. Build billboard plane facing camera, through ball center
    camera.getWorldDirection(planeNormal).negate(); // plane normal toward camera
    plane.setFromNormalAndCoplanarPoint(planeNormal, planePoint);

    // 2. Raycast mouse to plane
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, mouseWorld);

    // 3. Update uniforms
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = t;
      materialRef.current.uniforms.uMouseOnPlane.value.copy(mouseWorld);
    }
    if (depthRef.current) {
      depthRef.current.uniforms.uTime.value = t;
      depthRef.current.uniforms.uMouseOnPlane.value.copy(mouseWorld);
    }
  }); // run before reflector, etc.

  return (
    <group>
      <mesh castShadow>
        <icosahedronGeometry ref={geoRef} args={[2.5, 150]} />

        <CustomShaderMaterial
          ref={materialRef}
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          baseMaterial={THREE.MeshPhysicalMaterial}
          metalness={0}
          roughness={0.5}
          transmission={0}
          ior={1.5}
          thickness={1.5}
          transparent
          flatShading
          color="white"
          uniforms={{
            uTime: { value: 0 },
            uMouseOnPlane: { value: new THREE.Vector3(0, 0, 5) }, // initial forward
          }}
        />

        <CustomShaderMaterial
          attach="customDepthMaterial"
          ref={depthRef}
          baseMaterial={THREE.MeshDepthMaterial}
          vertexShader={vertexShader}
          depthPacking={THREE.RGBADepthPacking}
          uniforms={{
            uTime: { value: 0 },
            uMouseOnPlane: { value: new THREE.Vector3(0, 0, 5) },
          }}
        />
      </mesh>
    </group>
  );
}

function Floor() {
    return (
      <>
        {/* Floor */}
        <mesh
          receiveShadow
          position={[0, -4, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[20, 20]} />
          <meshPhysicalMaterial side={2} color="grey" />
        </mesh>
  
        {/* Back wall */}
        <mesh
          receiveShadow
          position={[0, 6, -10]}
          rotation={[0, 0, 0]}
        >
          <planeGeometry args={[20, 20]} />
          <meshPhysicalMaterial side={2} color="white" />
        </mesh>
  
        {/* Left wall */}
        <mesh
          receiveShadow
          position={[-10, 6, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <planeGeometry args={[20, 20]} />
          <meshPhysicalMaterial side={2} color="white" />
        </mesh>
  
      </>
    );
  }

  function Scene() {
    return (
      <>
      <ambientLight intensity={0.1} />
  
      <directionalLight
        castShadow
        intensity={.8}
        position={[0, 5, 0]}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={15}
        shadow-normalBias={0.05}
      />

      <OrbitControls enableZoom enableRotate={false} />
      <Floor />
      <Environment preset="studio" environmentIntensity={0.3}/>
      <MorphBall />
      </>
    )
  }
  
  const Day27Project = () => {
    const { camera, gl } = useThree();
    const [sceneReady, setSceneReady] = useState(false);
  
    useEffect(() => {
      camera.position.set(10, 2, 10);
      gl.shadowMap.enabled = true;
      gl.shadowMap.type = THREE.PCFSoftShadowMap;
      setSceneReady(true);
    }, []);
  
    return (
      <>
        <PromptHint
          prompt="lifeform"
          hint="touch"
          color="aliceblue"
        />
        <CompletedSketch day={27} />
        {sceneReady && <Scene/>}
      </>
    );
  };

export default Day27Project;