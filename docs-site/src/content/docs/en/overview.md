---
title: ikasue
description: Plane-centered adaptive UI components for information-dense workspaces.
template: splash
hero:
  tagline: One plane. Negotiated space. Readable work.
  actions:
    - text: Explore the component inventory
      link: ../components/
      icon: right-arrow
    - text: Read the philosophy
      link: ../philosophy/
      variant: minimal
---

ikasue is a framework- and language-neutral UI substrate for the Web. Its public ABI consists of Custom Elements, JSON-safe properties, data-only CustomEvents, command methods, and CSS custom properties. Every region is treated as ordered space on one shared plane: new information enters from the edge where it belongs and gives existing information room without hiding it.

## Plane-centered adaptive UI

The visual rule is small but consequential. Do not add a floating card taxonomy, overlay drawer, shadow hierarchy, or modal that hides the evidence for a decision. Developers declare order and fit with `vertical` or `horizontal`; `resolvePlane` determines positions for the available extent.

## Start with the contract

1. Read the [design philosophy](../philosophy/) for plane, axis, and selection principles.
2. Choose a responsibility from the current 17-component [inventory](../components/).
3. Read [Host environments](../guides/hosts/) for the same usage from plain Web, frameworks, Rust/WASM, Workers, and WebViews.
4. Use [Usage](../guides/usage/) and [Integration](../guides/integration/) to bring the package into an existing app.
5. Check [Behavioral contracts](../guides/behavioral-contracts/) and [Accessibility](../guides/accessibility/) before implementation.
6. See a few elements composed on one plane in [Examples](../examples/).

## Package, component pages, and deployment boundaries

The package is `@ugoite/ikasue`. `@ugoite/ikasue/elements` is the TypeScript binding for the Web ABI, `@ugoite/ikasue/contract` is the data-only contract, and `@ugoite/ikasue/view` lowers to the same Custom Elements. The package also exposes `vertical`, `horizontal`, `resolvePlane`, and component metadata. On GitHub Pages, each component page combines its explanation, contract, sources, properties, and an interactive demo that directly uses the public element; the package is published to GitHub Packages by a separate workflow.

The root locale is Japanese. The [Japanese docs](../../) and this English tree are manually authored with matching paths. The sync script checks path parity and rejects root-absolute internal links. Content is never sent to an external translation service.
