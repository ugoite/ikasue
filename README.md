# ikasue

Planar adaptive UI components for information-dense workspaces.

This repository contains the distributable `@ugoite/ikasue` package, an interactive component catalog, and a Starlight documentation site. The visual direction is intentionally flat: regions negotiate space on one plane, and additions push existing content instead of floating above it.

- [Documentation source](docs-site/src/content/docs/index.md)
- [Component matrix](docs-site/src/content/docs/components/index.mdx)
- [Interactive catalog](http://localhost:5173/)

## Development

```sh
mise run setup
mise run dev
mise run check
npm run docs:dev
```

The catalog is available at `http://localhost:5173/`. The Starlight docs run at `http://localhost:4321/`.

Useful documentation commands are `npm run docs:build` and `npm run docs:check`. From a clean checkout, install both lockfiles with `npm install` and `npm --prefix docs-site install`. Component demo links use `PUBLIC_CATALOG_URL` when set; otherwise they point to the local catalog at `http://localhost:5173/`.

## Publishing

- Documentation is deployed to GitHub Pages by `.github/workflows/pages.yml`.
- The npm package is published to GitHub Packages by `.github/workflows/package.yml`.
- The Pages project path is derived from `GITHUB_REPOSITORY`; no repository-specific credential or hard-coded deployment URL is required.

No third-party hosting is configured.

## License

MIT
