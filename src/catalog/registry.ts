import { COMPONENT_IDS as ROUTE_COMPONENT_IDS } from "./routes";
import type {
  CatalogComponentId,
  CatalogEntry,
  CatalogGroup,
  CatalogPageId,
} from "./types";

const groups: Record<CatalogGroup, readonly CatalogComponentId[]> = {
  layout: ["flex", "stack", "grid", "scroll-area", "separator"],
  navigation: [
    "tabs",
    "sidebar",
    "toolbar",
    "icon-button",
    "segmented-control",
  ],
  workspace: ["split-view", "side-panel", "bottom-panel", "loading-region"],
  input: [
    "text",
    "editable-text",
    "text-field",
    "checkbox",
    "radio-group",
    "field",
    "form",
  ],
  data: ["data-grid", "history-timeline"],
  feedback: ["status-indicator", "alert", "progress", "dialog"],
  principles: ["theme-root"],
};

const names: Record<CatalogComponentId, { ja: string; en: string }> = {
  "theme-root": { ja: "ThemeRoot", en: "ThemeRoot" },
  text: { ja: "Text", en: "Text" },
  "editable-text": { ja: "EditableText", en: "EditableText" },
  flex: { ja: "Flex", en: "Flex" },
  stack: { ja: "Stack", en: "Stack" },
  grid: { ja: "Grid", en: "Grid" },
  "scroll-area": { ja: "ScrollArea", en: "ScrollArea" },
  separator: { ja: "Separator", en: "Separator" },
  tabs: { ja: "Tabs", en: "Tabs" },
  sidebar: { ja: "Sidebar", en: "Sidebar" },
  toolbar: { ja: "Toolbar", en: "Toolbar" },
  "icon-button": { ja: "IconButton", en: "IconButton" },
  "text-field": { ja: "TextField", en: "TextField" },
  checkbox: { ja: "Checkbox", en: "Checkbox" },
  "radio-group": { ja: "RadioGroup", en: "RadioGroup" },
  "segmented-control": { ja: "SegmentedControl", en: "SegmentedControl" },
  field: { ja: "Field", en: "Field" },
  form: { ja: "Form", en: "Form" },
  "data-grid": { ja: "DataGrid", en: "DataGrid" },
  "status-indicator": { ja: "StatusIndicator", en: "StatusIndicator" },
  alert: { ja: "Alert", en: "Alert" },
  progress: { ja: "Progress", en: "Progress" },
  dialog: { ja: "Dialog", en: "Dialog" },
  "split-view": { ja: "SplitView", en: "SplitView" },
  "side-panel": { ja: "SidePanel", en: "SidePanel" },
  "bottom-panel": { ja: "BottomPanel", en: "BottomPanel" },
  "loading-region": { ja: "LoadingRegion", en: "LoadingRegion" },
  "history-timeline": { ja: "HistoryTimeline", en: "HistoryTimeline" },
};
const groupFor = (id: CatalogComponentId) =>
  (Object.entries(groups).find(([, ids]) => ids.includes(id))?.[0] ??
    "principles") as CatalogGroup;
const component = (id: CatalogComponentId): CatalogEntry => ({
  kind: "component",
  id,
  group: groupFor(id),
  title: names[id],
  summary: {
    ja: `${names[id].ja} の標準的な契約`,
    en: `The standard contract for ${names[id].en}.`,
  },
  source: {
    typescript: `import { ${camel(id)} } from "@ugoite/ikasue";`,
    rust: `use ikasue::${id.replaceAll("-", "_")};`,
  },
  properties: componentProperties[id],
});
const camel = (id: string) =>
  id.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());

type ComponentProperty = {
  readonly name: string;
  readonly type: string;
  readonly default?: string | boolean;
};
const property = (
  name: string,
  type: string,
  defaultValue?: string | boolean,
): ComponentProperty =>
  defaultValue === undefined
    ? { name, type }
    : { name, type, default: defaultValue };
const componentProperties: Record<
  CatalogComponentId,
  readonly ComponentProperty[]
> = {
  "theme-root": [
    property("tokens", "Record<string, string>", "{}"),
    property("variant", "default | quiet | dense", "default"),
  ],
  text: [
    property("content", "string", ""),
    property("tone", "default | muted | danger | success", "default"),
    property("selectable", "boolean", true),
  ],
  "editable-text": [
    property("value", "string", ""),
    property("disabled", "boolean", false),
  ],
  flex: [
    property("direction", "row | column", "row"),
    property("wrap", "nowrap | wrap | wrap-reverse", "nowrap"),
    property("gap", "string", "0"),
    property("align", "FlexAlign", "stretch"),
    property("justify", "FlexJustify", "start"),
  ],
  stack: [
    property("gap", "string", "0"),
    property("align", "FlexAlign", "stretch"),
    property("justify", "FlexJustify", "start"),
  ],
  grid: [
    property("columns", "string", "none"),
    property("rows", "string", "none"),
    property("gap", "string", "0"),
    property("align", "FlexAlign", "stretch"),
    property("justify", "FlexJustify", "start"),
  ],
  "scroll-area": [
    property("axis", "x | y | both", "y"),
    property("overscroll", "auto | contain", "auto"),
  ],
  separator: [property("orientation", "horizontal | vertical", "horizontal")],
  tabs: [
    property("items", "Item[]", "[]"),
    property("variant", "default | elastic", "default"),
    property("orientation", "horizontal | vertical", "horizontal"),
  ],
  sidebar: [
    property("items", "Item[]", "[]"),
    property("collapsed", "boolean", false),
  ],
  toolbar: [
    property("items", "ToolbarItem[]", "[]"),
    property("overflow", "none | menu", "none"),
  ],
  "icon-button": [
    property("label", "string", ""),
    property("type", "button | submit | reset", "button"),
    property("disabled", "boolean", false),
    property("pressed", "boolean", false),
  ],
  "text-field": [
    property("id", "string", ""),
    property("label", "string", ""),
    property("value", "string", ""),
    property("placeholder", "string", ""),
    property("disabled", "boolean", false),
    property("required", "boolean", false),
  ],
  checkbox: [
    property("id", "string", ""),
    property("label", "string", ""),
    property("checked", "boolean", false),
    property("disabled", "boolean", false),
  ],
  "radio-group": [
    property("options", "ChoiceOption[]", "[]"),
    property("disabled", "boolean", false),
  ],
  "segmented-control": [
    property("options", "ChoiceOption[]", "[]"),
    property("disabled", "boolean", false),
    property("variant", "default | elastic", "default"),
  ],
  field: [
    property("id", "string", ""),
    property("label", "string", ""),
    property("required", "boolean", false),
    property("content", "string", ""),
  ],
  form: [
    property("fields", "FormField[]", "[]"),
    property("values", "Record<string, string>", "{}"),
    property("status", "FormStateStatus", "idle"),
  ],
  "data-grid": [
    property("columns", "GridColumn[]", "[]"),
    property("rows", "GridRow[]", "[]"),
    property("cells", "DataGridCell[]", "[]"),
    property("columnsProvided", "boolean", false),
    property("rowsProvided", "boolean", false),
  ],
  "status-indicator": [
    property("label", "string", ""),
    property(
      "status",
      "neutral | info | success | warning | danger",
      "neutral",
    ),
  ],
  alert: [
    property("message", "string", ""),
    property("severity", "info | success | warning | danger", "info"),
    property("dismissible", "boolean", false),
  ],
  progress: [property("max", "number", "100"), property("label", "string", "")],
  dialog: [
    property("title", "string", ""),
    property("content", "string", ""),
    property("open", "boolean", false),
    property("modal", "boolean", true),
  ],
  "split-view": [
    property("panes", "SplitPane[]", "[]"),
    property("orientation", "horizontal | vertical", "horizontal"),
    property("sizes", "string[]", "[]"),
    property("collapsible", "boolean", false),
    property("motionOrigin", "start | end | top | bottom", "start"),
  ],
  "side-panel": [
    property("title", "string", ""),
    property("content", "string", ""),
    property("side", "start | end", "end"),
    property("open", "boolean", false),
  ],
  "bottom-panel": [
    property("title", "string", ""),
    property("content", "string", ""),
    property("open", "boolean", false),
  ],
  "loading-region": [
    property("content", "string", ""),
    property("busy", "boolean", false),
    property("label", "string", "Loading"),
  ],
  "history-timeline": [
    property("entries", "HistoryEntry[]", "[]"),
    property("orientation", "horizontal | vertical", "vertical"),
  ],
};
const philosophy: CatalogEntry = {
  kind: "concept",
  id: "philosophy",
  group: "principles",
  title: { ja: "Principles", en: "Principles" },
  summary: {
    ja: "平面と作業継続性の原則",
    en: "Principles for planar, continuous work",
  },
  source: { typescript: "", rust: "" },
  properties: [],
};
const siteCopy: Record<string, { ja: string; en: string }> = {
  root: { ja: "Getting Started", en: "Getting Started" },
  components: { ja: "Components", en: "Components" },
  examples: { ja: "Examples", en: "Examples" },
  "guides/behavioral-contracts": {
    ja: "Behavioral Contracts",
    en: "Behavioral Contracts",
  },
  "guides/usage": { ja: "Usage", en: "Usage" },
  "guides/integration": { ja: "Integration", en: "Integration" },
  "guides/accessibility": { ja: "Accessibility", en: "Accessibility" },
  "guides/release": { ja: "Release", en: "Release" },
};
const site = (
  id: Exclude<CatalogPageId, CatalogComponentId | "philosophy">,
): CatalogEntry => ({
  kind: "site",
  id,
  group: "principles",
  title: { ja: siteCopy[id]?.ja ?? id, en: siteCopy[id]?.en ?? id },
  summary:
    id === "root"
      ? { ja: "標準レイアウトから始める", en: "Start with standard layout" }
      : id === "components"
        ? { ja: "公開コンポーネント一覧", en: "Public component inventory" }
        : id === "examples"
          ? { ja: "構成例", en: "Composition examples" }
          : { ja: siteCopy[id]?.ja ?? id, en: siteCopy[id]?.en ?? id },
  source: { typescript: "", rust: "" },
  properties: [],
});
export const COMPONENT_REGISTRY = Object.fromEntries(
  ROUTE_COMPONENT_IDS.map((id) => [id, component(id as CatalogComponentId)]),
) as Readonly<Record<CatalogComponentId, CatalogEntry>>;
export const CONCEPT_REGISTRY = { philosophy } as Readonly<
  Record<"philosophy", CatalogEntry>
>;
export const CATALOG_REGISTRY = Object.fromEntries(
  [
    site("root"),
    philosophy,
    site("guides/behavioral-contracts"),
    site("guides/usage"),
    site("guides/integration"),
    site("guides/accessibility"),
    site("guides/release"),
    site("components"),
    site("examples"),
    ...ROUTE_COMPONENT_IDS.map(
      (id) => COMPONENT_REGISTRY[id as CatalogComponentId],
    ),
  ].map((entry) => [entry.id, entry]),
) as Readonly<Record<CatalogPageId, CatalogEntry>>;
export const CATALOG_COMPONENTS = ROUTE_COMPONENT_IDS.map(
  (id) => COMPONENT_REGISTRY[id as CatalogComponentId],
);
export const CATALOG_CONCEPTS = [philosophy] as const;
export const CATALOG_PAGES = [
  "root",
  "philosophy",
  "guides/behavioral-contracts",
  "guides/usage",
  "guides/integration",
  "guides/accessibility",
  "guides/release",
  "components",
  "examples",
  ...ROUTE_COMPONENT_IDS,
] as readonly CatalogPageId[];
export const CATALOG_GROUPS = Object.keys(groups) as readonly CatalogGroup[];
export const COMPONENT_IDS =
  ROUTE_COMPONENT_IDS as readonly CatalogComponentId[];
export const CONCEPT_IDS = ["philosophy"] as const;
export const PAGE_IDS = CATALOG_PAGES;
export const COMPONENT_SOURCE_RECIPES = Object.fromEntries(
  COMPONENT_IDS.map((id) => [id, COMPONENT_REGISTRY[id].source]),
);
export const COMPONENT_PAGE_COPY = Object.fromEntries(
  COMPONENT_IDS.map((id) => [
    id,
    {
      ja: {
        title: names[id].ja,
        description: COMPONENT_REGISTRY[id].summary.ja,
      },
      en: {
        title: names[id].en,
        description: COMPONENT_REGISTRY[id].summary.en,
      },
    },
  ]),
);
export const COMPONENT_MATRIX_PAGE_COPY = {
  ja: { title: "Components", description: "標準の公開API" },
  en: { title: "Components", description: "The standard public API" },
};
export const PHILOSOPHY_PAGE_COPY = {
  ja: { title: "Principles", description: philosophy.summary.ja },
  en: { title: "Principles", description: philosophy.summary.en },
};
export const CATALOG_PAGE_COPY = Object.fromEntries(
  CATALOG_PAGES.map((id) => [
    id,
    id === "philosophy"
      ? PHILOSOPHY_PAGE_COPY
      : id in COMPONENT_PAGE_COPY
        ? COMPONENT_PAGE_COPY[id as CatalogComponentId]
        : {
            ja: {
              title: CATALOG_REGISTRY[id].title.ja,
              description: CATALOG_REGISTRY[id].summary.ja,
            },
            en: {
              title: CATALOG_REGISTRY[id].title.en,
              description: CATALOG_REGISTRY[id].summary.en,
            },
          },
  ]),
);
export const RUNTIME_COMPONENT_REGISTRY = COMPONENT_REGISTRY;
const componentDefaults: Record<
  CatalogComponentId,
  Readonly<Record<string, string | boolean>>
> = {
  "theme-root": { tokens: "{}", variant: "default" },
  text: { content: "", tone: "default", selectable: true },
  "editable-text": { value: "", disabled: false },
  flex: {
    direction: "row",
    wrap: "nowrap",
    gap: "0",
    align: "stretch",
    justify: "start",
  },
  stack: {
    direction: "column",
    wrap: "nowrap",
    gap: "0",
    align: "stretch",
    justify: "start",
  },
  grid: {
    columns: "none",
    rows: "none",
    gap: "0",
    align: "stretch",
    justify: "start",
  },
  "scroll-area": { axis: "y", overscroll: "auto" },
  separator: { orientation: "horizontal" },
  tabs: { items: "[]", variant: "default", orientation: "horizontal" },
  sidebar: { items: "[]", collapsed: false },
  toolbar: { items: "[]", overflow: "none" },
  "icon-button": { label: "", type: "button", disabled: false, pressed: false },
  "text-field": {
    id: "",
    label: "",
    value: "",
    placeholder: "",
    disabled: false,
    required: false,
  },
  checkbox: { id: "", label: "", checked: false, disabled: false },
  "radio-group": { options: "[]", disabled: false },
  "segmented-control": { options: "[]", disabled: false, variant: "default" },
  field: { id: "", label: "", required: false, content: "" },
  form: { fields: "[]", values: "{}", status: "idle" },
  "data-grid": {
    columns: "[]",
    rows: "[]",
    cells: "[]",
    columnsProvided: false,
    rowsProvided: false,
  },
  "status-indicator": { label: "", status: "neutral" },
  alert: { message: "", severity: "info", dismissible: false },
  progress: { max: "100", label: "" },
  dialog: { title: "", content: "", open: false, modal: true },
  "split-view": {
    panes: "[]",
    orientation: "horizontal",
    sizes: "[]",
    collapsible: false,
    motionOrigin: "start",
  },
  "side-panel": { title: "", content: "", side: "end", open: false },
  "bottom-panel": { title: "", content: "", open: false },
  "loading-region": { content: "", busy: false, label: "Loading" },
  "history-timeline": { entries: "[]", orientation: "vertical" },
};
export const defaultProps = (
  id: CatalogComponentId,
): Readonly<Record<string, string | boolean>> => componentDefaults[id];
export const componentDocumentationCopy = (
  id: CatalogComponentId,
  locale: "ja" | "en" = "ja",
) => COMPONENT_REGISTRY[id].summary[locale];
export const componentSource = (
  id: CatalogComponentId,
  language: "typescript" | "rust" = "typescript",
) => COMPONENT_REGISTRY[id].source[language];
export function findRegistryEntry(id: CatalogPageId): CatalogEntry | undefined {
  return CATALOG_REGISTRY[id];
}
export const isCatalogComponentId = (
  value: string,
): value is CatalogComponentId =>
  COMPONENT_IDS.includes(value as CatalogComponentId);
export const isCatalogPageId = (value: string): value is CatalogPageId =>
  CATALOG_PAGES.includes(value as CatalogPageId);
