---
title: Release and publishing
description: Build, publish, and deploy ikasue from GitHub Actions.
---

## Local checks

Use the mise Node 22.14.0 toolchain and both lockfiles.

```sh
npm install
npm --prefix docs-site install
npm run format:check
npm run check
npm run build
npm run docs:check
npm run docs:build
```

The package build writes to `dist/`; the docs build writes to `docs-site/dist/`. Do not edit generated build output or the package version during the documentation phase.

## Bilingual documentation

The root locale and English locale are both authored manually. `npm run docs:sync` checks matching relative paths and rejects root-absolute links. Keep the English prose hand-authored alongside the same Plane API and component contracts; do not send it to an external machine-translation service.

## GitHub Pages boundary

The Pages workflow builds only the Astro + Starlight static site and publishes it with `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages`. `astro.config.mjs` derives the project base from `GITHUB_REPOSITORY`; generated links use `sitePath` so the base is preserved.

Pages hosts docs whose component pages include their interactive demos. It is not the package distribution channel.

## GitHub Packages boundary

The package workflow builds on `v*` tags and publishes `@ugoite/ikasue` to `https://npm.pkg.github.com` with `GITHUB_TOKEN` and `packages: write`. It does not publish to npmjs.org or a third-party deployment target. Pages deployment and package publishing remain separate boundaries.
