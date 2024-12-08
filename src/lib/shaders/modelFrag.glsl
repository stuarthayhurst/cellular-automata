#version 300 es
precision mediump float;

in vec3 fragPos;
in vec3 normal;
flat in uint alive;

out vec4 outColour;

uniform vec3 cameraPos;

float ambientStrength = 0.3;
float diffuseStrength = 0.6;
float specularStrength = 0.1;
vec3 baseColour = vec3(1, 0, 0);
vec3 cellColour = vec3(0, 1, 1);

void main() {
    //Check if the cell is active, return early if it is
    if (alive > uint(0)) {
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
    float specular = pow(max(dot(cameraPos, reflectDir), 0.0), 2.0);
    specular *= specularStrength;

    //Combine results
    outColour = vec4((ambientStrength + diffuse + specular) * baseColour, 1.0);
}
