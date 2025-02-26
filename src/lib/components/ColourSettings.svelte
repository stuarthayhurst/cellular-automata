<script>
    import { sharedState } from "../sharedState.js";
    import { rgbVec, hexToRGB, titleCase } from "../tools.js";
    import { reactiveState } from "../reactiveState.svelte.js";

    /**
     * @typedef {[Number, Number, Number]} ColourRGB
     */

    /**
     * @typedef {Object} ColourTheme
     * @property {ColourRGB} base
     * @property {ColourRGB} cell
     */

    // prettier-ignore
    /** @type {Object.<string, ColourTheme>} */
    const presetColours = {
        blue:     { base: [12, 56, 102],   cell: [30, 144, 255] },
        pink:     { base: [130, 20, 75],   cell: [255, 105, 180] },
        purple:   { base: [75, 20, 130],   cell: [147, 112, 219] },
        yellow:   { base: [130, 120, 20],  cell: [255, 215, 0] },
        white:    { base: [180, 180, 180], cell: [255, 255, 255] },
        green:    { base: [20, 102, 20],   cell: [50, 205, 50] },
        mint:     { base: [62, 180, 137],  cell: [142, 255, 189] },
        coral:    { base: [205, 80, 80],   cell: [255, 127, 80] },
        lavender: { base: [93, 85, 148],   cell: [230, 230, 250] },
        black:    { base: [200, 200, 200], cell: [0, 0, 0] },
    };

    let colourPickerHex = $state("#E6E6E6");

    /**
     * @param {String} hex
     * @returns {ColourTheme}
     */
    function hexToColourTheme(hex) {
        const rgb = hexToRGB(hex);
        return {
            base: rgb.map(/** @param {Number} n */ (n) => Math.floor(n * 0.5)), // 50% brightness
            cell: rgb,
        };
    }

    /**
     * @param {String} preset
     * @returns {void}
     */
    function setPresetColour(preset) {
        reactiveState.selectedColour = preset;
        setColours(presetColours[preset]);
    }

    /**
     * @param {ColourTheme} theme
     * @returns {void}
     */
    function setColours(theme) {
        sharedState.baseColour = rgbVec(...theme.base);
        sharedState.cellColour = rgbVec(...theme.cell);
    }

    /**
     * To determine if the colour picker's "+" sign should be white
     * (on dark backgrounds) or black (on light backgrounds) for readability.
     * @param {String} hex - e.g. #fff
     * @returns {Boolean}
     */
    function isDarkColour(hex) {
        const [r, g, b] = hexToRGB(hex);
        const perceivedBrightness = (r * 299 + g * 587 + b * 114) / 1000;
        return perceivedBrightness < 128;
    }

    /**
     * @param {String} removeHex
     * @returns {void}
     */
    function removeCustomColour(removeHex) {
        reactiveState.customColours = reactiveState.customColours.filter(
            (hex) => hex !== removeHex,
        );
    }
</script>

<div class="colour-controls">
    <div class="radio-group">
        {#each Object.entries(presetColours) as [themeKey, theme]}
            <label class="radio-label">
                <input
                    type="radio"
                    name="colour"
                    value={themeKey}
                    bind:group={reactiveState.selectedColour}
                    onchange={() => setPresetColour(themeKey)}
                />
                <div
                    class="colour-circle"
                    style="background-color: rgb({theme.cell.join(' ')})"
                    title={titleCase(themeKey)}
                ></div>
            </label>
        {/each}

        <!-- saved custom colors -->
        {#each reactiveState.customColours as hex}
            <label class="radio-label custom-saved-label">
                <input
                    type="radio"
                    name="colour"
                    value={hex}
                    bind:group={reactiveState.selectedColour}
                    onchange={(event) =>
                        setColours(hexToColourTheme(event.currentTarget.value))}
                />
                <div
                    class="colour-circle"
                    style="background-color: {hex}"
                    title="Saved Custom Colour"
                >
                    <button
                        class="remove-colour-btn"
                        onclick={() => removeCustomColour(hex)}
                        title="Remove colour"
                    >
                        ×
                    </button>
                </div>
            </label>
        {/each}
        <!-- colour picker -->
        <label class="radio-label custom-colour-label">
            <input
                type="radio"
                name="colour"
                onchange={(event) =>
                    setColours(hexToColourTheme(event.currentTarget.value))}
            />
            <div
                class="colour-circle custom-colour-circle"
                style="background-color: {colourPickerHex}"
                class:dark-background={isDarkColour(colourPickerHex)}
                title="Pick Custom Colour"
            >
                <input
                    type="color"
                    bind:value={colourPickerHex}
                    class="colour-picker"
                    oninput={(event) =>
                        setColours(hexToColourTheme(event.currentTarget.value))}
                    onchange={() => {
                        reactiveState.customColours.push(colourPickerHex);
                        reactiveState.selectedColour = colourPickerHex;
                    }}
                />
            </div>
        </label>
    </div>
</div>

<style>
    .colour-controls {
        background: rgba(0, 0, 0, 0.1);
        padding: 15px;
        border-radius: 12px;
        max-width: 360px;
        box-sizing: border-box;
    }

    .colour-controls .radio-group {
        justify-content: center;
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 10px;
    }

    .colour-controls .radio-label {
        position: relative;
        width: 40px;
        height: 40px;
        padding: 0;
        border: none;
        background: none;
        cursor: pointer;
    }

    .colour-controls input[type="radio"] {
        position: absolute;
        width: 100%;
        height: 100%;
        cursor: pointer;
    }

    .colour-circle {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        transition: all 0.001s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        position: relative;
    }

    .colour-controls input[type="radio"]:checked + .colour-circle {
        box-shadow:
            0 0 0 2px white,
            0 0 0 4px var(--foreground);
    }

    .colour-controls input[type="radio"]:hover + .colour-circle {
        transform: scale(1.2);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }

    /* custom colour */
    .colour-picker {
        opacity: 0;
        position: absolute;
        width: 100%;
        height: 100%;
    }

    .custom-colour-circle::after {
        content: "+";
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: rgba(0, 0, 0, 0.5);
        font-size: 20px;
        pointer-events: none;
    }

    /* changes the colour of "+" sign to white (with 80% opacity) when the background is dark,
    if bg is light, "+" stays black (default colour)*/
    .dark-background::after {
        color: rgba(255, 255, 255, 0.8);
    }

    .remove-colour-btn {
        position: absolute;
        top: -8px;
        right: -8px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #ff3e3e;
        color: white;
        border: none;
        font-size: 16px;
        line-height: 1;
        opacity: 0;
        transition: opacity 0.2s;
    }

    .custom-saved-label:hover .remove-colour-btn {
        opacity: 1;
    }

    .remove-colour-btn:hover {
        background: #ff6b6b;
    }
</style>
