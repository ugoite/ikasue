---
title: Accessibility
description: Semantic, keyboard, motion, and resilience requirements for ikasue.
---

Accessibility is a behavioral requirement, not a theme option. The planar language should make information relationships clearer without asking assistive technology users to infer them from paint or motion.

## Semantic structure

- Use real headings, buttons, links, form controls, tables, and landmarks.
- Label regions and groups according to their task, not their CSS class.
- Use `aria-current`, selected, checked, expanded, busy, and live attributes only when their native equivalent is not available or is insufficient.
- Keep the accessible name stable while an icon action changes from enabled to busy.

## Keyboard geometry

Tab follows the reading order. Arrow keys follow the visual axis for tabs, choices, tables, and focus regions. Home and End reach axis extremes when the component exposes them. A separator, rail toggle, icon action, and dialog action are real buttons with real focus styles.

Editing follows a consistent commit/cancel model: Enter or F2 starts where documented, Escape cancels, Enter commits, and Tab commits before moving onward. Focus returns to the opener when a temporary edge or bottom region closes.

## Non-color and reduced-motion cues

Black communicates structure. Status colors communicate status, never decoration alone. Pair every color cue with a check, icon shape, text, selected area, line, or busy attribute.

When `prefers-reduced-motion: reduce` is active, transition and animation durations become zero. The region still changes allocation and exposes the same text, focus, and semantic state.

## Narrow layouts and clipboard

The catalog remains operable at narrow mobile widths and under text zoom. Horizontal data surfaces may scroll, but keyboard focus must not disappear. If clipboard permissions fail, keep selection and inline editing available and explain the failure in a short status message rather than throwing.

See the [component matrix](../components/) and each page's “Behavior & accessibility” section for the component-specific contract.
