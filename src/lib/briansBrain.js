/**
 *
 * Brian's Brain Rule - Determines the next state of a cell.
 *
 * This cellular automaton follows these rules:
 * - OFF (0) -> ON (1) if exactly 2 neighbours are ON (Birth)
 * - ON (1) -> DYING (2) (Every ON cell dies in the next step)
 * - DYING (2) -> OFF (0) (A DYING cell always turns OFF)
 *
 *
 * @param {0|1|2} cellState - The current state of the cell
 * 0 = ODD, 1 = ON, 2 = DYING
 * @param {Number} aliveNeighbours - The number of ON (1) neighbours.
 * @returns {0|1|2} - the new state of the cell after one step
 */
export const briansBrainRule = (cellState, aliveNeighbours) => {
    return cellState === 0 && aliveNeighbours === 2
        ? 1 // Birth rule
        : cellState === 1
          ? 2 // ON -> DYING
          : cellState === 2
            ? 0 // DYING -> OFF
            : cellState;
};
