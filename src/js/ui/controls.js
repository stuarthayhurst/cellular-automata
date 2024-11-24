import { stateModel } from "../stateModel.js";
import { stepForward } from "../simulator.js";
import { updateCanvasResolution } from "./canvas.js";

// Pause button
/** @type HTMLButtonElement */
const pauseButton = document.querySelector("#pause-button");
pauseButton.onclick = () => stateModel.togglePaused();
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
/** @type HTMLButtonElement */
const stepForwardButton = document.querySelector("#step-forward-button");
stepForwardButton.onclick = () => stepForward();

// Toggle Settings Panel
const toggleSettingsButton = document.querySelector("#toggle-settings-button");
const settingsPanel = document.querySelector("#settings");
const appContainer = document.querySelector("#app");

toggleSettingsButton.addEventListener("click", () => {
    settingsPanel.classList.toggle("hidden");
    appContainer.classList.toggle("settings-hidden");
    updateCanvasResolution();
});
