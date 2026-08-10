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

## Use the Web ABI and plane API

```js
import {
  horizontal,
  resolvePlane,
  vertical,
} from "@ugoite/ikasue";
import { defineIkaSue } from "@ugoite/ikasue/elements";
import "@ugoite/ikasue/style.css";

defineIkaSue();
const grid = document.querySelector<HTMLElement & {
  rows: readonly { id: string; cells: Record<string, string> }[];
}>("ika-data-grid");
if (grid) grid.rows = [{ id: "42", cells: { name: "ika" } }];

const header = horizontal(["title", "actions"], { fit: "elastic", gap: 1 });
const body = vertical(["filters", "table"], { fit: "elastic", gap: 1 });
const layout = resolvePlane(vertical(["header", "body"], { gap: 1 }));
```

Element properties, events, and methods are the Web ABI. `vertical`, `horizontal`, and `resolvePlane` are serializable, framework-neutral plane contracts. [Host environments](hosts/) explains how to operate the same element from each language environment.

## State ownership

Before adding wrapper layers, decide which component owns values, status, selection, and draft. `FormList` is specifically the owner of values and status. Passing focus and draft to child `Text` creates local editing state; it must not recolor saved source data before confirmation.

## CSS and host layout

Import `@ugoite/ikasue/style.css` once at the application boundary. Give the mount target a real block size and avoid an ancestor transform that changes directional layout. Keep host focus styles visible.

The docs site builds each component page under the same Astro base path and embeds its interactive demo on that page. Astro components should use `sitePath` for generated links; content links remain relative.
