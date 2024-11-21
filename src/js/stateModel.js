import * as glMatrix from "./gl-matrix/src/index.js";

/**
 * @typedef StateModel
 * @type {object}
 * @property {Array<Number>} cells - Row-first cell values.
 * @property {Number} cellGridWidth
 * @property {Number} cellGridHeight
 *
 * @property {vec3} cameraPosition - Location of the camera.
 * @property {vec3} cameraDirection - Direction the camera is facing, so it's looking at cameraPosition + cameraDirection.
 * @property {Number} fieldOfView - Field of view of the camera.
 *
 * @property {ViewMode} viewMode - Whether to show the 2D editor or 3D view in the interface.
 * @property {function(ViewMode)} setViewMode
 *
 * @property {Boolean} paused - If the simulation is paused.
 * @property {function()} togglePaused
 * @property {Number} baseStepIntervalMillis - Interval in milliseconds between simulation steps taken when not paused.
 * @property {Number} stepIntervalMultiplier - Multiplier applied to the base step interval, e.g. 0.5x, 3x.
 *
 * @property {Map<string, Array<function>>} eventListeners
 * @property {function(String, Function)} addEventListener
 * @property {function(String)} broadcastEvent
 */
/** @typedef {"2D"|"3D"} ViewMode */

/** @type {StateModel} */
export const stateModel = {
    // Cell data
    cells: [],
    cellGridWidth: 10,
    cellGridHeight: 10,

    // Camera controls
    cameraPosition: glMatrix.vec3.fromValues(1.0, 1.0, 1.0),
    cameraDirection: glMatrix.vec3.fromValues(-1.0, -1.0, -1.0),
    fieldOfView: 90.0,

    // View Mode
    viewMode: "3D",
    setViewMode(newViewMode) {
        this.viewMode = newViewMode;
        this.broadcastEvent("onViewModeChanged");
    },

    // Simulation speed controls
    paused: true,
    togglePaused() {
        this.paused = !this.paused;
        this.broadcastEvent("onPausedChanged");
    },
    baseStepIntervalMillis: 200,
    stepIntervalMultiplier: 1.0,

    // Events system
    eventListeners: new Map(),
    addEventListener(eventName, callback) {
        this.eventListeners[eventName] ??= [];
        this.eventListeners[eventName].push(callback);
    },
    broadcastEvent(eventName) {
        this.eventListeners[eventName] ??= [];
        this.eventListeners[eventName].forEach((callback) => callback());
    },
};
