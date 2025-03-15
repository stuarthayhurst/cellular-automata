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
        const hasVisitedBefore = localStorage.getItem("hasVisitedCA");
        if (!hasVisitedBefore) {
            showInfoPopup = true;
        }
    });

    function toggleVideo(event) {
        const video = event.target;
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    }

    let wasShowingSettings = $state(false);
    let showInfoPopup = $state(false);

    function handleClosePopup() {
        showInfoPopup = false;
        localStorage.setItem("hasVisitedCA", "true");
    }
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

{#if showInfoPopup}
    <div class="info-popup">
        <div class="popup-content">
            <button class="close-button" onclick={handleClosePopup}>
                CLOSE
            </button>
            <h3>Cellular Automata Information</h3>
            <ul>
                <li>
                    This project simulates cellular automata and displays it in
                    3D. Play around with different rules, patterns and settings,
                    but have fun!
                </li>

                <li>
                    <div class="video-container">
                        <video
                            muted
                            onclick={toggleVideo}
                            style="cursor: pointer;"
                        >
                            <source
                                src="/videos/dragAndSpin.mp4"
                                type="video/mp4"
                            />
                        </video>
                    </div>
                    <div class="video-caption">
                        Use left or right click and drag to spin the 3D object
                        <br />
                        <small>(Click video to play/pause)</small>
                    </div>
                </li>

                <li>
                    <div class="video-container">
                        <video
                            muted
                            onclick={toggleVideo}
                            style="cursor: pointer;"
                        >
                            <source
                                src="/videos/3DObjectZoom.mp4"
                                type="video/mp4"
                            />
                        </video>
                        <video
                            muted
                            onclick={toggleVideo}
                            style="cursor: pointer;"
                        >
                            <source
                                src="/videos/gridZoom.mp4"
                                type="video/mp4"
                            />
                        </video>
                    </div>
                    <div class="video-caption">
                        Scroll up or down to zoom in or out
                        <br />
                        <small>(Click video to play/pause)</small>
                    </div>
                </li>

                <li>
                    <img src="/images/pencil.png" alt="Pencil" />
                    Use the pencil in the top left to open the cell editor
                </li>

                <li>
                    <img src="/images/dead.png" alt="Dead" />
                    <img src="/images/oneAlive.png" alt="Alive" />
                    Click on a tile to toggle it between dead and alive
                </li>

                <li>
                    <img src="/images/dead.png" alt="Dead" />
                    <img
                        src="/images/multipleCellsAlive.png"
                        alt="Multiple Cells Alive"
                    />
                    Left click and drag to change multiple cells at once
                </li>

                <li>
                    <div class="video-container">
                        <video
                            muted
                            onclick={toggleVideo}
                            style="cursor: pointer;"
                        >
                            <source
                                src="/videos/dragGrid.mp4"
                                type="video/mp4"
                            />
                        </video>
                    </div>
                    <div class="video-caption">
                        Right click and drag to move the grid around
                        <br />
                        <small>(Click video to play/pause)</small>
                    </div>
                </li>

                <li>
                    <img src="/images/shape.png" alt="Shape" />
                    <img src="/images/torus.png" alt="Torus" />
                    <img src="/images/sphere.png" alt="Sphere" />
                    Use the shape button in the top left to change the 3D object
                </li>

                <li>
                    <img
                        src="/images/playPauseAndSpeed.png"
                        alt="Play/Pause and Speed"
                    />
                    Use the controls in the middle at the top to run the simulation
                    and control its speed
                </li>

                <li>
                    <img src="/images/stepForward.png" alt="Step Forward" />
                    <img
                        src="/images/beforeStepForward.png"
                        alt="Before Step Forward"
                    />
                    <img
                        src="/images/afterStepForward.png"
                        alt="After Step Forward"
                    />
                    Use the "Step forward" button to move one generation at a time
                </li>

                <li>
                    <img src="/images/settings.png" alt="Settings" />
                    <img
                        src="/images/showSettingsPanel.png"
                        alt="Settings Panel"
                    />
                    Use the settings button in the top right to change the size,
                    preset, rules and graphics settings
                </li>
            </ul>
        </div>
    </div>
{/if}

<style>
    #controls.collapsed {
        padding: 0;
    }

    .info-popup {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        backdrop-filter: blur(3px);
        z-index: 9999;
    }

    .popup-content {
        background-color: white;
        color: #333;
        padding: 40px;
        padding-top: 60px;
        width: 900px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }

    .popup-content li {
        margin-bottom: 32px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        color: #3b3e3f;
        gap: 12px;
        border: 1px solid #e0e0e0;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        width: calc(100% - 48px);
        font-family: "Poppins", sans-serif;
        font-size: 0.95rem;
        font-weight: 500;
    }

    .close-button {
        position: fixed;
        top: 40px;
        right: calc(50% - 450px + 10px);
        width: auto;
        height: 36px;
        border-radius: 4px;
        background-color: #ff4444;
        color: white;
        border: none;
        justify-content: center;
        cursor: pointer;
        padding: 0 16px;
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.5px;
        z-index: 10000;
    }

    .close-button:hover {
        background-color: #ff0000;
        transform: scale(1.05);
    }

    .popup-content h3 {
        color: #445d77;
        margin-top: 0;
        margin-bottom: 1.5rem;
        font-family: "Poppins", sans-serif;
        font-weight: 700;
        font-size: 1.8rem;
        text-align: center;
        letter-spacing: -0.5px;
        border-bottom: 2px solid #eee;
        padding-bottom: 16px;
    }

    .popup-content img {
        max-width: 200px;
        height: auto;
        margin: 8px;
        border-radius: 8px;
    }

    .popup-content img[alt="Settings Panel"] {
        max-width: 700px;
    }

    .video-container {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 32px;
        max-width: 900px;
        border-radius: 10px;
    }

    .popup-content video {
        width: calc(50% - 16px);
        border-radius: 10px;
        display: block;
        box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
    }

    .video-caption {
        margin-top: 12px;
        font-family: "Poppins", sans-serif;
        font-size: 0.9rem;
        color: #3f5770;
        font-weight: 500;
    }

    .video-caption small {
        color: #667788;
        font-size: 0.85em;
        font-weight: 400;
    }
</style>
