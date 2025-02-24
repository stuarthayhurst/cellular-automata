import { gameOfLifeRule } from "./gameOfLife.js";

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
 * @property {Array<ChangeT>} historyStack
 * @property {Array<ChangeT>} redoStack
 * @property {function(Number, Number):Number} simulationRule
 * @property {Boolean} aliasBackground - 2D mode - Toggle aliasing the background tiles
 */

/** @type {ReactiveState} */
export const reactiveState = $state({
    paused: true,
    interfaceMode: "Editor",
    shape: "torus",
    simulationSpeed: 1,
    atStart: true,
    cellGridWidth: 160,
    cellGridHeight: 80,
    dragging: false,
    historyStack: [],
    redoStack: [],
    simulationRule: gameOfLifeRule,
    aliasBackground: true,
});
