import { stateModel } from "./stateModel.js";

/**
 * Take one step forward.
 */
export function stepForward() {
    const width = stateModel.cellGridWidth;
    const height = stateModel.cellGridHeight;
    const cells = stateModel.cells;
    const newCells = new Uint8Array(cells.length); //Using Uint8Array for effiecient storage

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = x + y * width; // calculate the linear index
            const neighbourCount = countMooresNeighbours(cells, width, x, y);
            newCells [index] = computeCellState(cells[index], neighbourCount); 
        }
    }

    stateModel.cells = newCells;
    stateModel.broadcastEvent("onGridUpdated"); // Tell listeners of grid changes
}

//counts the number of live neighbours within the Moore neighbourhood
//returns int
function countMooresNeighbours(grid, width, x, y) {
    const height = grid.length / width;
    let sum = 0;

    //iterating through neighbours using index offset
    for (let offsetY = -1; offsetY <= 1; offsetY++) {
        for (let offsetX = -1; offsetX <= 1; offsetX++) {
            // skip the cell itself
            if (offsetY === 0 && offsetX === 0) {
                continue;
            }

            const neighbourX = x + offsetX;
            const neighbourY = y + offsetY;

            //check bounds so to avoid accessing out of bounds indices

            if (
                neighbourX >= 0 &&
                neighbourY >= 0 &&
                neighbourX < width &&
                neighbourY < height
            ) {
                const neighbourIndex = neighbourX + neighbourY * width;
                sum += grid[neighbourIndex];
            }
        }
    }
    return sum;
}


//calculate whether a cell should live or die based on total alive neighbours
function computeCellState(cellState, aliveNeighbours) {
    //the below conditional checks for all of the rules that cause a cell to live (Conway's game of life)
    if (
        (cellState === 0 && aliveNeighbours === 3) ||
        (cellState === 1 && aliveNeighbours <= 3 && aliveNeighbours >= 2)
    ) {
        return 1;
    }

    //cell is dead if none of conditions met
    return 0;
}

stateModel.addEventListener("SimulationStep", stepForward);

