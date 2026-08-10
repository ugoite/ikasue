# ikasue implementation specification

## Product intent

ikasue is a portable UI runtime whose native ABI is the Web Platform. It keeps information readable during work, gives selected work area, matches motion to the direction of appearance, and prefers in-flow regions over floating surfaces.

## Web ABI

The stable v1 boundary is `ikasue-web/1`. The canonical nodes are Custom Elements such as `<ika-data-grid>`, `<ika-tabs>`, and `<ika-split-view>`. A host may be plain JavaScript/TypeScript, React, Vue, Svelte, Angular, Rust/WASM, a Worker-backed model, or a WebView/native binding.

The ABI has four distinct surfaces:

- attributes for primitive declarative configuration;
- properties for structured state, data, and models;
- data-only CustomEvent details for user intent and state changes;
- methods for imperative UI commands.

The contract is JSON-safe and versioned. It contains no functions, DOM values, promises, dates, maps, sets, or class instances. The JSON Schemas under `contract/` are the language-neutral source; TypeScript and Rust/WASM are bindings over it. `defineIkaSue(registry)` is idempotent for a registry and supports scoped registries for isolated hosts.

Small data can be assigned directly with `element.rows = rows`. Large or remote data uses `element.model = model` or `element.connect(messagePort)`. Direct models and the MessagePort adapter share request, response, error, event, and cancellation semantics. `renderIkaView` only lowers a serializable view to the same Custom Elements; it is not a second renderer.

## Public layers

Layout primitives are Flex, Stack, Grid, ScrollArea, and Separator. Interactive components are Tabs, Sidebar, Toolbar, IconButton, Text, TextField, EditableText, Checkbox, RadioGroup, SegmentedControl, Field, Form, DataGrid, StatusIndicator, Alert, Progress, Dialog, and HistoryTimeline. Workspace patterns are SplitView, SidePanel, BottomPanel, and LoadingRegion. ThemeRoot owns the visual tokens.

CSS resolves grow, shrink, basis, wrap, gap, alignment, overflow, and responsive container behavior. The package descriptors never calculate offsets, extents, available units, collapse replacement, or generated navigation. The Web ABI styling surface is CSS custom properties, `::part()`, slots, public attributes, and state; internal class names are not API.

## Behavioral principles

- Flat surfaces and semantic color keep the canvas readable.
- A selected work area can receive more space without adding a card hierarchy.
- Loading preserves the original content and adds busy/progress semantics.
- SidePanel and BottomPanel are in-flow; Dialog is reserved for a truly modal decision.
- Keyboard order follows DOM order and reduced motion removes transition duration.
- Tabs, DataGrid, ScrollArea, and SplitView each own their distinct interaction or overflow behavior.

## Documentation

Japanese and English docs are authored as fixed mirrored source pages. The route inventory is stored in scripts/catalog-routes.json and checked without directory discovery. Component pages import and call ikasue directly instead of using the legacy catalog renderer. The generic host guide explains the same boundary from each language/framework environment. The package is pre-v1, so the current public contract is intentionally direct and may make breaking changes in service of this design.
