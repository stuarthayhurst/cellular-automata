import { stateModel, togglePaused } from "./stateModel.js";
import { stepForward } from "./simulator.js";

export const canvas = document.querySelector("#renderer");

const pauseButton = document.querySelector("#pauseButton");
//pauseButton.addEventListener("click", () => togglePaused(stateModel));

const stepForwardButton = document.querySelector("#stepForwardButton");
//stepForwardButton.addEventListener("click", () => stepForward());
