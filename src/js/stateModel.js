/**
 * @typedef StateModel
 * @type {object}
 * @property {Array<Number>} cellData - Cell data.
 * @property {Vec3} cameraPosition - Location of the camera.
 * @property {Vec3} cameraDirection - Direction the camera is facing, so it's looking at cameraPosition + cameraDirection.
 * @property {Number} fieldOfView - Field of view of the camera.
 * @property {ViewMode} viewMode - Whether to show the 2D editor or 3D view in the interface.
 * @property {Boolean} paused - If the simulation is paused.
 * @property {Number} baseStepIntervalMillis - Interval in milliseconds between simulation steps taken when not paused.
 * @property {Number} stepIntervalMultiplier - Multiplier applied to the base step interval, e.g. 0.5x, 3x.
 */
/** @typedef {"2D"|"3D"} ViewMode */

/** @type {StateModel} */
export const stateModel = {
    cellData: [],

    // Camera controls
    cameraPosition: glMatrix.vec3.fromValues(1.0, 1.0, 1.0),
    cameraDirection: glMatrix.vec3.fromValues(-1.0, -1.0, -1.0),
    fieldOfView: 90.0,

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
 * @param stateModel {StateModel}
 */
export function togglePaused(stateModel) {
    stateModel.paused = !stateModel.paused;
}
