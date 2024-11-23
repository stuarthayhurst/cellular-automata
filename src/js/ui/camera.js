import { stateModel } from "../stateModel.js";
import { canvas } from "./ui.js";

const PRIMARY_BUTTON = 0;
const DRAGGING_CLASS = "canvas-dragging";

function clamp(min, value, max) {
    return Math.min(Math.max(min, value), max);
}

function setDraggingStyles() {
    document.body.classList.add(DRAGGING_CLASS);
    canvas.classList.add(DRAGGING_CLASS);
}

function unsetDraggingStyles() {
    document.body.classList.remove(DRAGGING_CLASS);
    canvas.classList.remove(DRAGGING_CLASS);
}

let dragging = false;

onmousedown = (mouseEvent) => {
    if (mouseEvent.button !== PRIMARY_BUTTON || !canvas.matches(":hover"))
        return;

    dragRefMouseX = mouseEvent.screenX;
    dragRefMouseY = mouseEvent.screenY;
    dragRefTheta = theta;
    dragRefPhi = phi;

    dragging = true;
    setDraggingStyles();
};

onmouseup = (mouseEvent) => {
    if (mouseEvent.button !== PRIMARY_BUTTON) return;
    dragging = false;
    unsetDraggingStyles();
};

let dragRefTheta = 0;
let dragRefPhi = 0;
let dragRefMouseX = 0;
let dragRefMouseY = 0;

let theta = 0;
let phi = Math.PI / 2;

const thetaMax = 2 * Math.PI;
const phiMax = Math.PI;
const dragSensitivity = 0.01;

onmousemove = (mouseEvent) => {
    if (!dragging) return;

    const deltaX = dragRefMouseX - mouseEvent.screenX;
    const deltaY = dragRefMouseY - mouseEvent.screenY;

    const thetaNew = dragRefTheta + deltaX * dragSensitivity;
    theta = ((thetaNew % thetaMax) + thetaMax) % thetaMax;

    phi = clamp(0, dragRefPhi + deltaY * dragSensitivity, phiMax);

    recalculatePosition();
};

let cameraDistance = 2.0;

onwheel = (wheelEvent) => {
    cameraDistance += wheelEvent.deltaY * 0.001;
    recalculatePosition();
};

function recalculatePosition() {
    //Account for WebGL being right-handed with -z
    const position = glMatrix.vec3.fromValues(
        Math.cos(theta) * Math.sin(phi),
        Math.cos(phi),
        -Math.sin(theta) * Math.sin(phi),
    );

    glMatrix.vec3.scale(stateModel.cameraPosition, position, cameraDistance);
}
