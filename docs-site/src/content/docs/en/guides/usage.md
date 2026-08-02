---
title: Usage
description: Compose ikasue components around one negotiated plane.
---

## The smallest mount

Mount the package into an existing DOM target. The catalog is framework-neutral and can live inside an application shell.

```js
import { mountCatalog } from "@ugoite/ikasue";
import "@ugoite/ikasue/style.css";

const target = document.querySelector("#workspace");
if (!target) throw new Error("workspace target is required");

const catalog = mountCatalog(target, {
  label: "Operations workspace",
  component: "data-table",
});

catalog.select("form-list");
// Route teardown:
catalog.dispose();
```

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

Read each component’s property table, JavaScript implementation / usage, and Rust implementation sketch, then use the catalog to verify defaults and keyboard behavior. The [Examples](../examples/) page compares the plane model across five distinct site shapes.
