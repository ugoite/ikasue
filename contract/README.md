# ikasue contract

The files in this directory are the stable data-only boundary of the
`ikasue-web/2` ABI. They use JSON Schema 2020-12 and intentionally contain no
functions, DOM values, promises, dates, maps, sets, or class instances.

The component contracts are split into `common.schema.json`,
`data-grid.schema.json`, `tabs.schema.json`, and `split-view.schema.json`.
`protocol.schema.json` describes the versioned MessagePort envelope, while
`view.schema.json` describes serializable UI lowering.

TypeScript bindings live in `src/contract.ts`; Rust/WASM hosts can deserialize
the same values with `serde`. The browser binding adds methods and direct
model objects around the contract, but values sent through `CustomEvent`,
`MessagePort`, or a serialized view remain JSON-safe.
