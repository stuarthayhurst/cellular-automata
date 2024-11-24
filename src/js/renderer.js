import { modelVertSource } from "./shaders/modelVert.js";
import { modelFragSource } from "./shaders/modelFrag.js";
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

/* TODO:
 * This is horrible, I know. It's going to be replaced with generated mesh data
 * But for now, hard-coding a cube is the easiest way to set the rest of the code set up
 * In future, check if settings changed and then either (re)generate a mesh, or use a cached copy
 * Format: vec3(position), vec3(normal), int(index)
 */
let meshData = new ArrayBuffer(1008);
let floatMeshData = new Float32Array(meshData);
let uintMeshData = new Int32Array(meshData);

// prettier-ignore
let floatData = [
    -0.5, -0.5, -0.5,  0.0,  0.0, -1.0,
     0.5, -0.5, -0.5,  0.0,  0.0, -1.0,
     0.5,  0.5, -0.5,  0.0,  0.0, -1.0,
     0.5,  0.5, -0.5,  0.0,  0.0, -1.0,
    -0.5,  0.5, -0.5,  0.0,  0.0, -1.0,
    -0.5, -0.5, -0.5,  0.0,  0.0, -1.0,

    -0.5, -0.5,  0.5,  0.0,  0.0,  1.0,
     0.5, -0.5,  0.5,  0.0,  0.0,  1.0,
     0.5,  0.5,  0.5,  0.0,  0.0,  1.0,
     0.5,  0.5,  0.5,  0.0,  0.0,  1.0,
    -0.5,  0.5,  0.5,  0.0,  0.0,  1.0,
    -0.5, -0.5,  0.5,  0.0,  0.0,  1.0,

    -0.5,  0.5,  0.5, -1.0,  0.0,  0.0,
    -0.5,  0.5, -0.5, -1.0,  0.0,  0.0,
    -0.5, -0.5, -0.5, -1.0,  0.0,  0.0,
    -0.5, -0.5, -0.5, -1.0,  0.0,  0.0,
    -0.5, -0.5,  0.5, -1.0,  0.0,  0.0,
    -0.5,  0.5,  0.5, -1.0,  0.0,  0.0,

     0.5,  0.5,  0.5,  1.0,  0.0,  0.0,
     0.5,  0.5, -0.5,  1.0,  0.0,  0.0,
     0.5, -0.5, -0.5,  1.0,  0.0,  0.0,
     0.5, -0.5, -0.5,  1.0,  0.0,  0.0,
     0.5, -0.5,  0.5,  1.0,  0.0,  0.0,
     0.5,  0.5,  0.5,  1.0,  0.0,  0.0,

    -0.5, -0.5, -0.5,  0.0, -1.0,  0.0,
     0.5, -0.5, -0.5,  0.0, -1.0,  0.0,
     0.5, -0.5,  0.5,  0.0, -1.0,  0.0,
     0.5, -0.5,  0.5,  0.0, -1.0,  0.0,
    -0.5, -0.5,  0.5,  0.0, -1.0,  0.0,
    -0.5, -0.5, -0.5,  0.0, -1.0,  0.0,

    -0.5,  0.5, -0.5,  0.0,  1.0,  0.0,
     0.5,  0.5, -0.5,  0.0,  1.0,  0.0,
     0.5,  0.5,  0.5,  0.0,  1.0,  0.0,
     0.5,  0.5,  0.5,  0.0,  1.0,  0.0,
    -0.5,  0.5,  0.5,  0.0,  1.0,  0.0,
    -0.5,  0.5, -0.5,  0.0,  1.0,  0.0,
];

// prettier-ignore
let indices = [
    0, 0, 0, 0, 0, 0,
    1, 1, 1, 1, 1, 1,
    2, 2, 2, 2, 2, 2,
    3, 3, 3, 3, 3, 3,
    4, 4, 4, 4, 4, 4,
    5, 5, 5, 5, 5, 5,
];
const vertexBlockSize = 4 * 7;

//Write the data to the mesh using a correctly typed buffer view
for (let i = 0; i < meshData.byteLength / vertexBlockSize; i++) {
    for (let j = 0; j < 6; j++) {
        floatMeshData[i * 7 + j] = floatData[i * 6 + j];
    }
    uintMeshData[i * 7 + 6] = indices[i];
}

//Bind an existing data texture, then fill it
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

//Create and fill a buffer for the mesh
let meshBuffer = context.createBuffer();
context.bindBuffer(context.ARRAY_BUFFER, meshBuffer);
context.bufferData(context.ARRAY_BUFFER, meshData, context.STATIC_DRAW);

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

let lastCellWidth = 0;
let lastCellHeight = 0;
let cellDataTexture = 0;

function drawFrame() {
    //Fetch values once to avoid changes during rendering
    const fieldOfView = stateModel.fieldOfView;
    const cameraPosition = stateModel.cameraPosition;
    const canvasHeight = context.canvas.height;
    const canvasWidth = context.canvas.width;

    //Fetch simulation data
    //TODO: Use the stateModel once custom meshes are done
    const cellWidth = 3;
    const cellHeight = 2;
    const cellData = new Uint8Array([0, 0, 0, 0, 1, 1]);

    //Data doesn't match dimensions, try again later
    if (cellWidth * cellHeight != cellData.length) {
        return;
    }

    //Reset the canvas
    resetCanvas(context, canvasHeight, canvasWidth);

    //Use the model shader and the vertex array object
    context.useProgram(modelProgram);
    context.bindVertexArray(meshVAO);

    //Dimensions have changed, recreate buffers
    if (lastCellWidth != cellWidth || lastCellHeight != cellHeight) {
        //TODO: Recalculate mesh and replace buffer once custom meshes are done

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
    //TODO: Enable backface culling
    context.uniform3fv(cameraPosLocation, cameraPosition);
    context.uniformMatrix4fv(MVPLocation, false, MVP);
    context.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
    context.drawArrays(
        context.TRIANGLES,
        0,
        meshData.byteLength / vertexBlockSize,
    );

    //Loop
    window.requestAnimationFrame(drawFrame);
}

//Kick off rendering, tied to browser framerate
window.requestAnimationFrame(drawFrame);
