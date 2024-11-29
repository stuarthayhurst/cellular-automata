import { stateModel } from "./stateModel.js";

/**
 * Take one step forward.
 * @returns {void}
 */
export function stepForward() {
    const width = stateModel.cellGridWidth;
    const height = stateModel.cellGridHeight;
    const cells = stateModel.cells;
    const nextCells = new Uint8Array(cells.length);

    if (stateModel.step === 0) {
        stateModel.stepZeroCells = new Uint8Array(stateModel.cells);
        stateModel.stepZeroCellGridHeight = stateModel.cellGridHeight;
        stateModel.stepZeroCellGridWidth = stateModel.cellGridWidth;
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = x + y * width;
            const neighbourCount = countMooresNeighbours(cells, width, x, y);
            nextCells[index] = conwaysCellState(cells[index], neighbourCount);
        }
    }

    stateModel.cells = nextCells;
    stateModel.step++;
}

/**
 * Set cells to the state they were in before the first step.
 */
export function resetSimulation() {
    if (stateModel.step === 0) return;
    stateModel.cells = new Uint8Array(stateModel.stepZeroCells);
    stateModel.step = 0;
    stateModel.cellGridWidth = stateModel.stepZeroCellGridWidth;
    stateModel.cellGridHeight = stateModel.stepZeroCellGridHeight;
}

/**
 * Resize the cell grid.
 * @param newWidth
 * @param newHeight
 * @returns {void}
 */
export function resizeCellGrid(newWidth, newHeight) {
    const resizedCells = new Uint8Array(newWidth * newHeight);
    stateModel.cells.forEach((cellState, index) => {
        const [x, y] = indexToPos(index, stateModel.cellGridWidth);
        const newIndex = posToIndex(x, y, newWidth);
        if (newIndex < resizedCells.length) resizedCells[newIndex] = cellState;
    });
    stateModel.cells = resizedCells;
    stateModel.cellGridWidth = newWidth;
    stateModel.cellGridHeight = newHeight;
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

function indexToPos(index, width) {
    const x = index % width;
    const y = Math.floor(index / width);
    return [x, y];
}

function posToIndex(x, y, width) {
    return x + width * y;
}

function life(cells) {
    return cells.reduce((acc, cellState) => acc + cellState);
}

function printCells() {
    const cells = stateModel.cells;
    const width = stateModel.cellGridWidth;
    const height = stateModel.cellGridHeight;
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

let simulationInterval = null;

function unPauseSimulation() {
    simulationInterval = setInterval(() => {
        stepForward();
    }, stateModel.baseStepIntervalMillis / stateModel.simulationSpeed);
}

function pauseSimulation() {
    clearInterval(simulationInterval);
    simulationInterval = null;
}

stateModel.onChanged("paused", () => {
    if (stateModel.paused) {
        pauseSimulation();
    } else {
        unPauseSimulation();
    }
});

stateModel.onChanged("simulationSpeed", () => {
    if (stateModel.paused) return;

    clearInterval(simulationInterval);
    unPauseSimulation();
});
