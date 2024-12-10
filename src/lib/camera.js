import * as glMatrix from "gl-matrix";
import { sharedState } from "./sharedState.js";
import { reactiveState } from "./reactiveState.svelte.js";
import { absMod } from "./tools.js";

const primaryButton = 0;
const thetaMax = 2 * Math.PI; // Full rotation around the horizontal axis (360 degrees)
const phiMax = Math.PI; // Vertical rotation limited to half a sphere (180 degrees)
const dragSensitivity = 0.005;
const zoomSpeed = 0.002;
const minCameraDistance = 0.1;

let dragRefTheta = 0;
let dragRefPhi = 0;
let dragRefMouseX = 0;
let dragRefMouseY = 0;

// Camera state variables
let theta = 0; // Horizontal rotation (0 to 2π)
let phi = Math.PI / 2; // Vertical rotation (initially looking straight ahead)
let cameraDistance = 2.0;

/**
 * Set up camera event handlers.
 * @param {HTMLCanvasElement} canvas
 */
export function setUpCamera(canvas) {
    // Start dragging
    onmousedown = (mouseEvent) => {
        if (mouseEvent.button !== primaryButton || !canvas.matches(":hover"))
            return;

        // Stores the initial mouse position and camera angles for reference
        dragRefMouseX = mouseEvent.screenX;
        dragRefMouseY = mouseEvent.screenY;
        dragRefTheta = theta;
        dragRefPhi = phi;

        reactiveState.dragging = true;
    };

    // Stop dragging
    onmouseup = (mouseEvent) => {
        if (mouseEvent.button === primaryButton) reactiveState.dragging = false;
    };

    // While dragging
    onmousemove = (mouseEvent) => {
        if (!reactiveState.dragging) return;

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

        theta = absMod(thetaNew, thetaMax);
        phi = clamp(0.00000000001, phiNew, phiMax);
        // Prevents phi from being 0 to prevent a bug with lookAt

        sharedState.cameraPosition = cameraPosition(theta, phi, cameraDistance);
    };

    // Zooming
    onwheel = (wheelEvent) => {
        if (wheelEvent.target !== canvas && !reactiveState.dragging) return;
        cameraDistance = Math.max(
            minCameraDistance, // Ensures the zoom level does not go below minCameraDistance (0.1)
            cameraDistance + wheelEvent.deltaY * zoomSpeed,
        );
        sharedState.cameraPosition = cameraPosition(theta, phi, cameraDistance);
    };
}

/**
 * Calculate camera position.
 * @param {Number} theta
 * @param {Number} phi
 * @param {Number} cameraDistance
 * @returns {glMatrix.vec3}
 */
const cameraPosition = (theta, phi, cameraDistance) =>
    glMatrix.vec3.fromValues(
        Math.cos(theta) * Math.sin(phi) * cameraDistance,
        Math.cos(phi) * cameraDistance,
        -Math.sin(theta) * Math.sin(phi) * cameraDistance, // Account for WebGL being right-handed with -z
    );

/**
 * Limit `value` to be no less than `min` and no greater than `max`, inclusively.
 * @param {Number}  min
 * @param {Number} value
 * @param {Number} max
 * @returns {Number}
 */
const clamp = (min, value, max) => Math.min(Math.max(min, value), max);
