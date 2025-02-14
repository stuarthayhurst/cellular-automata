import { reactiveState } from "./reactiveState.svelte.js";
import { sharedState, saveStartState } from "./sharedState.js";
import { indexToPos, posToIndex } from "./tools.js";

const baseStepIntervalMillis = 200;

let simulationInterval = null;

/**
 * Clear the cellular automaton
 * @returns {void}
 */
export function clearGrid() {
    const affectedCells = new Set();
    sharedState.cells.forEach((value, index) => {
        if (value === 1) {
            affectedCells.add(index);
        }
    });
    reactiveState.historyStack.push({
        cells: affectedCells,
        value: 0,
    });
    sharedState.cells.fill(0);
    reactiveState.redoStack = [];
}

/**
 * Take one step forward.
 * @returns {void}
 */
export function stepForward() {
    if (reactiveState.atStart) saveStartState();

    sharedState.cells = nextCells(
        sharedState.cells,
        reactiveState.cellGridWidth,
        reactiveState.cellGridHeight,
    );

    reactiveState.atStart = false;
}

/**
 * Return the grid of cells after one step.
 * @param {Uint8Array} cells - Array of cells.
 * @param {Number} w - Cell grid width.
 * @param {Number} h - Cell grid height.
 * @returns {Uint8Array}
 */
export const nextCells = (cells, w, h) =>
    cells.map((cellState, i) =>
        nextCellState(
            cellState,
            countMooresNeighbours(cells, w, h, ...indexToPos(i, w)),
        ),
    );

/**
 * Calculate the next state of a cell in Conway's game of life.
 * @param {0|1} cellState - The current cell state.
 * @param {Number} aliveNeighbours - The number of alive Moore's neighbours of the cell.
 * @returns {0|1} - The new cell state.
 */
export const nextCellState = (cellState, aliveNeighbours) =>
    (cellState === 1 && (aliveNeighbours === 2 || aliveNeighbours === 3)) ||
    (cellState === 0 && aliveNeighbours === 3)
        ? 1
        : 0;

/**
 * Count Moore's Neighbours
 * @param {Uint8Array} cells - Array of cells.
 * @param {Number} w - Cell grid width.
 * @param {Number} h - Cell grid height.
 * @param {Number} x - Cell X.
 * @param {Number} y - Cell Y.
 * @returns {Number} - The number of Moore's Neighbours.
 */
export function countMooresNeighbours(cells, w, h, x, y) {
    let neighbours = 0;

    for (let offsetX = -1; offsetX <= 1; offsetX++) {
        for (let offsetY = -1; offsetY <= 1; offsetY++) {
            if (offsetX === 0 && offsetY === 0) continue;
            neighbours += cells[posToIndex(x + offsetX, y + offsetY, w, h)];
        }
    }

    return neighbours;
}

/**
 * Set cell grid width.
 * @param {Number} newWidth
 * @returns {void}
 */
export function setCellGridWidth(newWidth) {
    resizeCellGrid(newWidth, reactiveState.cellGridHeight);
}

/**
 * Set cell grid height.
 * @param {Number} newHeight
 * @returns {void}
 */
export function setCellGridHeight(newHeight) {
    resizeCellGrid(reactiveState.cellGridWidth, newHeight);
}

/**
 * Resize the cell grid.
 * @param {Number} newWidth
 * @param {Number} newHeight
 * @returns {void}
 */
function resizeCellGrid(newWidth, newHeight) {
    const resizedCells = new Uint8Array(newWidth * newHeight);
    sharedState.cells.forEach((cellState, index) => {
        const [x, y] = indexToPos(index, reactiveState.cellGridWidth);
        const newIndex = posToIndex(x, y, newWidth, newHeight);
        if (newIndex < resizedCells.length) resizedCells[newIndex] = cellState;
    });
    sharedState.cells = resizedCells;
    reactiveState.cellGridWidth = newWidth;
    reactiveState.cellGridHeight = newHeight;
}

/**
 * Update the interval to follow the current speed setting.
 * @returns {void}
 */
export function updateSpeed() {
    if (reactiveState.paused) return;

    clearInterval(simulationInterval);
    playSimulation();
}

/**
 * Toggle simulation between playing and paused.
 * @returns {void}
 */
export function togglePaused() {
    if (reactiveState.paused) {
        playSimulation();
    } else {
        pauseSimulation();
    }
}

/**
 * Play the simulation.
 * @returns {void}
 */
export function playSimulation() {
    reactiveState.paused = false;
    simulationInterval = setInterval(() => {
        stepForward();
    }, baseStepIntervalMillis / reactiveState.simulationSpeed);
}

/**
 * Pause the simulation.
 * @returns {void}
 */
export function pauseSimulation() {
    reactiveState.paused = true;
    clearInterval(simulationInterval);
    simulationInterval = null;
}

// noinspection JSUnusedLocalSymbols
/**
 * Display the cell grid in the console.
 * @returns {void}
 */
function printCells() {
    const cells = sharedState.cells;
    const width = reactiveState.cellGridWidth;
    const height = reactiveState.cellGridHeight;
    let result = "";
    for (let y = 0; y < height; y++) {
        let row = "";
        for (let x = 0; x < width; x++) {
            row += cells[posToIndex(x, y, width, height)] === 0 ? "□ " : "■ ";
        }
        result += row + "\n";
    }
    console.log(result);
}
