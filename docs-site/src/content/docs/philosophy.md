---
title: Design philosophy / 平面適応UIの思想
description: The planar adaptive UI principles behind ikasue.
---

ikasue starts with a spatial question: if a new piece of information appears, where does it belong on the same plane? The answer is directional and negotiated. A right-side detail comes from the right, a navigation surface expands from the left, and a decision region enters from the bottom. Existing information is reallocated rather than hidden.

This is not an anti-decoration rule. It is a decision-making rule. The UI should preserve the relationship between an action and the information that makes the action understandable.

import Principles from '../../components/Principles.astro';

<Principles />

## How to read the system

### Geometry is behavior / geometryが振る舞い

An edge is not just a motion origin. It tells the user where the new information belongs. A focus request is not just a style change. It is a request to give the current task enough area to be understood.

### Information first, editing second / 情報が先、編集が後

`Text` is readable by default. An editable capability adds an editor only when needed. This keeps workspaces calm while retaining a direct path to change metadata, form values, and cells.

### Selection owns area / 選択は面積を持つ

Selected content receives a quiet surface and a little more room. It is not reduced to a thin underline or a heavy border. Status colors remain semantic; black belongs to structure.

### The catalog is a contract

Use the catalog to exercise defaults, change properties, reset state, and copy a JSON-like contract. A demo is not a substitute for product integration: it makes the spatial and keyboard contract visible before you compose it into your own app.

## A useful design test

Ask three questions during review:

- Can the user still read the evidence behind the decision?
- Does new information enter from the edge where it belongs and push space into existence?
- Does the same relationship remain understandable with keyboard navigation, text zoom, narrow width, and reduced motion?
