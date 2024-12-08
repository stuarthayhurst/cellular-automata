<script>
    import Icon from "@iconify/svelte";
    import { reactiveState } from "../reactiveState.svelte.js";
    import { resetToStart } from "../sharedState.js";
    import { pauseSimulation } from "../simulation.js";

    let { togglePaused, stepForward, toggleShowSettings } = $props();
</script>

<div id="controls-bar">
    <div id="left-controls" class="controls-section">
        <button
            aria-label="2D/3D"
            class="square-btn btn-secondary"
            title="2D/3D"
            disabled
        >
            <Icon icon="fa-solid:pen" width="20" height="20" />
        </button>
    </div>
    <div id="centre-controls" class="controls-section">
        <button
            id="reset-button"
            aria-label="Reset"
            class="square-btn btn-secondary"
            title="Reset"
            disabled={reactiveState.atStart}
            onclick={() => {
                pauseSimulation();
                resetToStart();
            }}
        >
            <Icon icon="fa-solid:fast-backward" width="20" height="20" />
        </button>
        <button
            id="pause-button"
            class="square-btn btn-primary"
            title={reactiveState.paused ? "Play" : "Pause"}
            onclick={togglePaused}
        >
            <Icon
                icon={reactiveState.paused ? "fa-solid:play" : "fa-solid:pause"}
                width="20"
                height="20"
            />
        </button>
        <select
            id="speed-selector"
            class="dropdown-btn"
            title="Select Speed"
            bind:value={reactiveState.simulationSpeed}
        >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={3}>3x</option>
            <option value={10}>10x</option>
        </select>
        <button
            id="step-forward-button"
            aria-label="Step Forward"
            class="square-btn btn-secondary"
            title="Step Forward"
            onclick={stepForward}
        >
            <Icon icon="fa-solid:step-forward" width="20" height="20" />
        </button>
    </div>
    <div id="right-controls" class="controls-section">
        <!-- <button
            id="clear-button"
            aria-label="Clear"
            class="square-btn btn-danger"
            title="Clear"
        >
            <Icon icon="fa-solid:eraser" width="20" height="20" />
        </button> -->
        <button
            id="toggle-settings-button"
            class="square-btn btn-secondary"
            title="Settings"
            onclick={toggleShowSettings}
        >
            <Icon icon="fa-solid:cog" width="20" height="20" />
        </button>
    </div>
</div>
