import { reactiveState } from "./reactiveState.svelte.js";
import { sharedState, saveStartState } from "./sharedState.js";

const baseStepIntervalMillis = 200;
let simulationInterval = null;

/**
 * Take one step forward.
 * @returns {void}
 */
export function stepForward() {
    const width = reactiveState.cellGridWidth;
    const height = reactiveState.cellGridHeight;
    const cells = sharedState.cells;
    const nextCells = new Uint8Array(cells.length);

    if (reactiveState.atStart) saveStartState();

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = x + y * width;
            const neighbourCount = countMooresNeighbours(cells, width, x, y);
            nextCells[index] = conwaysCellState(cells[index], neighbourCount);
        }
    }

    sharedState.cells = nextCells;
    reactiveState.atStart = false;
}

/**
 * Calculate the new state of a cell in Conway's game of life.
 * @param {0|1} cellState - The current cell state.
 * @param {Number} aliveNeighbours - The number of alive Moore's neighbours of the cell.
 * @returns {0|1} - The new cell state.
 */
export function conwaysCellState(cellState, aliveNeighbours) {
    if (cellState === 0 && aliveNeighbours === 3) {
        return 1; // Dead cell with 3 live neighbors turns alive
    } else if (
        cellState === 1 &&
        aliveNeighbours <= 3 &&
        aliveNeighbours >= 2
    ) {
        return 1; // Alive cell with 3 or 2 neighbors stays the same (alive)
    } else {
        return 0; // Cell is dead if none of conditions met
    }
}

/**
 * Count Moore's Neighbours
 * @param {Uint8Array} cells - Array of cells.
 * @param {Number} width - Cell cells width.
 * @param {Number} x - Cell X.
 * @param {Number} y - Cell Y.
 * @returns {Number} - The number of Moore's Neighbours.
 */
export function countMooresNeighbours(cells, width, x, y) {
    let neighbours = 0;

    for (let offsetY = -1; offsetY <= 1; offsetY++) {
        for (let offsetX = -1; offsetX <= 1; offsetX++) {
            if (offsetY === 0 && offsetX === 0) continue;

            const neighbourX = x + offsetX;
            const neighbourY = y + offsetY;

            const l = cells.length;
            const neighbourIndex =
                (((neighbourX + neighbourY * width) % l) + l) % l;

            neighbours += cells[neighbourIndex];
        }
    }

    return neighbours;
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
        const newIndex = posToIndex(x, y, newWidth);
        if (newIndex < resizedCells.length) resizedCells[newIndex] = cellState;
    });
    sharedState.cells = resizedCells;
    reactiveState.cellGridWidth = newWidth;
    reactiveState.cellGridHeight = newHeight;
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

function playSimulation() {
    reactiveState.paused = false;
    simulationInterval = setInterval(() => {
        stepForward();
    }, baseStepIntervalMillis / reactiveState.simulationSpeed);
}

export function pauseSimulation() {
    reactiveState.paused = true;
    clearInterval(simulationInterval);
    simulationInterval = null;
}

export function togglePaused() {
    if (reactiveState.paused) {
        playSimulation();
    } else {
        pauseSimulation();
    }
}

export function updateSpeed() {
    if (reactiveState.paused) return;

    clearInterval(simulationInterval);
    playSimulation();
}

const indexToPos = (index, width) => [index % width, Math.floor(index / width)];
const posToIndex = (x, y, width) => x + width * y;

// noinspection JSUnusedLocalSymbols
const population = (cells) => cells.reduce((acc, cellState) => acc + cellState);

// noinspection JSUnusedLocalSymbols
function printCells() {
    const cells = sharedState.cells;
    const width = reactiveState.cellGridWidth;
    const height = reactiveState.cellGridHeight;
    let result = "";
    for (let y = 0; y < height; y++) {
        let row = "";
        for (let x = 0; x < width; x++) {
            row += cells[posToIndex(x, y, width)] === 0 ? "□ " : "■ ";
        }
        result += row + "\n";
    }
    console.log(result);
}
