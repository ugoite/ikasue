---
title: ikasue
description: Planar adaptive UI components for information-dense workspaces.
template: splash
hero:
  tagline: One plane. Negotiated space. Readable work.
  actions:
    - text: Explore the component matrix
      link: components/
      icon: right-arrow
    - text: Read the philosophy
      link: philosophy/
      variant: minimal
---

ikasue is a framework-neutral runtime package and interactive catalog for planar adaptive UI. Every region belongs to one shared canvas: new information enters from the edge where it belongs, pushes existing content, and keeps the context being judged visible.

## Planar adaptive UI

The visual rule is small but consequential: no floating card taxonomy, overlay drawer, shadow hierarchy, or modal that hides the evidence for a decision. Space is negotiated by focus, content, viewport, and direction.

The docs use the same source metadata as the catalog. Each component page includes a practical entry point, a JSON contract, properties, keyboard behavior, accessibility notes, and a link to the matching catalog demo.

## Start with the contract

1. Read the [design philosophy](philosophy/) to understand the geometry.
2. Choose a primitive from the [component matrix](components/).
3. Read [Usage](guides/usage/) and [Integration](guides/integration/) before mounting it.
4. Validate the [behavioral contracts](guides/behavioral-contracts/) and [accessibility contract](guides/accessibility/) in your own workspace.

## Package and catalog

The package is `@ugoite/ikasue`. It exposes the framework-neutral `mountCatalog` API, metadata, state helpers, and custom event contracts. The [integrated interactive catalog](catalog/) is the executable reference and is served under the same site base path as these docs. The standalone Vite catalog remains available from the root `npm run catalog` command.

This English locale is a standalone, manually authored translation of the root documentation tree. It is kept in sync by the repository docs check; no external machine-translation service is used.
