# ikasue

Planar adaptive UI components for information-dense workspaces.

This repository contains the distributable `@ugoite/ikasue` package, an interactive component catalog, and a Starlight documentation site. The visual direction is intentionally flat: regions negotiate space on one plane, and additions push existing content instead of floating above it.

## Development

```sh
mise run setup
mise run dev
mise run check
```

The catalog is available at `http://localhost:5173/`. The Starlight docs run at `http://localhost:4321/`.

## Publishing

- Documentation is deployed to GitHub Pages by `.github/workflows/pages.yml`.
- The npm package is published to GitHub Packages by `.github/workflows/package.yml`.

No third-party hosting is configured.

## License

MIT
