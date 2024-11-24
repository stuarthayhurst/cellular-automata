import { canvas } from "./ui.js";

// Update Canvas Resolution to match its size in the page

export function updateCanvasResolution() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight - 5;
}

updateCanvasResolution();

onresize = () => updateCanvasResolution();
