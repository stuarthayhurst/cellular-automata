import { stateModel } from "./stateModel.js";
import { stepForward } from "./simulator.js";

export const canvas = document.querySelector("#renderer");

const pauseButton = document.querySelector("#pause-button");
pauseButton.addEventListener("click", () => stateModel.togglePaused());
stateModel.addEventListener("onPausedChanged", () => {
    if (stateModel.paused) {
        pauseButton.textContent = "Play";
    } else {
        pauseButton.textContent = "Pause";
    }
});

const stepForwardButton = document.querySelector("#step-forward-button");
stepForwardButton.addEventListener("click", () => stepForward());
