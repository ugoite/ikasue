import type { IkaJsonRecord, IkaJsonValue } from "../contract";
import type { CatalogComponentId, CatalogLocalized } from "./types";

export type DemoControlKind = "text" | "boolean" | "number" | "select" | "json";

export interface DemoControl {
  readonly key: string;
  readonly label: CatalogLocalized;
  readonly kind: DemoControlKind;
  readonly options?: readonly string[];
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
}

export interface ComponentDemo {
  readonly props: IkaJsonRecord;
  readonly controls: readonly DemoControl[];
}

const labels = (ja: string, en: string): CatalogLocalized => ({ ja, en });
const text = (key: string, ja: string, en: string): DemoControl => ({
  key,
  label: labels(ja, en),
  kind: "text",
});
const json = (key: string, ja: string, en: string): DemoControl => ({
  key,
  label: labels(ja, en),
  kind: "json",
});
const boolean = (key: string, ja: string, en: string): DemoControl => ({
  key,
  label: labels(ja, en),
  kind: "boolean",
});
const number = (
  key: string,
  ja: string,
  en: string,
  min = 0,
  max = 100,
): DemoControl => ({ key, label: labels(ja, en), kind: "number", min, max });
const select = (
  key: string,
  ja: string,
  en: string,
  options: readonly string[],
): DemoControl => ({ key, label: labels(ja, en), kind: "select", options });

const commonItems = [
  {
    id: "overview",
    label: "Overview",
    content: "A concise overview of the current work.",
  },
  {
    id: "details",
    label: "Details",
    content: "The selected panel owns this focused detail.",
  },
] as const;
const choiceOptions = [
  { id: "one", label: "One" },
  { id: "two", label: "Two" },
] as const;
const gridColumns = [
  { id: "name", label: "Name" },
  { id: "status", label: "Status" },
] as const;
const gridRows = [
  { id: "one", cells: { name: "ikasue", status: "Ready" } },
  { id: "two", cells: { name: "Catalog", status: "Review" } },
] as const;

const demos: Readonly<Record<CatalogComponentId, ComponentDemo>> = {
  "theme-root": {
    props: {
      tokens: {
        "--ikasue-surface": "#f5f7fb",
        "--ikasue-ink": "#172033",
        "--ikasue-line": "#9aa8bd",
      },
      variant: "default",
    },
    controls: [
      json("tokens", "トークン", "Tokens"),
      select("variant", "バリアント", "Variant", ["default", "quiet", "dense"]),
    ],
  },
  text: {
    props: {
      content: "Readable text that stays visible while you work.",
      tone: "default",
      selectable: true,
    },
    controls: [
      text("content", "内容", "Content"),
      select("tone", "トーン", "Tone", [
        "default",
        "muted",
        "danger",
        "success",
      ]),
      boolean("selectable", "選択可能", "Selectable"),
    ],
  },
  "editable-text": {
    props: { id: "title", value: "Editable title", disabled: false },
    controls: [
      text("id", "ID", "ID"),
      text("value", "値", "Value"),
      boolean("disabled", "無効", "Disabled"),
    ],
  },
  flex: {
    props: {
      direction: "row",
      wrap: "wrap",
      gap: "0.75rem",
      align: "stretch",
      justify: "start",
    },
    controls: [
      select("direction", "方向", "Direction", ["row", "column"]),
      select("wrap", "折り返し", "Wrap", ["nowrap", "wrap", "wrap-reverse"]),
      text("gap", "間隔", "Gap"),
      select("align", "交差軸", "Align", [
        "start",
        "center",
        "end",
        "stretch",
        "baseline",
      ]),
      select("justify", "主軸", "Justify", [
        "start",
        "center",
        "end",
        "space-between",
        "space-around",
        "space-evenly",
      ]),
    ],
  },
  stack: {
    props: { gap: "0.75rem", align: "stretch", justify: "start" },
    controls: [
      text("gap", "間隔", "Gap"),
      select("align", "交差軸", "Align", [
        "start",
        "center",
        "end",
        "stretch",
        "baseline",
      ]),
      select("justify", "主軸", "Justify", [
        "start",
        "center",
        "end",
        "space-between",
        "space-around",
        "space-evenly",
      ]),
    ],
  },
  grid: {
    props: {
      columns: "repeat(2, minmax(0, 1fr))",
      rows: "auto",
      gap: "0.75rem",
      align: "stretch",
      justify: "stretch",
    },
    controls: [
      text("columns", "列", "Columns"),
      text("rows", "行", "Rows"),
      text("gap", "間隔", "Gap"),
      select("align", "交差軸", "Align", [
        "start",
        "center",
        "end",
        "stretch",
        "baseline",
      ]),
      select("justify", "主軸", "Justify", [
        "start",
        "center",
        "end",
        "stretch",
      ]),
    ],
  },
  "scroll-area": {
    props: {
      content: "ScrollArea owns this overflow region.",
      axis: "y",
      overscroll: "contain",
    },
    controls: [
      text("content", "内容", "Content"),
      select("axis", "軸", "Axis", ["x", "y", "both"]),
      select("overscroll", "オーバースクロール", "Overscroll", [
        "auto",
        "contain",
      ]),
    ],
  },
  separator: {
    props: { orientation: "horizontal", role: "separator" },
    controls: [
      select("orientation", "方向", "Orientation", ["horizontal", "vertical"]),
    ],
  },
  tabs: {
    props: {
      items: commonItems,
      activeId: "overview",
      variant: "default",
      orientation: "horizontal",
    },
    controls: [
      json("items", "項目", "Items"),
      select("activeId", "選択中", "Active tab", ["overview", "details"]),
      select("variant", "バリアント", "Variant", ["default", "elastic"]),
      select("orientation", "方向", "Orientation", ["horizontal", "vertical"]),
    ],
  },
  sidebar: {
    props: {
      items: [
        { id: "home", label: "Home" },
        { id: "settings", label: "Settings" },
      ],
      activeId: "home",
      collapsed: false,
    },
    controls: [
      json("items", "項目", "Items"),
      select("activeId", "選択中", "Active item", ["home", "settings"]),
      boolean("collapsed", "折りたたみ", "Collapsed"),
    ],
  },
  toolbar: {
    props: {
      items: [
        { id: "save", label: "Save" },
        { id: "refresh", label: "Refresh" },
      ],
      overflow: "none",
    },
    controls: [
      json("items", "項目", "Items"),
      select("overflow", "オーバーフロー", "Overflow", ["none", "menu"]),
    ],
  },
  "icon-button": {
    props: {
      id: "more",
      label: "More actions",
      icon: "⋯",
      type: "button",
      disabled: false,
      pressed: false,
    },
    controls: [
      text("id", "ID", "ID"),
      text("label", "ラベル", "Label"),
      text("icon", "アイコン", "Icon"),
      select("type", "種類", "Type", ["button", "submit", "reset"]),
      boolean("disabled", "無効", "Disabled"),
      boolean("pressed", "押下中", "Pressed"),
    ],
  },
  "text-field": {
    props: {
      id: "name",
      label: "Name",
      value: "ikasue",
      placeholder: "Enter a name",
      disabled: false,
      required: true,
    },
    controls: [
      text("id", "ID", "ID"),
      text("label", "ラベル", "Label"),
      text("value", "値", "Value"),
      text("placeholder", "プレースホルダー", "Placeholder"),
      boolean("disabled", "無効", "Disabled"),
      boolean("required", "必須", "Required"),
    ],
  },
  checkbox: {
    props: { id: "enabled", label: "Enabled", checked: true, disabled: false },
    controls: [
      text("id", "ID", "ID"),
      text("label", "ラベル", "Label"),
      boolean("checked", "チェック", "Checked"),
      boolean("disabled", "無効", "Disabled"),
    ],
  },
  "radio-group": {
    props: {
      id: "choice",
      options: choiceOptions,
      value: "one",
      disabled: false,
    },
    controls: [
      text("id", "ID", "ID"),
      json("options", "選択肢", "Options"),
      select("value", "値", "Value", ["one", "two"]),
      boolean("disabled", "無効", "Disabled"),
    ],
  },
  "segmented-control": {
    props: {
      id: "view",
      options: choiceOptions,
      value: "one",
      disabled: false,
      variant: "default",
    },
    controls: [
      text("id", "ID", "ID"),
      json("options", "選択肢", "Options"),
      select("value", "値", "Value", ["one", "two"]),
      boolean("disabled", "無効", "Disabled"),
      select("variant", "バリアント", "Variant", ["default", "elastic"]),
    ],
  },
  field: {
    props: { id: "name", label: "Name", required: true, content: "ikasue" },
    controls: [
      text("id", "ID", "ID"),
      text("label", "ラベル", "Label"),
      text("content", "内容", "Content"),
      boolean("required", "必須", "Required"),
    ],
  },
  form: {
    props: {
      fields: [
        { id: "name", label: "Name", initialValue: "ikasue", required: true },
      ],
      values: { name: "ikasue" },
      status: "idle",
    },
    controls: [
      json("fields", "フィールド", "Fields"),
      json("values", "値", "Values"),
      select("status", "状態", "Status", [
        "idle",
        "clean",
        "dirty",
        "submitting",
        "success",
        "error",
      ]),
    ],
  },
  "data-grid": {
    props: {
      columns: gridColumns,
      rows: gridRows,
      selection: { row: "one", column: "name" },
      editable: false,
      density: "default",
    },
    controls: [
      json("columns", "列", "Columns"),
      json("rows", "行", "Rows"),
      json("selection", "選択", "Selection"),
      boolean("editable", "編集可能", "Editable"),
      select("density", "密度", "Density", ["default", "compact"]),
    ],
  },
  "status-indicator": {
    props: { label: "Ready", status: "success" },
    controls: [
      text("label", "ラベル", "Label"),
      select("status", "状態", "Status", [
        "neutral",
        "info",
        "success",
        "warning",
        "danger",
      ]),
    ],
  },
  alert: {
    props: {
      message: "Attention required: review the selected item.",
      severity: "warning",
      dismissible: true,
    },
    controls: [
      text("message", "メッセージ", "Message"),
      select("severity", "重要度", "Severity", [
        "info",
        "success",
        "warning",
        "danger",
      ]),
      boolean("dismissible", "閉じる", "Dismissible"),
    ],
  },
  progress: {
    props: { value: 48, max: 100, label: "Work progress" },
    controls: [
      number("value", "進捗", "Value"),
      number("max", "最大値", "Max", 1, 100),
      text("label", "ラベル", "Label"),
    ],
  },
  dialog: {
    props: {
      title: "Confirm changes",
      content: "This dialog stays in the document flow for the demo.",
      open: true,
      modal: false,
    },
    controls: [
      text("title", "タイトル", "Title"),
      text("content", "内容", "Content"),
      boolean("open", "開く", "Open"),
      boolean("modal", "モーダル", "Modal"),
    ],
  },
  "split-view": {
    props: {
      panes: [
        { id: "list", label: "List", content: "Items", basis: 1 },
        { id: "detail", label: "Detail", content: "Selection", basis: 2 },
      ],
      orientation: "horizontal",
      sizes: ["1fr", "2fr"],
      collapsible: true,
      motionOrigin: "start",
    },
    controls: [
      json("panes", "ペイン", "Panes"),
      select("orientation", "方向", "Orientation", ["horizontal", "vertical"]),
      json("sizes", "サイズ", "Sizes"),
      boolean("collapsible", "折りたたみ", "Collapsible"),
      select("motionOrigin", "モーション起点", "Motion origin", [
        "start",
        "end",
        "top",
        "bottom",
      ]),
    ],
  },
  "side-panel": {
    props: {
      title: "Inspector",
      content: "Details remain alongside the work.",
      side: "end",
      open: true,
    },
    controls: [
      text("title", "タイトル", "Title"),
      text("content", "内容", "Content"),
      select("side", "位置", "Side", ["start", "end"]),
      boolean("open", "開く", "Open"),
    ],
  },
  "bottom-panel": {
    props: {
      title: "Output",
      content: "Logs stay in the page plane.",
      open: true,
    },
    controls: [
      text("title", "タイトル", "Title"),
      text("content", "内容", "Content"),
      boolean("open", "開く", "Open"),
    ],
  },
  "loading-region": {
    props: {
      content: "Original content remains readable while work continues.",
      busy: true,
      label: "Loading",
    },
    controls: [
      text("content", "内容", "Content"),
      boolean("busy", "処理中", "Busy"),
      text("label", "ラベル", "Label"),
    ],
  },
  "history-timeline": {
    props: {
      entries: [
        {
          id: "one",
          label: "Created",
          content: "Initial state",
          tone: "success",
        },
        {
          id: "two",
          label: "Reviewed",
          content: "Ready for the next step",
          tone: "default",
        },
      ],
      orientation: "vertical",
    },
    controls: [
      json("entries", "履歴", "Entries"),
      select("orientation", "方向", "Orientation", ["vertical", "horizontal"]),
    ],
  },
};

export const COMPONENT_DEMOS = demos;

export function componentDemo(id: CatalogComponentId): ComponentDemo {
  return demos[id];
}

function codeJson(value: IkaJsonValue): string {
  return JSON.stringify(value, null, 2);
}

export function componentSourceForProps(
  id: CatalogComponentId,
  props: IkaJsonRecord,
  language: "typescript" | "rust",
): string {
  const tag = `ika-${id}`;
  if (language === "typescript")
    return [
      'import { defineIkaSue } from "@ugoite/ikasue/elements";',
      "",
      "defineIkaSue();",
      `const element = document.querySelector<HTMLElement & { props: Record<string, unknown> }>("${tag}");`,
      `if (!element) throw new Error("${tag} is required");`,
      "",
      `element.props = ${codeJson(props)};`,
    ].join("\n");
  const encoded = JSON.stringify(JSON.stringify(props));
  return [
    "use wasm_bindgen::prelude::*;",
    "use wasm_bindgen::JsCast;",
    "",
    "// Rust/WASM uses the same JSON-safe Web ABI.",
    "let document = web_sys::window()",
    '    .ok_or("window is required")?',
    "    .document()",
    '    .ok_or("document is required")?;',
    `let element = document.query_selector("${tag}")?`,
    `    .ok_or("${tag} is required")?`,
    "    .dyn_into::<web_sys::HtmlElement>()?;",
    `let props = js_sys::JSON::parse(${encoded})?;`,
    `js_sys::Reflect::set(element.as_ref(), &"props".into(), &props)?;`,
  ].join("\n");
}
