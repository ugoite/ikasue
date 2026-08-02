---
title: Release and publishing
description: Build, publish, and deploy ikasue from GitHub Actions.
---

## Local release checks

Use mise's Node 22.14.0 toolchain and install both lockfiles before checking a release.

```sh
mise trust
npm install
npm --prefix docs-site install
npm run format
npm run check
npm run build
npm run docs:check
npm run docs:build
npm pack --dry-run
pre-commit run --all-files
```

The package build writes the distributable files to `dist/`. The docs build writes the static site to `docs-site/dist/`.

## Documentation translation

The English locale is maintained as a manually authored translation. Keep its paths and component contracts synchronized with the source locale, and do not use external machine-translation services for release documentation.

## GitHub Pages

`.github/workflows/pages.yml` uses `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages`. The Astro config derives the project base path from `GITHUB_REPOSITORY`, so a repository such as `owner/project` builds links under `/project/`. The workflow grants `pages: write` and `id-token: write` only to the deploy job and uses the Pages environment.

The interactive catalog is part of the docs build at the relative `catalog/` route. It uses the same Astro base path as the Starlight pages, while the standalone Vite catalog remains a separate local development entry point.

## GitHub Packages

`.github/workflows/package.yml` runs on `v*` tags, builds the package, and publishes `@ugoite/ikasue` to `https://npm.pkg.github.com`. It uses the workflow `GITHUB_TOKEN` with `packages: write`; it does not publish to npmjs.org.

Keep the tag aligned with the package version, for example `v0.1.0`. Package consumers must configure the `@ugoite` scope for GitHub Packages as described in [Integration](integration/).
