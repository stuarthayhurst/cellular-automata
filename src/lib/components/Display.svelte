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
    import { setUpDragAndZoom } from "../dragAndZoom.js";
    import { setUpCellEditor } from "../cellEditor.js";

    onMount(() => {
        const context = canvas.getContext("webgl2");
        if (!context) {
            console.error("No WebGL2 support detected");
            return;
        }

        startRenderer(context);
        setUpDragAndZoom(canvas);
        setUpCellEditor(canvas);

        updateCanvasResolution();
        onresize = () => updateCanvasResolution();
    });
</script>

<canvas
    bind:this={canvas}
    class:grab={!reactiveState.dragging && reactiveState.renderMode === "3D"}
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
