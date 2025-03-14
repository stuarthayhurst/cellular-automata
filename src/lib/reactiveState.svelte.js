import { briansBrainRule } from "./simulation.js";
import { sharedState } from "./sharedState.js";
import { generateRandomCells } from "./preset.js";

/*
`reactiveState` contains state that needs universal reactivity (provided by
Svelte with `$state()`), i.e. UI components need to be 'notified' of changes.
Learn more: https://svelte.dev/tutorial/svelte/universal-reactivity.
 */

/**
 * @typedef {{
 *   setCellsAlive: Set<Number>,
 *   setCellsDead: Set<Number>,
 *   actionName: String
 * }} ChangeT
 */

/**
 * @typedef ReactiveState
 * @type {object}
 * @property {Boolean} paused
 * @property {"Editor"|"3D View"} interfaceMode
 * @property {"torus"|"sphere"} shape
 * @property {Number} simulationSpeed
 * @property {Boolean} atStart
 * @property {Number} cellGridWidth
 * @property {Number} cellGridHeight
 * @property {Boolean} dragging
 * @property {ChangeT[]} historyStack
 * @property {ChangeT[]} redoStack
 * @property {function(Number, Number):Number} simulationRule
 * @property {Boolean} aliasBackground - 2D mode - Toggle aliasing the background tiles
 * @property {Boolean} raiseCells
 * @property {Number} raisedCellHeight
 * @property {String} selectedColour - Hex or preset like "blue"
 * @property {String[]} customColours - Hex
 * @property {Boolean} controlsVisible
 * @property {Boolean} showSettings
 * @property {Number} randomFillProbability
 */

/** @type {ReactiveState} */
export const reactiveState = $state({
    paused: true,
    interfaceMode: "3D View",
    shape: "torus",
    simulationSpeed: 3,
    atStart: true,
    cellGridWidth: 160,
    cellGridHeight: 80,
    dragging: false,
    historyStack: [],
    redoStack: [],
    simulationRule: briansBrainRule,
    aliasBackground: true,
    selectedColour: "blue",
    raiseCells: true,
    raisedCellHeight: 0.05,
    customColours: [],
    controlsVisible: true,
    showSettings: false,
    randomFillProbability: 0.5,
});

sharedState.cells = new Uint8Array(
    generateRandomCells(
        reactiveState.cellGridWidth,
        reactiveState.cellGridHeight,
    ).flat(),
);
