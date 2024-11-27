import { expect } from "chai";
import {
    stepForward,
    conwaysCellState,
    countMooresNeighbours,
} from "../src/js/simulator.js";
import { stateModel } from "../src/js/stateModel.js";

describe("Simulator Functions", () => {
    // test computeCellState
    describe("computeCellState()", () => {
        it("should return 1 when cell is dead and has exactly 3 alive neighbors", () => {
            expect(conwaysCellState(0, 3)).to.equal(1);
        });

        it("should return 1 when cell is alive and has 2 or 3 alive neighbors", () => {
            expect(conwaysCellState(1, 2)).to.equal(1);
            expect(conwaysCellState(1, 3)).to.equal(1);
        });

        it("should return 0 when cell is alive and has less than 2 or more than 3 alive neighbors", () => {
            expect(conwaysCellState(1, 1)).to.equal(0);
            expect(conwaysCellState(1, 4)).to.equal(0);
        });

        it("should return 0 when cell is dead and has not exactly 3 alive neighbors", () => {
            expect(conwaysCellState(0, 0)).to.equal(0);
            expect(conwaysCellState(0, 1)).to.equal(0);
            expect(conwaysCellState(0, 2)).to.equal(0);
        });
    });

    // test countMooresNeighbours
    describe("countMooresNeighbours()", () => {
        it("should count the correct number of live neighbors", () => {
            const grid = [0, 1, 1, 0, 1, 0, 1, 1, 0]; // 3x3
            const width = 3;
            const x = 1;
            const y = 1;
            const widthMinOne = 2;
            const heightMinOne = 2;
            const count = countMooresNeighbours(
                grid,
                width,
                x,
                y,
                widthMinOne,
                heightMinOne,
            );
            expect(count).to.equal(4); // 4 live cells in the neighbors of position 1,1
        });
    });

    // test stepForward
    describe("stepForward()", () => {
        it("should update the state of the grid correctly", () => {
            const initialCells = [0, 1, 1, 0, 1, 0, 1, 1, 0]; // 3x3
            stateModel.cells = initialCells;
            stateModel.cellGridWidth = 3; // weight

            const initialState = [...stateModel.cells];
            stepForward();

            // Check if stateModel.cells has been updated
            expect(stateModel.cells).to.not.deep.equal(initialState);
        });
    });
});
