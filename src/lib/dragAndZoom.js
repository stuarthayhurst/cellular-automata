import * as glMatrix from "gl-matrix";
import { sharedState } from "./sharedState.js";
import { reactiveState } from "./reactiveState.svelte.js";
import { absMod, clientToCanvasSpace, clamp } from "./tools.js";

const primaryButton = 0;
const secondaryButton = 2;

const thetaMax = 2 * Math.PI; // Full rotation around the horizontal axis (360 degrees)
const phiMax = Math.PI; // Vertical rotation limited to half a sphere (180 degrees)
const dragSensitivity = 0.005;
const zoomSpeed = 0.002;
const minCameraDistance = (shape) => (shape === "sphere" ? 1.15 : 0.1);

let dragRefTheta = 0;
let dragRefPhi = 0;
let dragRefGridOffsetX = 0;
let dragRefGridOffsetY = 0;
let dragRefMouseX = 0;
let dragRefMouseY = 0;

// Camera state variables
let theta = 0; // Horizontal rotation (0 to 2π)
let phi = Math.PI / 3.5; // Vertical rotation
let cameraDistance = 2.0;

/**
 * Set up camera event handlers.
 * @param {HTMLCanvasElement} canvas
 * @returns {void}
 */
export function setUpDragAndZoom(canvas) {
    sharedState.cameraPosition = cameraPosition(theta, phi, cameraDistance);

    const gridWidth = () =>
        reactiveState.cellGridWidth * sharedState.pixelsPerCell;
    const gridHeight = () =>
        reactiveState.cellGridHeight * sharedState.pixelsPerCell;
    sharedState.gridOffsetX = canvas.width / 2 - gridWidth() / 2;
    sharedState.gridOffsetY = canvas.height / 2 - gridHeight() / 2;

    /*
        Drag
     */

    /**
     * @param {Number} button
     * @returns {Boolean}
     */
    const dragButton = (button) =>
        reactiveState.interfaceMode === "3D View"
            ? button === primaryButton || button === secondaryButton
            : button === secondaryButton;

    // Start dragging
    document.addEventListener("mousedown", (mouseEvent) => {
        if (!dragButton(mouseEvent.button) || !canvas.matches(":hover")) return;

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
        if (dragButton(mouseEvent.button)) reactiveState.dragging = false;
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
     * @param {Number} mouseX
     * @param {Number} mouseY
     * @returns {void}
     */
    const onwheel_editor = (wheel, mouseX, mouseY) => {
        const pixels = sharedState.pixelsPerCell;
        const change = wheel * -0.1;
        const sensitivity = pixels / 100.0;
        const newPixels = Math.max(
            7,
            sharedState.pixelsPerCell + change * sensitivity,
        );
        const zoomFactor = newPixels / pixels;

        const newGridOffsetX =
            mouseX - (mouseX - sharedState.gridOffsetX) * zoomFactor;
        const newGridOffsetY =
            mouseY - (mouseY - sharedState.gridOffsetY) * zoomFactor;

        dragRefGridOffsetX += newGridOffsetX - sharedState.gridOffsetX;
        dragRefGridOffsetY += newGridOffsetY - sharedState.gridOffsetY;

        sharedState.gridOffsetX = newGridOffsetX;
        sharedState.gridOffsetY = newGridOffsetY;
        sharedState.pixelsPerCell = newPixels;
    };

    /**
     * @param {Number} wheel
     * @returns {void}
     */
    const onwheel_3d_view = (wheel) => {
        cameraDistance = Math.max(
            minCameraDistance(reactiveState.shape),
            cameraDistance + wheel * zoomSpeed,
        );
        sharedState.cameraPosition = cameraPosition(theta, phi, cameraDistance);
    };

    document.addEventListener("wheel", (wheelEvent) => {
        if (wheelEvent.target !== canvas && !reactiveState.dragging) return;

        if (reactiveState.interfaceMode === "Editor") {
            onwheel_editor(
                wheelEvent.deltaY,
                ...clientToCanvasSpace(
                    canvas,
                    wheelEvent.clientX,
                    wheelEvent.clientY,
                ),
            );
        } else {
            onwheel_3d_view(wheelEvent.deltaY);
        }
    });
}

/**
 * If the camera distance is below the minimum,
 * update the camera position with the new distance.
 * @returns {void}
 */
export function bumpZoom() {
    const minDistance = minCameraDistance(reactiveState.shape);
    if (cameraDistance < minDistance) {
        cameraDistance = minDistance;
        sharedState.cameraPosition = cameraPosition(theta, phi, cameraDistance);
    }
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
