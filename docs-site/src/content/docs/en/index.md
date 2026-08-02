---
title: ikasue
description: Plane-centered adaptive UI components for information-dense workspaces.
template: splash
hero:
  tagline: One plane. Negotiated space. Readable work.
  actions:
    - text: Explore the component inventory
      link: components/
      icon: right-arrow
    - text: Read the philosophy
      link: philosophy/
      variant: minimal
---

ikasue is a framework-neutral component system for information-dense workspaces. Every region is treated as ordered space on one shared plane: new information enters from the edge where it belongs and gives existing information room without hiding it.

## Plane-centered adaptive UI

The visual rule is small but consequential. Do not add a floating card taxonomy, overlay drawer, shadow hierarchy, or modal that hides the evidence for a decision. Developers declare order and fit with `vertical` or `horizontal`; `resolvePlane` determines positions for the available extent.

## Start with the contract

1. Read the [design philosophy](philosophy/) for plane, axis, and selection principles.
2. Choose a responsibility from the current 17-component [inventory](components/).
3. Use [Usage](guides/usage/) and [Integration](guides/integration/) to bring the package into an existing app.
4. Check [Behavioral contracts](guides/behavioral-contracts/) and [Accessibility](guides/accessibility/) before implementation.
5. Compare five radically different site shapes in [Examples](examples/).

## Package, catalog, and deployment boundaries

The package is `@ugoite/ikasue`. It exposes `vertical`, `horizontal`, `resolvePlane`, and current component metadata; the interactive catalog exercises the same contracts. The [catalog](catalog/) is included in the GitHub Pages docs build, while the package is published to GitHub Packages by a separate workflow.

The root locale is Japanese. The [Japanese docs](../) and this English tree are manually authored with matching paths. The sync script checks path parity and rejects root-absolute internal links. Content is never sent to an external translation service.
