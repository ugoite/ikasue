import type {
  CatalogCategoryId,
  CatalogComponentId,
  CatalogComponentMetadata,
  CatalogConceptMetadata,
  CatalogPageId,
  CatalogPageMetadata,
  CatalogProperty,
  CatalogPropertyValue,
} from "./types";

const p = (
  key: string,
  label: string,
  type: CatalogProperty["type"],
  defaultValue: CatalogPropertyValue,
  values: readonly string[] = [],
): CatalogProperty => ({
  key,
  label,
  type,
  default: defaultValue,
  values,
});

export const CATALOG_GROUPS = [
  ["思想と契約", "philosophy"],
  ["基盤", "foundation"],
  ["配置", "layout"],
  ["アクション", "action"],
  ["情報と入力", "input"],
  ["データ", "data"],
  ["フィードバック", "feedback"],
] as const satisfies readonly (readonly [string, CatalogCategoryId])[];

export const CATALOG_CONCEPTS = [
  {
    id: "philosophy",
    cat: "philosophy",
    name: "Design philosophy",
    ja: "平面適応UIの思想",
    summary:
      "すべてのUIを一枚の平面上の順序と空間配分として扱う。必要な領域は同じ平面の中で場所を譲り、重なりを作らない。",
    demo: "philosophy",
    props: [],
  },
] as const satisfies readonly CatalogConceptMetadata[];

export const CATALOG_COMPONENTS = [
  {
    id: "developer-model",
    cat: "philosophy",
    name: "Developer model",
    ja: "コンポーネント契約",
    summary:
      "開発者は順序、軸、適応方針を宣言する。領域間の調停やイベント配線はランタイムが担う。",
    demo: "developer",
    props: [],
  },
  {
    id: "theme-root",
    cat: "foundation",
    name: "ThemeRoot",
    ja: "テーマルート",
    summary:
      "OS font、白いcanvas、黒い構造accent、状態色、密度、motionをdocument単位で供給する。",
    demo: "theme",
    props: [
      p("density", "密度", "select", "normal", [
        "compact",
        "normal",
        "relaxed",
      ]),
      p("selection", "選択面", "select", "quiet", ["quiet", "clear", "strong"]),
      p("motion", "motion", "select", "expressive", [
        "quiet",
        "expressive",
        "off",
      ]),
      p("line", "境界線", "select", "hairline", ["hairline", "standard"]),
    ],
  },
  {
    id: "text",
    cat: "foundation",
    name: "Text",
    ja: "情報テキスト",
    summary:
      "静的textとtext inputを同じcomponentとして扱う。editable capabilityがある場合だけ編集状態を持つ。",
    demo: "text",
    props: [
      p("editable", "編集可能", "boolean", true),
      p("editor", "editor", "select", "text", [
        "text",
        "email",
        "number",
        "date",
        "textarea",
        "select",
      ]),
      p("state", "差分状態", "select", "clean", [
        "clean",
        "created",
        "modified",
        "deleted",
        "error",
      ]),
      p("value", "値", "text", "東京オフィス"),
    ],
  },
  {
    id: "rule",
    cat: "foundation",
    name: "Rule",
    ja: "境界線",
    summary: "カードを作らず、意味の切れ目だけを一枚の線と余白で示す。",
    demo: "rule",
    props: [
      p("axis", "方向", "select", "horizontal", ["horizontal", "vertical"]),
      p("weight", "太さ", "select", "hairline", ["hairline", "standard"]),
    ],
  },
  {
    id: "status-icon",
    cat: "foundation",
    name: "StatusIcon",
    ja: "状態アイコン",
    summary: "status chipの代わりに、色付きiconとhover説明だけを表示する。",
    demo: "status",
    props: [
      p("kind", "状態", "select", "success", [
        "info",
        "success",
        "warning",
        "error",
      ]),
      p("label", "説明", "text", "同期済み"),
    ],
  },
  {
    id: "vertical",
    cat: "layout",
    name: "Vertical",
    ja: "縦平面",
    summary:
      "順序付きの子要素を縦方向のboundedな平面へ置く。要素サイズと高さを変え、elastic、wrap、scrollの差を確かめられる。",
    demo: "plane",
    props: [
      p("fit", "適応", "select", "elastic", ["elastic", "wrap", "scroll"]),
      p("gap", "間隔", "select", "md", ["none", "sm", "md", "lg"]),
      p("items", "項目数", "select", "4", ["3", "4", "6"]),
      p("basis", "要素サイズ", "select", "2", ["1", "2", "3"]),
      p("available", "利用可能範囲", "select", "10", ["6", "8", "10"]),
    ],
  },
  {
    id: "horizontal",
    cat: "layout",
    name: "Horizontal",
    ja: "横平面",
    summary:
      "順序付きの子要素を横方向のboundedな平面へ置く。要素サイズと幅を変え、elastic、wrap、scrollの差を確かめられる。",
    demo: "plane",
    props: [
      p("fit", "適応", "select", "elastic", ["elastic", "wrap", "scroll"]),
      p("gap", "間隔", "select", "sm", ["none", "sm", "md", "lg"]),
      p("items", "項目数", "select", "4", ["3", "4", "6"]),
      p("basis", "要素サイズ", "select", "2", ["1", "2", "3"]),
      p("available", "利用可能範囲", "select", "10", ["6", "8", "10"]),
    ],
  },
  {
    id: "icon-action",
    cat: "action",
    name: "IconAction",
    ja: "アイコン操作",
    summary:
      "業務で反復するactionはiconだけで表示し、hoverとfocusで説明を出す。",
    demo: "icon-action",
    props: [
      p("action", "action", "select", "save", [
        "save",
        "add",
        "edit",
        "delete",
      ]),
      p("state", "状態", "select", "enabled", ["enabled", "disabled", "busy"]),
    ],
  },
  {
    id: "action-strip",
    cat: "action",
    name: "ActionStrip",
    ja: "操作列",
    summary:
      "関連するicon actionを一列に並べ、選択中またはbusyなactionだけを淡い面で強調する。",
    demo: "action-strip",
    props: [
      p("active", "active", "select", "save", [
        "none",
        "save",
        "history",
        "refresh",
      ]),
      p("density", "密度", "select", "normal", ["compact", "normal"]),
    ],
  },
  {
    id: "boolean-text",
    cat: "input",
    name: "BooleanText",
    ja: "文章チェック",
    summary:
      "空boxを描かず、文章自体を押して真偽を切り替える。falseは薄く、trueはcheckと淡い面を持つ。",
    demo: "boolean",
    props: [
      p("checked", "値", "boolean", true),
      p("label", "文章", "text", "自動保存を有効にする"),
    ],
  },
  {
    id: "choice-group",
    cat: "input",
    name: "ChoiceGroup",
    ja: "単一選択",
    summary:
      "選択された意味へ面積を譲る。横・縦とも同じselection grammarを使う。",
    demo: "choice",
    props: [
      p("direction", "方向", "select", "horizontal", [
        "horizontal",
        "vertical",
      ]),
      p("selected", "選択", "select", "standard", [
        "compact",
        "standard",
        "review",
      ]),
    ],
  },
  {
    id: "form-list",
    cat: "input",
    name: "FormList",
    ja: "情報フォーム",
    summary:
      "項目名の下にTextを並べる。表示と編集は同じ情報componentで、Tabにより次のeditable情報へ移る。",
    demo: "form",
    props: [
      p("marker", "項目記号", "select", "bullet", ["bullet", "number", "none"]),
      p("state", "差分例", "select", "mixed", ["clean", "mixed", "error"]),
    ],
  },
  {
    id: "data-table",
    cat: "data",
    name: "DataTable",
    ja: "セル指向テーブル",
    summary:
      "indexを既定で持たず、選択cellと同じrow/columnだけを淡く示す。copy、paste、editに対応する。",
    demo: "table",
    props: [
      p("editable", "編集", "boolean", true),
      p("selection", "選択強調", "select", "row-column", [
        "cell",
        "row-column",
      ]),
      p("changes", "差分例", "boolean", true),
    ],
  },
  {
    id: "history-gutter",
    cat: "data",
    name: "HistoryGutter",
    ja: "変更履歴",
    summary: "線と点だけでrevisionを示し、選択revisionだけを面で強調する。",
    demo: "history",
    props: [
      p("selected", "revision", "select", "current", [
        "current",
        "previous",
        "initial",
      ]),
      p("compact", "compact", "boolean", false),
    ],
  },
  {
    id: "progress-region",
    cat: "feedback",
    name: "ProgressRegion",
    ja: "領域ローディング",
    summary: "処理対象領域の内容を残したまま、その面だけを黒いwaveで流す。",
    demo: "progress",
    props: [
      p("loading", "loading", "boolean", true),
      p("pattern", "pattern", "select", "wave", ["wave", "scan", "edge"]),
    ],
  },
  {
    id: "message-region",
    cat: "feedback",
    name: "MessageRegion",
    ja: "領域連動メッセージ",
    summary: "短いstatus messageを対象領域へ結び、押すとその領域へ注意を移す。",
    demo: "message",
    props: [
      p("kind", "status", "select", "info", [
        "info",
        "success",
        "warning",
        "error",
      ]),
      p("target", "対象", "select", "secondary", ["primary", "secondary"]),
    ],
  },
  {
    id: "bottom-dialog",
    cat: "feedback",
    name: "BottomDialog",
    ja: "下端ダイアログ",
    summary:
      "modalを上へ重ねず、下端から平面内へ追加する。上の情報を読みながら判断できる。",
    demo: "dialog",
    props: [
      p("intent", "目的", "select", "confirm", [
        "confirm",
        "danger",
        "information",
      ]),
      p("dismiss", "取消可能", "boolean", true),
    ],
  },
] as const satisfies readonly CatalogComponentMetadata[];

export const CATALOG_PAGES = [
  ...CATALOG_CONCEPTS,
  ...CATALOG_COMPONENTS,
] as const satisfies readonly CatalogPageMetadata[];

export const CONCEPT_IDS = CATALOG_CONCEPTS.map(
  (concept) => concept.id,
) as readonly CatalogConceptMetadata["id"][];

export const COMPONENT_IDS = CATALOG_COMPONENTS.map(
  (component) => component.id,
) as readonly CatalogComponentId[];

export const PAGE_IDS = CATALOG_PAGES.map(
  (page) => page.id,
) as readonly CatalogPageId[];

export const PRINCIPLES = [
  [
    "One Plane",
    "すべてのcomponentは同じ平面に置く。新しい領域は既存領域へ重ならず、flowの中で場所を作る。",
  ],
  [
    "One Axis at a Time",
    "開発者が選ぶのはverticalまたはhorizontalの一軸だけ。複雑な領域調停はランタイムが内部で行う。",
  ],
  [
    "Simple Adaptation",
    "収まる間は順序とサイズを保ち、必要になったときだけelastic、wrap、scrollへ決定的に適応する。",
  ],
  [
    "Information Is Editable",
    "TextとTextInputを分けない。情報へeditable capabilityとeditor kindを付け、読む状態を標準にする。",
  ],
  [
    "Selection Owns Area",
    "選択は下線や濃い枠だけで示さず、少し広がり、淡い面を持つ。未選択は静かに保つ。",
  ],
  [
    "No Card Taxonomy",
    "分類のために箱を増やさない。余白、境界線、順序で意味を分ける。",
  ],
  [
    "Semantic Color Only",
    "黒は構造。青・緑・赤・黄は状態だけに使用し、装飾paletteとして散らさない。",
  ],
  [
    "Readable During Work",
    "loadingや更新中も以前の内容を残し、処理対象の領域だけを黒いmotionで示す。",
  ],
] as const;

export const PRINCIPLES_EN = [
  [
    "One Plane",
    "Place every component on the same plane. New regions make room in the flow instead of covering existing regions.",
  ],
  [
    "One Axis at a Time",
    "The developer chooses only one axis, vertical or horizontal. Runtime behavior handles internal space negotiation.",
  ],
  [
    "Simple Adaptation",
    "Preserve order and size while content fits, then deterministically adapt with elastic, wrap, or scroll behavior.",
  ],
  [
    "Information Is Editable",
    "Do not split Text from TextInput. Give information an editable capability and editor kind while keeping reading as the default state.",
  ],
  [
    "Selection Owns Area",
    "Show selection with a little more area and a quiet surface, not only an underline or heavy border.",
  ],
  [
    "No Card Taxonomy",
    "Do not add boxes to create categories. Separate meaning with space, boundaries, and order.",
  ],
  [
    "Semantic Color Only",
    "Black is structural. Use blue, green, red, and yellow for state only.",
  ],
  [
    "Readable During Work",
    "Keep previous content visible during loading or updates, and show motion only on the region being processed.",
  ],
] as const;

const PHILOSOPHY: Partial<Record<CatalogPageId, string>> = {
  "theme-root":
    "themeは装飾presetではなく、全componentが共有する判断規則。白、黒、OS fontを固定基盤とし、選択面の濃度、線、密度、motionだけを調整する。",
  text: "情報は最初からeditorではない。読む状態を標準にし、editable capabilityがある情報だけ編集状態を持つ。",
  rule: "境界線はcontainerを作るためではなく、意味の切れ目を一度だけ示す。二重囲いと階層surfaceを作らない。",
  "status-icon":
    "反復業務ではstatus labelを読まなくても意味が身につく。iconと色を主表示にし、言語説明はhover、focus、accessible nameへ退避する。",
  vertical:
    "Verticalは子要素の順序だけを開発者から受け取り、利用可能な高さに応じたサイズ調整を内部で決める。",
  horizontal:
    "Horizontalは子要素の順序だけを開発者から受け取り、利用可能な幅に応じたサイズ調整を内部で決める。",
  "icon-action":
    "actionは業務で反復されるほどiconだけで理解できる。初回学習と多言語対応はtooltip、accessible name、documentationが担う。",
  "action-strip":
    "複数actionをcontainerで囲まず、近接と同じbaselineでgroup化する。activeやbusyなactionだけを面で強調する。",
  "boolean-text":
    "booleanの本体はboxではなく文章の意味。falseは薄い文章、trueはcheckと選択面で示し、文章全体をhit targetにする。",
  "choice-group":
    "選択肢の中で現在値へ面積を渡す。値は即時commitし、横・縦で同じgrammarを保つ。",
  "form-list":
    "formはboxの集合ではなく情報の順序。labelの下にTextを置き、Tabはeditable capabilityを持つ情報だけを移動する。",
  "data-table":
    "cellが操作単位。選択cellを明確にしつつrowとcolumnの文脈は淡く残す。",
  "history-gutter":
    "変更履歴は別cardではなく、現在情報の横にある時間軸。線、点、差分色だけでrevisionを示す。",
  "progress-region":
    "中央spinnerは対象が不明になる。対象region全体へ黒いmotionを流し、以前の情報を読めるままにする。",
  "message-region":
    "messageは通知棚へ積まず、対象regionへのlinkとして機能する。押すとその領域へ注意を移す。",
  "bottom-dialog":
    "dialogもZ軸へ逃げない。下端からrowを追加し、元の情報を押し縮める。不可逆判断でも根拠を隠さない。",
};

export function componentPhilosophy(id: CatalogPageId): string {
  return (
    PHILOSOPHY[id] ??
    "このcomponentはikasueの平面、境界、選択、順序の規則に従う。"
  );
}

const META: Partial<Record<CatalogPageId, readonly [string, string, string]>> =
  {
    text: [
      "静的説明、metadata、form値、table cell",
      "command検索のように常時入力が必要な欄",
      "Enter/F2で編集、Escape取消、Tabで確定移動",
    ],
    vertical: [
      "順序が意味を持つ文章、form、縦長の作業列",
      "横方向の関連項目を無理に詰め込むこと",
      "Tab、ArrowDown/Up、Home/End",
    ],
    horizontal: [
      "toolbar、関連action、横方向の比較項目",
      "読み順が縦になる内容を横へ押し込むこと",
      "Tab、ArrowLeft/Right、Home/End",
    ],
    "bottom-dialog": [
      "削除確認、短いsystem判断、補助command",
      "長いformや常設detail",
      "Escape、Tab、確定action",
    ],
    "data-table": [
      "業務データ、copy/paste、inline edit",
      "layout目的のtable",
      "Arrow keys、Ctrl/Cmd+C/V、Enter/F2",
    ],
  };

export function componentMeta(
  id: CatalogPageId,
): readonly [string, string, string] {
  return (
    META[id] ?? [
      "業務画面の意味ある構造",
      "装飾目的、card階層の代替",
      "標準keyboardとaccessible name",
    ]
  );
}

export function findComponent(
  id: CatalogComponentId,
): CatalogComponentMetadata {
  const component = CATALOG_COMPONENTS.find((item) => item.id === id);
  if (!component) {
    throw new Error(`Unknown catalog component: ${id}`);
  }
  return component;
}

export function findPage(id: CatalogPageId): CatalogPageMetadata {
  const page = CATALOG_PAGES.find((item) => item.id === id);
  if (!page) {
    throw new Error(`Unknown catalog page: ${id}`);
  }
  return page;
}
