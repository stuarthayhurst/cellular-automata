import { stateModel } from "./stateModel.js";


/**
 * Take one step forward.
 */
export function stepForward() {
    const width = stateModel.cellGridWidth;
    const height = stateModel.cellGridHeight;
    const cells = stateModel.cells;
    const newCells = new Uint8Array(cells.length); //Using Uint8Array for effiecient storage
    const widthMinOne = width - 1; //To prevent recalculation in loop
    const heightMinOne = height - 1;

    for (let y= 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = x + y * width; // calculate the linear index
            const neighbourCount = countMooresNeighbours(cells, width, x, y, widthMinOne, heightMinOne);
            newCells [index] = computeCellState(cells[index], neighbourCount); 
        }
    }

    stateModel.cells = newCells;
    stateModel.broadcastEvent("onGridUpdated"); // Tell listeners of grid changes
}

//counts the number of live neighbours within the Moore neighbourhood
//returns int
export function countMooresNeighbours(grid, width, x, y, widthMinOne, heightMinOne) {
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
                neighbourX >= 0 && neighbourX <= widthMinOne && neighbourY >= 0 && neighbourY <= heightMinOne
            ) {
                const neighbourIndex = neighbourX + neighbourY * width;
                sum += grid[neighbourIndex];
            }
        }
    }
    return sum;
}


//calculate whether a cell should live or die based on total alive neighbours
export function computeCellState(cellState, aliveNeighbours) {
    //the below conditional checks for all of the rules that cause a cell to live (Conway's game of life)
    if 
        (cellState === 0 && aliveNeighbours === 3) {
            return 1; //Dead cell with 3 live neighbors turns alive
    } else if
        (cellState === 1 && aliveNeighbours <= 3 && aliveNeighbours >= 2){
            return 1; //Alive cell with 3 or 2 neighbors stays the same (alive)
    } else {
        return 0;//cell is dead if none of conditions met
    }
}

stateModel.addEventListener("SimulationStep", stepForward);

