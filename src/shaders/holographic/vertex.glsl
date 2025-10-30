uniform float uTime;

varying vec3 vPosition;
varying vec3 vNormal;
// to become a random number from 0.0 to 1.0 => random2D function
#include ../includes/random2D.glsl

void main(){
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    
    // Glitch Effect:
    float glitchTime = uTime - modelPosition.y;
    // glitchStength var => to control how strong the glitch is
    float glitchStrength = sin(glitchTime) + sin(glitchTime * 3.45) + sin(glitchTime * 8.76);
    glitchStrength /= 3.0;
    //to apply a smoothstep from 0.3 to 1.0
  
   glitchStrength = smoothstep(0.3, 1.0, glitchStrength);
    // to lower the effect:
    glitchStrength *= 0.25;
   modelPosition.x += (random2D(modelPosition.xz + uTime) - 0.5) * glitchStrength;
   modelPosition.z += (random2D(modelPosition.zx + uTime) - 0.5) * glitchStrength;


    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    // create a modelNormal, and apply the modelMatrix to it.The translation won't be applied
    vec4 modelNormal = modelMatrix * vec4(normal, 0.0);

    //Final position
    gl_Position = projectedPosition;

    //Varyings
    vPosition = modelPosition.xyz;
    vNormal = modelNormal.xyz;
}