## Spectacular Cellular Automata
  - Originally developed as a group project for the University of Nottingham
    - This has been open-sourced for interest and inspiration, and is not actively developed
  - Simulate cellular automata in 2D, displaying it on the surface of 3D meshes
    - Supports dynamically generated spheres and toruses
  - See some [examples](#screenshots)
  - Licensed under the [Mozilla Public License 2.0](LICENCE.txt)

## Features:
  - GPU-accelerated 2D and 3D views
    - Includes various graphics settings
  - Interactive, drawable grid editor
  - 4 different rules
  - Speed selection, play / pause and single step mode

## Controls:
  - Left or right click and drag to rotate the 3D view
  - Scroll to zoom the 2D or 3D view
  - Click a cell to toggle its state
    - Click and drag to toggle multiple cells
  - Change the view mode with the pencil icon in the top left
  - Change the shape with the shape icon in the top left

## Development:
  - Run `npm install` to setup the project
  - Run `npm run dev` to start the development environment

## Screenshots:
<p align="center">
  <img src="https://github.com/stuarthayhurst/cellular-automata/raw/master/docs/demo-1.png" alt="Demo 1">
</p>

## Deployment:
  - Run `npm run build` to build the project, producing a bundle in `dist/`
    - This can be served using a web server of your choice
    - Alternatively, use `npm run preview`
