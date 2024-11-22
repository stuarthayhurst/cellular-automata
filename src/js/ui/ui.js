import { stateModel } from "../stateModel.js";
import { stepForward } from "../simulator.js";

export const canvas = document.querySelector("#renderer");

// Pause button
const pauseButton = document.querySelector("#pause-button");
pauseButton.addEventListener("click", () => stateModel.togglePaused());
stateModel.addEventListener("onPausedChanged", () => {
    if (stateModel.paused) {
        pauseButton.innerHTML = '<i class="fas fa-play"></i>'; 
        pauseButton.title = "Play";
    } else {
        pauseButton.innerHTML = '<i class="fas fa-pause"></i>';
        pauseButton.title = "Pause";
    }
});

// Step forward button
const stepForwardButton = document.querySelector("#step-forward-button");
stepForwardButton.addEventListener("click", () => stepForward());
