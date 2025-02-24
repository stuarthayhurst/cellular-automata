/**
 * Brian's Brain Rule
 *
 * This cellular automaton follows these rules:
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
