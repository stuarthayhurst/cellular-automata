import { stateModel } from "./stateModel";

/**
 * Take one step forward.
 * @returns {Array<number>}
 */
export function stepForward() {
    //for now I have used a fixed grid width because I cannot find where it is stored in stateModel
    const width = 10;
    const grid = stateModel.cellData;
    let newGrid = [];

    for (let y = 0; y < grid.length / width; y++) {
        for (let x = 0; x < width; x++) {
            let neighbourCount = countMooresNeighbours(grid, width, x, y);
            newGrid.push(computeCellState(grid[x + y * width], neighbourCount));
        }
    }

    return newGrid;
}

//counts the number of live neighbours within the Moore neighbourhood
//returns int
function countMooresNeighbours(grid, width, x, y) {
    let sum = 0;
    let thisIndex = x + y * width;

    //iterating through neighbours using index offset
    for (let offsetY = -1; offsetY < 2; offsetY++) {
        for (let offsetX = -1; offsetX < 2; offsetX++) {
            if (offsetY === 0 && offsetX === 0) {
                continue;
            }

            let offsetIndex = thisIndex + offsetX - offsetY * width;
            if (!(offsetIndex < 0 || offsetIndex >= grid.length)) {
                if (grid[offsetIndex] === 1) {
                    sum++;
                }
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
