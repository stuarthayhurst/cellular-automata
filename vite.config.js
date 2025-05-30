import { svelte } from "@sveltejs/vite-plugin-svelte";
import Icons from "unplugin-icons/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
    base: "/cellular-automata/",
    plugins: [
        svelte(),
        Icons({
            compiler: "svelte",
            autoInstall: true
        })
    ],
    assetsInclude: ["**/*.png", "**/*.webp", "**/*.svg", "**/*.mp4"]
});
