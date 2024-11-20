/*
 * This is treated as an ES6 module that exports a single string for easy file loading
 * This is actually a GLSL fragment shader, treated as JavaScript by the browser
*/

export const modelFragSource = `#version 300 es
precision mediump float;

out vec4 outColour;

void main() {
    outColour = vec4(1, 0, 0, 1);
}

`;
