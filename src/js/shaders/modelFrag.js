/*
 * This is treated as an ES6 module that exports a single string for easy file loading
 * This is actually a GLSL fragment shader, treated as JavaScript by the browser
*/

export const modelFragSource = `#version 300 es
precision mediump float;
precision lowp usampler2D;

in vec3 fragPos;
in vec3 normal;
flat in int cellIndexX;
flat in int cellIndexY;

out vec4 outColour;

uniform vec3 cameraPos;
uniform usampler2D cellDataTexture;

float ambientStrength = 0.1;
float diffuseStrength = 1.5;
float specularStrength = 0.5;
vec3 baseColour = vec3(1, 0, 0);
vec3 cellColour = vec3(0, 1, 1);

void main() {
    //Fetch the pixel the cell is in
    uvec4 cellQuad = texelFetch(cellDataTexture, ivec2(cellIndexX / (4 * 8), cellIndexY), 0);

    //Decide which byte of the pixel to look at
    int packing = cellIndexX % (4 * 8);
    int byte = packing / 8;

    //Fetch the specific byte
    //This is slow for a GPU, but packing gives 4x better memory usage
    uint alive;
    if (byte == 0) {
        alive = cellQuad.x;
    } else if (byte == 1) {
        alive = cellQuad.y;
    } else if (byte == 2) {
        alive = cellQuad.z;
    } else {
        alive = cellQuad.w;
    }

    //Decide which bit of the byte to look at and fetch it
    int bit = packing % 8;
    alive = alive & uint((1 << bit));

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
    float specular = pow(max(dot(cameraPos, reflectDir), 0.0), 32.0);
    specular *= specularStrength;

    //Combine results
    outColour = vec4((ambientStrength + diffuse + specular) * baseColour, 1.0);
}

`;
