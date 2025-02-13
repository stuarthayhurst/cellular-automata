import { sharedState } from "./sharedState.js";
import { reactiveState } from "./reactiveState.svelte.js";

/**
 * @typedef {Object} Preset
 * @property {string} name
 * @property {number[][]} cells
 */

export const presets = {
    block: {
        name: "Block (Still)",
        cells: [
            [3, 3],
            [3, 4],
            [4, 3],
            [4, 4],
        ],
    },
    blinker: {
        name: "Blinker (Oscillator)",
        cells: [
            [5, 3],
            [5, 4],
            [5, 5],
        ],
    },
    glider: {
        name: "Glider (Spaceships)",
        cells: [
            [3, 3],
            [4, 4],
            [5, 2],
            [5, 3],
            [5, 4],
        ],
    },
    random: {
        name: "Random",
    },
};

function generateCells(width, height, aliveCells = []) {
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
 * @param {Object} reactiveState
 */

export function applyPreset(presetKey) {
    let preset = presets[presetKey];
    if (!preset) return;

    let width = reactiveState.cellGridWidth;
    let height = reactiveState.cellGridHeight;
    let newCells;

    if (presetKey === "random") {
        newCells = generateRandomCells(width, height);
    } else {
        const cells = preset.cells;

        let minX = Infinity,
            maxX = -Infinity;
        let minY = Infinity,
            maxY = -Infinity;
        cells.forEach(([x, y]) => {
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        });
        const originalCenterX = (minX + maxX) / 2;
        const originalCenterY = (minY + maxY) / 2;
        const gridCenterX = Math.floor(width / 2);
        const gridCenterY = Math.floor(height / 2);
        const dx = Math.round(gridCenterX - originalCenterX);
        const dy = Math.round(gridCenterY - originalCenterY);
        const adjustedCells = cells.map(([x, y]) => [x + dx, y + dy]);
        newCells = generateCells(width, height, adjustedCells);
    }

    sharedState.cells = new Uint8Array(newCells.flat());
}
