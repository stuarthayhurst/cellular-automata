/**
 * Game of Life rule - Implements the rules for Conway's Game of Life
 *
 * This cellular automaton follows these rules:
 * - Any live cell with 2 or 3 live neighbours survives.
 * - Any dead cell with exactly 3 live neighbours becomes a live cell.
 * All other live cells die in the next generation.
 *
 * @param {0|1} cellState - The current cell state.
 * @param {Number} aliveNeighbours - The number of alive Moore's neighbours of the cell.
 * @returns {0|1} - The new cell state.
 */
export const gameOfLifeRule = (cellState, aliveNeighbours) =>
    (cellState === 1 && (aliveNeighbours === 2 || aliveNeighbours === 3)) ||
    (cellState === 0 && aliveNeighbours === 3)
        ? 1
        : 0;
