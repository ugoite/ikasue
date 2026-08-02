---
title: Design philosophy
description: The plane-centered principles behind ikasue.
---

ikasue starts with one question: where should new information enter the same plane? A right-side detail enters from the right; a decision region enters from the bottom. Existing information is reallocated rather than hidden. An edge is both a motion origin and a statement of ownership.

This is not an anti-decoration rule. It preserves the relationship between an action and the evidence that makes that action understandable.

import Principles from "../../../components/Principles.astro";

<Principles />

## How to read the system

### The plane is a shared work surface

Instead of stacking components on a Z-axis, adjust order and area inside one plane. Developers declare axis, fit, gap, and children in a `PlaneSpec`; `resolvePlane` returns each child’s offset, size, line, and overflow.

### One axis at a time

`vertical` and `horizontal` are small primitives for declaring child order. Preserve that order while content fits, then adapt only through the declared `elastic`, `wrap`, or `scroll` policy. A layout owner does not silently take ownership of child content or focus.

### Information first, editing second

`Text` is readable by default. Add the editable capability only where an editor is needed, and distinguish confirmed values from draft state. In `FormList`, FormList owns values and status; child focus and draft do not recolor source data.

### Selection owns area

Selection is a quiet surface with a little more area, not only an underline or heavy border. Status colors have semantic work; black remains structural.

### Do not create a card taxonomy

Do not add boxes to create categories. Use space, order, `Rule`, and semantic headings. New information enters the shared plane from its owning edge without covering existing evidence.

## A useful design test

- Can the user keep reading the evidence behind the decision?
- Does new information enter from the edge where it belongs and make room on the plane?
- Is the same relationship understandable with keyboard navigation, text zoom, narrow width, and reduced motion?
