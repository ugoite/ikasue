---
title: Behavioral contracts / 振る舞い契約
description: The cross-component behaviors that define the ikasue runtime.
---

These contracts are part of the component API. A visual match that breaks them is not an equivalent implementation.

## Shared rules

- Properties update live and can return to documented defaults.
- Every component page exposes a copyable JSON/Rust-like contract.
- Content enters from its semantic edge and reallocates space; it does not require an overlay.
- Selection, status, and progress use semantic color plus a non-color structural cue.
- `prefers-reduced-motion: reduce` disables transition and animation durations without removing state or direction.

## Information and editing

`Text` is a single information component with an optional editable capability. Enter or F2 enters editing, Escape cancels, Enter commits, and Tab commits before moving to the next editable value. A commit emits the custom `ikasue:commit` event with the value in its detail.

## Layout negotiation

`FocusPlane` owns the allocation. `FocusRegion` bubbles `ikasue:layout-request` so a nested component can ask for `primary`, `balanced`, or `secondary` attention. `AxisFlow` changes axis, item count, and focus strategy; if the content cannot fit, end navigation appears on the same axis.

`EdgeRegion`, `EdgeNav`, `BottomDock`, and `BottomDialog` add or remove tracks in their entry direction. Closing removes the track and restores the prior allocation. The content behind them remains the same DOM content, not a background screenshot.

## Data and navigation

`DataTable` treats the cell as the task unit. It supports cell selection, peer row/column highlighting, keyboard navigation, copy, paste, and editing when enabled. `ElasticTabs` follows the tabs keyboard pattern; `ChoiceGroup` follows the radio-group pattern. Their shared visual grammar does not erase their different semantics.

## Resilience checks

Test each contract at desktop width, narrow width, keyboard-only navigation, text zoom, and reduced motion. Clipboard features must leave the table usable when browser permission is denied or unavailable.
