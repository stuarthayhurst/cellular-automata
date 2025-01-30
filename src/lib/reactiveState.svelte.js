/*
`reactiveState` contains state that needs universal reactivity (provided by
Svelte with `$state()`), i.e. UI components need to be 'notified' of changes.
Learn more: https://svelte.dev/tutorial/svelte/universal-reactivity.
 */

/**
 * @typedef {{cells: Set<Number>, value: Number}} Change
 */

/**
 * @typedef ReactiveState
 * @type {object}
 * @property {Boolean} paused
 * @property {"Editor"|"3D View"} interfaceMode
 * @property {Number} simulationSpeed
 * @property {Boolean} atStart
 * @property {Number} cellGridWidth
 * @property {Number} cellGridHeight
 * @property {Boolean} dragging
 * @property {Array<Change>} historyStack
 * @property {Array<Change>} redoStack
 */
/** @type {ReactiveState} */
export const reactiveState = $state({
    paused: true,
    interfaceMode: "3D View",
    simulationSpeed: 1,
    atStart: true,
    cellGridWidth: 10,
    cellGridHeight: 10,
    dragging: false,
    historyStack: [],
    redoStack: [],
});
