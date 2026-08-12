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
const elementTagFor = (id: CatalogComponentId): string => `ika-${id}`;
const componentSourceFor = (id: CatalogComponentId) => {
  const tag = elementTagFor(id);
  const dataGrid =
    id === "data-grid"
      ? [
          'element.columns = [{ id: "name", label: "Name" }];',
          'element.rows = [{ id: "42", cells: { name: "ika" } }];',
          'element.addEventListener("ika-selection-change", (event) => console.log(event.detail));',
        ]
      : ["element.props = {};"];
  return {
    typescript: [
      'import { defineIkaSue } from "@ugoite/ikasue/elements";',
      "",
      "defineIkaSue();",
      `const element = document.querySelector("${tag}");`,
      `if (!element) throw new Error("${tag} is required");`,
      ...dataGrid,
      "element.focus();",
    ].join("\n"),
    rust: [
      "use wasm_bindgen::JsCast;",
      "use web_sys::HtmlElement;",
      "",
      "// Rust/WASM operates the same Web ABI; it does not create another renderer.",
      `let element: HtmlElement = document().query_selector("${tag}")?\n    .ok_or("${tag} is required")?\n    .dyn_into()?;`,
      `element.set_attribute("aria-label", "${id}")?;`,
      "element.focus()?;",
    ].join("\n"),
  };
};
const rationales: Record<CatalogComponentId, { ja: string; en: string }> = {
  "theme-root": {
    ja: "白い平面と意味色を共有する視覚基盤。",
    en: "The shared visual baseline: a white surface and semantic color only.",
  },
  text: {
    ja: "読むことを先に置く、装飾のない情報テキスト。",
    en: "Plain information text that keeps reading first.",
  },
  "editable-text": {
    ja: "破線の読み状態から、必要な時だけ一本線の編集へ移る。",
    en: "Moves from a dashed read state to one-line editing only when needed.",
  },
  flex: {
    ja: "標準CSSの順序と軸だけを担当する薄いprimitive。",
    en: "A thin primitive for predictable CSS order and axis.",
  },
  stack: {
    ja: "縦の順序だけを明示する、予測可能なprimitive。",
    en: "A predictable primitive for vertical order.",
  },
  grid: {
    ja: "標準Gridをそのまま使い、独自の面積調停を持ち込まない。",
    en: "Uses standard Grid without inventing a focus resolver.",
  },
  "scroll-area": {
    ja: "用途ごとの有限なviewportとoverflowを所有する。",
    en: "Owns a finite viewport and its intentional overflow.",
  },
  separator: {
    ja: "箱を増やさず、一枚の線で意味の切れ目を示す。",
    en: "Marks a semantic break with one quiet line instead of a box.",
  },
  tabs: {
    ja: "選択された面へ少しだけ面積と地理を譲る。",
    en: "Transfers a little area and directional motion to the selected panel.",
  },
  sidebar: {
    ja: "閉じても現在地を残し、開けばmainを押すedge navigation。",
    en: "An edge rail that keeps context when closed and pushes the main surface open.",
  },
  toolbar: {
    ja: "反復操作を文字列の箱ではなく線アイコンで並べる。",
    en: "Presents repeated work as line icons, not a row of text boxes.",
  },
  "icon-button": {
    ja: "hover/focus時だけ操作面が現れる軽量なaction。",
    en: "A light action surface that appears on hover or focus.",
  },
  "text-field": {
    ja: "検索など常時入力が必要な場所だけに使う下線入力。",
    en: "An underlined field reserved for values that must stay editable.",
  },
  checkbox: {
    ja: "空boxではなく文章そのものをbooleanの主役にする。",
    en: "Makes the sentence, not an empty box, the boolean control.",
  },
  "radio-group": {
    ja: "選択値へ面積を譲る、circleを描かない単一選択。",
    en: "A radio contract where the chosen option owns area instead of a circle.",
  },
  "segmented-control": {
    ja: "選択肢の面積差で現在地を知らせるchoice。",
    en: "A choice control whose selected option visibly owns more area.",
  },
  field: {
    ja: "labelと情報を順序で結び、囲い箱を作らない一行。",
    en: "A single information row joined by order, not a fieldset box.",
  },
  form: {
    ja: "読める情報の順序とdraft/validationを所有する。",
    en: "Owns readable information order plus draft and validation state.",
  },
  "data-grid": {
    ja: "cell選択とrow/column文脈を同時に見せる作業面。",
    en: "A work surface that keeps cell selection and row/column context visible.",
  },
  "status-indicator": {
    ja: "意味色のline iconを主役にし、labelは説明へ退避する。",
    en: "Makes a semantic line icon primary and keeps text as explanation.",
  },
  alert: {
    ja: "対象regionへ注意を返す、リンクしたメッセージ行。",
    en: "A linked message row that returns attention to its target region.",
  },
  progress: {
    ja: "意味色を足さず、細い構造線だけで進捗を示す。",
    en: "Shows determinate progress with a thin structural line.",
  },
  dialog: {
    ja: "判断根拠を隠さない、下端起点のplanar dialog。",
    en: "A planar dialog that keeps decision context visible from the bottom edge.",
  },
  "split-view": {
    ja: "focusされたpaneへ面積を譲り、divider上で操作する。",
    en: "Negotiates area toward focus and keeps controls on the divider.",
  },
  "side-panel": {
    ja: "同じ平面のtrackを増やし、mainを押して情報を出す。",
    en: "Adds a sibling track to push the main surface aside.",
  },
  "bottom-panel": {
    ja: "下端のrowを展開し、上の情報を残したまま補助面を出す。",
    en: "Expands a bottom row while keeping the work above readable.",
  },
  "loading-region": {
    ja: "内容を消さず、対象regionだけをneutral waveで示す。",
    en: "Keeps content readable and marks only the busy region with a neutral wave.",
  },
  "history-timeline": {
    ja: "番号付きlistではなくgutterの線と点でrevisionを読む。",
    en: "Reads revisions through a gutter line and dots, not a numbered list.",
  },
};
const component = (id: CatalogComponentId): CatalogEntry => ({
  kind: "component",
  id,
  group: groupFor(id),
  title: names[id],
  summary: {
    ja: rationales[id].ja,
    en: rationales[id].en,
  },
  source: componentSourceFor(id),
  properties: componentProperties[id],
});

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
    property("id", "string", ""),
    property("value", "string", ""),
    property(
      "editor",
      "text | email | number | date | textarea | select",
      "text",
    ),
    property("state", "clean | created | modified | deleted | error", "clean"),
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
    property("activeId", "string", ""),
    property("variant", "default | elastic", "default"),
    property("orientation", "horizontal | vertical", "horizontal"),
  ],
  sidebar: [
    property("main", "string", ""),
    property("items", "Item[]", "[]"),
    property("activeId", "string", ""),
    property("collapsed", "boolean", false),
  ],
  toolbar: [
    property("items", "ToolbarItem[]", "[]"),
    property("overflow", "none | menu", "none"),
  ],
  "icon-button": [
    property("id", "string", ""),
    property("label", "string", ""),
    property("icon", "string", ""),
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
    property("id", "string", ""),
    property("options", "ChoiceOption[]", "[]"),
    property("value", "string", ""),
    property("disabled", "boolean", false),
  ],
  "segmented-control": [
    property("id", "string", ""),
    property("options", "ChoiceOption[]", "[]"),
    property("value", "string", ""),
    property("disabled", "boolean", false),
    property("variant", "default | elastic", "default"),
  ],
  field: [
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
  ],
  form: [
    property("fields", "FormField[]", "[]"),
    property("values", "Record<string, string>", "{}"),
    property("status", "FormStateStatus", "idle"),
  ],
  "data-grid": [
    property("columns", "DataGridColumn[]", "[]"),
    property("rows", "DataGridRow[]", "[]"),
    property("selection", "DataGridSelection"),
    property("editing", "DataGridSelection"),
    property("editable", "boolean", false),
    property("density", "default | compact", "default"),
  ],
  "status-indicator": [
    property("id", "string", ""),
    property("label", "string", ""),
    property(
      "status",
      "neutral | info | success | warning | danger",
      "neutral",
    ),
    property("icon", "string", "i"),
    property("targetId", "string"),
  ],
  alert: [
    property("message", "string", ""),
    property("severity", "info | success | warning | danger", "info"),
    property("dismissible", "boolean", false),
    property("target", "string"),
    property("action", "string"),
  ],
  progress: [
    property("value", "number", "0"),
    property("max", "number", "100"),
    property("label", "string", ""),
  ],
  dialog: [
    property("title", "string", ""),
    property("content", "string", ""),
    property("open", "boolean", false),
    property("modal", "boolean", true),
  ],
  "split-view": [
    property("panes", "SplitPane[]", "[]"),
    property("orientation", "horizontal | vertical", "horizontal"),
    property("activePane", "string"),
    property("sizes", "string[]", "[]"),
    property("collapsible", "boolean", false),
    property("motionOrigin", "start | end | top | bottom", "start"),
  ],
  "side-panel": [
    property("main", "string", ""),
    property("title", "string", ""),
    property("content", "string", ""),
    property("side", "start | end", "end"),
    property("open", "boolean", false),
  ],
  "bottom-panel": [
    property("main", "string", ""),
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
    property("selectedId", "string"),
    property("compact", "boolean", false),
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
  "guides/hosts": {
    ja: "ホスト環境から使う",
    en: "Host environments",
  },
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
    site("guides/hosts"),
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
  "guides/hosts",
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
  "editable-text": { id: "", value: "", disabled: false },
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
  tabs: {
    items: "[]",
    activeId: "",
    variant: "default",
    orientation: "horizontal",
  },
  sidebar: { main: "", items: "[]", activeId: "", collapsed: false },
  toolbar: { items: "[]", overflow: "none" },
  "icon-button": {
    id: "",
    label: "",
    icon: "",
    type: "button",
    disabled: false,
    pressed: false,
  },
  "text-field": {
    id: "",
    label: "",
    value: "",
    placeholder: "",
    disabled: false,
    required: false,
  },
  checkbox: { id: "", label: "", checked: false, disabled: false },
  "radio-group": { id: "", options: "[]", value: "", disabled: false },
  "segmented-control": {
    id: "",
    options: "[]",
    value: "",
    disabled: false,
    variant: "default",
  },
  field: { id: "", label: "", required: false, content: "" },
  form: { fields: "[]", values: "{}", status: "idle" },
  "data-grid": {
    columns: "[]",
    rows: "[]",
    editable: false,
    density: "default",
  },
  "status-indicator": {
    id: "",
    label: "",
    status: "neutral",
    icon: "i",
    targetId: "",
  },
  alert: { message: "", severity: "info", dismissible: false },
  progress: { value: "0", max: "100", label: "" },
  dialog: { title: "", content: "", open: false, modal: true },
  "split-view": {
    panes: "[]",
    orientation: "horizontal",
    sizes: "[]",
    collapsible: false,
    motionOrigin: "start",
  },
  "side-panel": { main: "", title: "", content: "", side: "end", open: false },
  "bottom-panel": { main: "", title: "", content: "", open: false },
  "loading-region": { content: "", busy: false, label: "Loading" },
  "history-timeline": { entries: "[]", orientation: "vertical" },
};
export const defaultProps = (
  id: CatalogComponentId,
): Readonly<Record<string, string | boolean>> =>
  Object.freeze({ ...componentDefaults[id] });
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
