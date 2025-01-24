#version 300 es
precision mediump float;
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

uniform float borderSize;
uniform vec3 borderColour;

in vec2 position;
out vec4 outColour;

//Shared between modelVert.glsl and gridFrag.glsl
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
    //Convert from [-1, 1] to [0, 1]
    float x = (position.x + 1.0) / 2.0;
    float y = (position.y + 1.0) / 2.0;

    //Calculate the number of cells in
    x *= gridCellsPerWidth;
    y *= gridCellsPerWidth / aspectRatio;

    //Apply the grid offset
    x -= gridOffsetX;
    y -= gridOffsetY;

    //Get progress into each cell and its coordinate
    float cellProgressX = x - floor(x);
    float cellProgressY = y - floor(y);
    int gridIndexX = int(floor(x));
    int gridIndexY = int(floor(y));

    //Check for grid border
    bool isBorder = false;
    if (cellProgressX < borderSize || cellProgressY < borderSize ||
        cellProgressX > (1.0 - borderSize) || cellProgressY > (1.0 - borderSize)) {
        outColour = vec4(borderColour, 1.0);
        isBorder = true;
    }

    //Check for grid boundaries
    if (x < -borderSize || y < -borderSize ||
        x > float(gridCellWidth) + borderSize || y > float(gridCellHeight) + borderSize) {
        discard;
    } else {
      //Return if we already have the colour
      if (isBorder) {
        return;
      }
    }

    //Convert coordinate into an index, look up in the data texture
    int index = gridIndexX + ((gridCellHeight - gridIndexY) * gridCellWidth);
    uint alive = fetchDataBit(index, gridCellDataTexture);
    if (alive > uint(0)) {
      outColour = vec4(cellColour, 1.0);
    } else {
      outColour = vec4(baseColour, 1.0);
    }
}
