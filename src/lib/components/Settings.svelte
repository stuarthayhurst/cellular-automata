<script>
    import { reactiveState } from "../reactiveState.svelte.js";
    import { setCellGridWidth, setCellGridHeight } from "../simulation.js";
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

<h2>Camera</h2>

<style>
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
</style>
