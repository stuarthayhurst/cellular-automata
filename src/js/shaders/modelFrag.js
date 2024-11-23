/*
 * This is treated as an ES6 module that exports a single string for easy file loading
 * This is actually a GLSL fragment shader, treated as JavaScript by the browser
*/

export const modelFragSource = `#version 300 es
precision mediump float;

in vec3 fragPos;
in vec3 normal;
flat in ivec2 cellCoord;

out vec4 outColour;

uniform vec3 cameraPos;
uniform sampler2D cellDataTexture;

float ambientStrength = 0.1;
float diffuseStrength = 1.5;
float specularStrength = 0.5;
vec3 baseColour = vec3(1, 0, 0);
vec3 cellColour = vec3(0, 1, 1);

void main() {
  //Set fragments within an active cell
  if (texelFetch(cellDataTexture, cellCoord, 0).x > 0.0) {
    outColour = vec4(cellColour, 1.0);
    return;
  }

  vec3 lightPos = cameraPos;

  //Diffuse lighting
  vec3 normNormal = normalize(normal);
  vec3 lightDir = normalize(lightPos - fragPos);
  float diffuse = max(dot(normNormal, lightDir), 0.0);
  diffuse *= diffuseStrength;

  //Specular lighting
  vec3 viewDir = normalize(cameraPos - fragPos);
  vec3 reflectDir = reflect(-lightDir, normNormal);
  float specular = pow(max(dot(cameraPos, reflectDir), 0.0), 32.0);
  specular *= specularStrength;

  //Combine results
  outColour = vec4((ambientStrength + diffuse + specular) * baseColour, 1.0);
}


`;
