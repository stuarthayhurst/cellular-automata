#version 300 es
precision highp usampler2D;

in vec3 inPosition;
in vec3 inNormal;
in int inCellIndex;

out vec3 fragPos;
out vec3 normal;
flat out uint alive;

uniform mat4 MVP;
uniform mat4 modelMatrix;
uniform usampler2D cellDataTexture;

uint fetchDataBit(int cellIndex, usampler2D dataTexture) {
    int textureWidth = textureSize(dataTexture, 0).x;

    //Wrap cellIndexX every 4 * 32 widths (32 cells per channel, 4 channels per pixel)
    int cellIndexX = cellIndex % (textureWidth * 4 * 32);

    //Increment cellIndexY every 4 * 32 widths (32 cells per channel, 4 channels per pixel)
    int cellIndexY = cellIndex / (textureWidth * 4 * 32);

    //Fetch the pixel the cell is in
    uvec4 cellQuad = texelFetch(dataTexture, ivec2(cellIndexX / (4 * 32), cellIndexY), 0);

    //Decide which byte of the pixel to look at
    int packing = cellIndexX % (4 * 32);
    int byte = packing / 32;

    //Fetch the specific byte
    //This is slow for a GPU, but packing gives 4x better memory usage
    uint fetchedByte;
    if (byte == 0) {
        fetchedByte = cellQuad.x;
    } else if (byte == 1) {
        fetchedByte = cellQuad.y;
    } else if (byte == 2) {
        fetchedByte = cellQuad.z;
    } else {
        fetchedByte = cellQuad.w;
    }

    //Decide which bit of the byte to look at and fetch it
    int bit = packing % 32;
    return fetchedByte & uint((1 << bit));
}

void main() {
    alive = fetchDataBit(inCellIndex, cellDataTexture);

    normal = mat3(transpose(inverse(modelMatrix))) * inNormal;
    fragPos = vec3(modelMatrix * vec4(inPosition, 1.0));
    gl_Position = MVP * vec4(inPosition, 1.0);
}
