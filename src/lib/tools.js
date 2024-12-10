/**
 * Mod a value, looping it around correctly when it becomes negative.
 * @param {Number} x
 * @param {Number} m
 * @returns {number}
 */
export const absMod = (x, m) => ((x % m) + m) % m;
