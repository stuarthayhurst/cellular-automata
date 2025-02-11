/**
 * @property {string} name
 * @property {number} width
 * @property {number} height
 * @property {number[][]} cells
 */

export const presets = {
    block: {
        name: "Block (Still)",
        width: 10,
        height: 10,
        cells: generateCells(10, 10, [
            [3, 3],
            [3, 4],
            [4, 3],
            [4, 4],
        ]),
    },
    blinker: {
        name: "Blinker (Oscillator)",
        width: 10,
        height: 10,
        cells: generateCells(10, 10, [
            [5, 3],
            [5, 4],
            [5, 5],
        ]),
    },
    glider: {
        name: "Glider (Spaceships)",
        width: 10,
        height: 10,
        cells: generateCells(10, 10, [
            [3, 3],
            [4, 4],
            [5, 2],
            [5, 3],
            [5, 4],
        ]),
    },
    random: {
        name: "Random",
        width: 10,
        height: 10,
    },
};

function generateCells(width, height, aliveCells) {
    let cells = Array.from({ length: height }, () => Array(width).fill(0));
    aliveCells.forEach(([x, y]) => {
        if (x >= 0 && x < width && y >= 0 && y < height) {
            cells[y][x] = 1;
        }
    });
    return cells;
}

function generateRandomCells(width, height) {
    return Array.from({ length: height }, () =>
        Array.from({ length: width }, () => (Math.random() > 0.5 ? 1 : 0)),
    );
}

/**
 * @param {string} presetKey -("block", "blinker", "glider", "random")
 * @param {Object} sharedState
 * @param {Object} reactiveState -
 */

export function applyPreset(presetKey, sharedState, reactiveState) {
    let preset = presets[presetKey];
    if (!preset) return;
    if (presetKey === "random") {
        preset = {
            name: "Random",
            width: 10,
            height: 10,
            cells: generateRandomCells(10, 10),
        };
    }

    // Convert a two-dimensional array to a one-dimensional array
    sharedState.cells = new Uint8Array(preset.cells.flat());

    // Reset
    reactiveState.historyStack = [];
    reactiveState.redoStack = [];
    reactiveState.atStart = true;
}
