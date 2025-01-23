import * as glMatrix from "gl-matrix";
import { reactiveState } from "./reactiveState.svelte.js";

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
 * @property {glMatrix.vec3} cameraPosition
 * @property {String} renderMode
 * @property {Number} gridCellsPerWidth
 * @property {Number} gridOffsetX - A value of -1 indicates 1 cell is offscreen, to the left
 * @property {Number} gridOffsetY - A value of -1 indicates 1 cell is offscreen, to the bottom
 */
/** @type {SharedState} */
export const sharedState = {
    cells: new Uint8Array(100),
    startCells: null,
    startCellGridWidth: undefined,
    startCellGridHeight: undefined,
    maxCells: 0,
    baseColour: glMatrix.vec3.fromValues(1, 0, 0),
    cellColour: glMatrix.vec3.fromValues(0, 1, 1),
    cameraPosition: glMatrix.vec3.fromValues(2, 0, 0),
    renderMode: "3D",
    gridCellsPerWidth: 20.0,
    gridOffsetX: 0.0,
    gridOffsetY: 0.0,
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

sharedState.cells[2] =
    sharedState.cells[10] =
    sharedState.cells[12] =
    sharedState.cells[21] =
    sharedState.cells[22] =
        1;
