<script>
    import Settings from "./lib/components/Settings.svelte";
    import Controls from "./lib/components/Controls.svelte";
    import Display from "./lib/components/Display.svelte";
    import { reactiveState } from "./lib/reactiveState.svelte.js";
    import { stepForward, togglePaused } from "./lib/simulation.js";
</script>

<main
    class:settings-hidden={!reactiveState.showSettings}
    class:dragging={reactiveState.dragging}
>
    <div id="canvas-container">
        <Display />
    </div>
    <Controls
        {togglePaused}
        {stepForward}
        toggleShowSettings={() => {
            reactiveState.showSettings = !reactiveState.showSettings;
        }}
    />
    {#if reactiveState.showSettings}
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
