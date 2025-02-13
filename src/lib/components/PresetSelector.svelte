<script>
    import { applyPreset, presets } from "../preset.js";

    export let selectedPreset = "";

    function handlePresetChange(event) {
        const newPreset = event.target.value;
        if (newPreset) {
            applyPreset(newPreset);
            if (newPreset === "random") {
                setTimeout(() => (selectedPreset = ""), 0);
            }
        }
    }
</script>

<div class="preset-container">
    <label for="preset-select">Select preset:</label>
    <select
        id="preset-select"
        bind:value={selectedPreset}
        on:change={handlePresetChange}
    >
        <option value="">-- Select a preset --</option>
        {#each Object.keys(presets) as key}
            <option value={key}>{presets[key].name}</option>
        {/each}
    </select>
</div>

<style>
    .preset-container {
        margin-top: 10px;
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    select {
        padding: 5px;
        font-size: 14px;
        border-radius: 4px;
        border: 1px solid #ccc;
        width: 100%;
    }
</style>
