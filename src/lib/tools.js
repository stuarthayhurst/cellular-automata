import * as glMatrix from "gl-matrix";

/**
 * Mod a value, looping it around correctly when it becomes negative.
 * @param {Number} x
 * @param {Number} m
 * @returns {number}
 */
export const absMod = (x, m) => ((x % m) + m) % m;

/**
 *
 * @param {Number}  r
 * @param {Number}  g
 * @param {Number}  b
 * @returns {glMatrix.vec3}
 */
export const colour_rgb = (r, g, b) =>
    glMatrix.vec3.fromValues(r / 255, g / 255, b / 255);
