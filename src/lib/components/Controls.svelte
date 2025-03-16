<script>
    import Icon from "@iconify/svelte";
    import { onMount } from "svelte";
    import { reactiveState } from "../reactiveState.svelte.js";
    import { resetToStart } from "../sharedState.js";
    import { pauseSimulation, updateSpeed } from "../simulation.js";
    import {
        editorUndo,
        mayUndo,
        editorRedo,
        mayRedo,
        clearGrid,
    } from "../cellEditor.js";
    import { bumpZoom } from "../dragAndZoom.js";
    import InfoPopup from "./InfoPopup.svelte";

    let { togglePaused, stepForward, toggleShowSettings } = $props();

    /**
     * Element at end of array.
     * @template T
     * @param {T[]} arr
     * @returns {T}
     */
    const top = (arr) => arr[arr.length - 1];

    document.addEventListener("keydown", (keyboardEvent) => {
        if (
            keyboardEvent.ctrlKey &&
            keyboardEvent.code === "Space" &&
            !reactiveState.showSettings
        )
            reactiveState.controlsVisible = !reactiveState.controlsVisible;
    });

    // Work around weird Chrome bug
    if (
        /** @type {PerformanceNavigationTiming | undefined} */ (
            window.performance.getEntriesByType("navigation")[0]
        ).type !== "navigate" &&
        navigator.userAgent.search("Chrome")
    ) {
        reactiveState.controlsVisible = false;
        setTimeout(() => (reactiveState.controlsVisible = true), 100);
    }

    $effect(() => {
        updateSpeed();
        reactiveState.simulationSpeed;
    });

    onMount(() => {
        if (!localStorage.getItem("hasVisited")) {
            showInfoPopup = true;
        }
    });

    let wasShowingSettings = $state(false);
    let showInfoPopup = $state(false);
</script>

<div id="controls" class:collapsed={!reactiveState.controlsVisible}>
    {#if !reactiveState.controlsVisible}
        <button
            class="hidden-arrow-btn"
            title="Show Controls (CTRL + SPACE)"
            onclick={() => {
                reactiveState.controlsVisible = true;
                reactiveState.showSettings = wasShowingSettings;
            }}
        >
            <Icon icon="fa-solid:angle-down" width="16" height="16" />
        </button>
    {/if}

    {#if reactiveState.controlsVisible}
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
                        onclick={() => {
                            reactiveState.shape =
                                reactiveState.shape === "sphere"
                                    ? "torus"
                                    : "sphere";
                            bumpZoom();
                        }}
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
                    <Icon
                        icon="fa-solid:fast-backward"
                        width="20"
                        height="20"
                    />
                </button>
                <button
                    id="pause-button"
                    class="square-btn btn-primary"
                    title={reactiveState.paused ? "Play" : "Pause"}
                    onclick={togglePaused}
                >
                    <Icon
                        icon={reactiveState.paused
                            ? "fa-solid:play"
                            : "fa-solid:pause"}
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
                        onclick={() => clearGrid()}
                    >
                        <Icon icon="fa-solid:eraser" width="20" height="20" />
                    </button>
                {/if}
                <button
                    class="square-btn btn-secondary"
                    title="Information"
                    onclick={() => (showInfoPopup = true)}
                >
                    <Icon icon="fa-solid:info" width="20" height="20" />
                </button>
                <button
                    class="square-btn btn-secondary"
                    title="Hide Controls (CTRL + SPACE)"
                    onclick={() => {
                        wasShowingSettings = reactiveState.showSettings;
                        reactiveState.showSettings = false;
                        reactiveState.controlsVisible = false;
                    }}
                >
                    <Icon icon="fa-solid:angle-up" width="20" height="20" />
                </button>
                <button
                    id="toggle-settings-button"
                    class="square-btn btn-secondary"
                    title="Settings"
                    onclick={() => toggleShowSettings()}
                >
                    <Icon icon="fa-solid:cog" width="20" height="20" />
                </button>
            </div>
        </div>
    {/if}
</div>

<InfoPopup bind:showInfoPopup />

<style>
    #controls.collapsed {
        padding: 0;
    }
</style>
