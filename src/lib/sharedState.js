import * as glMatrix from "gl-matrix";
import { reactiveState } from "./reactiveState.svelte.js";
import { rgbVec } from "./tools.js";

/*
`sharedState` contains state that needs to be shared between components but
doesn't need the reactivity provided by Svelte. Camera position for example,
relates to the user interface, but its value is read every frame: components
don't need to be 'notified' of its value changing.
 */

/**
 * @typedef SharedState
 * @type {object}
 * @property {Uint8Array} cells
 * @property {Uint8Array} startCells
 * @property {Number} startCellGridWidth
 * @property {Number} startCellGridHeight
 * @property {Number} maxCells
 * @property {glMatrix.vec3} baseColour
 * @property {glMatrix.vec3} cellColour
 * @property {glMatrix.vec3} unmappedColour
 * @property {glMatrix.vec3} aliasBaseColour
 * @property {glMatrix.vec3} aliasCellColour
 * @property {glMatrix.vec3} cameraPosition
 * @property {Number} pixelsPerCell
 * @property {Number} gridOffsetX - A value of -1 indicates 1 pixel is offscreen, to the left
 * @property {Number} gridOffsetY - A value of -1 indicates 1 pixel is offscreen, to the bottom
 * @property {Number} borderSize - 2D mode
 * @property {glMatrix.vec3} borderColour - 2D mode
 * @property {glMatrix.vec3} backgroundBorderColour - 2D mode
 */
/** @type {SharedState} */
export const sharedState = {
    cells: undefined,
    startCells: null,
    startCellGridWidth: undefined,
    startCellGridHeight: undefined,
    maxCells: 0,
    baseColour: rgbVec(12, 56, 102),
    cellColour: rgbVec(30, 144, 255),
    unmappedColour: rgbVec(255, 255, 255),
    aliasBaseColour: rgbVec(102, 102, 102),
    aliasCellColour: rgbVec(128, 128, 128),
    cameraPosition: glMatrix.vec3.fromValues(2, 0, 0),
    pixelsPerCell: 10.0,
    gridOffsetX: 0.0,
    gridOffsetY: 0.0,
    borderSize: 0.015,
    borderColour: rgbVec(0, 0, 0),
    backgroundBorderColour: rgbVec(77, 77, 77),
};

export function saveStartState() {
    sharedState.startCells = new Uint8Array(sharedState.cells);
    sharedState.startCellGridWidth = reactiveState.cellGridWidth;
    sharedState.startCellGridHeight = reactiveState.cellGridHeight;
}

export function resetToStart() {
    if (reactiveState.atStart) return;
    sharedState.cells = new Uint8Array(sharedState.startCells);
    reactiveState.atStart = true;
    reactiveState.cellGridWidth = sharedState.startCellGridWidth;
    reactiveState.cellGridHeight = sharedState.startCellGridHeight;
}
