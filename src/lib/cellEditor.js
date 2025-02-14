import { sharedState } from "./sharedState.js";
import { reactiveState } from "./reactiveState.svelte.js";
import { canvasToGridCoord, clientToCanvasSpace, posToIndex } from "./tools.js";

const primaryButton = 0;

let drawingStroke = false;
/** @type {Number} */
let strokeValue;
/** @type {Set<Number>} */
let strokeChangedCells = new Set([]);

/**
 * Add event listeners for cell editor.
 * @param {HTMLCanvasElement} canvas
 * @returns {void}
 */
export function setUpCellEditor(canvas) {
    /*
        Drawing
     */

    /**
     * @param {Boolean} initialClick
     * @param {Number} mouseX
     * @param {Number} mouseY
     * @returns {Number|void}
     */
    const draw = (initialClick, mouseX, mouseY) => {
        const canvasMousePos = clientToCanvasSpace(canvas, mouseX, mouseY);
        const clickGridCoord = canvasToGridCoord(...canvasMousePos);

        /** @type {Boolean} */
        const clickNotInGrid =
            clickGridCoord[0] < 0 ||
            clickGridCoord[0] >= reactiveState.cellGridWidth ||
            clickGridCoord[1] < 0 ||
            clickGridCoord[1] >= reactiveState.cellGridHeight;

        if (clickNotInGrid) return;

        const gridIndex = posToIndex(
            ...clickGridCoord,
            reactiveState.cellGridWidth,
            reactiveState.cellGridHeight,
        );

        if (strokeChangedCells.has(gridIndex)) return;

        if (initialClick) {
            sharedState.cells[gridIndex] = flip(sharedState.cells[gridIndex]);
            strokeChangedCells.add(gridIndex);
        } else if (sharedState.cells[gridIndex] !== strokeValue) {
            sharedState.cells[gridIndex] = strokeValue;
            strokeChangedCells.add(gridIndex);
        }

        return sharedState.cells[gridIndex];
    };

    // Start Drawing
    document.addEventListener("mousedown", (mouseEvent) => {
        if (
            !canvas.matches(":hover") ||
            mouseEvent.button !== primaryButton ||
            reactiveState.dragging ||
            reactiveState.interfaceMode !== "Editor"
        )
            return;

        drawingStroke = true;
        strokeValue = draw(true, mouseEvent.clientX, mouseEvent.clientY);
    });

    // Stop Drawing
    document.addEventListener("mouseup", () => {
        drawingStroke = false;

        pushHistory(Change(strokeChangedCells, strokeValue, "Drawing"));

        strokeChangedCells = new Set([]);
    });

    // While Drawing
    document.addEventListener("mousemove", (mouseEvent) => {
        if (drawingStroke) draw(false, mouseEvent.clientX, mouseEvent.clientY);
    });

    /*
        Keyboard Shortcuts
     */

    document.addEventListener("keydown", (keyboardEvent) => {
        // keyboardEvent.key === "A" if shift else "a"
        if (
            keyboardEvent.ctrlKey &&
            keyboardEvent.key === "z" &&
            mayUndo(reactiveState.historyStack.length, reactiveState.atStart)
        ) {
            editorUndo();
        } else if (
            keyboardEvent.ctrlKey &&
            keyboardEvent.key === "Z" &&
            mayRedo(reactiveState.redoStack.length, reactiveState.atStart)
        )
            editorRedo();
    });
}

/**
 * Clear all cells.
 * @returns {void}
 */
export function clearGrid() {
    let clearedCells = new Set();
    sharedState.cells.forEach((cell, i) => {
        if (cell === 1) {
            sharedState.cells[i] = 0;
            clearedCells.add(i);
        }
    });

    pushHistory(Change(clearedCells, 0, "Clear"));
}

/**
 * Undo last editor action.
 * @returns {void}
 */
export function editorUndo() {
    if (drawingStroke) return;

    /** @type {ChangeT} */
    const change = reactiveState.historyStack.pop();
    change.setCellsDead.forEach((i) => (sharedState.cells[i] = 1));
    change.setCellsAlive.forEach((i) => (sharedState.cells[i] = 0));
    reactiveState.redoStack.push(change);
}

/**
 * If we are allowed to undo.
 *
 * Takes in these arguments instead of checking reactiveState directly
 * so that its reactivity can be determined.
 *
 * @param {Number} historyStackLength
 * @param {Boolean} atStart
 * @returns {Boolean}
 */
export const mayUndo = (historyStackLength, atStart) =>
    historyStackLength > 0 && atStart;

/**
 * Redo last editor action.
 * @returns {void}
 */
export function editorRedo() {
    if (drawingStroke) return;

    /** @type {ChangeT} */
    const change = reactiveState.redoStack.pop();
    change.setCellsDead.forEach((i) => (sharedState.cells[i] = 0));
    change.setCellsAlive.forEach((i) => (sharedState.cells[i] = 1));
    reactiveState.historyStack.push(change);
}

/**
 * If we are allowed to redo.
 *
 * Takes in these arguments instead of checking reactiveState directly
 * so that its reactivity can be determined.
 *
 * @param {Number} redoStackLength
 * @param {Boolean} atStart
 * @returns {Boolean}
 */
export const mayRedo = (redoStackLength, atStart) =>
    redoStackLength > 0 && atStart;

/**
 * Push change to the history stack.
 * @param {ChangeT} change
 * @returns {void}
 */
export function pushHistory(change) {
    if (!reactiveState.atStart || changeSize(change) === 0) return;
    reactiveState.historyStack.push(change);
    reactiveState.redoStack = [];
}

/**
 * ChangeT constructor.
 * @param {Set<Number>} cells
 * @param {Number} value
 * @param {String} actionName
 * @returns {ChangeT}
 */
const Change = (cells, value, actionName) =>
    value === 1
        ? { setCellsAlive: cells, setCellsDead: new Set(), actionName }
        : { setCellsDead: cells, setCellsAlive: new Set(), actionName };

/**
 * Total number of cells changed in a change.
 * @param change
 * @returns {number}
 */
const changeSize = (change) =>
    change.setCellsAlive.size + change.setCellsDead.size;

/**
 * 0 => 1
 * 1 => 0
 * @param {Number} n
 * @returns {number}
 */
const flip = (n) => 1 - n;
