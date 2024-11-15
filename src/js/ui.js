import { stateModel, togglePaused } from "./stateModel.js";
import { stepForward } from "./simulator.js";

const pauseButton = document.querySelector("#pauseButton");
pauseButton.addEventListener("click", () => togglePaused(stateModel));

const stepForwardButton = document.querySelector("#stepForwardButton");
stepForwardButton.addEventListener("click", () => stepForward());
