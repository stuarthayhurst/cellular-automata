import * as glMatrix from "gl-matrix";
import { sharedState } from "./sharedState.js";
import { reactiveState } from "./reactiveState.svelte.js";

/**
 * Convert canvas coordinates into grid coordinates
 * No validation is done, this just convert values
 * @param {Number} canvasX
 * @param {Number} canvasY
 * @returns {[Number, Number]}
 */
export const canvasToGridCoord = (canvasX, canvasY) => {
    const gridX = canvasX - sharedState.gridOffsetX;
    const gridY = canvasY - sharedState.gridOffsetY;

    const gridHeight = reactiveState.cellGridHeight * sharedState.pixelsPerCell;

    return [
        Math.floor(gridX / sharedState.pixelsPerCell),
        Math.floor((gridHeight - gridY) / sharedState.pixelsPerCell),
    ];
};

/**
 * Convert client position to canvas space.
 * @param {HTMLCanvasElement} canvas
 * @param {Number} clientX
 * @param {Number} clientY
 * @returns {[Number, Number]}
 */
export const clientToCanvasSpace = (canvas, clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    return [clientX - rect.x, rect.height - (clientY - rect.y)];
};

/**
 * @param {String} hex e.g. #fff
 * @returns {ColourRGB}
 */
export const hexToRGB = (hex) => [
    parseInt(hex.substring(1, 3), 16),
    parseInt(hex.substring(3, 5), 16),
    parseInt(hex.substring(5, 7), 16),
];

/**
 * hello -> Hello
 * @param {String} str
 * @returns {String}
 */
export const titleCase = (str) => str[0].toUpperCase() + str.slice(1);

/**
 * Mod a value, looping it around correctly when it becomes negative.
 * @param {Number} x
 * @param {Number} m
 * @returns {Number}
 */
export const absMod = (x, m) => ((x % m) + m) % m;

/**
 * Limit `value` to be no less than `min` and no greater than `max`, inclusively.
 * @param {Number}  min
 * @param {Number} value
 * @param {Number} max
 * @returns {Number}
 */
export const clamp = (min, value, max) => Math.min(Math.max(min, value), max);

/**
 * Convert 0-255 RGB to 0-1 Vec3 RGB.
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @returns {glMatrix.vec3}
 */
export const rgbVec = (r, g, b) =>
    glMatrix.vec3.fromValues(r / 255, g / 255, b / 255);

/**
 * Convert 1D array index to 2D position.
 * @param {Number} i - Index
 * @param {Number} w - Cell Grid width
 * @returns {[Number, Number]}
 */
export const indexToPos = (i, w) => [i % w, Math.floor(i / w)];

/**
 * Convert 2D position to 1D array index.
 * @param {Number} x
 * @param {Number} y
 * @param {Number} w - Cell Grid width
 * @param {Number} h - Cell Grid height
 * @returns {Number}
 */
export const posToIndex = (x, y, w, h) => absMod(x + y * w, w * h);

// noinspection JSUnusedGlobalSymbols
/**
 * Count living cells.
 * @param {Uint8Array} cells
 * @returns {Number}
 */
export const population = (cells) =>
    cells.reduce((acc, cellState) => acc + cellState);

/**
 * Meter function execution time.
 * @template V
 * @param {function:V} func
 * @returns {[V, Number]}
 */
export const meter = (func) => {
    const startTime = performance.now();
    const returnValue = func();
    const endTime = performance.now();
    return [returnValue, Math.round(endTime - startTime)];
};
