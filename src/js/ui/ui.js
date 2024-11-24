export const canvas = document.querySelector("#canvas");
const toggleSettingsButton = document.querySelector("#toggle-settings-button");
const settingsPanel = document.querySelector("#settings");
const appContainer = document.querySelector("#app");

toggleSettingsButton.addEventListener("click", () => {
 
  
  settingsPanel.classList.toggle("hidden");

  appContainer.classList.toggle("settings-hidden");

  resizeCanvas();
});
function resizeCanvas() {
    const canvas = document.querySelector("#canvas");
    const container = document.querySelector("#canvas-container");
  
    canvas.width = container.offsetWidth * 0.9;
    canvas.height = container.offsetHeight * 0.9;
  
    const context = canvas.getContext("webgl2");
    if (context) {
      context.viewport(0, 0, canvas.width, canvas.height);
    }
  }
resizeCanvas();
window.addEventListener("resize", resizeCanvas);