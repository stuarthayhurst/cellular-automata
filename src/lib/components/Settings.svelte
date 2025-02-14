<script>
    import { reactiveState } from "../reactiveState.svelte.js";
    import { setCellGridWidth, setCellGridHeight } from "../simulation.js";
    import GridDimensionInput from "./GridDimensionInput.svelte";
    import { applyPreset, presets } from "../preset.js";
</script>

<h1>Settings</h1>

<h2>Grid</h2>
<div style="display: flex; flex-direction: column">
    <div>
        <label for="width">Width</label>
        <GridDimensionInput
            value={reactiveState.cellGridWidth}
            setFn={(v) => setCellGridWidth(v)}
            id="width"
        />
    </div>
    <div>
        <label for="height">Height</label>
        <GridDimensionInput
            value={reactiveState.cellGridHeight}
            setFn={(v) => setCellGridHeight(v)}
            id="height"
        />
    </div>
</div>

<h2>Presets</h2>
{#each Object.entries(presets) as [key, preset]}
    <button on:click={() => applyPreset(key)} class="preset-button"
        >{preset.name}</button
    >
{/each}

<h2>Camera</h2>

<style>
    .preset-button {
        margin-right: 5px;
        margin-bottom: 5px;
    }
</style>
