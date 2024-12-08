import { mount } from "svelte";
import "./app.css";
import "./html-controls.css";
import App from "./App.svelte";

/** @type {MountOptions} */
const mountOptions = {
    target: document.getElementById("app"),
};

const app = mount(App, mountOptions);

export default app;
