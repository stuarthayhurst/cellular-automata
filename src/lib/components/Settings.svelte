<script>
    import { reactiveState } from "../reactiveState.svelte.js";
    import {
        setCellGridWidth,
        setCellGridHeight,
        changeRule,
    } from "../simulation.js";
    import GridDimensionInput from "./GridDimensionInput.svelte";
    import { applyPreset, presets } from "../preset.js";
</script>

<h1>Settings</h1>

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

<h2>Apply Presets</h2>
<div class="preset-container">
    {#each Object.entries(presets) as [key, preset]}
        <button on:click={() => applyPreset(key)} class="preset-button"
            >{preset.name}</button
        >
    {/each}
</div>

<h2>Rules</h2>
<div class="rules-controls">
    <div class="radio-group">
        <label class="radio-label">
            <input
                type="radio"
                name="rule"
                value="gameOfLife"
                checked={reactiveState.simulationRule === "Game of Life"}
                on:change={changeRule}
            />
            <span class="radio-text">Game of Life</span>
        </label>
        <label class="radio-label">
            <input
                type="radio"
                name="rule"
                value="briansBrain"
                checked={reactiveState.simulationRule === "Brian's Brain"}
                on:change={changeRule}
            />
            <span class="radio-text">Brian's Brain</span>
        </label>
    </div>
</div>

<h2>Cell Editor</h2>
<div class="background-controls">
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
</style>
