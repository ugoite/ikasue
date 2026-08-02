# ikasue

Planar adaptive UI components for information-dense workspaces.

This repository contains the distributable `@ugoite/ikasue` package, an interactive component catalog, and a Starlight documentation site. The visual direction is intentionally flat: regions negotiate space on one plane, and additions push existing content instead of floating above it.

- [Documentation source](docs-site/src/content/docs/index.md)
- [Component matrix](docs-site/src/content/docs/components/index.mdx)
- Standalone interactive catalog (`npm run catalog`)

## Development

```sh
mise run setup
mise run dev
mise run check
npm run docs:dev
```

The standalone catalog is served by `npm run catalog`, and the integrated catalog is available at `catalog/` from the local docs origin during development. GitHub Pages serves the same integrated route at `https://ugoite.github.io/ikasue/catalog/`; all docs links follow Astro’s configured base path.

Useful documentation commands are `npm run docs:build` and `npm run docs:check`. From a clean checkout, install both lockfiles with `npm install` and `npm --prefix docs-site install`. Component demo links point to the integrated docs catalog, while `npm run catalog` keeps the standalone Vite catalog working locally.

The English docs locale is manually authored and kept in sync with the root locale by `npm run docs:sync`. Do not use external machine-translation services when adding or updating documentation.

## Publishing

- Documentation is deployed to GitHub Pages by `.github/workflows/pages.yml`.
- The npm package is published to GitHub Packages by `.github/workflows/package.yml`.
- The Pages project path is derived from `GITHUB_REPOSITORY`; no repository-specific credential or hard-coded deployment URL is required.

No third-party hosting is configured.

## License

MIT
