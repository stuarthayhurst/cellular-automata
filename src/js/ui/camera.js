import { stateModel } from "../stateModel.js";
import { canvas } from "./ui.js";

// Constants for camera behavior
const primaryButton = 0; // Left mouse button
const draggingClass = "canvas-dragging"; // CSS class for dragging styles
const thetaMax = 2 * Math.PI; // Full rotation around the horizontal axis (360 degrees)
const phiMax = Math.PI; // Vertical rotation limited to half a sphere (180 degrees)
const dragSensitivity = 0.006;
const minCameraDistance = 0.1;

function clamp(min, value, max) {
    return Math.min(Math.max(min, value), max);
}

// Adds/removes a CSS class to visually indicate when the user is dragging
function setDraggingStyles() {
    document.body.classList.add(draggingClass);
    canvas.classList.add(draggingClass);
}

function unsetDraggingStyles() {
    document.body.classList.remove(draggingClass);
    canvas.classList.remove(draggingClass);
}

// Recalculates the camera's position based on the current theta, phi, and camera distance values
function recalculatePosition() {
    const position = glMatrix.vec3.fromValues(
        Math.cos(theta) * Math.sin(phi), // X-axis position
        Math.cos(phi), // Y-axis position
        -Math.sin(theta) * Math.sin(phi) // Account for WebGL being right-handed with -z
    );

    glMatrix.vec3.scale(stateModel.cameraPosition, position, cameraDistance);
}

// Dragging-related variables
let dragging = false;

let dragRefTheta = 0;
let dragRefPhi = 0;
let dragRefMouseX = 0;
let dragRefMouseY = 0;

// Camera state variables
let theta = 0; // Horizontal rotation (0 to 2π)
let phi = Math.PI / 2; // Vertical rotation (initially looking straight ahead)
let cameraDistance = 2.0;

// MOUSE EVENT HANDLERS:
// (1) Mouse Down (Start Dragging)
// Activates dragging when the user clicks the left mouse button over the canvas
onmousedown = (mouseEvent) => {
    if (mouseEvent.button !== primaryButton || !canvas.matches(":hover"))
        return;

    // Stores the initial mouse position and camera angles for reference
    dragRefMouseX = mouseEvent.screenX;
    dragRefMouseY = mouseEvent.screenY;
    dragRefTheta = theta;
    dragRefPhi = phi;

    dragging = true;
    setDraggingStyles();
};

// (2) Mouse Up (Stop Dragging)
// Ends dragging when the left mouse button is released
onmouseup = (mouseEvent) => {
    if (mouseEvent.button !== primaryButton) return;

    // Resets the dragging flag and removes dragging styles
    dragging = false;
    unsetDraggingStyles();
};

// (3) Mouse Move (Rotate Camera)
onmousemove = (mouseEvent) => {
    if (!dragging) return;

    // Calculates changes in mouse movement (deltaX and deltaY) to adjust theta and phi
    const deltaX = dragRefMouseX - mouseEvent.screenX;
    const deltaY = dragRefMouseY - mouseEvent.screenY;

    const deltaYMin = -dragRefPhi / dragSensitivity;
    const deltaYMax = (phiMax - dragRefPhi) / dragSensitivity;

    if (deltaY < deltaYMin || deltaY > deltaYMax) {
        dragRefPhi = phi;
        dragRefMouseY = mouseEvent.screenY;
    }

    const thetaNew = dragRefTheta + deltaX * dragSensitivity;
    const phiNew = dragRefPhi + deltaY * dragSensitivity;

    theta = ((thetaNew % thetaMax) + thetaMax) % thetaMax; // Wrap theta around 0–2π
    phi = clamp(0.00000000001, phiNew, phiMax);
    // Prevents phi from being 0 to prevent a bug with lookAt

    recalculatePosition();
};

// (4) Mouse Wheel (Zoom In/Out)
// Adjusts cameraDistance based on the mouse wheel's scroll direction
onwheel = (wheelEvent) => {
    if (wheelEvent.target !== canvas && !dragging) return;
    cameraDistance = Math.max(
        minCameraDistance, // Ensures the zoom level does not go below minCameraDistance (0.1)
        cameraDistance + wheelEvent.deltaY * 0.002
    );
    recalculatePosition();
};
