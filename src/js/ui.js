import { model, togglePaused } from "./model.js";
import { stepForward } from "./simulator.js";

const pauseButton = document.querySelector("#pauseButton");
pauseButton.addEventListener("click", () => togglePaused(model));

const stepForwardButton = document.querySelector("#stepForwardButton");
stepForwardButton.addEventListener("click", () => stepForward());
