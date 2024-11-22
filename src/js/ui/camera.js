import { stateModel } from "../stateModel.js";
import { canvas } from "./ui.js";

let mouseOverCanvas = false;
canvas.onmouseover = () => (mouseOverCanvas = true);
canvas.onmouseout = () => (mouseOverCanvas = false);

let dragStartTheta = 0;
let dragStartPhi = 0;
let dragStartMouseX = 0;
let dragStartMouseY = 0;

onmousedown = (mouseEvent) => {
    dragStartMouseX = mouseEvent.screenX;
    dragStartMouseY = mouseEvent.screenY;
    dragStartTheta = theta;
    dragStartPhi = phi;
};

let theta = 0;
let phi = Math.PI / 2;

let deltaX = 0;
let deltaY = 0;
onmousemove = (mouseEvent) => {
    if (mouseEvent.buttons !== 1) return;

    deltaX = dragStartMouseX - mouseEvent.screenX;
    deltaY = dragStartMouseY - mouseEvent.screenY;

    updatePosition();
};

function updatePosition() {
    theta = (deltaY * 0.01) % (2 * Math.PI);
    phi = (deltaX * 0.01) % Math.PI;

    const x = cameraDistance * Math.cos(theta) * Math.sin(phi);
    const y = cameraDistance * Math.sin(theta) * Math.sin(phi);
    const z = cameraDistance * Math.cos(phi);

    console.log(theta, phi);

    stateModel.cameraPosition = glMatrix.vec3.fromValues(x, y, z);
}

let cameraDistance = 2.0;
onwheel = (wheelEvent) => {
    cameraDistance += wheelEvent.deltaY * 0.001;
    updatePosition();
};
