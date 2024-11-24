/*
 * This is treated as an ES6 module that exports a single string for easy file loading
 * This is actually a GLSL vertex shader, treated as JavaScript by the browser
*/

export const modelVertSource = `#version 300 es
precision lowp usampler2D;

in vec3 inPosition;
in vec3 inNormal;
in int inCellIndex;

out vec3 fragPos;
out vec3 normal;
flat out int cellIndexX;
flat out int cellIndexY;

uniform mat4 MVP;
uniform mat4 modelMatrix;
uniform usampler2D cellDataTexture;

void main() {
    int textureWidth = textureSize(cellDataTexture, 0).x;

    //Wrap cellIndexX every 4 * 8 widths (8 cells per byte, 4 bytes per pixel)
    cellIndexX = inCellIndex % (textureWidth * 4 * 8);

    //Increment cellIndexY every 4 * 8 widths (8 cells per byte, 4 bytes per pixel)
    cellIndexY = inCellIndex / (textureWidth * 4 * 8);

    normal = mat3(transpose(inverse(modelMatrix))) * inNormal;
    fragPos = vec3(modelMatrix * vec4(inPosition, 1.0));
    gl_Position = MVP * vec4(inPosition, 1.0);
}

`;
