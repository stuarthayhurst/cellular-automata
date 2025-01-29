import { sharedState } from "./sharedState.js";
import { reactiveState } from "./reactiveState.svelte.js";
import { posToIndex } from "./tools.js";

const primaryButton = 0;

let drawStroke = false;
/** @type {Number} */
let drawStrokeValue;
/** @type {Set} */
let drawStrokeGridCells = new Set([]);

export function setUpCellEditor(canvas) {
    const flip = (i) => 1 - i;

    const draw = (initialClick, mouseX, mouseY) => {
        const canvasMousePos = clientToCanvasSpace(canvas, mouseX, mouseY);
        const clickGridCoord = canvasToGridCoord(...canvasMousePos);

        /** @type {Boolean} */
        const clickNotInGrid =
            clickGridCoord[0] < 0 ||
            clickGridCoord[0] >= reactiveState.cellGridWidth ||
            clickGridCoord[1] < 0 ||
            clickGridCoord[1] >= reactiveState.cellGridHeight;

        if (clickNotInGrid) return;

        const gridIndex = posToIndex(
            ...clickGridCoord,
            reactiveState.cellGridWidth,
            reactiveState.cellGridHeight,
        );

        if (drawStrokeGridCells.has(gridIndex)) return;

        if (initialClick) {
            sharedState.cells[gridIndex] = flip(sharedState.cells[gridIndex]);
        } else {
            sharedState.cells[gridIndex] = drawStrokeValue;
        }
        drawStrokeGridCells.add(gridIndex);

        return sharedState.cells[gridIndex];
    };

    document.addEventListener("mousedown", (mouseEvent) => {
        if (
            mouseEvent.button !== primaryButton ||
            reactiveState.dragging ||
            reactiveState.renderMode !== "2D"
        )
            return;

        drawStroke = true;
        drawStrokeValue = draw(true, mouseEvent.clientX, mouseEvent.clientY);
    });

    document.addEventListener("mouseup", () => {
        drawStroke = false;
        drawStrokeGridCells = new Set([]);
    });

    document.addEventListener("mousemove", (mouseEvent) => {
        if (drawStroke) draw(false, mouseEvent.clientX, mouseEvent.clientY);
    });
}

/**
 * Convert canvas coordinates into grid coordinates
 * No validation is done, this just convert values
 * @param {Number} canvasX
 * @param {Number} canvasY
 * @returns {[Number, Number]}
 */
const canvasToGridCoord = (canvasX, canvasY) => {
    const gridX = canvasX - sharedState.gridOffsetX;
    const gridY = canvasY - sharedState.gridOffsetY;

    const gridHeight = reactiveState.cellGridHeight * sharedState.pixelsPerCell;

    return [
        Math.floor(gridX / sharedState.pixelsPerCell),
        Math.floor((gridHeight - gridY) / sharedState.pixelsPerCell),
    ];
};

/**
 * Convert client position to canvas space.
 * @param {HTMLCanvasElement} canvas
 * @param {Number} clientX
 * @param {Number} clientY
 * @returns {number[2]}
 */
const clientToCanvasSpace = (canvas, clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    return [clientX - rect.x, rect.height - (clientY - rect.y)];
};
