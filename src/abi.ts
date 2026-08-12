import type { IkaViewKind } from "./contract";

export interface IkaElementPropertyContract {
  readonly name: string;
  readonly type: string;
  readonly defaultValue?: string | boolean;
}

export interface IkaElementContract {
  readonly tag: `ika-${IkaViewKind}`;
  readonly attributes: readonly string[];
  readonly properties: readonly IkaElementPropertyContract[];
  readonly events: readonly string[];
  readonly methods: readonly string[];
}

const property = (
  name: string,
  type: string,
  defaultValue?: string | boolean,
): IkaElementPropertyContract =>
  defaultValue === undefined ? { name, type } : { name, type, defaultValue };

const primitiveAttributeNames = new Set([
  "id",
  "density",
  "editable",
  "disabled",
  "required",
  "label",
  "content",
  "title",
  "main",
  "message",
  "placeholder",
  "orientation",
  "variant",
  "editor",
  "state",
  "compact",
  "selectedId",
  "gap",
  "direction",
  "wrap",
  "align",
  "justify",
  "tone",
  "selectable",
  "axis",
  "overscroll",
  "role",
  "overflow",
  "type",
  "pressed",
  "checked",
  "collapsed",
  "open",
  "modal",
  "collapsible",
  "busy",
  "status",
  "severity",
  "dismissible",
  "side",
  "target",
  "targetId",
  "action",
  "max",
  "value",
]);

const contract = (
  kind: IkaViewKind,
  properties: readonly IkaElementPropertyContract[],
  events: readonly string[] = [],
  methods: readonly string[] = [],
): IkaElementContract => ({
  tag: `ika-${kind}`,
  attributes: properties
    .filter(({ name }) => primitiveAttributeNames.has(name))
    .map(({ name }) => name),
  properties,
  events,
  methods,
});

/** The docs and generated host bindings read this data-only Web ABI inventory. */
export const IKA_ELEMENT_CONTRACTS: Readonly<
  Record<IkaViewKind, IkaElementContract>
> = {
  "theme-root": contract("theme-root", [
    property("tokens", "JSON object", "{}"),
    property("variant", "default | quiet | dense", "default"),
  ]),
  text: contract("text", [
    property("content", "string", ""),
    property("tone", "default | muted | danger | success", "default"),
    property("selectable", "boolean", true),
  ]),
  "editable-text": contract(
    "editable-text",
    [
      property("id", "string", ""),
      property("value", "string", ""),
      property(
        "editor",
        "text | email | number | date | textarea | select",
        "text",
      ),
      property(
        "state",
        "clean | created | modified | deleted | error",
        "clean",
      ),
      property("disabled", "boolean", false),
    ],
    ["ika-commit", "ika-cancel"],
  ),
  "text-field": contract(
    "text-field",
    [
      property("id", "string", ""),
      property("label", "string", ""),
      property("value", "string", ""),
      property("placeholder", "string", ""),
      property("disabled", "boolean", false),
      property("required", "boolean", false),
      property("description", "string", ""),
      property("error", "string", ""),
    ],
    ["ika-input"],
  ),
  flex: contract("flex", [
    property("direction", "row | column", "row"),
    property("wrap", "nowrap | wrap | wrap-reverse", "nowrap"),
    property("gap", "CSS length", "0"),
    property("align", "FlexAlign", "stretch"),
    property("justify", "FlexJustify", "start"),
    property("children", "IkaView[]", "[]"),
  ]),
  stack: contract("stack", [
    property("gap", "CSS length", "0"),
    property("align", "FlexAlign", "stretch"),
    property("justify", "FlexJustify", "start"),
    property("children", "IkaView[]", "[]"),
  ]),
  grid: contract("grid", [
    property("columns", "CSS track list", "none"),
    property("rows", "CSS track list", "none"),
    property("gap", "CSS length", "0"),
    property("align", "FlexAlign", "stretch"),
    property("justify", "FlexJustify", "start"),
    property("children", "IkaView[]", "[]"),
  ]),
  "scroll-area": contract("scroll-area", [
    property("content", "string", ""),
    property("axis", "x | y | both", "y"),
    property("overscroll", "auto | contain", "auto"),
  ]),
  separator: contract("separator", [
    property("orientation", "horizontal | vertical", "horizontal"),
    property("weight", "hairline | standard", "hairline"),
    property("role", "separator", "separator"),
  ]),
  tabs: contract(
    "tabs",
    [
      property("items", "TabsItem[]", "[]"),
      property("activeId", "string"),
      property("variant", "default | elastic", "default"),
      property("orientation", "horizontal | vertical", "horizontal"),
    ],
    ["ika-active-change"],
    ["select(id)"],
  ),
  sidebar: contract(
    "sidebar",
    [
      property("main", "string", ""),
      property("items", "Item[]", "[]"),
      property("activeId", "string"),
      property("collapsed", "boolean", false),
    ],
    ["ika-select"],
  ),
  toolbar: contract(
    "toolbar",
    [
      property("items", "Item[]", "[]"),
      property("overflow", "none | menu", "none"),
    ],
    ["ika-select"],
  ),
  "icon-button": contract(
    "icon-button",
    [
      property("id", "string", ""),
      property("label", "string", ""),
      property("icon", "string", ""),
      property("type", "button | submit | reset", "button"),
      property("disabled", "boolean", false),
      property("pressed", "boolean", false),
    ],
    ["ika-action"],
  ),
  checkbox: contract(
    "checkbox",
    [
      property("id", "string", ""),
      property("label", "string", ""),
      property("checked", "boolean", false),
      property("disabled", "boolean", false),
    ],
    ["ika-change"],
  ),
  "radio-group": contract(
    "radio-group",
    [
      property("id", "string", ""),
      property("options", "ChoiceOption[]", "[]"),
      property("value", "string"),
      property("disabled", "boolean", false),
    ],
    ["ika-change"],
  ),
  "segmented-control": contract(
    "segmented-control",
    [
      property("id", "string", ""),
      property("options", "ChoiceOption[]", "[]"),
      property("value", "string"),
      property("disabled", "boolean", false),
      property("variant", "default | elastic", "default"),
    ],
    ["ika-change"],
  ),
  field: contract("field", [
    property("id", "string", ""),
    property("label", "string", ""),
    property("required", "boolean", false),
    property("content", "string", ""),
    property(
      "editor",
      "text | email | number | date | textarea | select",
      "text",
    ),
    property("state", "clean | created | modified | deleted | error", "clean"),
  ]),
  form: contract(
    "form",
    [
      property("fields", "FormField[]", "[]"),
      property("values", "JSON object", "{}"),
      property("drafts", "JSON object", "{}"),
      property("errors", "JSON object", "{}"),
      property("status", "FormStateStatus", "idle"),
    ],
    ["ika-submit", "ika-draft-change"],
  ),
  "data-grid": contract(
    "data-grid",
    [
      property("columns", "DataGridColumn[]", "[]"),
      property("rows", "DataGridRow[]", "[]"),
      property("selection", "DataGridSelection"),
      property("editing", "DataGridSelection"),
      property("selectionMode", "cell | context", "context"),
      property("editable", "boolean", false),
      property("density", "default | compact", "default"),
      property("model", "IkaDataGridModel (binding)"),
    ],
    [
      "ika-selection-change",
      "ika-edit-start",
      "ika-edit-commit",
      "ika-model-event",
      "ika-update",
      "ika-error",
    ],
    [
      "focus()",
      "scrollToRow(row)",
      "loadRows(request)",
      "update(mutation)",
      "connect(port)",
      "disconnect()",
      "startEditing(selection)",
    ],
  ),
  "history-timeline": contract("history-timeline", [
    property("entries", "HistoryEntry[]", "[]"),
    property("orientation", "horizontal | vertical", "vertical"),
    property("selectedId", "string"),
    property("compact", "boolean", false),
  ]),
  "split-view": contract(
    "split-view",
    [
      property("panes", "SplitViewPane[]", "[]"),
      property("orientation", "horizontal | vertical", "horizontal"),
      property("activePane", "string"),
      property("sizes", "CSS track list[]", "[]"),
      property("collapsible", "boolean", false),
      property("motionOrigin", "start | end | top | bottom", "start"),
    ],
    ["ika-collapse-change", "ika-active-pane-change"],
  ),
  "side-panel": contract("side-panel", [
    property("main", "string", ""),
    property("children", "IkaView[]", "[]"),
    property("title", "string", ""),
    property("content", "string", ""),
    property("side", "start | end", "end"),
    property("open", "boolean", false),
  ]),
  "bottom-panel": contract("bottom-panel", [
    property("main", "string", ""),
    property("children", "IkaView[]", "[]"),
    property("title", "string", ""),
    property("content", "string", ""),
    property("open", "boolean", false),
  ]),
  "loading-region": contract("loading-region", [
    property("content", "string", ""),
    property("busy", "boolean", false),
    property("label", "string", "Loading"),
  ]),
  dialog: contract("dialog", [
    property("title", "string", ""),
    property("content", "string", ""),
    property("open", "boolean", false),
    property("modal", "boolean", true),
  ]),
  "status-indicator": contract("status-indicator", [
    property("id", "string", ""),
    property("label", "string", ""),
    property(
      "status",
      "neutral | info | success | warning | danger",
      "neutral",
    ),
    property("icon", "string", ""),
    property("showLabel", "boolean", false),
    property("targetId", "string"),
  ]),
  alert: contract(
    "alert",
    [
      property("message", "string", ""),
      property("severity", "info | success | warning | danger", "info"),
      property("dismissible", "boolean", false),
      property("target", "string"),
      property("action", "string"),
    ],
    ["ika-dismiss", "ika-action"],
  ),
  progress: contract("progress", [
    property("value", "number", "0"),
    property("max", "number", "100"),
    property("label", "string", ""),
  ]),
};
