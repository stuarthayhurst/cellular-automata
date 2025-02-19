/**
 * Calculate the next state of a cell in Conway's game of life.
 * @param {0|1} cellState - The current cell state.
 * @param {Number} aliveNeighbours - The number of alive Moore's neighbours of the cell.
 * @returns {0|1} - The new cell state.
 */
export const gameOfLifeRule = (cellState, aliveNeighbours) {
    return (cellState === 1 && (aliveNeighbours === 2 || aliveNeighbours === 3)) ||
    (cellState === 0 && aliveNeighbours === 3)
        ? 1 : 0;
}
    