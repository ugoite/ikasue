---
title: Integration
---

# Integration

Separate the pure spec/state API from the Web ABI binding in `@ugoite/ikasue/elements`. Put structured data on element properties, primitive declarations on attributes, user intent in data-only CustomEvents, and imperative commands on methods.

```ts
import { defineIkaSue } from "@ugoite/ikasue/elements";
import "@ugoite/ikasue/style.css";

defineIkaSue();
const grid = document.querySelector("ika-data-grid");
if (grid) {
  grid.columns = [{ id: "name", label: "Name" }];
  grid.rows = [{ id: "42", cells: { name: "ika" } }];
}
```

The host owns application state; ikasue elements own behavior, state transitions, and rendering. See [Host environments](../hosts/) for plain Web, frameworks, Rust/WASM, workers, and WebViews.
