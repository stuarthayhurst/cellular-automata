import { reactiveState } from "./reactiveState.svelte.js";
import { sharedState, saveStartState } from "./sharedState.js";
import { indexToPos, posToIndex } from "./tools.js";
import { briansBrainRule } from "./briansBrain.js";
import { gameOfLifeRule } from "./gameOfLife.js";

const baseStepIntervalMillis = 200;
let simulationInterval = null;

let currentRule = gameOfLifeRule;

/**
 * @returns {void}
 */
export function changeRule() {
    currentRule =
        currentRule === briansBrainRule ? gameOfLifeRule : briansBrainRule;

    reactiveState.simulationRule =
        currentRule === briansBrainRule ? "Brian's Brain" : "Game of Life";
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
        currentRule,
    );

    reactiveState.atStart = false;
}

/**
 * Return the grid of cells after one step.
 * @param {Uint8Array} cells - Array of cells.
 * @param {Number} w - Cell grid width.
 * @param {Number} h - Cell grid height.
 * @param {Function} ruleFunction - The rule function to apply (e,g., gameOfLifeRule, briansBrainRule)
 * @returns {Uint8Array}
 */
export const nextCells = (cells, w, h, ruleFunction) =>
    cells.map((cellState, i) =>
        ruleFunction(
            cellState,
            countMooresNeighbours(
                cells,
                w,
                h,
                ...indexToPos(i, w),
                ruleFunction,
            ),
        ),
    );

/**
 * Count Moore's Neighbours
 * @param {Uint8Array} cells - Array of cells.
 * @param {Number} w - Cell grid width.
 * @param {Number} h - Cell grid height.
 * @param {Number} x - Cell X.
 * @param {Number} y - Cell Y.
 * @param {Function} ruleFunction - The rule function to apply (e,g., gameOfLifeRule, briansBrainRule).
 * @returns {Number} - The number of Moore's Neighbours.
 */

export function countMooresNeighbours(cells, w, h, x, y, ruleFunction) {
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
