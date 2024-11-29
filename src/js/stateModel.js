/**
 * @typedef StateModel
 * @type {object}
 * @property {Uint8Array} cells - Row-first cell values.
 * @property {Number} cellGridWidth
 * @property {Number} cellGridHeight
 *
 * @property {vec3} cameraPosition - Location of the camera.
 * @property {Number} fieldOfView - Field of view of the camera.
 *
 * @property {ViewMode} viewMode - Whether to show the 2D editor or 3D view in the interface.
 * @property {function(ViewMode)} setViewMode
 *
 * @property {Boolean} paused - If the simulation is paused.
 * @property {function()} togglePaused
 * @property {Number} baseStepIntervalMillis - Interval in milliseconds between simulation steps taken when not paused.
 * @property {Number} simulationSpeed - Divisor applied to the base step interval, e.g. 0.5x, 3x.
 * @property {function(Number)} setSimulationSpeed
 *
 * @property {Map<string, Array<function>>} eventListeners
 * @property {function(String, Function)} addEventListener
 * @property {function(String)} broadcastEvent
 */
/** @typedef {"2D"|"3D"} ViewMode */

/** @type {StateModel} */
export const stateModel = {
    // Cell data
    cells: new Uint8Array(100),
    cellGridWidth: 10,
    cellGridHeight: 10,

    // Camera controls
    cameraPosition: glMatrix.vec3.fromValues(2, 0, 0),
    fieldOfView: 90.0,

    // View Mode
    viewMode: "3D",
    setViewMode(newViewMode) {
        this.viewMode = newViewMode;
        this.broadcastEvent("onViewModeChanged");
    },

    // Simulation speed controls
    paused: true,
    baseStepIntervalMillis: 200,
    simulationSpeed: 1.0,
    togglePaused() {
        this.paused = !this.paused;
        this.broadcastEvent("onPausedChanged");
    },
    setSimulationSpeed(speed) {
        this.simulationSpeed = speed;
        this.broadcastEvent("onSimulationSpeedChanged");
    },

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

// Glider
stateModel.cells[2] =
    stateModel.cells[10] =
    stateModel.cells[12] =
    stateModel.cells[21] =
    stateModel.cells[22] =
        1;
