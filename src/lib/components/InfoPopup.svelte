<script>
    export let showInfoPopup = false;

    import deadImage from "../assets/images/dead.webp";
    import pencilImage from "../assets/images/pencil.webp";
    import oneAliveImage from "../assets/images/oneAlive.webp";
    import multipleCellsAliveImage from "../assets/images/multipleCellsAlive.webp";
    import shapeImage from "../assets/images/shape.webp";
    import torusImage from "../assets/images/torus.webp";
    import sphereImage from "../assets/images/sphere.webp";
    import playPauseAndSpeedImage from "../assets/images/playPauseAndSpeed.webp";
    import stepForwardImage from "../assets/images/stepForward.webp";
    import beforeStepForwardImage from "../assets/images/beforeStepForward.webp";
    import afterStepForwardImage from "../assets/images/afterStepForward.webp";
    import settingsImage from "../assets/images/settings.webp";
    import showSettingsPanelImage from "../assets/images/showSettingsPanel.webp";

    import dragAndSpinVideo from "../assets/videos/dragAndSpin.mp4";
    import gridZoomVideo from "../assets/videos/gridZoom.mp4";
    import dragGridVideo from "../assets/videos/dragGrid.mp4";
    import objectZoomVideo from "../assets/videos/3DObjectZoom.mp4";

    function handleClosePopup() {
        showInfoPopup = false;
        localStorage.setItem("hasVisited", "true");
    }

    function toggleVideo(event) {
        const video = event.target;
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    }
</script>

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
                            <source src={dragAndSpinVideo} type="video/mp4" />
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
                            <source src={objectZoomVideo} type="video/mp4" />
                        </video>
                        <video
                            muted
                            onclick={toggleVideo}
                            style="cursor: pointer;"
                        >
                            <source src={gridZoomVideo} type="video/mp4" />
                        </video>
                    </div>
                    <div class="video-caption">
                        Scroll up or down to zoom in or out
                        <br />
                        <small>(Click video to play/pause)</small>
                    </div>
                </li>

                <li>
                    <img src={pencilImage} alt="Pencil" />
                    Use the pencil in the top left to open the cell editor
                </li>

                <li>
                    <img src={deadImage} alt="Dead" />
                    <img src={oneAliveImage} alt="Alive" />
                    Click on a tile to toggle it between dead and alive
                </li>

                <li>
                    <img src={deadImage} alt="Dead" />
                    <img
                        src={multipleCellsAliveImage}
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
                            <source src={dragGridVideo} type="video/mp4" />
                        </video>
                    </div>
                    <div class="video-caption">
                        Right click and drag to move the grid around
                        <br />
                        <small>(Click video to play/pause)</small>
                    </div>
                </li>

                <li>
                    <img src={shapeImage} alt="Shape" />
                    <img src={torusImage} alt="Torus" />
                    <img src={sphereImage} alt="Sphere" />
                    Use the shape button in the top left to change the 3D object
                </li>

                <li>
                    <img
                        src={playPauseAndSpeedImage}
                        alt="Play/Pause and Speed"
                    />
                    Use the controls in the middle at the top to run the simulation
                    and control its speed
                </li>

                <li>
                    <img src={stepForwardImage} alt="Step Forward" />
                    <img
                        src={beforeStepForwardImage}
                        alt="Before Step Forward"
                    />
                    <img src={afterStepForwardImage} alt="After Step Forward" />
                    Use the "Step forward" button to move one generation at a time
                </li>

                <li>
                    <img src={settingsImage} alt="Settings" />
                    <img src={showSettingsPanelImage} alt="Settings Panel" />
                    Use the settings button in the top right to change the size,
                    preset, rules and graphics settings
                </li>
            </ul>
        </div>
    </div>
{/if}

<style>
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
