import { describe, it, expect } from "vitest";
import {
    gameOfLifeRule,
    countMooresNeighbours,
    nextCells,
    briansBrainRule,
} from "../src/lib/simulation.js";

describe("Simulator Functions", () => {
    describe("Conway's cell state calculation", () => {
        it("should become alive with 3 alive neighbors", () => {
            expect(gameOfLifeRule(0, 3)).toBe(1);
        });

        it("should stay alive with 2 or 3 alive neighbors", () => {
            expect(gameOfLifeRule(1, 2)).toBe(1);
            expect(gameOfLifeRule(1, 3)).toBe(1);
        });

        it("should die with less than 2 or more than 3 alive neighbors", () => {
            expect(gameOfLifeRule(1, 1)).toBe(0);
            expect(gameOfLifeRule(1, 4)).toBe(0);
        });

        it("should stay dead with 0-2 alive neighbours", () => {
            expect(gameOfLifeRule(0, 0)).toBe(0);
            expect(gameOfLifeRule(0, 1)).toBe(0);
            expect(gameOfLifeRule(0, 2)).toBe(0);
        });
    });

    describe("Count Moore's Neighbours", () => {
        it("should correctly count the alive neighbours", () => {
            const grid = new Uint8Array([0, 1, 1, 0, 1, 0, 1, 1, 0]); // 3x3
            const count = countMooresNeighbours(grid, 3, 3, 1, 1);
            expect(count).toBe(4); // 4 live cells in the neighbors of position 1,1
        });
    });

    describe("Simulation Step", () => {
        it("should change at least one value", () => {
            const initialCells = new Uint8Array([0, 1, 1, 0, 1, 0, 1, 1, 0]);
            expect(nextCells(initialCells, 3, 3, briansBrainRule)).not.toBe(
                initialCells,
            );
        });
    });
});
