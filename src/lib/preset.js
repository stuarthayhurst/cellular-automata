import { sharedState } from "./sharedState.js";
import { reactiveState } from "./reactiveState.svelte.js";
import { pushHistory } from "./cellEditor.js";

/**
 * @typedef {Object} Preset
 * @property {String} name
 * @property {Number[][]} cells
 */

/** @type {Object.<string, Preset>} */
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
        cells: [],
    },
};

/**
 * @param {String} presetKey
 * @returns {void}
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

    const newCellsFlat = new Uint8Array(newCells.flat());
    let changedCellsAlive = new Set();
    let changedCellsDead = new Set();

    // Calculate difference
    sharedState.cells.forEach((cell, i) => {
        if (cell === 0 && newCellsFlat[i] === 1) {
            changedCellsAlive.add(i);
        } else if (cell === 1 && newCellsFlat[i] === 0) {
            changedCellsDead.add(i);
        }
    });

    pushHistory({
        setCellsAlive: changedCellsAlive,
        setCellsDead: changedCellsDead,
        actionName: "Apply Preset",
    });

    sharedState.cells = newCellsFlat;
}

/**
 * @param {Number} width
 * @param {Number} height
 * @param {Number[][]} aliveCells
 * @returns {Number[][]}
 */
function generateCells(width, height, aliveCells = []) {
    let cells = Array.from({ length: height }, () => Array(width).fill(0));
    aliveCells.forEach(([x, y]) => {
        if (x >= 0 && x < width && y >= 0 && y < height) {
            cells[y][x] = 1;
        }
    });
    return cells;
}

/**
 * @param {Number} width
 * @param {Number} height
 * @returns {Number[][]}
 */
export function generateRandomCells(width, height) {
    return Array.from({ length: height }, () =>
        Array.from({ length: width }, () =>
            Math.random() < reactiveState.randomFillProbability ? 1 : 0,
        ),
    );
}
