# ikasue implementation specification

## Product intent

ikasue is a plane-centered adaptive UI component system for information-dense work. Every region shares one canvas. New information enters from the edge where it belongs and reallocates existing space; the system does not depend on floating card taxonomies, overlay drawers, shadow hierarchies, or evidence-obscuring modals.

## Current public component inventory

The public runtime inventory is exactly 17 components. The catalog metadata and bilingual documentation use this same list:

- `developer-model`
- `theme-root`
- `text`
- `rule`
- `status-icon`
- `vertical`
- `horizontal`
- `icon-action`
- `action-strip`
- `boolean-text`
- `choice-group`
- `form-list`
- `data-table`
- `history-gutter`
- `progress-region`
- `message-region`
- `bottom-dialog`

The separate conceptual page is the design philosophy. It is not an additional runtime component.

## Plane API

The package exposes a small framework-neutral plane model:

- `vertical(children, options)` creates an ordered vertical `PlaneSpec`.
- `horizontal(children, options)` creates an ordered horizontal `PlaneSpec`.
- `resolvePlane(input, available?)` normalizes a plane and returns deterministic child positions.
- `PlaneChild` contains an `id`, optional preferred `basis`, and optional elastic `min`.
- `PlaneSpec` contains `axis`, `fit`, `gap`, optional `available` and `focus`, a `navigation` flag, and ordered `children`.
- `fit` is `elastic` or `wrap`. Resolved output reports `offset`, `size`, `line`, child `state` (`focused`, `visible`, or `collapsed`), navigation bounds, `extent`, and `overflow`. When a navigable plane cannot fit its requested extent, both policies keep the focused child readable and collapse the rest; the owning rail provides previous/next and direct region selection instead of plane scrolling.

The developer declares order, axis, and adaptation policy. The plane owner resolves available space. Child components do not need a parent reference or a public layout event to participate.

## State ownership and behavioral contracts

- Properties update live and can be reset to documented defaults.
- `Text` is readable by default and gains editing capability only when needed. Confirmed values return through normal state updates; the public API does not require custom event names.
- `FormList` owns values, validation status, and confirmed results. Child focus and draft are local editing state; blur, Enter, and Tab do not commit them. An explicit external-send action applies all drafts together, then clears the child draft affordance. A draft that returns to its original value remains clean when sent, and local draft styling is neutral rather than a created/modified source-status color.
- `Vertical` and `Horizontal` preserve ordered children while applying their declared fit and focus/navigation policy. A constrained navigable plane keeps the focused child readable and collapses the other children for rail selection.
- Selection, status, and progress use semantic color plus a non-color cue.
- `DataTable` treats the cell as the task unit and keeps selection, peer context, clipboard behavior, and editing explicit.
- Temporary bottom decisions add a row inside the plane and return focus to their opener when closed.
- Native semantics, keyboard behavior, text zoom, narrow layouts, and reduced motion remain available.

## Documentation contract

`docs-site/` is an Astro + Starlight site. The root Japanese locale and the `/en/` English locale are independent, manually authored documents. No machine translation or translation service is used, and no documentation content is transferred to an external service. Every markdown or MDX file under the root docs tree has the same relative path under `src/content/docs/en/`; `npm run docs:sync` checks path parity, requires both locale files in every local or CI change set, and rejects root-absolute internal links. A commit may not update only one side of a Japanese/English pair.

Every public component has a mirrored page, a property table, philosophy/use/avoid guidance, interaction and keyboard behavior, accessibility notes, and JavaScript implementation/usage plus Rust implementation source tabs. Starlight `Tabs` and `TabItem` are used for those source views.

Astro-generated links use `sitePath` or `catalogPath` so local builds and project GitHub Pages builds include the configured base path. Content-authored internal links remain relative.

## Deployment boundaries

- GitHub Pages is the only documentation host. The Pages workflow builds the Astro + Starlight site and interactive catalog with `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages`. The Astro base is derived from `GITHUB_REPOSITORY` for project Pages sites.
- GitHub Packages is the package distribution boundary. The package workflow publishes only `@ugoite/ikasue` to `https://npm.pkg.github.com` on `v*` tags with `GITHUB_TOKEN` and `packages: write`.
- Pages deployment and GitHub Packages publishing are separate workflows and targets. The documentation phase does not change generated build output or package version.
