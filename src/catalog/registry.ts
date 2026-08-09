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
  properties: [],
});
const camel = (id: string) =>
  id.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
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
  root: { ja: "標準レイアウトから始める", en: "Start with standard layout" },
  components: {
    ja: "公開コンポーネント一覧",
    en: "Public component inventory",
  },
  examples: { ja: "構成例", en: "Composition examples" },
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
  summary: { ja: siteCopy[id]?.ja ?? id, en: siteCopy[id]?.en ?? id },
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
export const defaultProps = (
  id: CatalogComponentId,
): Readonly<Record<string, string | boolean>> =>
  id === "stack"
    ? { direction: "column" }
    : id === "flex"
      ? { direction: "row", wrap: "nowrap", gap: "0" }
      : {};
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
