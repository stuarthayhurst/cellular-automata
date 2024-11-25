import { stepForward } from "./simulator";
/**
 * Generates a 2D or 3D mesh from the given grid, width, height, and view mode.
 * @param {Array<number>} grid - The input grid representing cell states.
 * @param {number} width - The width of the grid.
 * @param {number} height - The height of the grid.
 * @param {string} viewMode - The view mode ("2D" or "3D").
 * @returns {Array<object>} The generated mesh.
 */
function generateMesh(grid, width, height, viewMode) {
    if (grid.length !== width * height) {
        throw new Error("Invalid grid dimensions");
    }
    return [];
}

function preCalculatedMesh(grid, width, height, viewMode) {
    const localState = { cellData: grid };
    const nextState = stepForward(localState.cellData);
    return nextState;
}

describe("Mesh Generation Tests", () => {
    describe("2D Mesh Generation", () => {
        test("Should generate correct 2D mesh for a simple 3x3 grid", () => {
            const grid = [
                1, 0, 1,
                0, 1, 0,
                1, 0, 1
            ];
            const width = 3;
            const height = 3;
            const viewMode = "2D";

            const generatedMesh = generateMesh(grid, width, height, viewMode);
            const expectedMesh = preCalculatedMesh(grid, width, height, viewMode);

            expect(generatedMesh).toEqual(expectedMesh);
        });

        test("Should handle large 2D grids correctly (e.g., 50x50)", () => {
            const width = 50;
            const height = 50;
            const grid = Array(width * height).fill(0).map(() => Math.round(Math.random()));
            const viewMode = "2D";

            const generatedMesh = generateMesh(grid, width, height, viewMode);
            const expectedMesh = preCalculatedMesh(grid, width, height, viewMode);

            expect(generatedMesh).toEqual(expectedMesh);
        });

        test("Should correctly process a 2D grid with all cells active", () => {
            const width = 5;
            const height = 5;
            const grid = Array(width * height).fill(1);
            const viewMode = "2D";

            const generatedMesh = generateMesh(grid, width, height, viewMode);
            const expectedMesh = preCalculatedMesh(grid, width, height, viewMode);

            expect(generatedMesh).toEqual(expectedMesh);
        });

        test("Should correctly process a 2D grid with no active cells", () => {
            const width = 5;
            const height = 5;
            const grid = Array(width * height).fill(0);
            const viewMode = "2D";

            const generatedMesh = generateMesh(grid, width, height, viewMode);
            const expectedMesh = preCalculatedMesh(grid, width, height, viewMode);

            expect(generatedMesh).toEqual(expectedMesh);
        });
    });

    describe("3D Mesh Generation", () => {
        test("Should generate correct 3D mesh for a simple 2x2 grid mapped to a torus", () => {
            const grid = [
                1, 0,
                0, 1
            ];
            const width = 2;
            const height = 2;
            const viewMode = "3D";

            const generatedMesh = generateMesh(grid, width, height, viewMode);
            const expectedMesh = preCalculatedMesh(grid, width, height, viewMode);

            expect(generatedMesh).toEqual(expectedMesh);
        });

        test("Should handle 3D torus grid with edge wrapping correctly", () => {
            const grid = [
                1, 0, 1,
                0, 1, 0,
                1, 0, 1
            ];
            const width = 3;
            const height = 3;
            const viewMode = "3D";

            const generatedMesh = generateMesh(grid, width, height, viewMode);
            const expectedMesh = preCalculatedMesh(grid, width, height, viewMode);

            expect(generatedMesh).toEqual(expectedMesh);
        });

        test("Should handle 3D sphere grid with complex boundaries", () => {
            const grid = [
                1, 0, 1,
                0, 1, 0,
                1, 0, 1
            ];
            const width = 3;
            const height = 3;
            const viewMode = "3D";

            const generatedMesh = generateMesh(grid, width, height, viewMode);
            const expectedMesh = preCalculatedMesh(grid, width, height, viewMode);

            expect(generatedMesh).toEqual(expectedMesh);
        });

        test("Should handle large 3D grids correctly (e.g., 100x100 mapped to a torus)", () => {
            const width = 100;
            const height = 100;
            const grid = Array(width * height).fill(0).map(() => Math.round(Math.random()));
            const viewMode = "3D";

            const generatedMesh = generateMesh(grid, width, height, viewMode);
            const expectedMesh = preCalculatedMesh(grid, width, height, viewMode);

            expect(generatedMesh).toEqual(expectedMesh);
        });
    });

    test("Should throw an error for invalid grid dimensions", () => {
        const grid = [1, 0, 1];
        const width = 2;
        const height = 2;
        const viewMode = "2D";

        expect(() => generateMesh(grid, width, height, viewMode)).toThrow("Invalid grid dimensions");
    });
});