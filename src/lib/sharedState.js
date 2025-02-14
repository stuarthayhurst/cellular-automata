import * as glMatrix from "gl-matrix";
import { reactiveState } from "./reactiveState.svelte.js";
import { colour_rgb } from "./tools.js";

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
 * @property {glMatrix.vec3} aliasBaseColour
 * @property {glMatrix.vec3} aliasCellColour
 * @property {glMatrix.vec3} cameraPosition
 * @property {Number} pixelsPerCell
 * @property {Number} gridOffsetX - A value of -1 indicates 1 pixel is offscreen, to the left
 * @property {Number} gridOffsetY - A value of -1 indicates 1 pixel is offscreen, to the bottom
 * @property {Number} borderSize - 2D mode
 * @property {glMatrix.vec3} borderColour - 2D mode
 * @property {glMatrix.vec3} backgroundBorderColour - 2D mode
 * @property {Boolean} aliasBackground - 2D mode - Toggle aliasing the background tiles
 */
/** @type {SharedState} */
export const sharedState = {
    cells: new Uint8Array(100),
    startCells: null,
    startCellGridWidth: undefined,
    startCellGridHeight: undefined,
    maxCells: 0,
    baseColour: colour_rgb(12, 56, 102),
    cellColour: colour_rgb(30, 144, 255),
    aliasBaseColour: colour_rgb(102, 102, 102),
    aliasCellColour: colour_rgb(128, 128, 128),
    cameraPosition: glMatrix.vec3.fromValues(2, 0, 0),
    pixelsPerCell: 70.0,
    gridOffsetX: 0.0,
    gridOffsetY: 0.0,
    borderSize: 0.015,
    borderColour: colour_rgb(0, 0, 0),
    backgroundBorderColour: colour_rgb(77, 77, 77),
    aliasBackground: true,
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
