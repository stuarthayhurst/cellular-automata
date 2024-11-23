/*
 * This is treated as an ES6 module that exports a single string for easy file loading
 * This is actually a GLSL vertex shader, treated as JavaScript by the browser
*/

export const modelVertSource = `#version 300 es

in vec3 inPosition;
in vec3 inNormal;
in float inCellIndex;

out vec3 fragPos;
out vec3 normal;
flat out ivec2 cellCoord;

uniform mat4 MVP;
uniform mat4 modelMatrix;

void main() {
    cellCoord = ivec2(int(inCellIndex), 0);

    normal = mat3(transpose(inverse(modelMatrix))) * inNormal;
    fragPos = vec3(modelMatrix * vec4(inPosition, 1.0));
    gl_Position = MVP * vec4(inPosition, 1.0);
}

`;
