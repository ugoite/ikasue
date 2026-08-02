---
title: Behavioral contracts
description: The cross-component rules that define the ikasue runtime.
---

These are component API contracts, not visual suggestions. A screen that looks similar but breaks plane, state ownership, or keyboard behavior is not an equivalent ikasue implementation.

## Shared rules

- Properties update live and can return to documented defaults.
- Every component page exposes a JSON contract and JavaScript / Rust source.
- Information enters from a semantic edge and reallocates space on the same plane; an overlay is not a requirement.
- Selection, status, and progress pair semantic color with a non-color cue.
- `prefers-reduced-motion: reduce` preserves state, direction, and focus.

## Plane and placement

`vertical` and `horizontal` turn ordered children into a `PlaneSpec`; `resolvePlane` returns offsets, sizes, lines, and overflow for the available extent. `elastic` shrinks toward minimums, `wrap` adds lines, and `scroll` preserves child sizes while reporting overflow.

The layout owner does not own child content or widget state. `Rule` names a boundary, `ProgressRegion` retains target information, and `BottomDialog` adds a row from the bottom edge.

## Information, editing, and form state

`Text` is readable by default. Enter or F2 starts editing, Escape cancels, Enter confirms, and Tab confirms before moving to the next editable value. The confirmed value returns through normal state updates; no custom public event name is required.

`FormList` owns values, validation status, and confirmed results. Child `Text`, select, and textarea focus and drafts are local editing state; blur, Enter, and Tab ending an edit do not send them to FormList. Only an explicit external-send action applies all drafts to FormList at once and then clears the child draft affordance. Sending a draft that returned to its original value leaves a clean source status. Initial server statuses remain visible until send, while the local draft affordance stays neutral instead of using created/modified semantic colors.

## Selection, data, and feedback

`ChoiceGroup` follows a radio-like keyboard contract for one selected value. `DataTable` treats the cell as the unit of selection, row/column context, copy, paste, and inline editing. If clipboard permission is unavailable, preserve selection and explain the limitation.

`StatusIcon` and `MessageRegion` expose labels, icons, and targets instead of relying on color alone. `ProgressRegion` keeps previous content readable while marking only the region being processed.

## Verification

Check the same contracts at desktop width, narrow width, keyboard-only navigation, text zoom, and reduced motion. A temporary region should return focus to its opener on close, and the evidence for a decision should remain readable.
