---
title: Accessibility
description: Semantic, keyboard, motion, and resilience requirements for ikasue.
---

Accessibility is part of each component contract, not a theme option. Do not ask users to infer plane relationships from paint or motion; expose them with semantic structure, keyboard behavior, prose, and state attributes.

## Semantic structure

- Use real headings, buttons, links, form controls, tables, and landmarks.
- Label regions and groups by task rather than CSS class.
- Add selected, checked, expanded, busy, and live states only where native semantics are insufficient.
- Keep an icon action’s accessible name stable as it moves from enabled to busy.

## Keyboard and plane geometry

Tab follows reading order. ChoiceGroup uses radio-like arrow behavior, DataTable uses cell-axis navigation, and Text follows the Enter/F2, Escape, Enter, and Tab editing contract. Passive elements such as `Rule` stay out of the Tab order.

When a temporary `BottomDialog` opens, move focus to its first action and return focus to the opener on close. If a plane becomes tight, keep the focused item readable and make collapsed regions reachable through the owning rail’s region selection.

## Non-color and reduced-motion cues

Black is structural; status colors are for status only. Pair color with a check, icon shape, text, selection surface, line, or busy attribute.

With `prefers-reduced-motion: reduce`, transition and animation durations become zero. The plane still reallocates and exposes the same text, focus, and semantic state.

## Narrow layouts and clipboard

Keep the interface usable under text zoom and at narrow mobile widths. A horizontal `DataTable` may scroll, but keyboard focus must remain reachable. If clipboard permission is unavailable, preserve selection and inline editing and explain the limitation with a short status message.

Use each component page’s “Behavior and accessibility” section and the [component inventory](../components/) as the implementation checklist.
