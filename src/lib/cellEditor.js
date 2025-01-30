import { sharedState } from "./sharedState.js";
import { reactiveState } from "./reactiveState.svelte.js";
import { posToIndex } from "./tools.js";

const primaryButton = 0;

let drawStroke = false;
/** @type {Number} */
let drawStrokeValue;
/** @type {Set<Number>} */
let drawStrokeChangedCells = new Set([]);

const flip = (i) => 1 - i;

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

        if (drawStrokeChangedCells.has(gridIndex)) return;

        if (initialClick) {
            sharedState.cells[gridIndex] = flip(sharedState.cells[gridIndex]);
            drawStrokeChangedCells.add(gridIndex);
        } else if (sharedState.cells[gridIndex] !== drawStrokeValue) {
            sharedState.cells[gridIndex] = drawStrokeValue;
            drawStrokeChangedCells.add(gridIndex);
        }

        return sharedState.cells[gridIndex];
    };

    // Start Drawing
    document.addEventListener("mousedown", (mouseEvent) => {
        if (
            mouseEvent.button !== primaryButton ||
            reactiveState.dragging ||
            reactiveState.interfaceMode !== "Editor"
        )
            return;

        drawStroke = true;
        drawStrokeValue = draw(true, mouseEvent.clientX, mouseEvent.clientY);
    });

    // Stop Drawing
    document.addEventListener("mouseup", () => {
        drawStroke = false;
        drawStrokeChangedCells = new Set([]);

        if (drawStrokeChangedCells.size === 0 || !reactiveState.atStart) return;

        reactiveState.historyStack.push({
            cells: drawStrokeChangedCells,
            value: drawStrokeValue,
        });
        reactiveState.redoStack = [];
    });

    // While Drawing
    document.addEventListener("mousemove", (mouseEvent) => {
        if (drawStroke) draw(false, mouseEvent.clientX, mouseEvent.clientY);
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
 * Undo last editor action.
 * @returns {void}
 */
export function editorUndo() {
    if (drawStroke) return;

    const change = reactiveState.historyStack.pop();
    change.cells.forEach(
        (cell) => (sharedState.cells[cell] = flip(change.value)),
    );
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
    if (drawStroke) return;

    const change = reactiveState.redoStack.pop();
    change.cells.forEach((cell) => (sharedState.cells[cell] = change.value));
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
 * Convert canvas coordinates into grid coordinates
 * No validation is done, this just convert values
 * @param {Number} canvasX
 * @param {Number} canvasY
 * @returns {[Number, Number]}
 */
const canvasToGridCoord = (canvasX, canvasY) => {
    const gridX = canvasX - sharedState.gridOffsetX;
    const gridY = canvasY - sharedState.gridOffsetY;

    const gridHeight = reactiveState.cellGridHeight * sharedState.pixelsPerCell;

    return [
        Math.floor(gridX / sharedState.pixelsPerCell),
        Math.floor((gridHeight - gridY) / sharedState.pixelsPerCell),
    ];
};

/**
 * Convert client position to canvas space.
 * @param {HTMLCanvasElement} canvas
 * @param {Number} clientX
 * @param {Number} clientY
 * @returns {[Number, Number]}
 */
const clientToCanvasSpace = (canvas, clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    return [clientX - rect.x, rect.height - (clientY - rect.y)];
};
