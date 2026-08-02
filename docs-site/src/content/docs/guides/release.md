---
title: Release and publishing / リリース
description: Build, publish, and deploy ikasue from GitHub Actions.
---

## local check

miseのNode 22.14.0 toolchainと両方のlockfileを使います。

```sh
npm install
npm --prefix docs-site install
npm run format:check
npm run check
npm run build
npm run docs:check
npm run docs:build
```

package buildの出力は`dist/`、docs buildの出力は`docs-site/dist/`です。generated build outputやpackage versionをdocs phaseで編集しません。

## bilingual docs

root localeとEnglish localeは両方とも手書きです。`npm run docs:sync`がrelative pathの一致とroot-absolute linkの混入を検査します。English proseを外部のmachine translation serviceへ送らず、同じPlane APIとcomponent contractを人手で更新します。

## GitHub Pages boundary

Pages workflowはAstro + Starlightのstatic siteだけをbuildし、`actions/configure-pages`、`actions/upload-pages-artifact`、`actions/deploy-pages`で公開します。`astro.config.mjs`は`GITHUB_REPOSITORY`からproject baseを導き、generated linkは`sitePath` / `catalogPath`でそのbaseを含めます。

Pagesはdocsとinteractive catalogのhostです。packageの配布先ではありません。

## GitHub Packages boundary

package workflowは`v*` tagでpackageをbuildし、`@ugoite/ikasue`を`https://npm.pkg.github.com`へ`GITHUB_TOKEN`と`packages: write`で公開します。npmjs.orgやthird-party deployment targetへは公開しません。Pages deployとpackage publishは別のboundaryとして扱います。
