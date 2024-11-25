import { stateModel } from "../stateModel.js";
import { canvas } from "./ui.js";

const primaryButton = 0;
const draggingClass = "canvas-dragging";

const thetaMax = 2 * Math.PI;
const phiMax = Math.PI;

const dragSensitivity = 0.005;
const zoomSpeed = 0.2;

function clamp(min, value, max) {
    return Math.min(Math.max(min, value), max);
}

function setDraggingStyles() {
    document.body.classList.add(draggingClass);
    canvas.classList.add(draggingClass);
}

function unsetDraggingStyles() {
    document.body.classList.remove(draggingClass);
    canvas.classList.remove(draggingClass);
}

function recalculatePosition() {
    const position = glMatrix.vec3.fromValues(
        Math.cos(theta) * Math.sin(phi),
        Math.cos(phi),
        -Math.sin(theta) * Math.sin(phi), // Account for WebGL being right-handed with -z
    );

    glMatrix.vec3.scale(stateModel.cameraPosition, position, cameraDistance);
}

let dragging = false;

let dragRefTheta = 0;
let dragRefPhi = 0;
let dragRefMouseX = 0;
let dragRefMouseY = 0;

let theta = 0;
let phi = Math.PI / 2;
let cameraDistance = 2.0;

onmousedown = (mouseEvent) => {
    if (mouseEvent.button !== primaryButton || !canvas.matches(":hover"))
        return;

    dragRefMouseX = mouseEvent.screenX;
    dragRefMouseY = mouseEvent.screenY;
    dragRefTheta = theta;
    dragRefPhi = phi;

    dragging = true;
    setDraggingStyles();
};

onmouseup = (mouseEvent) => {
    if (mouseEvent.button !== primaryButton) return;
    dragging = false;
    unsetDraggingStyles();
};

onmousemove = (mouseEvent) => {
    if (!dragging) return;

    const deltaX = dragRefMouseX - mouseEvent.screenX;
    const deltaY = dragRefMouseY - mouseEvent.screenY;

    const thetaNew = dragRefTheta + deltaX * dragSensitivity;
    theta = ((thetaNew % thetaMax) + thetaMax) % thetaMax;

    phi = clamp(0.00000000001, dragRefPhi + deltaY * dragSensitivity, phiMax);

    recalculatePosition();
};

onwheel = (wheelEvent) => {
    if (wheelEvent.target !== canvas && !dragging) return;
    if (wheelEvent.deltaY > 0) {
        cameraDistance += zoomSpeed;
    } else {
        cameraDistance -= zoomSpeed;
    }
    recalculatePosition();
};
