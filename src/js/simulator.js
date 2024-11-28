import { stateModel } from "./stateModel.js";

/**
 * Take one step forward.
 */
export function stepForward() {
    const width = stateModel.cellGridWidth;
    const height = stateModel.cellGridHeight;
    const cells = stateModel.cells;
    const newCells = new Uint8Array(cells.length);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = x + y * width;
            const neighbourCount = countMooresNeighbours(cells, width, x, y);
            newCells[index] = conwaysCellState(cells[index], neighbourCount);
        }
    }

    stateModel.cells = newCells;
    stateModel.broadcastEvent("onGridUpdated"); // Tell listeners of grid changes
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

stateModel.addEventListener("onPausedChanged", () => {
    if (stateModel.paused) {
        pauseSimulation();
    } else {
        unPauseSimulation();
    }
});

stateModel.addEventListener("onSimulationSpeedChanged", () => {
    if (stateModel.paused) return;

    clearInterval(simulationInterval);
    unPauseSimulation();
});
