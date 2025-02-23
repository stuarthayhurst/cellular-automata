import { reactiveState } from "./reactiveState.svelte.js";
import { sharedState } from "./sharedState.js";
import { colour_rgb } from "./tools.js";

export const colours = {
    blue: { base: [12, 56, 102], cell: [30, 144, 255] },
    pink: { base: [130, 20, 75], cell: [255, 105, 180] },
    purple: { base: [75, 20, 130], cell: [147, 112, 219] },
    yellow: { base: [130, 120, 20], cell: [255, 215, 0] },
    white: { base: [180, 180, 180], cell: [255, 255, 255] },
    green: { base: [20, 102, 20], cell: [50, 205, 50] },
    mint: { base: [62, 180, 137], cell: [142, 255, 189] },
    coral: { base: [205, 80, 80], cell: [255, 127, 80] },
    lavender: { base: [93, 85, 148], cell: [230, 230, 250] },
    black: { base: [200, 200, 200], cell: [0, 0, 0] },
};

export function changeColour(event) {
    const selectedColour = event.target.value; //extract the selected colour value from the radio input
    reactiveState.selectedColour = selectedColour; //update reactive state with the selected new colour

    const colourSet = colours[selectedColour]; //get the colour set (1. base colour 2. cell colour) from the selected colour
    sharedState.baseColour = colour_rgb(
        //update base colour in shared state
        colourSet.base[0],
        colourSet.base[1],
        colourSet.base[2],
    );
    sharedState.cellColour = colour_rgb(
        //update cell colour in shared state
        colourSet.cell[0],
        colourSet.cell[1],
        colourSet.cell[2],
    );
}
