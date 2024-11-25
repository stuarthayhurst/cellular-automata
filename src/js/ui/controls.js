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
/** @type HTMLButtonElement */
const toggleSettingsButton = document.querySelector("#toggle-settings-button");
/** @type HTMLDivElement */
const settingsPanel = document.querySelector("#settings");
/** @type HTMLDivElement */
const appContainer = document.querySelector("#app");

toggleSettingsButton.onclick = () => {
    settingsPanel.classList.toggle("hidden");
    appContainer.classList.toggle("settings-hidden");
    updateCanvasResolution();
};

// Speed selector
/** @type HTMLSelectElement */
const speedSelector = document.querySelector("#speed-selector");

speedSelector.addEventListener("change", (event) => {
    const selectedSpeed = parseFloat(event.target.value);
    stateModel.stepIntervalMultiplier = selectedSpeed;

    if (!stateModel.paused) {
        adjustSimulationSpeed(); // recalculate interval with new speed
    }
});

// Adjust simulation speed based on selected multiplier
function adjustSimulationSpeed() {
    const interval =
        stateModel.baseStepIntervalMillis * stateModel.stepIntervalMultiplier;

    if (stateModel.paused) {
        return; //  if the simulation is paused, the function exits early
    }

    clearInterval(stateModel.stepInterval); // clear existing intervals
    stateModel.stepInterval = setInterval(() => {
        stepForward();
    }, interval); // set new interval with adjusted speed
}
