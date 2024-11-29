/**
 * @typedef StateModel
 * @type {object}
 * @property {Uint8Array} cells - Row-first cell values.
 * @property {Uint8Array} stepZeroCells - Row-first cell values in the starting state.
 * @property {Number} stepZeroCellGridWidth
 * @property {Number} stepZeroCellGridHeight
 * @property {Number} step - Number of simulation steps taken.
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
 * @property {function()} pause
 * @property {Number} baseStepIntervalMillis - Interval in milliseconds between simulation steps taken when not paused.
 * @property {Number} simulationSpeed - Divisor applied to the base step interval, e.g. 0.5x, 3x.
 * @property {function(Number)} setSimulationSpeed
 *
 * @property {Map<string, Array<function>>} changeListeners
 * @property {function(String, Function)} onChanged
 * @property {function(String)} notifyChange
 */
/** @typedef {"2D"|"3D"} ViewMode */

/** @type {StateModel} */
export const stateModel = {
    // Simulation
    cells: new Uint8Array(100),
    stepZeroCells: null,
    stepZeroCellGridWidth: 10,
    stepZeroCellGridHeight: 10,
    step: 0,
    cellGridWidth: 10,
    cellGridHeight: 10,

    // Camera controls
    cameraPosition: glMatrix.vec3.fromValues(2, 0, 0),
    fieldOfView: 90.0,

    // View Mode
    viewMode: "3D",
    setViewMode(newViewMode) {
        this.viewMode = newViewMode;
        this.notifyChange("viewMode");
    },

    // Simulation speed controls
    paused: true,
    baseStepIntervalMillis: 200,
    simulationSpeed: 1.0,
    togglePaused() {
        this.paused = !this.paused;
        this.notifyChange("paused");
    },
    pause() {
        this.paused = true;
        this.notifyChange("paused");
    },
    setSimulationSpeed(speed) {
        this.simulationSpeed = speed;
        this.notifyChange("simulationSpeed");
    },

    // Change event system
    changeListeners: new Map(),
    onChanged(eventName, callback) {
        this.changeListeners[eventName] ??= [];
        this.changeListeners[eventName].push(callback);
    },
    notifyChange(eventName) {
        this.changeListeners[eventName] ??= [];
        this.changeListeners[eventName].forEach((callback) => callback());
    },
};

// Glider
stateModel.cells[2] =
    stateModel.cells[10] =
    stateModel.cells[12] =
    stateModel.cells[21] =
    stateModel.cells[22] =
        1;
