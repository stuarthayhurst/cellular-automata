import * as glMatrix from "gl-matrix";
import { calculateMesh, calculateNormals } from "./mesh.js";

/** @type {String} */
import modelVertSource from "./shaders/modelVert.glsl?raw";
/** @type {String} */
import modelFragSource from "./shaders/modelFrag.glsl?raw";

/** @type {String} */
import gridVertSource from "./shaders/gridVert.glsl?raw";
/** @type {String} */
import gridFragSource from "./shaders/gridFrag.glsl?raw";

import { sharedState } from "./sharedState.js";
import { reactiveState } from "./reactiveState.svelte.js";
import { meter } from "./tools.js";

/**
 * Start the renderer.
 * @param {WebGL2RenderingContext} context
 * @returns {void}
 */
export function startRenderer(context) {
    //Changes to these require matching changes to the texture types and shader code
    const channels = 4;
    const channelWidth = 32;

    //Set this to a value large enough for the simulator
    const bitsPerCell = 2;

    sharedState.maxCells =
        context.MAX_TEXTURE_SIZE ** 2 * channels * (channelWidth / bitsPerCell);
    console.info(
        "WebGL2 support detected, width x height must not exceed " +
            sharedState.maxCells,
    );
    const square = Math.floor(Math.sqrt(sharedState.maxCells));
    console.info("Maximum square dimensions are " + square + " x " + square);

    //Reset canvas while loading
    resetCanvas(context, context.canvas.height, context.canvas.width);

    //Compile the model shaders
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

    //Link model shaders into a program
    const modelProgram = linkProgram(context, modelVertShader, modelFragShader);
    context.useProgram(modelProgram);

    //Create and bind a buffer for the mesh
    let meshBuffer = context.createBuffer();
    context.bindBuffer(context.ARRAY_BUFFER, meshBuffer);

    //Fetch model shader attribute locations
    const meshAttribLocation = context.getAttribLocation(
        modelProgram,
        "inPosition",
    );
    const normalAttribLocation = context.getAttribLocation(
        modelProgram,
        "inNormal",
    );
    const originAttribLocation = context.getAttribLocation(
        modelProgram,
        "inOrigin",
    );
    const cellIndexAttribLocation = context.getAttribLocation(
        modelProgram,
        "inCellIndex",
    );

    //Stride - (1 * 1) * sizeof(int) + (3 * 3) * sizeof(float)
    const meshStride = 10 * 4;

    //Create a vertex array object for the mesh, define the positions and normals
    let meshVAO = context.createVertexArray();
    context.bindVertexArray(meshVAO);
    context.vertexAttribPointer(
        meshAttribLocation,
        3, //Number of components
        context.FLOAT, //Data type
        false, //Normalisation toggle
        meshStride,
        0, //Data offset - (0 * 3) * sizeof(float)
    );
    context.enableVertexAttribArray(meshAttribLocation);
    context.vertexAttribPointer(
        normalAttribLocation,
        3, //Number of components
        context.FLOAT, //Data type
        false, //Normalisation toggle
        meshStride,
        3 * 4, //Data offset - (1 * 3) * sizeof(float)
    );
    context.enableVertexAttribArray(normalAttribLocation);
    context.vertexAttribPointer(
        originAttribLocation,
        3, //Number of components
        context.FLOAT, //Data type
        false, //Normalisation toggle
        meshStride,
        6 * 4, //Data offset - (2 * 3) * sizeof(float)
    );
    context.enableVertexAttribArray(originAttribLocation);
    context.vertexAttribIPointer(
        cellIndexAttribLocation,
        1, //Number of components
        context.INT, //Data type
        meshStride,
        9 * 4, //Data offset - (3 * 3) * sizeof(float)
    );
    context.enableVertexAttribArray(cellIndexAttribLocation);

    //Get shader uniform locations
    const MVPLocation = context.getUniformLocation(modelProgram, "MVP");
    const modelMatrixLocation = context.getUniformLocation(
        modelProgram,
        "modelMatrix",
    );
    const cameraPosLocation = context.getUniformLocation(
        modelProgram,
        "cameraPos",
    );
    const cellDataTexLocation = context.getUniformLocation(
        modelProgram,
        "cellDataTexture",
    );
    const baseColourLocation = context.getUniformLocation(
        modelProgram,
        "baseColour",
    );
    const cellColourLocation = context.getUniformLocation(
        modelProgram,
        "cellColour",
    );
    const unmappedColourLocation = context.getUniformLocation(
        modelProgram,
        "unmappedColour",
    );
    const activeCellModeLocation = context.getUniformLocation(
        modelProgram,
        "activeCellMode",
    );
    const raisedCellHeightLocation = context.getUniformLocation(
        modelProgram,
        "raisedCellHeight",
    );

    //Compile the grid shaders
    const gridVertShader = compileShader(
        context,
        context.VERTEX_SHADER,
        gridVertSource,
    );
    const gridFragShader = compileShader(
        context,
        context.FRAGMENT_SHADER,
        gridFragSource,
    );

    //Link grid shaders into a program
    const gridProgram = linkProgram(context, gridVertShader, gridFragShader);
    context.useProgram(gridProgram);

    //Create and bind a buffer for the grid
    let gridBuffer = context.createBuffer();
    context.bindBuffer(context.ARRAY_BUFFER, gridBuffer);

    //Fetch grid shader attribute locations
    const gridMeshAttribLocation = context.getAttribLocation(
        gridProgram,
        "inPosition",
    );

    //Create a vertex array object for the grid's mesh
    let gridVAO = context.createVertexArray();
    context.bindVertexArray(gridVAO);
    context.vertexAttribPointer(
        gridMeshAttribLocation,
        2, //Number of components
        context.FLOAT, //Data type
        false, //Normalisation toggle
        2 * 4, //Stride - (1 * 2) * sizeof(float)
        0, //Data offset
    );
    context.enableVertexAttribArray(gridMeshAttribLocation);

    //Get grid shader uniform locations
    const gridCellWidthLocation = context.getUniformLocation(
        gridProgram,
        "gridCellWidth",
    );
    const gridCellHeightLocation = context.getUniformLocation(
        gridProgram,
        "gridCellHeight",
    );
    const gridCellsPerWidthLocation = context.getUniformLocation(
        gridProgram,
        "gridCellsPerWidth",
    );
    const gridOffsetXLocation = context.getUniformLocation(
        gridProgram,
        "gridOffsetX",
    );
    const gridOffsetYLocation = context.getUniformLocation(
        gridProgram,
        "gridOffsetY",
    );
    const aspectRatioLocation = context.getUniformLocation(
        gridProgram,
        "aspectRatio",
    );
    const gridCellDataTexLocation = context.getUniformLocation(
        gridProgram,
        "cellDataTexture",
    );
    const gridBaseColourLocation = context.getUniformLocation(
        gridProgram,
        "baseColour",
    );
    const gridCellColourLocation = context.getUniformLocation(
        gridProgram,
        "cellColour",
    );
    const gridAliasBaseColourLocation = context.getUniformLocation(
        gridProgram,
        "aliasBaseColour",
    );
    const gridAliasCellColourLocation = context.getUniformLocation(
        gridProgram,
        "aliasCellColour",
    );
    const gridBorderSizeLocation = context.getUniformLocation(
        gridProgram,
        "borderSize",
    );
    const gridBorderColourLocation = context.getUniformLocation(
        gridProgram,
        "borderColour",
    );
    const gridBackgroundBorderColourLocation = context.getUniformLocation(
        gridProgram,
        "backgroundBorderColour",
    );
    const gridAliasBackgroundLocation = context.getUniformLocation(
        gridProgram,
        "aliasBackground",
    );
    const gridWidthPixelsLocation = context.getUniformLocation(
        gridProgram,
        "widthPixels",
    );

    //Set up the vertices for the grid
    const gridData = new Float32Array([
        -1, 1, -1, -1, 1, -1, -1, 1, 1, -1, 1, 1,
    ]);
    fillMeshBuffer(context, gridBuffer, gridData.buffer);

    //Enable depth testing
    context.enable(context.DEPTH_TEST);
    context.depthFunc(context.LESS);

    //Enable back-face culling
    context.enable(context.CULL_FACE);
    context.cullFace(context.BACK);

    let lastCellWidth = 0;
    let lastCellHeight = 0;
    let lastShape = "";
    /** @type {WebGLTexture} */
    let cellDataTexture = null;
    let vertexCount = 0;

    /**
     * Render the selected model to the framebuffer
     * @param {Number} fieldOfView
     * @param {glMatrix.vec3} cameraPosition
     * @param {Number} canvasWidth
     * @param {Number} canvasHeight
     * @param {glMatrix.vec3} baseColour
     * @param {glMatrix.vec3} cellColour
     * @param {glMatrix.vec3} unmappedColour
     * @param {Boolean} raiseCells
     * @param {Number} raisedCellHeight
     * @returns {void}
     */
    function drawMesh(
        fieldOfView,
        cameraPosition,
        canvasWidth,
        canvasHeight,
        baseColour,
        cellColour,
        unmappedColour,
        raiseCells,
        raisedCellHeight,
    ) {
        //Use the model shader and the vertex array object
        context.useProgram(modelProgram);
        context.bindVertexArray(meshVAO);

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

        //Send the uniforms and draw the mesh
        context.uniform3fv(cameraPosLocation, cameraPosition);
        context.uniformMatrix4fv(MVPLocation, false, MVP);
        context.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
        context.uniform3fv(baseColourLocation, baseColour);
        context.uniform3fv(cellColourLocation, cellColour);
        context.uniform3fv(unmappedColourLocation, unmappedColour);
        // noinspection JSSuspiciousNameCombination
        context.uniform1f(raisedCellHeightLocation, raisedCellHeight);

        /*
         * Tell shaders what to do with active cells and then render
         * activeCellMode 0 - Render active cells as normal
         * activeCellMode 1 - Render active cells as a shadow
         * activeCellMode 2 - Render active cells as normal, but raised
         *   - Skip dead cells entirely
         */
        context.bindBuffer(context.ARRAY_BUFFER, meshBuffer);
        if (raiseCells) {
            context.uniform1i(activeCellModeLocation, 1);
            context.drawArrays(context.TRIANGLES, 0, vertexCount);

            //Disable backface culling for second pass
            context.disable(context.CULL_FACE);
            context.uniform1i(activeCellModeLocation, 2);
            context.drawArrays(context.TRIANGLES, 0, vertexCount);
            context.enable(context.CULL_FACE);
        } else {
            context.uniform1i(activeCellModeLocation, 0);
            context.drawArrays(context.TRIANGLES, 0, vertexCount);
        }
    }

    /**
     * Render the grid to the framebuffer
     * @param {Number} cellWidth
     * @param {Number} cellHeight
     * @param {Number} gridCellsPerWidth
     * @param {Number} gridOffsetX
     * @param {Number} gridOffsetY
     * @param {Number} aspectRatio
     * @param {glMatrix.vec3} baseColour
     * @param {glMatrix.vec3} cellColour
     * @param {glMatrix.vec3} aliasBaseColour
     * @param {glMatrix.vec3} aliasCellColour
     * @param {Number} borderSize
     * @param {glMatrix.vec3} borderColour
     * @param {glMatrix.vec3} backgroundBorderColour
     * @param {Boolean} aliasBackground
     * @param {Number} canvasWidth
     * @returns {void}
     */
    function drawGrid(
        cellWidth,
        cellHeight,
        gridCellsPerWidth,
        gridOffsetX,
        gridOffsetY,
        aspectRatio,
        baseColour,
        cellColour,
        aliasBaseColour,
        aliasCellColour,
        borderSize,
        borderColour,
        backgroundBorderColour,
        aliasBackground,
        canvasWidth,
    ) {
        //Use the grid shader and the vertex array object
        context.useProgram(gridProgram);
        context.bindVertexArray(gridVAO);

        //Enable the data texture
        context.activeTexture(context.TEXTURE0);
        context.uniform1i(gridCellDataTexLocation, 0);

        //Send the uniforms and draw the grid
        context.uniform1i(gridCellWidthLocation, cellWidth);
        // noinspection JSSuspiciousNameCombination
        context.uniform1i(gridCellHeightLocation, cellHeight);
        context.uniform1f(gridCellsPerWidthLocation, gridCellsPerWidth);
        context.uniform1f(gridOffsetXLocation, gridOffsetX);
        // noinspection JSSuspiciousNameCombination
        context.uniform1f(gridOffsetYLocation, gridOffsetY);
        context.uniform1f(aspectRatioLocation, aspectRatio);
        context.uniform3fv(gridBaseColourLocation, baseColour);
        context.uniform3fv(gridCellColourLocation, cellColour);
        context.uniform3fv(gridAliasBaseColourLocation, aliasBaseColour);
        context.uniform3fv(gridAliasCellColourLocation, aliasCellColour);
        context.uniform1f(gridBorderSizeLocation, borderSize);
        context.uniform3fv(gridBorderColourLocation, borderColour);
        context.uniform3fv(
            gridBackgroundBorderColourLocation,
            backgroundBorderColour,
        );
        context.uniform1i(gridAliasBackgroundLocation, Number(aliasBackground));
        context.uniform1i(gridWidthPixelsLocation, canvasWidth);

        context.bindBuffer(context.ARRAY_BUFFER, gridBuffer);
        context.drawArrays(context.TRIANGLES, 0, 6);
    }

    /** @returns {void} */
    function drawFrame() {
        //Fetch values once to avoid changes during rendering
        const fieldOfView = 90.0;
        const cameraPosition = sharedState.cameraPosition;
        const canvasHeight = context.canvas.height;
        const canvasWidth = context.canvas.width;
        const baseColour = sharedState.baseColour;
        const cellColour = sharedState.cellColour;
        const unmappedColour = sharedState.unmappedColour;
        const aliasBaseColour = sharedState.aliasBaseColour;
        const aliasCellColour = sharedState.aliasCellColour;
        const raiseCells = reactiveState.raiseCells;
        const raisedCellHeight = reactiveState.raisedCellHeight;
        const shape = reactiveState.shape;
        const interfaceMode = reactiveState.interfaceMode;

        const pixelsPerCell = sharedState.pixelsPerCell;
        const gridOffsetX = sharedState.gridOffsetX;
        const gridOffsetY = sharedState.gridOffsetY;
        const borderSize = sharedState.borderSize;
        const borderColour = sharedState.borderColour;
        const backgroundBorderColour = sharedState.backgroundBorderColour;
        const aliasBackground = reactiveState.aliasBackground;

        //Fetch simulation data
        const cellWidth = reactiveState.cellGridWidth;
        const cellHeight = reactiveState.cellGridHeight;
        const cellData = new Uint8Array(sharedState.cells);

        //Data doesn't match dimensions, try again later
        if (cellWidth * cellHeight !== cellData.length) {
            window.requestAnimationFrame(drawFrame);
            console.warn(
                "Not drawing this frame: cell data doesn't match dimensions.",
            );
            return;
        }

        //Dimensions have changed, recreate buffers
        if (
            lastCellWidth !== cellWidth ||
            lastCellHeight !== cellHeight ||
            lastShape !== shape
        ) {
            //Generate the mesh data and fill its buffer
            let [meshData, vertexBlockSize] = generateMesh(
                cellHeight,
                cellWidth,
                shape,
            );
            fillMeshBuffer(context, meshBuffer, meshData);
            vertexCount = meshData.byteLength / vertexBlockSize;

            //Clear existing data
            if (cellDataTexture !== null) {
                context.deleteTexture(cellDataTexture);
                cellDataTexture = null;
            }

            //Create the texture, fill it with data and bind it
            cellDataTexture = createDataTexture(
                context,
                cellData,
                channels,
                channelWidth,
                bitsPerCell,
            );

            lastCellWidth = cellWidth;
            lastCellHeight = cellHeight;
            lastShape = shape;
        } else {
            //Just update the cell data if the size hasn't changed, then bind the texture
            setDataTexture(
                context,
                cellDataTexture,
                cellData,
                channels,
                channelWidth,
                bitsPerCell,
            );
        }

        //Reset the canvas
        resetCanvas(context, canvasHeight, canvasWidth);

        if (interfaceMode === "3D View") {
            drawMesh(
                fieldOfView,
                cameraPosition,
                canvasWidth,
                canvasHeight,
                baseColour,
                cellColour,
                unmappedColour,
                raiseCells,
                raisedCellHeight,
            );
        } else {
            drawGrid(
                cellWidth,
                cellHeight,
                canvasWidth / pixelsPerCell,
                gridOffsetX / pixelsPerCell,
                gridOffsetY / pixelsPerCell,
                canvasWidth / canvasHeight,
                baseColour,
                cellColour,
                aliasBaseColour,
                aliasCellColour,
                borderSize,
                borderColour,
                backgroundBorderColour,
                aliasBackground,
                canvasWidth,
            );
        }
        window.requestAnimationFrame(drawFrame);
    }

    //Kick off rendering, tied to browser framerate
    window.requestAnimationFrame(drawFrame);
}

/**
 * Compile shader.
 * @param {WebGL2RenderingContext} context
 * @param {Number} shaderType
 * @param {String} shaderSource
 * @returns {WebGLShader}
 */
function compileShader(context, shaderType, shaderSource) {
    //Create, load and compile the shader
    let shader = context.createShader(shaderType);
    context.shaderSource(shader, shaderSource);
    context.compileShader(shader);

    //Check compile was successful
    if (context.getShaderParameter(shader, context.COMPILE_STATUS)) {
        return shader;
    } else {
        console.error("Failed to compile shader");
        console.error(context.getShaderInfoLog(shader));
        context.deleteShader(shader);
    }
}

/**
 * Link program.
 * @param {WebGL2RenderingContext} context
 * @param {WebGLShader} vertexShader
 * @param {WebGLShader} fragShader
 * @returns {WebGLProgram}
 */
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
        console.error("Failed to link program");
        console.error(context.getProgramInfoLog(program));
        context.deleteProgram(program);
    }
}

/**
 * Calculate projection matrix.
 * @param {Number} fieldOfView
 * @param {Number} height
 * @param {Number} width
 * @returns {glMatrix.mat4}
 */
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

/**
 * Calculate view matrix.
 * @param {glMatrix.vec3} cameraPosition
 * @returns {glMatrix.mat4}
 */
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

/**
 * Calculate model matrix.
 * @param {Number} scale
 * @returns {glMatrix.mat4}
 */
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

/**
 * Reset canvas.
 * @param {WebGL2RenderingContext} context
 * @param {Number} height
 * @param {Number} width
 * @returns {void}
 */
function resetCanvas(context, height, width) {
    context.viewport(0, 0, width, height);
    context.clearColor(0, 0, 0, 0);
    context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
}

/**
 * Bind an existing data texture, then fill it
 * Pack the cell data into each bit of a byte, then pack 4 bytes per pixel
 * Use both dimensions of a 2D texture
 * If this needs even higher density, we can use 3D textures
 *   That's not really worth it unless we absolutely have to, due to the extra complexity
 * @param {WebGL2RenderingContext} context
 * @param {WebGLTexture} texture
 * @param {Uint8Array} rawData
 * @param {Number} channels
 * @param {Number} channelWidth
 * @param {Number} bitsPerCell
 * @returns {void}
 */
function setDataTexture(
    context,
    texture,
    rawData,
    channels,
    channelWidth,
    bitsPerCell,
) {
    //Calculate rows and columns required to store the bytes
    const minPixels = Math.ceil(
        rawData.length / ((channelWidth / bitsPerCell) * channels),
    );
    const rows = Math.ceil(minPixels / context.MAX_TEXTURE_SIZE);
    let cols = context.MAX_TEXTURE_SIZE;
    if (rows === 1) {
        cols = minPixels % context.MAX_TEXTURE_SIZE;
    }

    if (rows > context.MAX_TEXTURE_SIZE) {
        console.error("Max texture size exceeded, refusing to upload");
        return;
    }

    //Resize the buffer to match the rows and columns
    let size = rows * cols * channels;
    let data = new Uint32Array(size);

    const dataShift = Math.log2(channelWidth / bitsPerCell);
    const cellMask = channelWidth / bitsPerCell - 1;
    for (let i = 0; i < rawData.length; i++) {
        data[i >> dataShift] |= rawData[i] << ((i & cellMask) * bitsPerCell);
    }

    //Data is treated as 4 separate cells per pixel
    context.bindTexture(context.TEXTURE_2D, texture);
    context.texImage2D(
        context.TEXTURE_2D,
        0,
        context.RGBA32UI,
        cols,
        rows,
        0,
        context.RGBA_INTEGER,
        context.UNSIGNED_INT,
        data,
    );
}

/**
 * Create a texture for storing data, bind it, fill it and return it
 * @param {WebGL2RenderingContext} context
 * @param {Uint8Array} data
 * @param {Number} channels
 * @param {Number} channelWidth
 * @param {Number} bitsPerCell
 * @returns {WebGLTexture}
 */
function createDataTexture(context, data, channels, channelWidth, bitsPerCell) {
    //Upload data to a texture
    const texture = context.createTexture();
    setDataTexture(context, texture, data, channels, channelWidth, bitsPerCell);

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

/**
 * Generate interleaved mesh, normal and index data for rendering
 * Format: vec3f32(position), vec3f32(normal), vec3f32(origin), int32(index)
 * @param {Number} height
 * @param {Number} width
 * @param {String} shape
 * @returns {[ArrayBuffer, Number]}
 */
function generateMesh(height, width, shape) {
    const minDimension = 100;

    //Scale the mesh up to handle tiny grids
    let meshWidthScale = 1;
    let meshHeightScale = 1;
    if (height < minDimension) {
        meshHeightScale = Math.ceil(minDimension / height);
    }
    if (width < minDimension) {
        meshWidthScale = Math.ceil(minDimension / width);
    }

    //Generate the mesh, origins, indices and normals
    const [[mesh, origins, indices], meshT] = meter(() =>
        calculateMesh(width, height, meshWidthScale, meshHeightScale, shape),
    );

    const [normals, normalsT] = meter(() => calculateNormals(mesh, origins));

    console.log(`Mesh: ${meshT}ms. Normals: ${normalsT}ms.`);

    //Size of each buffer * their 3 uses * 4 bytes per element
    const bufferSize =
        (mesh.length + normals.length + origins.length + indices.length) *
        3 *
        4;
    const vertexBlockSize = 4 * 10;

    let meshData = new ArrayBuffer(bufferSize);
    let floatView = new Float32Array(meshData);
    let intView = new Int32Array(meshData);

    //Write the data to the mesh array using a correctly typed buffer view
    for (let i = 0; i < mesh.length; i++) {
        for (let j = 0; j < 3; j++) {
            floatView[i * 10 + j] = mesh[i][j];
        }

        for (let j = 0; j < 3; j++) {
            floatView[i * 10 + j + 3] = normals[i][j];
        }

        for (let j = 0; j < 3; j++) {
            floatView[i * 10 + j + 6] = origins[i][j];
        }

        intView[i * 10 + 9] = indices[Math.floor(i / 3)];
    }

    return [meshData, vertexBlockSize];
}

/**
 * Bind the mesh buffer and copy the data into it.
 * @param {WebGL2RenderingContext} context
 * @param {WebGLBuffer} meshBuffer
 * @param {ArrayBuffer} meshData
 * @returns {void}
 */
function fillMeshBuffer(context, meshBuffer, meshData) {
    context.bindBuffer(context.ARRAY_BUFFER, meshBuffer);
    context.bufferData(context.ARRAY_BUFFER, meshData, context.STATIC_DRAW);
}
