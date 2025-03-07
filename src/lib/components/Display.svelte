<script>
    /** @type HTMLCanvasElement */
    let canvas;

    import { onMount } from "svelte";
    import { reactiveState } from "../reactiveState.svelte.js";
    import { startRenderer } from "../rendering.js";
    import { setUpDragAndZoom } from "../dragAndZoom.js";
    import { setUpCellEditor } from "../cellEditor.js";

    function updateCanvasResolution() {
        const bound = canvas.getBoundingClientRect();

        canvas.width = canvas.clientWidth;
        canvas.height = window.innerHeight - bound.y;
    }

    $effect(() => {
        updateCanvasResolution();
        reactiveState.showSettings;
        reactiveState.controlsVisible;
    });

    onMount(() => {
        const context = canvas.getContext("webgl2");
        if (!context) {
            console.error("No WebGL2 support detected");
            return;
        }

        updateCanvasResolution();
        onresize = () => updateCanvasResolution();

        startRenderer(context);
        setUpDragAndZoom(canvas);
        setUpCellEditor(canvas);
    });
</script>

<canvas
    bind:this={canvas}
    class:grab={!reactiveState.dragging &&
        reactiveState.interfaceMode === "3D View"}
    oncontextmenu={(event) => event.preventDefault()}
></canvas>

<style>
    canvas {
        width: 100%;
        height: 100%;
        grid-area: canvas;
        background-color: var(--very-light-grey);
    }

    canvas.grab {
        cursor: grab;
    }
</style>
