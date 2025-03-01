#version 300 es
precision highp usampler2D;
precision highp int;

in vec3 inPosition;
in vec3 inNormal;
in vec3 inOrigin;
in int inCellIndex;

out vec3 fragPos;
out vec3 normal;
flat out uint alive;
flat out uint mapped;

uniform mat4 MVP;
uniform mat4 modelMatrix;
uniform usampler2D cellDataTexture;
uniform int activeCellMode;
uniform float raisedCellHeight;

//Shared between modelVert.glsl and gridFrag.glsl
uint fetchDataBit(int cellIndex, usampler2D dataTexture) {
    const int channels = 4;
    const int channelWidth = 32;
    const int bitsPerChannel = 2;

    const uint channelBlockMask = 3u; //(2 ^ bitsPerChannel) - 1
    const int cellsPerPixel = channels * (channelWidth / bitsPerChannel);

    //Skip unmapped cells
    if (cellIndex == -1) {
        return 0u;
    }

    int textureWidth = textureSize(dataTexture, 0).x;

    //Components of the cell index, accounting for texture geometry
    int cellIndexX = cellIndex % (textureWidth * cellsPerPixel);
    int cellIndexY = cellIndex / (textureWidth * cellsPerPixel);

    //Fetch the pixel the cell is in
    uvec4 cellQuad = texelFetch(dataTexture, ivec2(cellIndexX / cellsPerPixel, cellIndexY), 0);

    //Decide which cell of the pixel to look at
    int cellNumber = cellIndexX % cellsPerPixel;

    //Decide which channel to look in
    int channel = (cellNumber * bitsPerChannel) / channelWidth;

    //Decide which bit of the channel to look at
    int bit = (cellNumber * bitsPerChannel) % channelWidth;

    //Fetch the channel and extract the chosen bit(s), then shift back down
    return (cellQuad[channel] & (channelBlockMask << bit)) >> bit;
}

void main() {
    alive = fetchDataBit(inCellIndex, cellDataTexture);
    if (inCellIndex == -1) {
        mapped = 0u;
    } else {
        mapped = 1u;
    }

    //Raise the cells if we're in the second pass
    vec3 position = inPosition;
    if (activeCellMode == 2 && alive > 0u) {
        position = position + normalize(position - inOrigin) * raisedCellHeight;
    }

    normal = mat3(transpose(inverse(modelMatrix))) * inNormal;
    fragPos = vec3(modelMatrix * vec4(position, 1.0));
    gl_Position = MVP * vec4(position, 1.0);
}
