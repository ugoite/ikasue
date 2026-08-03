---
title: Integration
description: Mount the plane-centered runtime in an existing application.
---

## Install the package

`@ugoite/ikasue` is published to GitHub Packages. Configure the `@ugoite` scope in the consuming project and use the organization’s normal package-manager and CI secret store for authentication.

```sh
npm install @ugoite/ikasue --registry=https://npm.pkg.github.com
```

Credentials belong in the managed GitHub Packages configuration, not in this documentation.

## Mount and use the plane API

```js
import {
  horizontal,
  mountCatalog,
  resolvePlane,
  vertical,
} from "@ugoite/ikasue";
import "@ugoite/ikasue/style.css";

const target = document.querySelector("#workspace");
const handle = target
  ? mountCatalog(target, {
      label: "Operations workspace",
      component: "data-table",
    })
  : undefined;

const header = horizontal(["title", "actions"], { fit: "elastic", gap: 1 });
const body = vertical(["filters", "table"], { fit: "elastic", gap: 1 });
const layout = resolvePlane(vertical(["header", "body"], { gap: 1 }));

handle?.dispose();
```

`mountCatalog` owns listeners and the generated catalog subtree for its target. Call `dispose()` during route teardown. `vertical`, `horizontal`, and `resolvePlane` are serializable, framework-neutral plane contracts.

## State ownership

Before adding wrapper layers, decide which component owns values, status, selection, and draft. `FormList` is specifically the owner of values and status. Passing focus and draft to child `Text` creates local editing state; it must not recolor saved source data before confirmation.

## CSS and host layout

Import `@ugoite/ikasue/style.css` once at the application boundary. Give the mount target a real block size and avoid an ancestor transform that changes directional layout. Keep host focus styles visible.

The docs site builds each component page under the same Astro base path and embeds its interactive demo on that page. Astro components should use `sitePath` for generated links; content links remain relative.
