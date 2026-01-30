// spirograph_mutation.glsl
#ifdef GL_ES
precision highp float;
#endif

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform int uPattern;

varying vec2 vUv;

// --------------------------------------------------------
// Utility
// --------------------------------------------------------

float hash11(float p) {
    p = fract(p * 0.1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}
float dot2(vec2 p) {
    return dot(p, p);
}
float noise2(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    float a = hash11(dot(i, vec2(1.0, 57.0)));
    float b = hash11(dot(i + vec2(1.0, 0.0), vec2(1.0, 57.0)));
    float c = hash11(dot(i + vec2(0.0, 1.0), vec2(1.0, 57.0)));
    float d = hash11(dot(i + vec2(1.0, 1.0), vec2(1.0, 57.0)));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// --------------------------------------------------------
// Box SDF
// --------------------------------------------------------

float sdBox(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

float sdPentagram(in vec2 p, in float r )
{
    const float k1x = 0.809016994; // cos(π/ 5) = ¼(√5+1)
    const float k2x = 0.309016994; // sin(π/10) = ¼(√5-1)
    const float k1y = 0.587785252; // sin(π/ 5) = ¼√(10-2√5)
    const float k2y = 0.951056516; // cos(π/10) = ¼√(10+2√5)
    const float k1z = 0.726542528; // tan(π/ 5) = √(5-2√5)
    const vec2  v1  = vec2( k1x,-k1y);
    const vec2  v2  = vec2(-k1x,-k1y);
    const vec2  v3  = vec2( k2x,-k2y);
    
    p.x = abs(p.x);
    p -= 2.0*max(dot(v1,p),0.0)*v1;
    p -= 2.0*max(dot(v2,p),0.0)*v2;
    p.x = abs(p.x);
    p.y -= r;
    return length(p-v3*clamp(dot(p,v3),0.0,k1z*r))
           * sign(p.y*v3.x-p.x*v3.y);
}

float sdBlobbyCross( in vec2 pos, float he )
{
    pos = abs(pos);
    pos = vec2(abs(pos.x-pos.y),1.0-pos.x-pos.y)/sqrt(2.0);

    float p = (he-pos.y-0.25/he)/(6.0*he);
    float q = pos.x/(he*he*16.0);
    float h = q*q - p*p*p;
    
    float x;
    if( h>0.0 ) { float r = sqrt(h); x = pow(q+r,1.0/3.0)-pow(abs(q-r),1.0/3.0)*sign(r-q); }
    else        { float r = sqrt(p); x = 2.0*r*cos(acos(q/(p*r))/3.0); }
    x = min(x,sqrt(2.0)/2.0);
    
    vec2 z = vec2(x,he*(1.0-2.0*x*x)) - pos;
    return length(z) * sign(z.y);
}

float sdCircleWave( in vec2 p, in float tb, in float ra )
{
    tb = 3.1415927*5.0/6.0*max(tb,0.0001);
    vec2 co = ra*vec2(sin(tb),cos(tb));
    p.x = abs(mod(p.x,co.x*4.0)-co.x*2.0);
    vec2  p1 = p;
    vec2  p2 = vec2(abs(p.x-2.0*co.x),-p.y+2.0*co.y);
    float d1 = ((co.y*p1.x>co.x*p1.y) ? length(p1-co) : abs(length(p1)-ra));
    float d2 = ((co.y*p2.x>co.x*p2.y) ? length(p2-co) : abs(length(p2)-ra));
    return min(d1, d2); 
}

float sdTunnel( in vec2 p, in vec2 wh )
{
    p.x = abs(p.x); p.y = -p.y;
    vec2 q = p - wh;

    float d1 = dot2(vec2(max(q.x,0.0),q.y));
    q.x = (p.y>0.0) ? q.x : length(p)-wh.x;
    float d2 = dot2(vec2(q.x,max(q.y,0.0)));
    float d = sqrt( min(d1,d2) );
    
    return (max(q.x,q.y)<0.0) ? -d : d;
}

float strokeSDF(float d, float w) {
    return 1.0 - smoothstep(w, w + 0.002, abs(d));
}

// --------------------------------------------------------
// Main
// --------------------------------------------------------

void main() {
    vec2 uv = vUv - 0.5;
    uv.x *= uResolution.x / uResolution.y;

    float t = uTime * 0.3;

    vec3 col = vec3(0.02, 0.02, 0.04);

    vec2 p = uv * 2.0;

    const int N = 70;

    for (int i = 0; i < N; i++) {
        float fi = float(i);
        float m = length(uMouse-0.5)* fi / float(N - 1);

        // ------------------------------
        // Mouse influence
        // ------------------------------
        float rotInfluence  = pow(10., float(uPattern+1))*(uMouse.x - 0.5) * 2.0;   // -1..1 rotation direction & strength
        float sizeInfluence = uMouse.y;                // 0..1 controls growth

        // ------------------------------
        // Box size
        // ------------------------------
        float baseSize = 0.25;
        float sizeGrowth = mix(0.05, 10.5, sizeInfluence);
        vec2 halfSize = vec2(baseSize + sizeGrowth * m*m);

        // ------------------------------
        // Rotation
        // ------------------------------
        float ROTATION_SCALE = 3.5; // tweakable
        float angle = m * rotInfluence * ROTATION_SCALE;
        float ca = cos(angle), sa = sin(angle);

        // ------------------------------
        // Noise warp
        // ------------------------------
        vec2 q = p;
        float wn = noise2(q * (3.0 + m * 4.0) + fi * 10.0 + t);
        q += vec2(cos(wn * 6.2831), sin(wn * 6.2831)) * m * 0.0025;

        // Apply rotation
        q = mat2(ca, -sa, sa, ca) * q;

        float thickness = mix(0.01, 0.04, m);
        float d;
        float line;

        // Shared parameters for shapes
        float radius = halfSize.x;
        float tb = m * 1.5 + 0.2; // for circle wave

         d = sdCircleWave(q, tb, radius);
            line = strokeSDF(d, thickness);


        // ------------------------------
        // Color
        // ------------------------------
        vec3 baseColor = vec3(
            0.5 + 0.5 * sin(fi * 1.7*pow(8., float(uPattern+1)) + 0.3*length(uMouse)),
            0.5 + 0.5 * sin(fi * 1.2*pow(8., float(uPattern+1)) + 10.1*uMouse.x),
            0.5 + 0.5 * sin(fi * 2.3*pow(8., float(uPattern+1))+ 20.7*uMouse.y)
        );

        // Minimum brightness so early boxes aren't dark
        baseColor = max(baseColor, vec3(0.25));

        // Mutation affects saturation & brightness
        float satBoost = mix(0.8, 1.4, m);
        float valBoost = mix(0.9, 1.6, m);
        baseColor = clamp(baseColor * satBoost, 0.0, 1.5);
        baseColor *= valBoost;

        // Stronger opacity for early boxes
        float lineOpacity = mix(0.2, 0.25, m);

        col = mix(col, baseColor, line * lineOpacity);
    }

    // Vignette
    float v = length(uv);
    col *= smoothstep(1.2, 0.4, v);

    gl_FragColor = vec4(col, 1.0);
}