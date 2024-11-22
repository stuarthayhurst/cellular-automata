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

function resetCanvas(context) {
    context.viewport(0, 0, context.canvas.width, context.canvas.height);
    context.clearColor(0, 0, 0, 0);
    context.clear(context.COLOR_BUFFER_BIT);
}

/* TODO:
 * This is horrible, I know. It's going to be replaced with generated mesh data
 * But for now, hard-coding a cube is the easiest way to set the rest of the code set up
 * In future, check if settings changed and then either (re)generate a mesh, or use a cached copy
 */
// prettier-ignore
let meshData = new Float32Array([
    -0.5, -0.5, -0.5,
     0.5, -0.5, -0.5,
     0.5,  0.5, -0.5,
     0.5,  0.5, -0.5,
    -0.5,  0.5, -0.5,
    -0.5, -0.5, -0.5,

    -0.5, -0.5,  0.5,
     0.5, -0.5,  0.5,
     0.5,  0.5,  0.5,
     0.5,  0.5,  0.5,
    -0.5,  0.5,  0.5,
    -0.5, -0.5,  0.5,

    -0.5,  0.5,  0.5,
    -0.5,  0.5, -0.5,
    -0.5, -0.5, -0.5,
    -0.5, -0.5, -0.5,
    -0.5, -0.5,  0.5,
    -0.5,  0.5,  0.5,

     0.5,  0.5,  0.5,
     0.5,  0.5, -0.5,
     0.5, -0.5, -0.5,
     0.5, -0.5, -0.5,
     0.5, -0.5,  0.5,
     0.5,  0.5,  0.5,

    -0.5, -0.5, -0.5,
     0.5, -0.5, -0.5,
     0.5, -0.5,  0.5,
     0.5, -0.5,  0.5,
    -0.5, -0.5,  0.5,
    -0.5, -0.5, -0.5,

    -0.5,  0.5, -0.5,
     0.5,  0.5, -0.5,
     0.5,  0.5,  0.5,
     0.5,  0.5,  0.5,
    -0.5,  0.5,  0.5,
    -0.5,  0.5, -0.5,
]);

//Prepare context from canvas element
const context = canvas.getContext("webgl2");
if (!context) {
    console.log("No WebGL2 support detected, good luck");
}

//Reset canvas while loading
resetCanvas(context);

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
const meshAttribLocation = context.getAttribLocation(
    modelProgram,
    "inPosition",
);
let meshBuffer = context.createBuffer();
context.bindBuffer(context.ARRAY_BUFFER, meshBuffer);
context.bufferData(context.ARRAY_BUFFER, meshData, context.STATIC_DRAW);

//Create a vertex array object for the mesh
let meshVAO = context.createVertexArray();
context.bindVertexArray(meshVAO);
context.enableVertexAttribArray(meshAttribLocation);
context.vertexAttribPointer(
    meshAttribLocation,
    3, //Number of components
    context.FLOAT, //Data type
    false, //Normalisation toggle
    0, //Stride
    0,
); //Data offset

//Get shader uniform locations
const MVPLocation = context.getUniformLocation(modelProgram, "MVP");

function drawFrame() {
    //Reset the canvas
    resetCanvas(context);

    //Use the model shader and the vertex array object
    context.useProgram(modelProgram);
    context.bindVertexArray(meshVAO);

    //Calculate the projection matrix
    const projectionMatrix = glMatrix.mat4.create();
    glMatrix.mat4.perspective(
        projectionMatrix,
        glMatrix.glMatrix.toRadian(stateModel.fieldOfView),
        context.canvas.width / context.canvas.height,
        0.1,
        null,
    );

    //Calculate the view matrix
    const viewMatrix = glMatrix.mat4.create();
    const cameraTarget = glMatrix.vec3.create();
    glMatrix.vec3.add(
        cameraTarget,
        stateModel.cameraPosition,
        stateModel.cameraDirection,
    );
    glMatrix.mat4.lookAt(
        viewMatrix,
        stateModel.cameraPosition,
        cameraTarget,
        glMatrix.vec3.fromValues(0.0, 1.0, 0.0),
    );

    //Calculate the model matrix
    //TODO: Calculate a more useful matrix to take into account actual position, scale and rotation
    // - Rotation and position might be handled by the camera depending on interface design
    const modelMatrix = glMatrix.mat4.create();
    glMatrix.mat4.identity(modelMatrix);

    //Combine matrices into a precalculated MVP matrix
    const MVP = glMatrix.mat4.create();
    glMatrix.mat4.multiply(MVP, projectionMatrix, viewMatrix);
    glMatrix.mat4.multiply(MVP, MVP, modelMatrix);

    //Send the uniforms and draw the mesh
    //TODO: Swap to using element buffers and index the meshes
    //TODO: Enable depth testing, clear the depth each frame
    //TODO: Enable backface culling
    context.uniformMatrix4fv(MVPLocation, false, MVP);
    context.drawArrays(context.TRIANGLES, 0, meshData.length / 3);

    //Loop
    window.requestAnimationFrame(drawFrame);
}

//Kick off rendering, tied to browser framerate
window.requestAnimationFrame(drawFrame);
