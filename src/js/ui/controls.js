import { stateModel } from "../stateModel.js";
import { stepForward } from "../simulator.js";
import { updateCanvasResolution } from "./canvas.js";

// Pause button
/** @type HTMLButtonElement */
const pauseButton = document.querySelector("#pause-button");
/** @type HTMLElement */
const pauseIcon = document.querySelector("#pause-icon");

pauseButton.onclick = () => stateModel.togglePaused();

stateModel.addEventListener("onPausedChanged", () => {
    if (stateModel.paused) {
        pauseIcon.classList.remove("fa-pause");
        pauseIcon.classList.add("fa-play");
        pauseIcon.title = "Play";
    } else {
        pauseIcon.classList.remove("fa-play");
        pauseIcon.classList.add("fa-pause");
        pauseIcon.title = "Pause";
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
    stateModel.setSimulationSpeed(parseFloat(event.target.value));
});

