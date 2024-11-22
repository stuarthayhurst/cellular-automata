import { stateModel } from "../stateModel.js";
import { stepForward } from "../simulator.js";

export const canvas = document.querySelector("#canvas");

// Pause button
const pauseButton = document.querySelector("#pause-button");
pauseButton.addEventListener("click", () => stateModel.togglePaused());
stateModel.addEventListener("onPausedChanged", () => {
    if (stateModel.paused) {
        pauseButton.textContent = "Play";
    } else {
        pauseButton.textContent = "Pause";
    }
});

// Step forward button
const stepForwardButton = document.querySelector("#step-forward-button");
stepForwardButton.addEventListener("click", () => stepForward());
