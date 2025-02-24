import { reactiveState } from "./reactiveState.svelte.js";
import { sharedState, saveStartState } from "./sharedState.js";
import { indexToPos, posToIndex } from "./tools.js";

const baseStepIntervalMillis = 200;
let simulationInterval = null;

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
        reactiveState.simulationRule,
    );

    reactiveState.atStart = false;
}

/**
 * Return the grid of cells after one step.
 * @param {Uint8Array} cells - Array of cells.
 * @param {Number} w - Cell grid width.
 * @param {Number} h - Cell grid height.
 * @param {function(Number, Number):Number} nextCell - The rule function to apply (e,g., gameOfLifeRule, briansBrainRule)
 * @returns {Uint8Array}
 */
export const nextCells = (cells, w, h, nextCell) =>
    cells.map((cellState, i) =>
        nextCell(
            cellState,
            countMooresNeighbours(cells, w, h, ...indexToPos(i, w)),
        ),
    );

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

            const neighbourX = (x + offsetX + w) % w;
            const neighbourY = (y + offsetY + h) % h;
            const neighbourState =
                cells[posToIndex(neighbourX, neighbourY, w, h)];

            neighbours += neighbourState === 1 ? 1 : 0;
        }
    }

    return neighbours;
}

/**
 * Conway's Game of Life
 *
 * - Any live cell with 2 or 3 live neighbours survives.
 * - Any dead cell with exactly 3 live neighbours becomes a live cell.
 * - All other live cells die in the next generation.
 *
 * @param {0|1} cellState - The current cell state.
 * @param {Number} aliveNeighbours - The number of alive Moore's neighbours of the cell.
 * @returns {0|1} - Next cell state.
 */
export const gameOfLifeRule = (cellState, aliveNeighbours) =>
    (cellState === 1 && (aliveNeighbours === 2 || aliveNeighbours === 3)) ||
    (cellState === 0 && aliveNeighbours === 3)
        ? 1
        : 0;

/**
 * Brian's Brain
 *
 * - Dead (0) -> Alive (1) if exactly 2 neighbours are alive (Birth)
 * - Alive (1) -> Dying (2)
 * - Dying (2) -> Dead (0)
 *
 * @param {0|1|2} cellState
 * @param {Number} aliveNeighbours
 * @returns {0|1|2} - Next cell state.
 */
export const briansBrainRule = (cellState, aliveNeighbours) => {
    if (cellState === 0 && aliveNeighbours === 2) {
        return 1;
    } else if (cellState === 1) {
        return 2;
    } else if (cellState === 2) {
        return 0;
    }
};

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
