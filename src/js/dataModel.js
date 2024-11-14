import * as Renderer from "./renderer.js"
import * as Simulator from "./simulator.js"

var dataModel = {
  cellData: [],
  cameraPosition: null,
  cameraAngle: null,
  isPaused: true,
};

Renderer.setModel(dataModel);
Simulator.setModel(dataModel);
