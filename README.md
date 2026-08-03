# ikasue

Planar adaptive UI components for information-dense workspaces.

This repository contains the distributable `@ugoite/ikasue` package and a Starlight documentation site with page-local interactive component demos. The visual direction is intentionally flat: regions negotiate space on one plane, and additions push existing content instead of floating above it.

- [Documentation source](docs-site/src/content/docs/overview.md)
- [Component matrix](docs-site/src/content/docs/components/index.mdx)
- Standalone interactive runtime surface (`npm run catalog`)

## Development

```sh
mise run setup
mise run dev
mise run check
npm run docs:dev
```

The standalone runtime surface is served by `npm run catalog`. GitHub Pages serves one component page per component, with its explanation and matching interactive demo in the same `/components/<id>/` page; all docs links follow Astro’s configured base path.

Useful documentation commands are `npm run docs:build` and `npm run docs:check`. From a clean checkout, install both lockfiles with `npm install` and `npm --prefix docs-site install`. Component links point to the component pages that own their demos, while `npm run catalog` keeps the standalone Vite runtime surface working locally.

The English docs locale is manually authored and kept in sync with the root locale by `npm run docs:sync`. Do not use external machine-translation services when adding or updating documentation.

## Publishing

- Documentation is deployed to GitHub Pages by `.github/workflows/pages.yml`.
- The npm package is published to GitHub Packages by `.github/workflows/package.yml`.
- The Pages project path is derived from `GITHUB_REPOSITORY`; no repository-specific credential or hard-coded deployment URL is required.

No third-party hosting is configured.

## License

MIT
