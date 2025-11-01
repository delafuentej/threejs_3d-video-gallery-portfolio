uniform float uTime;
uniform vec3 uColor;

varying vec3 vPosition;
varying vec3 vNormal;


void main(){
    // renormalize Normal
    vec3 normal = normalize(vNormal);

    if(!gl_FrontFacing) normal *= -1.0;

    //1.Stripes
    float stripes = mod((vPosition.y - uTime * 0.03)  * 20.0, 1.0);
    // to make sharper gradient:
    stripes = pow(stripes, 3.0);

    //2.Fresnel
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    //float fresnel = dot(viewDirection, vNormal);
     float fresnel = dot(viewDirection, normal) + 1.0;
     // apply a pow to fresnel to make it sharper
     fresnel = pow(fresnel, 2.0);


      //4. Falloff Effect.
    float falloff = smoothstep(0.8, 0.0, fresnel);


     //3.Holographic- Combine stripes & fresnel
     float holographic = stripes * fresnel;
     //add the fresnel on top of it 
     holographic += fresnel * 1.25;
     holographic *= falloff;


   

    //Final color
    gl_FragColor = vec4(uColor, holographic);
    // gl_FragColor = vec4(vNormal, 1.0);

    // #include <tonemapping_fragment>
    // #include <colorspace_fragment>
}