import type { CatalogComponentId } from "../../../src/catalog/types";

interface SourceRecipe {
  readonly axis: "vertical" | "horizontal";
  readonly children: string;
  readonly planeOptions: string;
  readonly componentProps: string;
  readonly ownership: string;
  readonly rustState: string;
}

const RECIPES: Record<CatalogComponentId, SourceRecipe> = {
  "developer-model": {
    axis: "vertical",
    children:
      '[{ id: "filters", basis: 2, min: 1 }, { id: "results", basis: 5, min: 2 }]',
    planeOptions: '{ fit: "elastic", gap: 1, available: 8 }',
    componentProps: "{}",
    ownership:
      "The nearest plane owner resolves allocation; children own only their local contract.",
    rustState: 'owner: "workspace-plane", child_state: "local component only"',
  },
  "theme-root": {
    axis: "vertical",
    children: '["header", "workspace"]',
    planeOptions: '{ fit: "elastic", gap: 1, available: 8 }',
    componentProps:
      '{ density: "compact", selection: "quiet", motion: "expressive", line: "hairline" }',
    ownership: "ThemeRoot owns document tokens, not focus or component values.",
    rustState: "tokens: ThemeTokens::compact(), owns_focus: false",
  },
  text: {
    axis: "vertical",
    children: '[{ id: "label", basis: 1 }, { id: "value", basis: 2, min: 1 }]',
    planeOptions: '{ fit: "elastic", gap: 1, available: 8 }',
    componentProps:
      '{ editable: true, editor: "text", state: "clean", value: "Tokyo office" }',
    ownership:
      "The parent owns the confirmed value; Text owns only display/edit capability.",
    rustState: 'value_owner: "form", draft_owner: "text-focus"',
  },
  rule: {
    axis: "horizontal",
    children: '["details", "rule", "history"]',
    planeOptions: '{ fit: "elastic", gap: 1, available: 8 }',
    componentProps: '{ axis: "horizontal", weight: "hairline" }',
    ownership:
      "Rule owns no interactive state; it names a structural boundary.",
    rustState: "interactive: false, semantic_role: Separator",
  },
  "status-icon": {
    axis: "horizontal",
    children: '["icon", "label"]',
    planeOptions: '{ fit: "elastic", gap: 1, available: 8 }',
    componentProps: '{ kind: "success", label: "Synced" }',
    ownership:
      "The source region owns status; StatusIcon renders a named view of it.",
    rustState: 'status_owner: "sync-region", label: "Synced"',
  },
  vertical: {
    axis: "vertical",
    children:
      '[{ id: "summary", basis: 2, min: 1 }, { id: "table", basis: 6, min: 3 }]',
    planeOptions: '{ fit: "elastic", gap: 2, available: 10 }',
    componentProps: '{ fit: "elastic", gap: "md", items: "4" }',
    ownership: "Vertical owns order and fit resolution, not child semantics.",
    rustState: "axis: Axis::Vertical, fit: Fit::Elastic",
  },
  horizontal: {
    axis: "horizontal",
    children:
      '[{ id: "save", basis: 1 }, { id: "history", basis: 2 }, { id: "refresh", basis: 1 }]',
    planeOptions: '{ fit: "wrap", gap: 1, available: 5 }',
    componentProps: '{ fit: "wrap", gap: "sm", items: "4" }',
    ownership:
      "Horizontal owns order and fit resolution, not child keyboard behavior.",
    rustState: "axis: Axis::Horizontal, fit: Fit::Wrap",
  },
  "icon-action": {
    axis: "horizontal",
    children: '["save", "add", "delete"]',
    planeOptions: '{ fit: "elastic", gap: 1, available: 8 }',
    componentProps: '{ action: "save", state: "enabled" }',
    ownership:
      "The action owner controls intent; IconAction controls button state and label.",
    rustState: 'action_owner: "document", state: ActionState::Enabled',
  },
  "action-strip": {
    axis: "horizontal",
    children: '["save", "history", "refresh"]',
    planeOptions: '{ fit: "elastic", gap: 1, available: 8 }',
    componentProps: '{ active: "save", density: "compact" }',
    ownership:
      "ActionStrip owns grouping order; each action keeps its own accessible name.",
    rustState: 'active: Some("save"), density: Density::Compact',
  },
  "boolean-text": {
    axis: "vertical",
    children: '["autosave-label", "autosave-control"]',
    planeOptions: '{ fit: "elastic", gap: 1, available: 8 }',
    componentProps: '{ checked: true, label: "Enable automatic save" }',
    ownership:
      "The form owns the boolean value; the label and native control share one target.",
    rustState: 'checked_owner: "settings-form", label: "Enable automatic save"',
  },
  "choice-group": {
    axis: "horizontal",
    children: '["compact", "standard", "review"]',
    planeOptions: '{ fit: "wrap", gap: 1, available: 8 }',
    componentProps: '{ direction: "horizontal", selected: "standard" }',
    ownership:
      "ChoiceGroup owns one selected value and reports it as a normal state update.",
    rustState: "selected: Choice::Standard, direction: Direction::Horizontal",
  },
  "form-list": {
    axis: "vertical",
    children: '["customer", "status", "owner"]',
    planeOptions: '{ fit: "elastic", gap: 1, available: 8 }',
    componentProps: '{ marker: "none", state: "mixed" }',
    ownership:
      "FormList owns values and status. Child focus and draft are local and never recolor the source data.",
    rustState:
      'values_owner: "form-list", status_owner: "form-list", child_draft: Draft::Local',
  },
  "data-table": {
    axis: "horizontal",
    children:
      '[{ id: "order-id", basis: 2 }, { id: "status", basis: 2 }, { id: "owner", basis: 3 }]',
    planeOptions: '{ fit: "scroll", gap: 1, available: 8 }',
    componentProps:
      '{ editable: true, selection: "row-column", changes: true }',
    ownership:
      "DataTable owns cell selection and table state; clipboard failure does not erase selection.",
    rustState: "selected: Cell::new(2, 1), editable: true, changes: true",
  },
  "history-gutter": {
    axis: "vertical",
    children: '["current", "previous", "initial"]',
    planeOptions: '{ fit: "elastic", gap: 1, available: 8 }',
    componentProps: '{ selected: "current", compact: false }',
    ownership:
      "HistoryGutter owns revision selection; document data remains owned by the parent.",
    rustState: "selected: Revision::Current, compact: false",
  },
  "progress-region": {
    axis: "vertical",
    children: '["previous-results", "loading-state"]',
    planeOptions: '{ fit: "elastic", gap: 1, available: 8 }',
    componentProps: '{ loading: true, pattern: "wave" }',
    ownership:
      "The target region owns its data; ProgressRegion adds progress state without clearing it.",
    rustState:
      "loading: true, pattern: ProgressPattern::Wave, retains_previous: true",
  },
  "message-region": {
    axis: "vertical",
    children: '["message", "target-region"]',
    planeOptions: '{ fit: "elastic", gap: 1, available: 8 }',
    componentProps: '{ kind: "warning", target: "secondary" }',
    ownership:
      "MessageRegion owns the route back to a target; the target owns the underlying data.",
    rustState: "kind: MessageKind::Warning, target: RegionId::Secondary",
  },
  "bottom-dialog": {
    axis: "vertical",
    children: '["evidence", "dialog-row"]',
    planeOptions: '{ fit: "elastic", gap: 1, available: 8 }',
    componentProps: '{ intent: "confirm", dismiss: true }',
    ownership:
      "The dialog row owns its temporary decision; the opener owns the underlying evidence.",
    rustState:
      'intent: DialogIntent::Confirm, dismiss: true, returns_focus_to: "opener"',
  },
};

function javascriptSource(
  id: CatalogComponentId,
  recipe: SourceRecipe,
): string {
  const constructor = recipe.axis;
  return `import { horizontal, resolvePlane, vertical } from "@ugoite/ikasue";

const plane = ${constructor}(${recipe.children}, ${recipe.planeOptions});
const resolved = resolvePlane(plane);

const component = {
  id: "${id}",
  props: ${recipe.componentProps},
};

const contract = {
  component,
  plane: { axis: plane.axis, fit: plane.fit, gap: plane.gap },
  ownership: ${JSON.stringify(recipe.ownership)},
};

renderPlane({ contract, resolved });
// resolved.children provides stable index, offset, size, and line values.`;
}

function rustSource(id: CatalogComponentId, recipe: SourceRecipe): string {
  const axis =
    recipe.axis === "vertical" ? "Axis::Vertical" : "Axis::Horizontal";
  const children =
    recipe.axis === "vertical" ? ["filters", "results"] : ["save", "history"];
  return `#[derive(Debug)]
struct PlaneChild<'a> { id: &'a str, basis: f32, min: f32 }

#[derive(Debug)]
struct PlaneSpec<'a> {
    axis: Axis,
    fit: Fit,
    gap: f32,
    children: Vec<PlaneChild<'a>>,
}

let plane = PlaneSpec {
    axis: ${axis},
    fit: Fit::Elastic,
    gap: 1.0,
    children: vec![
        PlaneChild { id: "${children[0]}", basis: 2.0, min: 1.0 },
        PlaneChild { id: "${children[1]}", basis: 4.0, min: 2.0 },
    ],
};
let resolved = resolve_plane(&plane, 8.0);
let component_contract = ComponentContract {
    component: "${id}",
    state: ${JSON.stringify(recipe.rustState)},
};
// Render resolved offsets without overlaying the existing plane.`;
}

export function componentSource(id: CatalogComponentId): {
  readonly javascript: string;
  readonly rust: string;
} {
  const recipe = RECIPES[id];
  return {
    javascript: javascriptSource(id, recipe),
    rust: rustSource(id, recipe),
  };
}
