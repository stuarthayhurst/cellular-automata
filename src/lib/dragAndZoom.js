import * as glMatrix from "gl-matrix";
import { sharedState } from "./sharedState.js";
import { reactiveState } from "./reactiveState.svelte.js";
import { absMod } from "./tools.js";

const secondaryButton = 2;

const thetaMax = 2 * Math.PI; // Full rotation around the horizontal axis (360 degrees)
const phiMax = Math.PI; // Vertical rotation limited to half a sphere (180 degrees)
const dragSensitivity = 0.005;
const zoomSpeed = 0.002;
const minCameraDistance = 0.1;

let dragRefTheta = 0;
let dragRefPhi = 0;
let dragRefGridOffsetX = 0;
let dragRefGridOffsetY = 0;
let dragRefMouseX = 0;
let dragRefMouseY = 0;

// Camera state variables
let theta = 0; // Horizontal rotation (0 to 2π)
let phi = Math.PI / 2; // Vertical rotation (initially looking straight ahead)
let cameraDistance = 2.0;

/**
 * Set up camera event handlers.
 * @param {HTMLCanvasElement} canvas
 * @returns {void}
 */
export function setUpDragAndZoom(canvas) {
    /*
        Drag
     */

    // Start dragging
    document.addEventListener("mousedown", (mouseEvent) => {
        if (mouseEvent.button !== secondaryButton || !canvas.matches(":hover"))
            return;

        // Stores the initial mouse position and camera angles for reference
        dragRefMouseX = mouseEvent.screenX;
        dragRefMouseY = mouseEvent.screenY;
        if (reactiveState.interfaceMode === "3D View") {
            dragRefTheta = theta;
            dragRefPhi = phi;
        } else {
            dragRefGridOffsetX = sharedState.gridOffsetX;
            dragRefGridOffsetY = sharedState.gridOffsetY;
        }

        reactiveState.dragging = true;
    });

    // Stop dragging
    document.addEventListener("mouseup", (mouseEvent) => {
        if (mouseEvent.button === secondaryButton)
            reactiveState.dragging = false;
    });

    // While dragging
    /**
     * @param {Number} mouseScreenY
     * @param {Number} deltaX
     * @param {Number} deltaY
     * @returns {void}
     */
    const onmousemove_3d_view = (mouseScreenY, deltaX, deltaY) => {
        const deltaYMin = -dragRefPhi / dragSensitivity;
        const deltaYMax = (phiMax - dragRefPhi) / dragSensitivity;

        if (deltaY < deltaYMin || deltaY > deltaYMax) {
            dragRefPhi = phi;
            dragRefMouseY = mouseScreenY;
        }

        const thetaNew = dragRefTheta + deltaX * dragSensitivity;
        const phiNew = dragRefPhi + deltaY * dragSensitivity;

        theta = absMod(thetaNew, thetaMax);
        phi = clamp(0.00000000001, phiNew, phiMax);
        // Prevents phi from being 0 to prevent a bug with lookAt

        sharedState.cameraPosition = cameraPosition(theta, phi, cameraDistance);
    };

    /**
     * @param {Number} deltaX
     * @param {Number} deltaY
     * @returns {void}
     */
    const onmousemove_editor = (deltaX, deltaY) => {
        sharedState.gridOffsetX = dragRefGridOffsetX - deltaX;
        sharedState.gridOffsetY = dragRefGridOffsetY + deltaY;
    };

    document.addEventListener("mousemove", (mouseEvent) => {
        if (!reactiveState.dragging) return;

        const deltaX = dragRefMouseX - mouseEvent.screenX;
        const deltaY = dragRefMouseY - mouseEvent.screenY;

        if (reactiveState.interfaceMode === "Editor") {
            onmousemove_editor(deltaX, deltaY);
        } else {
            onmousemove_3d_view(mouseEvent.screenY, deltaX, deltaY);
        }
    });

    /*
        Zoom
     */

    /**
     * @param {Number} wheel
     * @returns {void}
     */
    const onwheel_editor = (wheel) => {
        const change = wheel * -0.1;

        const pixels = sharedState.pixelsPerCell;
        const newPixels = sharedState.pixelsPerCell + change;
        const zoomFactor = newPixels / pixels;

        if (newPixels < 10) return; // @Improve

        const centreX = canvas.width / 2;
        const centreY = canvas.height / 2;

        sharedState.gridOffsetX =
            centreX - (centreX - sharedState.gridOffsetX) * zoomFactor;
        sharedState.gridOffsetY =
            centreY - (centreY - sharedState.gridOffsetY) * zoomFactor;

        sharedState.pixelsPerCell = Math.max(10, newPixels);
    };

    /**
     * @param {Number} wheel
     * @returns {void}
     */
    const onwheel_3d_view = (wheel) => {
        cameraDistance = Math.max(
            minCameraDistance,
            cameraDistance + wheel * zoomSpeed,
        );
        sharedState.cameraPosition = cameraPosition(theta, phi, cameraDistance);
    };

    document.addEventListener("wheel", (wheelEvent) => {
        if (wheelEvent.target !== canvas && !reactiveState.dragging) return;

        if (reactiveState.interfaceMode === "Editor") {
            onwheel_editor(wheelEvent.deltaY);
        } else {
            onwheel_3d_view(wheelEvent.deltaY);
        }
    });
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
