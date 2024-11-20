import { stateModel, togglePaused } from "./stateModel.js";
import { stepForward } from "./simulator.js";

export const canvas = document.querySelector("#renderer");

const pauseButton = document.querySelector("#pause-button");
pauseButton.addEventListener("click", () => togglePaused(stateModel));

const stepForwardButton = document.querySelector("#step-forward-button");
stepForwardButton.addEventListener("click", () => stepForward());
