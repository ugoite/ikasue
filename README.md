# ikasue

ikasue is a portable UI runtime whose native ABI is the Web Platform. It is not a React, Vue, or TypeScript renderer: those environments are hosts for the same Custom Elements.

The stable boundary is `ikasue-web/1`: Custom Elements, primitive attributes, JSON-safe properties, data-only CustomEvents, command methods, and CSS custom properties/parts. TypeScript is the first-class binding; Rust/WASM, React, Vue, Svelte, Angular, workers, and WebViews use the same element boundary.

```ts
import { defineIkaSue } from "@ugoite/ikasue/elements";
import "@ugoite/ikasue/style.css";

defineIkaSue();
const grid = document.querySelector("ika-data-grid");
if (grid) {
  grid.columns = [{ id: "name", label: "Name" }];
  grid.rows = [{ id: "42", cells: { name: "ika" } }];
}
```

The contract schemas live under [`contract/`](contract/). `renderIkaView` only lowers a serializable view to the same elements; it is not a second renderer. Small datasets can use `grid.rows`; large or off-thread datasets can use `grid.model` or `grid.connect(messagePort)`.

The generic host guide covers plain JavaScript/TypeScript, React, Vue, Svelte, Angular, Rust/WASM, Worker/MessagePort, and WebView/Tauri-style environments.

## Development

```sh
npm install
npm run check
npm run build
npm run docs:check
npm run docs:build
```

The docs site is an Astro + Starlight site with manually mirrored Japanese and English pages. The visual language stays flat, readable during work, directional, and keyboard-first. Selected work receives area; loading keeps its content mounted; panels remain in flow.

## Publishing

Documentation is deployed to GitHub Pages and the package is published to GitHub Packages by the existing workflows.

## License

MIT
