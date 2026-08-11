---
title: Host environments
description: Use the same ikasue Web ABI from JavaScript, frameworks, Rust/WASM, workers, and WebViews.
---

# Host environments

ikasue is not a JavaScript UI library. It is a portable UI runtime for the Web, and its public boundary is the `ikasue-web/1` Web ABI. A JavaScript or TypeScript app, React, Vue, Svelte, Angular, Rust/WASM, a Worker, or a WebView host all end by operating the same `HTMLElement`.

## Register the Web ABI

Every host registers the elements once before using them.

```ts
import { defineIkaSue } from "@ugoite/ikasue/elements";
import "@ugoite/ikasue/style.css";

defineIkaSue();
```

Pass a scoped `CustomElementRegistry` when a microfrontend or multiple package versions must be isolated. Registration is idempotent for one registry and fails with a conflict when another constructor already owns a tag.

```ts
import { defineIkaSue } from "@ugoite/ikasue/elements";
import { renderIkaView } from "@ugoite/ikasue/view";

const registry = new CustomElementRegistry();
defineIkaSue(registry);
const host = document.querySelector<HTMLElement>("#isolated-root");
if (!host) throw new Error("#isolated-root is required");
renderIkaView(
  host,
  { version: "ikasue-web/1", kind: "text", text: "Isolated host" },
  registry,
);
```

This does not distribute a renderer to the host. The host creates elements, assigns properties, listens to events, and calls documented command methods.

## Attribute / property / event / method

Keep the four boundaries distinct.

| Boundary                   | Use                   | Example                                      |
| -------------------------- | --------------------- | -------------------------------------------- |
| primitive declaration      | attribute             | `density="compact"`, `editable`              |
| structured data / model    | property              | `grid.columns = columns`, `grid.rows = rows` |
| user intent / state change | data-only CustomEvent | `ika-selection-change`                       |
| imperative command         | method                | `grid.focus()`, `grid.scrollToRow("42")`     |

```ts
const grid = document.querySelector<
  HTMLElement & {
    columns: readonly { id: string; label: string }[];
    rows: readonly { id: string; cells: Record<string, string> }[];
    scrollToRow(id: string): void;
  }
>("ika-data-grid");

if (!grid) throw new Error("ika-data-grid is required");
grid.setAttribute("density", "compact");
grid.columns = [{ id: "name", label: "Name" }];
grid.rows = [{ id: "42", cells: { name: "ika" } }];
grid.addEventListener("ika-selection-change", (event) => {
  const selection = (event as CustomEvent).detail;
  console.log(selection);
});
grid.scrollToRow("42");
```

`CustomEvent.detail` contains no functions, DOM nodes, promises, dates, maps, sets, or class instances. Failures use the data-only detail of `ika-error`. Networking, authentication, storage, and routing remain host responsibilities.

## JavaScript / TypeScript

In a plain Web host, put the element in HTML and assign structured properties after registration. TypeScript users can add the exported element interface to their DOM query. The host owns application state; ikasue owns behavior, state transitions, and rendering inside the element.

```html
<ika-tabs orientation="horizontal"></ika-tabs>
```

```ts
import { defineIkaSue } from "@ugoite/ikasue/elements";
defineIkaSue();

const tabs = document.querySelector("ika-tabs");
if (tabs) {
  tabs.items = [
    { id: "overview", label: "Overview" },
    { id: "detail", label: "Detail" },
  ];
  tabs.activeId = "overview";
}
```

## React

React is a host. Do not reimplement the component in React; put the Custom Element in the JSX tree and assign structured values as element properties. Use a `ref` and `addEventListener` when an explicit event binding is needed.

```tsx
import { useEffect, useRef } from "react";
import { defineIkaSue } from "@ugoite/ikasue/elements";

defineIkaSue();

export function Results({ rows }: { rows: readonly unknown[] }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const grid = ref.current;
    if (!grid) return;
    (grid as HTMLElement & { rows: readonly unknown[] }).rows = rows;
    const onSelection = (event: Event) =>
      console.log((event as CustomEvent).detail);
    grid.addEventListener("ika-selection-change", onSelection);
    return () => grid.removeEventListener("ika-selection-change", onSelection);
  }, [rows]);
  return <ika-data-grid ref={ref} density="compact" />;
}
```

A React adapter, if one is useful, only supplies property assignment, event binding, and types. It does not duplicate DataGrid or Tabs DOM behavior.

## Vue

Configure Custom Elements as host elements in the Vue compiler. Keep primitives as attributes and assign objects/arrays as element properties. Register native listeners in the component lifecycle instead of inventing a renderer-specific event model.

```vue
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { defineIkaSue } from "@ugoite/ikasue/elements";

defineIkaSue();

const grid = ref<HTMLElement | null>(null);
onMounted(() => {
  if (grid.value) {
    (grid.value as HTMLElement & { rows: readonly unknown[] }).rows = [];
  }
});
</script>

<template><ika-data-grid ref="grid" density="compact" /></template>
```

## Svelte

Use `bind:this` to receive the element and assign properties after mount. Svelte state remains host state; event details are data-only messages.

```svelte
<script lang="ts">
  import { onMount } from "svelte";
  import { defineIkaSue } from "@ugoite/ikasue/elements";

  defineIkaSue();

  let grid: HTMLElement;
  onMount(() => {
    (grid as HTMLElement & { columns: readonly unknown[] }).columns = [];
  });
</script>

<ika-data-grid bind:this={grid} density="compact" />
```

## Angular

Enable Custom Elements in Angular and obtain the native element through `ElementRef`. Assign objects/arrays as properties in the component lifecycle rather than relying on a template binding to serialize them into strings.

```ts
import { AfterViewInit, ElementRef, ViewChild } from "@angular/core";
import { defineIkaSue } from "@ugoite/ikasue/elements";

defineIkaSue();

export class ResultsComponent implements AfterViewInit {
  @ViewChild("grid") grid!: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    const element = this.grid.nativeElement as HTMLElement & {
      rows: readonly unknown[];
    };
    element.rows = [];
  }
}
```

```html
<ika-data-grid #grid density="compact"></ika-data-grid>
```

## Rust / WASM

Rust/WASM does not create another DOM renderer. Use `wasm-bindgen` / `web-sys` to query the same Custom Element, set primitive attributes, pass JSON-serialized properties, and consume data-only events. Rust structs should serialize to the same shapes as `contract/*.schema.json` with `serde`.

```rust
use wasm_bindgen::JsCast;
use web_sys::HtmlElement;

let grid: HtmlElement = document()
    .query_selector("ika-data-grid")?
    .ok_or("ika-data-grid is required")?
    .dyn_into()?;
grid.set_attribute("density", "compact")?;
grid.focus()?;
```

The Rust API is a binding, not a second runtime. When WASM runs in a Worker, use the MessagePort protocol below.

## Worker / MessagePort

Use `grid.rows = rows` for small data. Use `grid.connect(port)` when query, filtering, or sorting belongs in another thread. The main-thread `<ika-data-grid>` owns DOM and accessibility; the Worker handles only data-only requests, responses, events, and cancellation.

```ts
const channel = new MessageChannel();
grid.connect(channel.port1);
worker.postMessage({ type: "connect" }, [channel.port2]);
```

The protocol has one shared meaning:

- `request(id, operation, payload)` carries `version: "ikasue-web/1"` and asks for `rows` or `update`.
- `response(id, result)` or `error(id, error)` completes it.
- `cancel(id)` corresponds to the host `AbortSignal`.
- `event(event, payload)` reports a data-only model event.

The direct model object and the MessagePort model share these semantics. ikasue does not know whether the model uses SQL, REST, IndexedDB, Rust, or a Worker. The model/Worker owns async data and cancellation; the element presents the result.

## WebView / Tauri-style host

For a WebView host, native code creates JSON and sends it to the Custom Element. In the other direction, the host maps CustomEvent detail to its IPC boundary. IPC channels, permissions, authentication, and retry remain host responsibilities.

```ts
import { renderIkaView } from "@ugoite/ikasue/view";

const view = {
  version: "ikasue-web/1",
  kind: "data-grid",
  props: {
    columns: [{ id: "name", label: "Name" }],
    rows: [{ id: "42", cells: { name: "ika" } }],
  },
} as const;
renderIkaView(document.querySelector("#root")!, view);
```

Serializable view only lowers `IkaView → <ika-…>`. It does not create a host-specific renderer, so every host receives the same behavior, accessibility, and CSS boundary.

## Styling boundary

The public styling API is CSS custom properties, `::part()`, slots, and public attributes/state. Internal class names are not ABI. Composition primitives lean toward light DOM; DataGrid, Tabs, SplitView, and complex editors may use Shadow DOM with public parts.

```css
ika-data-grid {
  --ikasue-grid-cell-padding: 0.25rem;
}

ika-data-grid::part(table) {
  font-variant-numeric: tabular-nums;
}
```

## Choosing a host boundary

1. Define data and state as JSON-safe contract values.
2. Separate primitive attributes from structured properties.
3. Use CustomEvents for user intent and methods for imperative commands.
4. Use a direct model for small data and MessagePort for large or off-thread data.
5. Dispose listeners, models, and ports from the host lifecycle.

The language or framework can change while the final boundary stays the same, so ikasue behavior and UI semantics remain one implementation.
