## Spectacular Cellular Automata
  - Team 15's group project on cellular automata
  - Refer to the [style guide](docs/STYLE.md) for programming style guidelines
  - See also the [branching policy](docs/BRANCHING.md)
  - The webpage's files can be found in `src`, where `src/index.html` is the landing page

## Setup:
  - This is designed to be run locally, or hosted
  - Either way, the project depends on [gl-matrix](https://github.com/toji/gl-matrix) for linear algebra
  - Use `git submodule init` and `git submodule update --remote` to pull the submodule locally
  - Due to CORS, the project has to be hosted locally at a minimum
    - Use `cd src; python3 -m http.server` to host it
    - View the webpage by visiting `http://0.0.0.0:8000/`