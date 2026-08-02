---
title: Usage
description: Choose and compose ikasue components around negotiated space.
---

## The smallest useful composition

Start with a semantic region and let the runtime mount into a real DOM target. The catalog is framework-neutral and can sit inside an existing application shell.

```ts
import { mountCatalog } from "@ugoite/ikasue";
import "@ugoite/ikasue/style.css";

const target = document.querySelector<HTMLElement>("#workspace");
if (!target) throw new Error("workspace target is required");

const catalog = mountCatalog(target, {
  label: "Order workspace",
  component: "focus-plane",
});

// Keep the returned handle for route changes or teardown.
catalog.select("data-table");
catalog.dispose();
```

The package's public mount API is intentionally small: `label`, `component`, and `search` configure the catalog; `select` changes the current page and `dispose` removes listeners and DOM owned by the mount.

## Choose by spatial responsibility

| Need                                      | Start with                   | Why                                                                     |
| ----------------------------------------- | ---------------------------- | ----------------------------------------------------------------------- |
| A readable value that can become editable | `Text`                       | Information and editor capability stay together.                        |
| Two regions competing for attention       | `FocusPlane` + `FocusRegion` | A child can request space without knowing the parent tree.              |
| Many regions along one axis               | `AxisFlow`                   | End navigation appears on the same axis when the viewport is finite.    |
| Detail entering from an edge              | `EdgeRegion` or `BottomDock` | The new track pushes content instead of overlaying it.                  |
| One panel among siblings                  | `ElasticTabs`                | Selection receives area and panel motion has direction.                 |
| Business data                             | `DataTable`                  | Cell selection, peer highlighting, clipboard, and editing are explicit. |
| A short decision                          | `BottomDialog`               | The evidence remains above the new bottom row.                          |

## Keep composition planar

Use `Stack` and `Cluster` for local order and wrapping. Add `Rule` only at a meaningful boundary. When a component needs to change the allocation of a larger region, use the dedicated layout contract rather than adding a new wrapper surface.

The [component matrix](../components/) is the fastest way to compare props and jump to a working demo. Every page includes the current metadata defaults and a copyable contract.
