<script>
    import Settings from "./lib/components/Settings.svelte";
    import Controls from "./lib/components/Controls.svelte";
    import Display from "./lib/components/Display.svelte";
    import { sharedState } from "./lib/sharedState.js";
    import { applyPreset } from "./lib/preset.js";
    import { updateCanvasResolution } from "./lib/components/Display.svelte";
    import { reactiveState } from "./lib/reactiveState.svelte.js";
    import {
        stepForward,
        togglePaused,
        updateSpeed,
    } from "./lib/simulation.js";

    let presetsList = sharedState.presets;
    let showSettings = $state(false);
    $effect(() => {
        updateCanvasResolution();
        showSettings;
    });
    $effect(() => {
        updateSpeed();
        reactiveState.simulationSpeed;
    });
</script>

<select
    onchange={(e) =>
        applyPreset(e.currentTarget.value, sharedState, reactiveState)}
>
    {#each Object.keys(presetsList) as key}
        <option value={key}>{presetsList[key].name}</option>
    {/each}
</select>

<main
    class:settings-hidden={!showSettings}
    class:dragging={reactiveState.dragging}
>
    <div id="canvas-container">
        <Display />
    </div>
    <div id="controls">
        <Controls
            {togglePaused}
            {stepForward}
            toggleShowSettings={() => {
                showSettings = !showSettings;
            }}
        />
    </div>
    {#if showSettings}
        <div id="settings">
            <Settings />
        </div>
    {/if}
</main>

<style>
    main {
        height: 100vh;
        display: grid;
        grid-template-areas:
            "controls settings"
            "canvas settings";
        grid-template-columns: auto 400px;
        grid-template-rows: min-content auto;
        background-color: red;
    }

    main.settings-hidden {
        grid-template-areas:
            "controls"
            "canvas";
        grid-template-columns: auto;
    }
</style>
