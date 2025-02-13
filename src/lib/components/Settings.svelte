<script>
    import { reactiveState } from "../reactiveState.svelte.js";
    import { setCellGridWidth, setCellGridHeight } from "../simulation.js";
    import GridDimensionInput from "./GridDimensionInput.svelte";
    import PresetSelector from "./PresetSelector.svelte";

    let selectedPreset = "";
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
<h2>Camera</h2>
<PresetSelector bind:selectedPreset />
<h2>Camera</h2>
