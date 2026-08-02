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
  ["ナビゲーション", "navigation"],
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
      "すべてのUIを一枚の平面上の空間配分として扱う。重ねず、出現元の辺から既存領域を押して場所を作る。",
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
      "表示専用と入力専用を分断せず、情報componentへ編集能力を付与する。配置は固定column数ではなくaxisとfocus要求で決まる。",
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
      "静的textとtext inputを同じcomponentとして扱う。editable capabilityがある場合だけ破線と編集cursorを持つ。",
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
    id: "stack",
    cat: "layout",
    name: "Stack",
    ja: "縦配置",
    summary:
      "縦方向のde facto primitive。順序、gap、alignmentだけを責務にし、装飾やcontainer surfaceを持たない。",
    demo: "stack",
    props: [
      p("gap", "gap", "select", "md", ["xs", "sm", "md", "lg"]),
      p("align", "alignment", "select", "stretch", [
        "start",
        "center",
        "stretch",
      ]),
    ],
  },
  {
    id: "cluster",
    cat: "layout",
    name: "Cluster",
    ja: "横配置",
    summary:
      "横方向のde facto primitive。入らない場合はwrapするが、作業領域の自動退避はAxisFlowへ委ねる。",
    demo: "cluster",
    props: [
      p("gap", "gap", "select", "sm", ["xs", "sm", "md"]),
      p("wrap", "wrap", "boolean", true),
      p("active", "active child", "select", "2", ["none", "1", "2", "3"]),
    ],
  },
  {
    id: "focus-plane",
    cat: "layout",
    name: "FocusPlane",
    ja: "焦点配分面",
    summary:
      "複数領域のうちfocusされた領域へ幅を譲る。desktopは境界線上の矢印、mobileは画面端の矢印で隣の領域へ移る。",
    demo: "focus",
    props: [
      p("initial", "初期focus", "select", "primary", [
        "primary",
        "balanced",
        "secondary",
      ]),
      p("focusOnInput", "内部focusで拡張", "boolean", true),
      p("collapse", "0幅を許可", "boolean", true),
    ],
  },
  {
    id: "focus-region",
    cat: "layout",
    name: "FocusRegion",
    ja: "焦点要求",
    summary:
      "子componentが親FocusPlaneを直接参照せず、eventで必要な領域と比率を要求する。",
    demo: "focus-request",
    props: [
      p("target", "要求先", "select", "secondary", [
        "primary",
        "balanced",
        "secondary",
      ]),
      p("scope", "探索", "select", "nearest", ["nearest", "named"]),
    ],
  },
  {
    id: "axis-flow",
    cat: "layout",
    name: "AxisFlow",
    ja: "無限軸配置",
    summary:
      "横または縦に任意数の領域を受け入れ、入らない場合はその軸の終端にnavigationを自動生成する。",
    demo: "axis",
    props: [
      p("axis", "軸", "select", "horizontal", ["horizontal", "vertical"]),
      p("items", "項目数", "select", "10", ["4", "7", "10"]),
      p("strategy", "focus配分", "select", "elastic", [
        "equal",
        "elastic",
        "single",
      ]),
    ],
  },
  {
    id: "edge-region",
    cat: "layout",
    name: "EdgeRegion",
    ja: "辺から追加する領域",
    summary:
      "右の領域は右から、下の領域は下から現れ、既存内容を押し縮めて場所を作る。overlayしない。",
    demo: "edge",
    props: [
      p("edge", "出現辺", "select", "right", ["right", "left", "bottom"]),
      p("initial", "初期状態", "select", "closed", ["closed", "open"]),
    ],
  },
  {
    id: "bottom-dock",
    cat: "layout",
    name: "BottomDock",
    ja: "下端作業領域",
    summary:
      "上の情報を維持しながら下から作業領域を追加する。system dialogや短い確認にも使える。",
    demo: "bottom-dock",
    props: [
      p("size", "高さ", "select", "medium", ["small", "medium", "large"]),
      p("purpose", "用途", "select", "confirm", [
        "confirm",
        "detail",
        "command",
      ]),
    ],
  },
  {
    id: "edge-nav",
    cat: "navigation",
    name: "EdgeNav",
    ja: "押し出しナビゲーション",
    summary:
      "左端のrailを恒常的な手掛かりにし、開くと横から伸びてmain contentを押す。重ならない。",
    demo: "edge-nav",
    props: [
      p("initial", "初期", "select", "closed", ["closed", "open"]),
      p("selected", "選択", "select", "workspace", [
        "home",
        "workspace",
        "settings",
      ]),
    ],
  },
  {
    id: "elastic-tabs",
    cat: "navigation",
    name: "ElasticTabs",
    ja: "伸縮タブ",
    summary:
      "active tabへ面積と淡い面を与える。panelは選択方向から入り、奥行きや浮遊を使わない。",
    demo: "tabs",
    props: [
      p("selected", "選択", "select", "1", ["0", "1", "2"]),
      p("activation", "activation", "select", "automatic", [
        "automatic",
        "manual",
      ]),
      p("directional", "方向motion", "boolean", true),
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
      "radio circleを使わず、選択された意味へ面積を譲る。横・縦とも同じselection grammarを使う。",
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
    summary:
      "VS Codeの履歴感覚を洗練し、線と点だけでrevisionを示す。選択revisionだけを面で強調する。",
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
    summary:
      "短いstatus messageを対象領域へ結び、押すとその領域が拡張され、薄くstatus色で強調される。",
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
    "Flat Plane",
    "すべてのcomponentは同じ平面に置く。新しい領域は既存領域へ重ならず、grid trackやflowを変更して場所を作る。",
  ],
  [
    "Directional Origin",
    "右の内容は右から、左navは左から、bottom dialogは下から現れる。motionは情報の地理を説明する。",
  ],
  [
    "Space Negotiation",
    "表示領域は固定spanではなく、focus、内容量、viewport、優先度から必要な幅と高さを交渉する。",
  ],
  [
    "Infinite Axis, Finite Viewport",
    "横にも縦にも任意数を受け入れる。収まらない場合はoverflowさせず、その軸の端にnavigationを生やす。",
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
    "分類のために箱を増やさない。余白、境界線、順序、edge navigationで意味を分ける。",
  ],
  [
    "Semantic Color Only",
    "黒は構造。青・緑・赤・黄は状態だけに使用し、装飾paletteとして散らさない。",
  ],
  [
    "Readable During Work",
    "loadingや更新中も以前の内容を残し、処理対象の領域だけを黒いmotionで示す。",
  ],
  [
    "Keyboard Is Geometry",
    "Tab、矢印、Home/End、copy/pasteが視覚的な移動方向と一致する。",
  ],
] as const;

const PHILOSOPHY: Partial<Record<CatalogPageId, string>> = {
  "theme-root":
    "themeは装飾presetではなく、全componentが共有する判断規則。白、黒、OS fontを固定基盤とし、選択面の濃度、線、密度、motionだけを調整する。",
  text: "情報は最初からeditorではない。読む状態を標準にし、editable capabilityがある情報だけ破線とcursorを持つ。編集中は破線を消し、単一の黒線だけを表示するため二重線にならない。",
  rule: "境界線はcontainerを作るためではなく、意味の切れ目を一度だけ示す。二重囲いと階層surfaceを作らない。",
  "status-icon":
    "反復業務ではstatus labelを読まなくても意味が身につく。iconと色を主表示にし、言語説明はhover、focus、accessible nameへ退避する。",
  stack:
    "Stackは縦順序だけを保証する。focusによる伸縮やoverflow navigationを含めず、予測可能な基礎として保つ。",
  cluster:
    "Clusterは横配置とwrapだけを保証する。選択childの軽い拡張は許すが、複雑な領域退避はAxisFlowの責務。",
  "focus-plane":
    "FocusPlaneはtaskへ空間を譲る。separatorは装飾ではなく隣接領域の方向を示す操作線で、自由dragより意味ある状態遷移を優先する。",
  "focus-region":
    "visual treeとcomponent treeを疎結合にする。子は「secondaryをexpandedに」と要求し、最も近いFocusPlaneがviewportに応じて実際の比率を決める。",
  "axis-flow":
    "無限に要素を受け入れるAPIと有限viewportを両立する。収まる間は同一平面に並べ、収まらなくなった瞬間に終端navigationへ変換する。",
  "edge-region":
    "新規detailやtoolは、その存在場所と同じ辺から追加する。重なりではなくtrackの増加なので、元の情報との位置関係が壊れない。",
  "bottom-dock":
    "確認や補助情報は下端の新しいrowとして追加する。上の文脈がそのまま読めるため、判断の根拠を隠さない。",
  "edge-nav":
    "navigationは必要なときだけ語彙を展開する。閉じてもrailとiconが地理的手掛かりとして残り、開くとmainを押して平面を再配分する。",
  "elastic-tabs":
    "選択された情報へ面積を譲ることで、下線だけより明確に現在位置を示す。contentはtabの相対位置と同じ方向から交代する。",
  "icon-action":
    "actionは業務で反復されるほどiconだけで理解できる。初回学習と多言語対応はtooltip、accessible name、documentationが担う。",
  "action-strip":
    "複数actionをcontainerで囲まず、近接と同じbaselineでgroup化する。activeやbusyなactionだけを面で強調する。",
  "boolean-text":
    "booleanの本体はboxではなく文章の意味。falseは薄い文章、trueはcheckと選択面で示し、文章全体をhit targetにする。",
  "choice-group":
    "選択肢の中で現在値へ面積を渡す。navigationのElasticTabsと同じgrammarを使うが、値は即時commitする。",
  "form-list":
    "formはboxの集合ではなく情報の順序。labelの下にTextを置き、Tabはeditable capabilityを持つ情報だけを移動する。",
  "data-table":
    "cellが操作単位。選択cellを明確にしつつrowとcolumnの文脈は淡く残す。indexやlock iconを既定表示しない。",
  "history-gutter":
    "変更履歴は別cardではなく、現在情報の横にある時間軸。線、点、差分色だけでrevisionを示す。",
  "progress-region":
    "中央spinnerは対象が不明になる。対象region全体へ黒いmotionを流し、以前の情報を読めるままにする。",
  "message-region":
    "messageは通知棚へ積まず、対象regionへのlinkとして機能する。押すとその領域へ空間とstatus色を一時的に渡す。",
  "bottom-dialog":
    "dialogもZ軸へ逃げない。下端からrowを追加し、元の情報を押し縮める。不可逆判断でも根拠を隠さない。",
};

export function componentPhilosophy(id: CatalogPageId): string {
  return (
    PHILOSOPHY[id] ??
    "このcomponentはikasueの平面、境界、選択、方向motionの規則に従う。"
  );
}

const META: Partial<Record<CatalogPageId, readonly [string, string, string]>> =
  {
    text: [
      "静的説明、metadata、form値、table cell",
      "command検索のように常時入力が必要な欄",
      "Enter/F2で編集、Escape取消、Tabで確定移動",
    ],
    "focus-plane": [
      "一覧とdetail、文書と履歴、検索とpreview",
      "単純な二列文章layout",
      "境界矢印、内部focus、layout-request",
    ],
    "axis-flow": [
      "多数のdashboard region、tool群、可変workspace",
      "単純な短いrow",
      "edge navigation、Arrow keys",
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
    "elastic-tabs": [
      "同一階層の単一panel切替",
      "複数panelの同時表示",
      "ArrowLeft/Right、Home/End、Enter/Space",
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
