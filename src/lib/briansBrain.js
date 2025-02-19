export const briansBrainRule = (cellState, aliveNeighbours) {
    return cellState === 0 && aliveNeighbours === 2 ? 1 : // Birth rule
    cellState === 1 ? 2 : // ON -> DYING
    cellState === 2 ? 0 : // DYING -> OFF
    cellState;

}
    
