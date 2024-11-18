/*
 * This is treated as an ES6 module that exports a single string for easy file loading
 * This is actually a GLSL vertex shader, treated as JavaScript by the browser
*/

export const modelVertSource = `#version 300 es

in vec3 inPosition;

void main() {
    gl_Position = vec4(inPosition, 1.0);
}

`;
