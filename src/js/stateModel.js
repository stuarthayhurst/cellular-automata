/**
 * @typedef StateModel
 * @type {object}
 * @property {ViewMode} viewMode
 * @property {Boolean} paused - If the simulation is paused.
 * @property {Number} baseStepIntervalMillis - Interval in milliseconds between simulation steps taken when not paused.
 * @property {Number} stepIntervalMultiplier - Multiplier applied to the base step interval, e.g. 0.5x, 3x.
 */
/** @typedef {"2D"|"3D"} ViewMode */

/** @type {StateModel} */
export const stateModel = {
    cellData: [],
    cameraPosition: null,
    cameraAngle: null,

    viewMode: "3D",

    // Simulation speed controls
    paused: true,
    baseStepIntervalMillis: 200,
    stepIntervalMultiplier: 1.0,
};

/**
 * Clear all cells.
 * @param stateModel {StateModel}
 */
export function clearCells(stateModel) {
    // TODO: implement this
}

/**
 * Pause and unpause the simulation.
 * @param stateModel {stateModel}
 */
export function togglePaused(stateModel) {
    stateModel.paused = !stateModel.paused;
}
