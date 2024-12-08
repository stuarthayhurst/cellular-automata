<script module>
    /** @type HTMLCanvasElement */
    let canvas;

    export function updateCanvasResolution() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight - 5;
    }
</script>

<script>
    import { onMount } from "svelte";
    import { reactiveState } from "../reactiveState.svelte.js";
    import { startRenderer } from "../rendering.js";
    import { setUpCamera } from "../camera.js";

    onMount(() => {
        const context = canvas.getContext("webgl2");
        if (!context) {
            console.error("No WebGL2 support detected");
            return;
        }

        startRenderer(context);
        setUpCamera(canvas);

        updateCanvasResolution();
        onresize = () => updateCanvasResolution();
    });
</script>

<canvas bind:this={canvas} class:dragging={reactiveState.dragging}></canvas>

<style>
    canvas {
        width: 100%;
        height: 100%;
        grid-area: canvas;
        background-color: var(--very-light-grey);
    }

    canvas:not(.dragging) {
        cursor: grab;
    }
</style>
