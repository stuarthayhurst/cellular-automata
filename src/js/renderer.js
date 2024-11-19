import { modelVertSource } from "./shaders/modelVert.js";
import { modelFragSource } from "./shaders/modelFrag.js";
import { canvas } from "./ui.js";

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

//TODO: Replace this with actual mesh data
//TODO: Every frame, check if shape or grid settings changed, recreate the mesh and cache it
let meshData = new Float32Array([
  0, 0, 0,
  0, 1, 0,
  1, 0, 0,
]);

//Prepare context from canvas element
const context = canvas.getContext("webgl2");
if (!context) {
    console.log("No WebGL2 support detected, good luck");
}

//Reset canvas while loading
resetCanvas(context);

//Compile the shaders
const modelVertShader = compileShader(context, context.VERTEX_SHADER, modelVertSource);
const modelFragShader = compileShader(context, context.FRAGMENT_SHADER, modelFragSource);

//Link shaders into a program
const modelProgram = linkProgram(context, modelVertShader, modelFragShader);

//Create and fill a buffer for the mesh
const meshAttribLocation = context.getAttribLocation(modelProgram, "inPosition");
let meshBuffer = context.createBuffer();
context.bindBuffer(context.ARRAY_BUFFER, meshBuffer);
context.bufferData(context.ARRAY_BUFFER, meshData, context.STATIC_DRAW);

//Create a vertex array object for the mesh
let meshVAO = context.createVertexArray();
context.bindVertexArray(meshVAO);
context.enableVertexAttribArray(meshAttribLocation);
context.vertexAttribPointer(meshAttribLocation,
                            3, //Number of components
                            context.FLOAT, //Data type
                            false, //Normalisation toggle
                            0, //Stride
                            0); //Data offset

function drawFrame() {
    //Reset the canvas
    resetCanvas(context);

    //Use the model shader and the vertex array object
    context.useProgram(modelProgram);
    context.bindVertexArray(meshVAO);

    //Draw the mesh
    const pointCount = 3;
    context.drawArrays(context.TRIANGLES, 0, pointCount);

    //Loop
    window.requestAnimationFrame(drawFrame);
}

//Kick off rendering, tied to browser framerate
window.requestAnimationFrame(drawFrame);
