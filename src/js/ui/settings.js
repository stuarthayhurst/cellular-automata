import { stateModel } from "../stateModel.js";
import { resizeCellGrid } from "../simulator.js";

/**
 * Add an event listener to an input element so that when the user focuses away
 * from the element, the input will be reset to the value from `getCurrentValue`
 * if the input is invalid, and `success` will be executed otherwise.
 * @param {HTMLInputElement} inputElement
 * @param {function():*} getCurrentValue
 * @param {function()} success
 */
function setupSetIfValid(inputElement, getCurrentValue, success) {
    inputElement.addEventListener("focusout", (_) => {
        if (inputElement.checkValidity()) {
            success();
        } else {
            inputElement.value = getCurrentValue();
        }
    });
}

// Width
/** @type HTMLInputElement */
const cellGridWidthInput = document.querySelector("#width");
setupSetIfValid(
    cellGridWidthInput,
    () => stateModel.cellGridWidth,
    () =>
        resizeCellGrid(
            Number(cellGridWidthInput.value),
            stateModel.cellGridHeight,
        ),
);

// Height
/** @type HTMLInputElement */
const cellGridHeightInput = document.querySelector("#height");
setupSetIfValid(
    cellGridHeightInput,
    () => stateModel.cellGridHeight,
    () =>
        resizeCellGrid(
            stateModel.cellGridWidth,
            Number(cellGridHeightInput.valu),
        ),
);
