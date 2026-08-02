# ikasue implementation specification

## Source of truth

`./Downloads/ikasue_component_catalog_v4.html` is the visual and interaction reference. Its Japanese copy, component inventory, planar visual language, and live demos are preserved in the implementation while being separated into maintainable package and catalog modules.

## Product intent

ikasue is a planar adaptive UI component library for information-dense work. Every region shares one canvas. New information enters from the edge where it belongs and reflows existing content; it never relies on a floating card, overlay drawer, shadow hierarchy, or modal that obscures the information being judged.

## Required component inventory

The catalog must document and demonstrate the following 24 components:

- Design philosophy, Developer model
- ThemeRoot, Text, Rule, StatusIcon
- Stack, Cluster, FocusPlane, FocusRegion, AxisFlow, EdgeRegion, BottomDock
- EdgeNav, ElasticTabs
- IconAction, ActionStrip
- BooleanText, ChoiceGroup, FormList
- DataTable, HistoryGutter
- ProgressRegion, MessageRegion, BottomDialog

## Behavioral contracts

- Properties update live and can be reset to their documented defaults.
- Each component page exposes a copyable JSON/Rust-like contract.
- Text is one information component with an optional editable capability; editing supports keyboard commit/cancel and emits a custom commit event.
- FocusPlane and FocusRegion coordinate through a bubbling `ikasue:layout-request` event.
- AxisFlow changes axis, item count, and focus strategy; when content does not fit it exposes end navigation on the same axis.
- EdgeRegion, EdgeNav, BottomDock, and BottomDialog push/reallocate space in their entry direction rather than overlaying content.
- DataTable supports cell selection, row/column peer highlighting, keyboard navigation, copy, paste, and editing when enabled.
- ElasticTabs and ChoiceGroup expose keyboard semantics appropriate to tabs/radio groups.
- Status and progress states use semantic color and a non-color structural cue.

## Accessibility and resilience

- Use semantic headings, buttons, form controls, roles, labels, and live state attributes.
- Every icon-only action has an accessible label and a visible tooltip on hover/focus.
- Keyboard navigation must work for catalog navigation, tabs, choices, focus regions, tables, and editors.
- `prefers-reduced-motion: reduce` disables transition and animation durations.
- The catalog is usable at desktop, narrow mobile, keyboard-only, and text zoom layouts.
- Clipboard features degrade gracefully when browser permissions are unavailable.

## Delivery and operations

- The package is published as `@ugoite/ikasue` to GitHub Packages (npm registry); no other package or hosting service is used.
- The Starlight site is built and deployed to GitHub Pages by GitHub Actions.
- mise is the declared local toolchain and task runner.
- pre-commit runs formatting, linting, YAML/action checks, and project validation before commits.
- Work is implemented in Git worktrees with focused commits so each phase can be reviewed or reverted independently.

## Necessary additions made during implementation

- Component pages are addressable with a `?component=<id>` query parameter so demos can be linked from documentation and bug reports without adding a second navigation model.
- The package exposes a small framework-neutral mount API and ships its CSS so consumers can use the planar primitives without adopting the catalog app.
- The docs include a release/publishing contract and a component matrix so package consumers can distinguish the interactive catalog from the runtime package.
