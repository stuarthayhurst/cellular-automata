import { stateModel } from "../stateModel.js";

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
const cellGridWidthInput = document.querySelector("#width");
setupSetIfValid(
    cellGridWidthInput,
    () => stateModel.cellGridWidth,
    () => (stateModel.cellGridWidth = cellGridWidthInput.value),
);

// Height
const cellGridHeightInput = document.querySelector("#height");
setupSetIfValid(
    cellGridHeightInput,
    () => stateModel.cellGridHeight,
    () => (stateModel.cellGridHeight = cellGridHeightInput.value),
);
