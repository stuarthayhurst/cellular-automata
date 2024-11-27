import { modelVertSource } from "./shaders/modelVert.js";
import { modelFragSource } from "./shaders/modelFrag.js";
import { generateSkeleton, calculateMesh, calculateNormals } from "./mesh.js";
import { stateModel } from "./stateModel.js";
import { canvas } from "./ui/ui.js";

function compileShader(context, shaderType, shaderSource) {
    //Create, load and compile the shader
    let shader = context.createShader(shaderType);
    context.shaderSource(shader, shaderSource);
    context.compileShader(shader);

    //Check compile was successful
    if (context.getShaderParameter(shader, context.COMPILE_STATUS)) {
        return shader;
    } else {
        console.log("Failed to compile shader");
        console.log(context.getShaderInfoLog(shader));
        context.deleteShader(shader);
    }
}

function linkProgram(context, vertexShader, fragShader) {
    //Create the program then attach and link shaders
    let program = context.createProgram();
    context.attachShader(program, vertexShader);
    context.attachShader(program, fragShader);
    context.linkProgram(program);

    //Check link was successful
    if (context.getProgramParameter(program, context.LINK_STATUS)) {
        //Clean up shaders and return
        context.deleteShader(vertexShader);
        context.deleteShader(fragShader);
        return program;
    } else {
        console.log("Failed to link program");
        console.log(context.getProgramInfoLog(program));
        context.deleteProgram(program);
    }
}

function calculateProjectionMatrix(fieldOfView, height, width) {
    const projectionMatrix = glMatrix.mat4.create();
    glMatrix.mat4.perspective(
        projectionMatrix,
        glMatrix.glMatrix.toRadian(fieldOfView),
        width / height,
        0.1,
        null,
    );

    return projectionMatrix;
}

function calculateViewMatrix(cameraPosition) {
    const viewMatrix = glMatrix.mat4.create();
    const cameraTarget = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);
    glMatrix.mat4.lookAt(
        viewMatrix,
        cameraPosition,
        cameraTarget,
        glMatrix.vec3.fromValues(0.0, 1.0, 0.0),
    );

    return viewMatrix;
}

function calculateModelMatrix(scale) {
    const modelMatrix = glMatrix.mat4.create();
    glMatrix.mat4.identity(modelMatrix);
    glMatrix.mat4.scale(
        modelMatrix,
        modelMatrix,
        glMatrix.vec3.fromValues(scale, scale, scale),
    );

    return modelMatrix;
}

function resetCanvas(context, height, width) {
    context.viewport(0, 0, width, height);
    context.clearColor(0, 0, 0, 0);
    context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
}

/*
 * Bind an existing data texture, then fill it
 * Pack the cell data into each bit of a byte, then pack 4 bytes per pixel
 * Use both dimensions of a 2D texture
 * If this needs even higher density, we can use 3D textures
 *   That's not really worth it unless we absolutely have to, due to the extra complexity
 */
function setDataTexture(context, texture, rawData) {
    //Calculate rows and columns required to store the bytes
    const minPixels = Math.ceil(rawData.length / (4 * 8));
    const rows = Math.ceil(minPixels / context.MAX_TEXTURE_SIZE);
    let cols = context.MAX_TEXTURE_SIZE;
    if (rows == 1) {
        cols = minPixels % context.MAX_TEXTURE_SIZE;
    }

    if (rows > context.MAX_TEXTURE_SIZE) {
        console.log("Max texture size exceeded, refusing to upload");
        return;
    }

    //Resize the buffer to match the rows and columns
    let size = rows * cols * 4;
    let data = new Uint8Array(size);

    for (let i = 0; i < rawData.length; i++) {
        data[Math.floor(i / 8)] |= rawData[i] << i % 8;
    }

    //Data is treated as 4 separate cells per pixel, one per colour channel
    context.bindTexture(context.TEXTURE_2D, texture);
    context.texImage2D(
        context.TEXTURE_2D,
        0,
        context.RGBA8UI,
        cols,
        rows,
        0,
        context.RGBA_INTEGER,
        context.UNSIGNED_BYTE,
        data,
    );
}

//Create a texture for storing data, bind it, fill it and return it
function createDataTexture(context, data) {
    //Upload data to a texture
    const texture = context.createTexture();
    setDataTexture(context, texture, data);

    //Disable filtering
    context.texParameteri(
        context.TEXTURE_2D,
        context.TEXTURE_MIN_FILTER,
        context.NEAREST,
    );
    context.texParameteri(
        context.TEXTURE_2D,
        context.TEXTURE_MAG_FILTER,
        context.NEAREST,
    );

    return texture;
}

/*
 * Generate interleaved mesh, normal and index data for rendering
 * Format: vec3f32(position), vec3f32(normal) int32(index)
 */
function generateMesh(height, width) {
    const volumeDiameter = 0.55;
    const ringRadius = 1 - volumeDiameter / 2;
    let meshWidthScale = 1;
    let meshHeightScale = 1;
    let minDimension = 100;

    //Scale the mesh up to handle tiny grids
    if (height < minDimension) {
        meshHeightScale = Math.ceil(minDimension / height);
    }
    if (width < minDimension) {
        meshWidthScale = Math.ceil(minDimension / width);
    }

    //Generate the mesh, indices and normals
    const [skeleton, skeletonOrigins] = generateSkeleton(
        width,
        height,
        ringRadius,
        volumeDiameter,
        meshWidthScale,
        meshHeightScale,
    );
    const [mesh, origins, indices] = calculateMesh(
        skeleton,
        skeletonOrigins,
        width,
        height,
        meshWidthScale,
        meshHeightScale,
    );
    const normals = calculateNormals(mesh, origins);

    //Size of each buffer * their 3 uses * 4 bytes per element
    const bufferSize = (mesh.length + normals.length + indices.length) * 3 * 4;
    const vertexBlockSize = 4 * 7;

    let meshData = new ArrayBuffer(bufferSize);
    let floatView = new Float32Array(meshData);
    let intView = new Int32Array(meshData);

    //Write the data to the mesh array using a correctly typed buffer view
    for (let i = 0; i < mesh.length; i++) {
        for (let j = 0; j < 3; j++) {
            floatView[i * 7 + j] = mesh[i][j];
        }

        for (let j = 0; j < 3; j++) {
            floatView[i * 7 + j + 3] = normals[i][j];
        }

        intView[i * 7 + 6] = indices[Math.floor(i / 3)];
    }

    return [meshData, vertexBlockSize];
}

//Bind the mesh buffer and copy the data into it
function fillMeshBuffer(context, meshBuffer, meshData) {
    context.bindBuffer(context.ARRAY_BUFFER, meshBuffer);
    context.bufferData(context.ARRAY_BUFFER, meshData, context.STATIC_DRAW);
}

//Prepare context from canvas element
const context = canvas.getContext("webgl2");
if (!context) {
    console.log("No WebGL2 support detected, good luck");
} else {
    const maxSize = context.MAX_TEXTURE_SIZE ** 2 * 4 * 8;
    console.log(
        "WebGL2 support detected, width x height must not exceed " + maxSize,
    );
    const square = Math.floor(Math.sqrt(maxSize));
    console.log("Maximum square dimensions are " + square + " x " + square);
}

//Reset canvas while loading
resetCanvas(context, context.canvas.height, context.canvas.width);

//Compile the shaders
const modelVertShader = compileShader(
    context,
    context.VERTEX_SHADER,
    modelVertSource,
);
const modelFragShader = compileShader(
    context,
    context.FRAGMENT_SHADER,
    modelFragSource,
);

//Link shaders into a program
const modelProgram = linkProgram(context, modelVertShader, modelFragShader);
context.useProgram(modelProgram);

//Create and bind a buffer for the mesh
let meshBuffer = context.createBuffer();
context.bindBuffer(context.ARRAY_BUFFER, meshBuffer);

//Fetch shader attribute locations
const meshAttribLocation = context.getAttribLocation(
    modelProgram,
    "inPosition",
);
const normalAttribLocation = context.getAttribLocation(
    modelProgram,
    "inNormal",
);
const cellIndexAttribLocation = context.getAttribLocation(
    modelProgram,
    "inCellIndex",
);

//Create a vertex array object for the mesh, define the positions and normals
let meshVAO = context.createVertexArray();
context.bindVertexArray(meshVAO);
context.vertexAttribPointer(
    meshAttribLocation,
    3, //Number of components
    context.FLOAT, //Data type
    false, //Normalisation toggle
    7 * 4, //Stride - (1 * 1) * sizeof(int) + (2 * 3) * sizeof(float)
    0, //Data offset - (0 * 3) * sizeof(float)
);
context.enableVertexAttribArray(meshAttribLocation);
context.vertexAttribPointer(
    normalAttribLocation,
    3, //Number of components
    context.FLOAT, //Data type
    false, //Normalisation toggle
    7 * 4, //Stride - (1 * 1) * sizeof(int) + (2 * 3) * sizeof(float)
    3 * 4, //Data offset - (1 * 3) * sizeof(float)
);
context.enableVertexAttribArray(normalAttribLocation);
context.vertexAttribIPointer(
    cellIndexAttribLocation,
    1, //Number of components
    context.INT, //Data type
    7 * 4, //Stride - (1 * 1) * sizeof(int) + (2 * 3) * sizeof(float)
    6 * 4, //Data offset - (2 * 3) * sizeof(float)
);
context.enableVertexAttribArray(cellIndexAttribLocation);

//Get shader uniform locations
const MVPLocation = context.getUniformLocation(modelProgram, "MVP");
const modelMatrixLocation = context.getUniformLocation(
    modelProgram,
    "modelMatrix",
);
const cameraPosLocation = context.getUniformLocation(modelProgram, "cameraPos");
const cellDataTexLocation = context.getUniformLocation(
    modelProgram,
    "cellDataTexture",
);

//Enable depth testing
context.enable(context.DEPTH_TEST);
context.depthFunc(context.LEQUAL);

//Enable back-face culling
context.enable(context.CULL_FACE);
context.cullFace(context.BACK);

let lastCellWidth = 0;
let lastCellHeight = 0;
let cellDataTexture = 0;
let vertexCount = 0;

function drawFrame() {
    //Fetch values once to avoid changes during rendering
    const fieldOfView = stateModel.fieldOfView;
    const cameraPosition = stateModel.cameraPosition;
    const canvasHeight = context.canvas.height;
    const canvasWidth = context.canvas.width;

    //Fetch simulation data
    const cellWidth = stateModel.cellGridWidth;
    const cellHeight = stateModel.cellGridHeight;
    const cellData = new Uint8Array(stateModel.cells);

    //Data doesn't match dimensions, try again later
    if (cellWidth * cellHeight != cellData.length) {
        window.requestAnimationFrame(drawFrame);
        return;
    }

    //Reset the canvas
    resetCanvas(context, canvasHeight, canvasWidth);

    //Use the model shader and the vertex array object
    context.useProgram(modelProgram);
    context.bindVertexArray(meshVAO);

    //Dimensions have changed, recreate buffers
    if (lastCellWidth != cellWidth || lastCellHeight != cellHeight) {
        //Generate the mesh data and fill its buffer
        let [meshData, vertexBlockSize] = generateMesh(cellHeight, cellWidth);
        fillMeshBuffer(context, meshBuffer, meshData);
        vertexCount = meshData.byteLength / vertexBlockSize;

        //Clear existing data
        if (cellDataTexture != 0) {
            context.deleteTexture(cellDataTexture);
            cellDataTexture = 0;
        }

        //Create the texture, fill it with data and bind it
        cellDataTexture = createDataTexture(context, cellData);
        context.bindTexture(context.TEXTURE_2D, cellDataTexture);

        lastCellWidth = cellWidth;
        lastCellHeight = cellHeight;
    } else {
        //Just update the cell data if the size hasn't changed, then bind the texture
        setDataTexture(context, cellDataTexture, cellData);
    }

    //Calculate the projection matrix
    const projectionMatrix = calculateProjectionMatrix(
        fieldOfView,
        canvasHeight,
        canvasWidth,
    );

    //Calculate the view matrix
    const viewMatrix = calculateViewMatrix(cameraPosition);

    /* Calculate the model matrix
     * For a single model, rotation and translation are better handled by a camera
     */
    const modelMatrix = calculateModelMatrix(1.0);

    //Combine matrices into a precalculated MVP matrix
    const MVP = glMatrix.mat4.create();
    glMatrix.mat4.multiply(MVP, projectionMatrix, viewMatrix);
    glMatrix.mat4.multiply(MVP, MVP, modelMatrix);

    //Enable the data texture
    context.activeTexture(context.TEXTURE0);
    context.uniform1i(cellDataTexLocation, 0);

    //Send the remaining uniforms and draw the mesh
    //TODO: Swap to using element buffers and index the meshes
    context.uniform3fv(cameraPosLocation, cameraPosition);
    context.uniformMatrix4fv(MVPLocation, false, MVP);
    context.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
    context.bindBuffer(context.ARRAY_BUFFER, meshBuffer);
    context.drawArrays(context.TRIANGLES, 0, vertexCount);

    //Loop
    window.requestAnimationFrame(drawFrame);
}

//Kick off rendering, tied to browser framerate
window.requestAnimationFrame(drawFrame);
