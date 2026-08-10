# ikasue

Portable UI runtime for the Web, with plane-centered components for information-dense workspaces.

ikasue is a framework- and language-neutral UI substrate whose native ABI is the Web Platform. Custom Elements, JSON-safe properties, data-only CustomEvents, command methods, and CSS custom properties are the stable boundary. TypeScript is the first-class SDK; React, Vue, Svelte, Angular, Rust/WASM, Workers, and WebViews are hosts or bindings.

The package also keeps the pure plane and behavior primitives used by the runtime. The visual direction is intentionally flat: regions negotiate space on one plane, and additions push existing content instead of floating above it.

- [Documentation source](docs-site/src/content/docs/overview.md)
- [Component matrix](docs-site/src/content/docs/components/index.mdx)
- [Host environment guide](docs-site/src/content/docs/guides/hosts.md)

## Web ABI quick start

```ts
import { defineIkaSue } from "@ugoite/ikasue/elements";
import "@ugoite/ikasue/style.css";

defineIkaSue();
const grid = document.querySelector<
  HTMLElement & {
    columns: readonly { id: string; label: string }[];
    rows: readonly { id: string; cells: Record<string, string> }[];
  }
>("ika-data-grid");
if (!grid) throw new Error("ika-data-grid is required");
grid.columns = [{ id: "name", label: "Name" }];
grid.rows = [{ id: "42", cells: { name: "ika" } }];
```

Structured values stay properties; primitive configuration stays attributes; user intent and state changes are data-only events. The portable `IkaView` and `MessagePort` APIs lower to the same Custom Elements rather than introducing another renderer.

## Development

```sh
mise run setup
mise run dev
mise run check
npm run docs:dev
```

The standalone catalog remains available through `npm run catalog` as a development surface. GitHub Pages serves one component page per component, with its explanation and a matching demo that imports and registers the public ikasue elements on the same `/components/<id>/` page; all docs links follow Astro’s configured base path.

Useful documentation commands are `npm run docs:build` and `npm run docs:check`. From a clean checkout, install both lockfiles with `npm install` and `npm --prefix docs-site install`. Component links point to the component pages that own their demos; the host guide covers plain Web, framework, Rust/WASM, Worker, and WebView environments.

The English docs locale is manually authored and kept in sync with the root locale by `npm run docs:sync`. Do not use external machine-translation services when adding or updating documentation.

## Publishing

- Documentation is deployed to GitHub Pages by `.github/workflows/pages.yml`.
- The npm package is published to GitHub Packages by `.github/workflows/package.yml`.
- The Pages project path is derived from `GITHUB_REPOSITORY`; no repository-specific credential or hard-coded deployment URL is required.

No third-party hosting is configured.

## License

MIT
