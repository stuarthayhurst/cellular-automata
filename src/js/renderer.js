//Fetch elements, prepare context
const canvas = document.querySelector("#renderer");
const context = canvas.getContext("webgl2");
if (!context) {
    console.log("No WebGL2 support detected, good luck");
}

//Set canvas to black
context.clearColor(0, 0, 0, 1);
context.clear(context.COLOR_BUFFER_BIT);
