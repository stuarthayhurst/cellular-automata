import { model, togglePaused } from "./model";
import { stepForward } from "./simulator";

const pauseButton = document.querySelector("#pauseButton");
pauseButton.addEventListener("click", () => togglePaused(model));

const stepForwardButton = document.querySelector("#stepForwardButton");
stepForwardButton.addEventListener("click", () => stepForward());
