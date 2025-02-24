import { reactiveState } from "./reactiveState.svelte.js";
import { sharedState } from "./sharedState.js";
import { colour_rgb } from "./tools.js";
import { writable, get } from "svelte/store";

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

export const customColours = writable([]); //stores array of saved custom colours
export const showSaveButton = writable(false); //controls save button visibility
export const currentCustomColour = writable("#E6E6E6"); //stores current colour picker value, default is light grey to macth settings' bg colour
export const errorMessage = writable(""); //stores error message for duplicate custom colours

export function handleCustomColourChange(event) {
    const colour = event.target.value; //get colour from colour picker
    currentCustomColour.set(colour); //update current colour store
    showSaveButton.set(true); //show the save button
    changeColour({
        target: {
            value: "custom",
            customColor: colour,
        },
    });
}

export function saveColour() {
    const colour = get(currentCustomColour); //get current colour value
    if (!get(customColours).some((c) => c.hex === colour)) {
        saveCustomColour(colour);
        showSaveButton.set(false);
        errorMessage.set("");
    } else {
        //display error message for duplicate custom colours
        errorMessage.set("This colour already exists!");
        setTimeout(() => errorMessage.set(""), 3000);
    }
}

function convertHexToRGB(hexColour) {
    const hex = hexColour.replace("#", ""); //remove #

    //get the rgb values from hex
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    //make rgb values 50% darker for base colour (bg)
    const baseR = Math.floor(r * 0.5);
    const baseG = Math.floor(g * 0.5);
    const baseB = Math.floor(b * 0.5);

    return {
        base: [baseR, baseG, baseB],
        cell: [r, g, b],
    };
}

export function saveCustomColour(hexColour) {
    const colors = convertHexToRGB(hexColour);
    //update the store with the new colour
    customColours.update((colours) => [
        ...colours,
        {
            hex: hexColour,
            base: colors.base, //50% darker rgb values for base colour
            cell: colors.cell, //original rgb values for cell colour
        },
    ]);
}

export function changeColour(event) {
    const value = event.target.value;
    reactiveState.selectedColour = value;

    if (value.startsWith("#")) {
        //"#": custom coloour from colour picker/previously saved custom colour
        const colours = convertHexToRGB(value);
        //apply colours using array destructuring
        const [baseR, baseG, baseB] = colours.base;
        const [cellR, cellG, cellB] = colours.cell;

        sharedState.baseColour = colour_rgb(baseR, baseG, baseB);
        sharedState.cellColour = colour_rgb(cellR, cellG, cellB);
    } else {
        //preset colours
        const colourSet = colours[value]; //get the colour set (1. base colour 2. cell colour) from the selected colour
        if (colourSet) {
            const [baseR, baseG, baseB] = colourSet.base;
            const [cellR, cellG, cellB] = colourSet.cell;

            sharedState.baseColour = colour_rgb(baseR, baseG, baseB);
            sharedState.cellColour = colour_rgb(cellR, cellG, cellB);
        }
    }
}

//to determine if the colour picker's "+" sign should be white (on dark backgrounds) or black (on light backgrounds) for optimal readability
export function isDarkColour(color) {
    // remove '#' from hex colour code, e.g., "#000000" to "000000"
    const hex = color.replace("#", "");

    //convert hex to rgb values
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    //calculate perceived brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128; //return true if the colour is dark
}

//remove custom colour from the store
export function removeCustomColour(hexColour) {
    customColours.update((colours) =>
        colours.filter((c) => c.hex !== hexColour),
    );
}
