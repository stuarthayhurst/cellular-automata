# Spectacular Cellular Automata

- Team 15's group project on cellular automata.
- An [npm](https://www.npmjs.com/) package using the [Svelte](https://svelte.dev/) web framework with [Vite](https://vite.dev/) to bundle source and asset files.
- Uses [gl-matrix](https://www.npmjs.com/package/gl-matrix) for linear algebra.
- Refer to the [style guide](docs/STYLE.md) for programming style guidelines.
- See also the [branching policy](docs/BRANCHING.md).

## Setup

1. Install [node](https://nodejs.org/en).
2. In the project directory, run `npm install` to install dependencies.

## Development

- Use `npm run dev`.
  This will serve the website locally with hot reloading[^1].

## Testing

- Use `npm run test`.

## Deployment

1. Use `npm run build` to build the project, this will create a bundle in `dist/`.
2. Use any web server to serve the files in `dist/`.
   An easy way to do this locally is using `npm run preview`.

[^1]: When you save changes in the project directory, the program will automatically reload the webpage in your browser reflecting those changes.
