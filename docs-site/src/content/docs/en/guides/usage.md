---
title: Usage
description: Compose ikasue components around one negotiated plane.
---

## The smallest Web ABI usage

Register the Custom Elements in the host, then pass primitive configuration as attributes and structured data as properties.

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
grid.setAttribute("density", "compact");
grid.columns = [{ id: "name", label: "Name" }];
grid.rows = [{ id: "42", cells: { name: "ika" } }];
```

See [Host environments](hosts/) for plain Web, framework, Rust/WASM, Worker, and WebView usage. `npm run catalog` remains a development-only entry point for checking the package locally.

## Declare the plane first

```js
import { horizontal, resolvePlane, vertical } from "@ugoite/ikasue";

const filters = horizontal(["status", "owner", "date"], {
  fit: "wrap",
  gap: 1,
  available: 6,
});
const workspace = vertical(
  [
    { id: "filters", basis: 2, min: 1 },
    { id: "table", basis: 6, min: 3 },
  ],
  { fit: "elastic", gap: 1, available: 8 },
);

const filterLayout = resolvePlane(filters);
const workspaceLayout = resolvePlane(workspace);
```

A `PlaneSpec` gives components one vocabulary for available space, child order, and overflow. You do not need another surface or overlap rule just to make layout work.

## Choose by responsibility

| Need                                   | Start with      | What the plane model preserves                   |
| -------------------------------------- | --------------- | ------------------------------------------------ |
| Document-wide rules                    | `ThemeRoot`     | Consistent density, selection, motion, and lines |
| A vertical work column                 | `Vertical`      | DOM order and height adaptation                  |
| A toolbar or short comparison          | `Horizontal`    | Horizontal order and width adaptation            |
| A value read most of the time          | `Text`          | One information contract for display and edit    |
| A short form with owned status         | `FormList`      | Centralized FormList state ownership             |
| Cell-oriented business data            | `DataTable`     | Selection, copy/paste, and inline editing        |
| A status linked to a region            | `MessageRegion` | The relationship between message and target      |
| A decision that keeps evidence visible | `BottomDialog`  | A bottom row added to the same plane             |

`FormList` owns values and status. Child `Text` focus and draft are local editing state and must not recolor saved source data before confirmation.

## Check the composition

Read each component’s property table, JavaScript implementation / usage, Rust implementation sketch, and page-local demo using the public element as one component contract. The [Examples](../examples/) page shows the plane model with a few simple arrangements.
