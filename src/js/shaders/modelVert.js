/*
 * This is treated as an ES6 module that exports a single string for easy file loading
 * This is actually a GLSL vertex shader, treated as JavaScript by the browser
*/

export const modelVertSource = `#version 300 es

in vec3 inPosition;
in vec3 inNormal;

out vec3 fragPos;
out vec3 normal;

uniform mat4 MVP;
uniform mat4 modelMatrix;

void main() {
    normal = mat3(transpose(inverse(modelMatrix))) * inNormal;
    fragPos = vec3(modelMatrix * vec4(inPosition, 1.0));
    gl_Position = MVP * vec4(inPosition, 1.0);
}

`;
