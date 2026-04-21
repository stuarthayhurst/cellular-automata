#version 300 es
precision highp float;
precision highp usampler2D;

uniform int gridCellWidth;
uniform int gridCellHeight;
uniform float gridCellsPerWidth;
uniform float gridOffsetX;
uniform float gridOffsetY;
uniform float aspectRatio;
uniform usampler2D gridCellDataTexture;

uniform vec3 baseColour;
uniform vec3 cellColour;
uniform vec3 aliasBaseColour;
uniform vec3 aliasCellColour;

uniform float borderSize;
uniform vec3 borderColour;
uniform vec3 backgroundBorderColour;
uniform bool aliasBackground;
uniform int widthPixels;

in vec2 position;
out vec4 outColour;

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

//Shared between modelFrag.glsl and gridFrag.glsl
vec3 weightCell(vec3 cellColour, vec3 baseColour, uint alive) {
    const float range = 3.0; //(2 ^ bitsPerChannel) - 1
    float weight = 1.0 - (1.0 / range) * float(alive - 1u);
    return cellColour * weight + baseColour * (1.0 - weight);
}

void main() {
    //Convert from [-1, 1] to [0, 1]
    float x = (position.x + 1.0) / 2.0;
    float y = (position.y + 1.0) / 2.0;

    //Calculate the number of cells in
    x *= gridCellsPerWidth;
    y *= gridCellsPerWidth / aspectRatio;

    //Split the grid offset into floating point and integer components
    float iGridOffsetX = 0.0;
    float iGridOffsetY = 0.0;
    float fGridOffsetX = modf(gridOffsetX, iGridOffsetX);
    float fGridOffsetY = modf(gridOffsetY, iGridOffsetY);

    //Get progress into each cell and its coordinate
    //Only apply the floating point offset to reduce size and minmise precision loss
    x -= fGridOffsetX;
    y -= fGridOffsetY;
    float cellProgressX = x - floor(x);
    float cellProgressY = y - floor(y);

    //Apply the 'integer' grid offset for indexing and background testing
    int gridIndexX = int(floor(x)) - int(iGridOffsetX);
    int gridIndexY = int(floor(y)) - int(iGridOffsetY);

    //Detect canvas background
    bool isBackground = gridIndexX < 0 || gridIndexY < 0 ||
                        gridIndexX > (gridCellWidth - 1) ||
                        gridIndexY > (gridCellHeight - 1);

    //Alias tiles, handle negative indices
    if (gridIndexX < 0) {
        gridIndexX = (-gridIndexX - 1) % gridCellWidth;
        gridIndexX = (gridCellWidth - 1) - gridIndexX;
    } else {
        gridIndexX %= gridCellWidth;
    }

    if (gridIndexY < 0) {
        gridIndexY = (-gridIndexY - 1) % gridCellHeight;
        gridIndexY = (gridCellHeight - 1) - gridIndexY;
    } else {
        gridIndexY %= gridCellHeight;
    }

    //Detect grid lines
    float borderDistanceX = min(1.0 - cellProgressX, cellProgressX);
    float borderDistanceY = min(1.0 - cellProgressY, cellProgressY);
    float borderDistance = min(borderDistanceX, borderDistanceY);

    //Smooth grid lines over pixels
    float pixelSize = gridCellsPerWidth / float(widthPixels);
    float borderCoeff = 0.0;
    if (borderSize >= borderDistance) {
        borderCoeff = 1.0;
    } else {
        float distanceOut = borderDistance - borderSize;
        if (distanceOut > pixelSize) {
          borderCoeff = 0.0;
        } else {
          borderCoeff = (pixelSize - distanceOut) / pixelSize;
        }
    }

    //Convert coordinate into an index, look up in the data texture
    int index = gridIndexX + (((gridCellHeight - 1) - gridIndexY) * gridCellWidth);
    uint alive = fetchDataBit(index, gridCellDataTexture);
    if (alive > 0u) {
        if (isBackground) {
            outColour = vec4(aliasCellColour, 1.0);
        } else {
            outColour = vec4(weightCell(cellColour, baseColour, alive), 1.0);
        }
    } else {
        if (isBackground) {
            outColour = vec4(aliasBaseColour, 1.0);
        } else {
            outColour = vec4(baseColour, 1.0);
        }
    }

    //Combine grid lines, grid display and background modes
    if (isBackground && !aliasBackground) {
        //Render grid lines over the canvas background
        outColour = vec4(backgroundBorderColour, 1.0) * borderCoeff;
    } else {
        //Render grid lines over existing outColour
        vec4 colourComponent = outColour * (1.0 - borderCoeff);
        vec4 borderComponent = vec4(borderColour, 1.0) * borderCoeff;
        outColour = colourComponent + borderComponent;
    }
}
