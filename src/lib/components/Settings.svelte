<script>
    import { reactiveState } from "../reactiveState.svelte.js";
    import { setCellGridWidth, setCellGridHeight } from "../simulation.js";
    import GridDimensionInput from "./GridDimensionInput.svelte";
    import { applyPreset, presets } from "../preset.js";
    import { gameOfLifeRule, briansBrainRule } from "../simulation.js";
    import {
        changeColour,
        customColours,
        currentCustomColour,
        showSaveButton,
        handleCustomColourChange,
        saveColour,
        isDarkColour,
        errorMessage,
        removeCustomColour,
    } from "../colourTheme.js";
</script>

<h1>Settings</h1>

<!-- 1st section: grid-->
<h2>Grid</h2>
<div class="grid-controls">
    <div class="grid-input-group">
        <label for="width">Width</label>
        <GridDimensionInput
            value={reactiveState.cellGridWidth}
            setFn={(v) => setCellGridWidth(v)}
            id="width"
        />
    </div>
    <div class="grid-input-group">
        <label for="height">Height</label>
        <GridDimensionInput
            value={reactiveState.cellGridHeight}
            setFn={(v) => setCellGridHeight(v)}
            id="height"
        />
    </div>
</div>

<!-- 2nd sectiom: presets-->
<h2>Apply Presets</h2>
<div class="preset-container">
    {#each Object.entries(presets) as [key, preset]}
        <button on:click={() => applyPreset(key)} class="preset-button"
            >{preset.name}</button
        >
    {/each}
</div>

<!-- 3rd section: rules-->
<h2>Rules</h2>
<div class="rules-controls">
    <div class="radio-group">
        <label class="radio-label">
            <input
                type="radio"
                name="rule"
                bind:group={reactiveState.simulationRule}
                value={gameOfLifeRule}
            />
            <span class="radio-text">Game of Life</span>
        </label>
        <label class="radio-label">
            <input
                type="radio"
                name="rule"
                bind:group={reactiveState.simulationRule}
                value={briansBrainRule}
            />
            <span class="radio-text">Brian's Brain</span>
        </label>
    </div>
</div>

<!-- 4th section: colour selection-->
<h2>Colour Theme</h2>
<div class="colour-controls">
    <div class="radio-group">
        <!-- (1) Blue (default)-->
        <label class="radio-label">
            <input
                type="radio"
                name="colour"
                value="blue"
                checked={reactiveState.selectedColour === "blue"}
                on:change={changeColour}
            />
            <div
                class="colour-circle"
                style="background-color: #1E90FF"
                title="Blue"
            ></div>
        </label>
        <!-- (2) Pink-->
        <label class="radio-label">
            <input
                type="radio"
                name="colour"
                value="pink"
                checked={reactiveState.selectedColour === "pink"}
                on:change={changeColour}
            />
            <div
                class="colour-circle"
                style="background-color: #FF69B4"
                title="Pink"
            ></div>
        </label>
        <!-- (3) Purple-->
        <label class="radio-label">
            <input
                type="radio"
                name="colour"
                value="purple"
                checked={reactiveState.selectedColour === "purple"}
                on:change={changeColour}
            />
            <div
                class="colour-circle"
                style="background-color: #9370DB"
                title="Purple"
            ></div>
        </label>
        <!-- (4) Yellow-->
        <label class="radio-label">
            <input
                type="radio"
                name="colour"
                value="yellow"
                checked={reactiveState.selectedColour === "yellow"}
                on:change={changeColour}
            />
            <div
                class="colour-circle"
                style="background-color: #FFD700"
                title="Yellow"
            ></div>
        </label>
        <!-- (5) White-->
        <label class="radio-label">
            <input
                type="radio"
                name="colour"
                value="white"
                checked={reactiveState.selectedColour === "white"}
                on:change={changeColour}
            />
            <div
                class="colour-circle"
                style="background-color: #FFFFFF"
                title="White"
            ></div>
        </label>
        <!-- (6) Green-->
        <label class="radio-label">
            <input
                type="radio"
                name="colour"
                value="green"
                checked={reactiveState.selectedColour === "green"}
                on:change={changeColour}
            />
            <div
                class="colour-circle"
                style="background-color: #2ECC71"
                title="Green"
            ></div>
        </label>
        <!-- (7) Mint-->
        <label class="radio-label">
            <input
                type="radio"
                name="colour"
                value="mint"
                checked={reactiveState.selectedColour === "mint"}
                on:change={changeColour}
            />
            <div
                class="colour-circle"
                style="background-color: #8EFFBD"
                title="Mint"
            ></div>
        </label>
        <!-- (8) Coral-->
        <label class="radio-label">
            <input
                type="radio"
                name="colour"
                value="coral"
                checked={reactiveState.selectedColour === "coral"}
                on:change={changeColour}
            />
            <div
                class="colour-circle"
                style="background-color: #FF7F50"
                title="Coral"
            ></div>
        </label>
        <!-- (9) Lavender-->
        <label class="radio-label">
            <input
                type="radio"
                name="colour"
                value="lavender"
                checked={reactiveState.selectedColour === "lavender"}
                on:change={changeColour}
            />
            <div
                class="colour-circle"
                style="background-color: #E6E6FA"
                title="Lavender"
            ></div>
        </label>
        <!-- (10) Black-->
        <label class="radio-label">
            <input
                type="radio"
                name="colour"
                value="black"
                checked={reactiveState.selectedColour === "black"}
                on:change={changeColour}
            />
            <div
                class="colour-circle"
                style="background-color: #000000"
                title="Black"
            ></div>
        </label>
        <!-- saved custom colors -->
        {#each $customColours as colour}
            <label class="radio-label custom-saved-label">
                <input
                    type="radio"
                    name="colour"
                    value={colour.hex}
                    checked={reactiveState.selectedColour === colour.hex}
                    on:change={changeColour}
                />
                <div
                    class="colour-circle"
                    style="background-color: {colour.hex}"
                    title="Saved Custom Colour"
                >
                    <button
                        class="remove-colour-btn"
                        on:click|stopPropagation={() =>
                            removeCustomColour(colour.hex)}
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
                value="custom"
                checked={reactiveState.selectedColour === "custom"}
                on:change={changeColour}
            />
            <div
                class="colour-circle custom-colour-circle"
                style="background-color: {$currentCustomColour}"
                class:dark-background={isDarkColour($currentCustomColour)}
                title="Pick Custom Colour"
            >
                <input
                    type="color"
                    value={$currentCustomColour}
                    on:input={handleCustomColourChange}
                    class="colour-picker"
                />
            </div>
        </label>
    </div>
    <!-- save button for custom colours -->
    {#if $showSaveButton}
        <button class="save-colour-btn" on:click={saveColour}>
            Save Colour
        </button>
    {/if}
    <!-- error message for duplicate custom colours -->
    {#if $errorMessage}
        <div class="error-message">{$errorMessage}</div>
    {/if}
</div>

<!-- 5th section: cell editor-->
<h2>Cell Editor</h2>
<div class="cell-editor-controls">
    <div class="toggle-group">
        <label class="toggle-label">
            <input
                type="checkbox"
                bind:checked={reactiveState.aliasBackground}
            />
            <span class="toggle-text">Show aliased cells</span>
        </label>
    </div>
</div>

<style>
    /* @Improve
    This is needed to prevent the layout from bugging out
    when the content in the settings pane goes off the
    bottom of the viewport.
     */
    :global(#settings) {
        width: 400px;
        flex-shrink: 0;
        overflow-y: auto;
        height: 100%;
        position: fixed;
        right: 0;
        top: 0;
        padding: 20px;
        box-sizing: border-box;
        z-index: 1000;
    }

    :global(#settings h1) {
        color: #445d77;
        margin-top: 3rem;
        margin-bottom: 1.5rem;
        font-family: "Poppins", sans-serif;
        font-weight: 700;
        font-size: 1.8rem;
        text-align: center;
        letter-spacing: -0.5px;
    }

    :global(#settings h2) {
        color: #3f5770;
        margin-top: 2.5rem;
        font-family: "Poppins", sans-serif;
        font-weight: 540;
        font-size: 1.2rem;
        letter-spacing: -0.2px;
    }

    .grid-controls {
        background: rgba(0, 0, 0, 0.1);
        padding: 15px;
        border-radius: 12px;
        display: flex;
        justify-content: center;
        gap: 30px;
    }

    .grid-input-group {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .grid-input-group :global(input) {
        text-align: center;
        padding: 10px 1px;
        border-radius: 4px;
        border: 2px solid var(--foreground-light);
        font-size: 14px;
        color: var(--foreground);
        outline: none;
        box-sizing: border-box;
        height: 45px;
        width: 85px;
    }

    .grid-input-group :global(input:focus) {
        border: 3px solid var(--foreground);
        outline: none;
    }

    .grid-input-group :global(input:invalid) {
        border-color: var(--danger);
    }

    .grid-input-group label {
        font-size: 15px;
        color: #2c3e50;
        font-family: "Poppins", sans-serif;
    }

    /* Preset */
    .preset-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 10px;
        background: rgba(0, 0, 0, 0.1);
        padding: 20px;
        border-radius: 12px;
    }

    .preset-button {
        background-color: rgba(255, 255, 255, 0.9);
        border: 2px solid var(--foreground-light);
        border-radius: 4px;
        padding: 10px 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: "Poppins", system-ui, sans-serif;
        font-size: 13px;
        font-weight: 500;
        color: #3b3e3f;
        min-height: 45px;
        min-width: 45px;
    }

    .preset-button:focus {
        border: 3px solid var(--foreground);
        padding: 9px 13px;
    }

    .preset-button:active:not(:disabled) {
        background-color: rgb(0 0 0 / 15%);
    }

    /* Rules */
    .radio-group {
        display: flex;
        gap: 10px;
    }

    .radio-label {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 14px;
        background: rgba(255, 255, 255, 0.9);
        border: 2px solid var(--foreground-light);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .radio-text {
        font-family: "Poppins", system-ui, sans-serif;
        font-size: 13px;
        font-weight: 500;
        color: #3b3e3f;
    }

    input[type="radio"] {
        appearance: none;
        width: 16px;
        height: 16px;
        border: 2px solid #445d77;
        border-radius: 50%;
        margin: 0;
    }

    input[type="radio"]:checked {
        background: #445d77;
        border-color: white;
        box-shadow: 0 0 0 2px #445d77;
    }

    /* Colour Theme */
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

    /* Grid Background */
    .toggle-group {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .toggle-label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 8px 14px;
        background: rgba(255, 255, 255, 0.9);
        border: 2px solid var(--foreground-light);
        border-radius: 4px;
        transition: all 0.2s ease;
    }

    .toggle-text {
        font-family: "Poppins", system-ui, sans-serif;
        font-size: 13px;
        font-weight: 500;
        color: #3b3e3f;
    }

    .toggle-label input[type="checkbox"] {
        width: 16px;
        height: 16px;
        margin: 0;
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

    .save-colour-btn {
        margin-top: 10px;
        margin-left: auto;
        margin-right: auto;
        padding: 8px 16px;
        font-family: "Poppins", system-ui, sans-serif;
        background: var(--foreground-light);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        display: block;
    }

    .save-colour-btn:hover {
        opacity: 0.7;
    }

    .error-message {
        color: #ff3e3e;
        font-size: 14px;
        font-weight: 750;
        text-align: center;
        margin-top: 8px;
        font-family: "Poppins", system-ui, sans-serif;
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
