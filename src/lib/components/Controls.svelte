<script>
    import Icon from "@iconify/svelte";
    import { reactiveState } from "../reactiveState.svelte.js";
    import { resetToStart } from "../sharedState.js";
    import { pauseSimulation } from "../simulation.js";
    import {
        editorUndo,
        mayUndo,
        editorRedo,
        mayRedo,
        clearGrid,
    } from "../cellEditor.js";

    let { togglePaused, stepForward, toggleShowSettings } = $props();

    /**
     * @template T
     * @param {Array<T>} arr
     * @returns {T}
     */
    const top = (arr) => arr[arr.length - 1];
</script>

<div id="controls-bar">
    <div id="left-controls" class="controls-section">
        <button
            class="square-btn btn-secondary"
            title={reactiveState.interfaceMode === "3D View"
                ? "Edit Cells"
                : "3D View"}
            onclick={() => {
                reactiveState.interfaceMode =
                    reactiveState.interfaceMode === "Editor"
                        ? "3D View"
                        : "Editor";
            }}
        >
            <Icon
                icon={reactiveState.interfaceMode === "3D View"
                    ? "fa-solid:pen"
                    : "fa-solid:cube"}
                width="20"
                height="20"
            />
        </button>
        {#if reactiveState.interfaceMode === "Editor"}
            <button
                class="square-btn btn-secondary"
                title={`Undo ${reactiveState.historyStack.length > 0 ? top(reactiveState.historyStack).actionName : ""} (CTRL+Z)`}
                onclick={() => editorUndo()}
                disabled={!mayUndo(
                    reactiveState.historyStack.length,
                    reactiveState.atStart,
                )}
            >
                <Icon icon="fa-solid:undo" width="20" height="20" />
            </button>
            <button
                class="square-btn btn-secondary"
                title={`Redo ${reactiveState.redoStack.length > 0 ? top(reactiveState.redoStack).actionName : ""} (CTRL+SHIFT+Z)`}
                onclick={() => editorRedo()}
                disabled={!mayRedo(
                    reactiveState.redoStack.length,
                    reactiveState.atStart,
                )}
            >
                <Icon icon="fa-solid:redo" width="20" height="20" />
            </button>
        {:else}
            <button
                class="square-btn btn-secondary"
                title={reactiveState.shape === "sphere"
                    ? "See Torus"
                    : "See Sphere"}
                onclick={() =>
                    (reactiveState.shape =
                        reactiveState.shape === "sphere" ? "torus" : "sphere")}
            >
                <Icon icon="fa-solid:shapes" width="20" height="20" />
            </button>
        {/if}
    </div>
    <div id="centre-controls" class="controls-section">
        <button
            id="reset-button"
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
            class="square-btn btn-secondary"
            title="Step Forward"
            onclick={stepForward}
        >
            <Icon icon="fa-solid:step-forward" width="20" height="20" />
        </button>
    </div>
    <div id="right-controls" class="controls-section">
        {#if reactiveState.interfaceMode === "Editor"}
            <button
                id="clear-button"
                aria-label="Clear"
                class="square-btn btn-danger"
                title="Clear"
                onclick={clearGrid}
            >
                <Icon icon="fa-solid:eraser" width="20" height="20" />
            </button>
        {/if}
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
