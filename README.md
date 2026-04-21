## Spectacular Cellular Automata
  - Originally developed as a group project for the University of Nottingham
    - This has been open-sourced for interest and inspiration, and is not actively developed
  - Simulate cellular automata in 2D, displaying it on the surface of 3D meshes
    - Supports dynamically generated spheres and toruses
  - Host it yourself, or visit the [GitHub pages copy](https://stuarthayhurst.github.io/cellular-automata)
  - See some [examples](#screenshots)
  - Licensed under the [Mozilla Public License 2.0](LICENCE.txt)

## Features:
  - GPU-accelerated 2D and 3D views
    - Includes various graphics settings
  - Interactive, drawable grid editor
  - 4 different rules
  - Speed selection, play / pause and single step mode
  - Up to 1.46 billion individually addressable cells, with configurable bit width

## Controls:
  - Left or right click and drag to rotate the 3D view
  - Scroll to zoom the 2D or 3D view
  - Click a cell to toggle its state
    - Click and drag to toggle multiple cells
  - Change the view mode with the pencil icon in the top left
  - Change the shape with the shape icon in the top left

## Development:
  - Run `cd app; npm install` to setup the project
  - Run `cd app; npm run dev` to start the development environment

## Screenshots:
<p align="center">
  <img src="https://github.com/stuarthayhurst/cellular-automata/raw/master/docs/demo-1.png" alt="Demo 1">
</p>
<p align="center">
  <img src="https://github.com/stuarthayhurst/cellular-automata/raw/master/docs/demo-2.png" alt="Demo 2">
</p>

## Deployment:
  - Run `cd app; npm run build` to build the project, producing a bundle in `app/dist/`
    - This can be served using a web server of your choice
    - Alternatively, use `cd app; npm run preview`
  - Alternatively, run `docker compose up` to build and start a Docker image
