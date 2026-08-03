/**
 * Authoritative component registry.
 *
 * Runtime catalog metadata, bilingual documentation copy, property labels,
 * documentation page metadata, and source recipes live here. The legacy
 * metadata and docs-site modules are projections of these values.
 */
import type {
  CatalogCategoryId,
  CatalogComponentRegistryEntry,
  CatalogComponentId,
  CatalogComponentMetadata,
  CatalogDocumentationCopy,
  CatalogConceptId,
  CatalogLocale,
  CatalogLocalizedText,
  CatalogPageCopy,
  CatalogRegistryEntry,
  CatalogSourceRecipe,
  CatalogConceptMetadata,
  CatalogConceptRegistryEntry,
  CatalogPageId,
  CatalogPageMetadata,
  CatalogPrinciple,
  CatalogProperty,
  CatalogPropertyValue,
} from "./types";

const p = (
  key: string,
  label: string,
  type: CatalogProperty["type"],
  defaultJa: CatalogPropertyValue,
  values: readonly string[] = [],
  defaultEn: CatalogPropertyValue = defaultJa,
): CatalogProperty => ({
  key,
  label,
  labelJa: label,
  labelEn: label,
  type,
  default: defaultJa,
  defaultJa,
  defaultEn,
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

const PHILOSOPHY_METADATA = {
  id: "philosophy",
  cat: "philosophy",
  name: "Design philosophy",
  ja: "平面適応UIの思想",
  summary:
    "すべてのUIを一枚の平面上の順序と空間配分として扱う。必要な領域は同じ平面の中で場所を譲り、重なりを作らない。",
  demo: "philosophy",
  props: [],
} as const satisfies CatalogConceptMetadata;

const BASE_CATALOG_COMPONENTS = [
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
      p("value", "値", "text", "東京オフィス", [], "Tokyo office"),
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
      p("label", "説明", "text", "同期済み", [], "Synced"),
    ],
  },
  {
    id: "vertical",
    cat: "layout",
    name: "Vertical",
    ja: "縦平面",
    summary:
      "順序付きの子要素を縦方向のboundedな平面へ置く。要素サイズと高さを変え、elastic、wrap、focus navigationの差を確かめられる。",
    demo: "plane",
    props: [
      p("fit", "適応", "select", "elastic", ["elastic", "wrap"]),
      p("gap", "間隔", "select", "md", ["none", "sm", "md", "lg"]),
      p("items", "項目数", "select", "3", ["3", "4", "6"]),
      p("basis", "要素サイズ", "select", "2", ["1", "2", "3"]),
      p("available", "利用可能範囲", "select", "6", ["6", "8", "10"]),
    ],
  },
  {
    id: "horizontal",
    cat: "layout",
    name: "Horizontal",
    ja: "横平面",
    summary:
      "順序付きの子要素を横方向のboundedな平面へ置く。要素サイズと幅を変え、elastic、wrap、focus navigationの差を確かめられる。",
    demo: "plane",
    props: [
      p("fit", "適応", "select", "elastic", ["elastic", "wrap"]),
      p("gap", "間隔", "select", "sm", ["none", "sm", "md", "lg"]),
      p("items", "項目数", "select", "3", ["3", "4", "6"]),
      p("basis", "要素サイズ", "select", "2", ["1", "2", "3"]),
      p("available", "利用可能範囲", "select", "6", ["6", "8", "10"]),
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
      p(
        "label",
        "文章",
        "text",
        "自動保存を有効にする",
        [],
        "Enable automatic save",
      ),
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

export type DocsLocale = CatalogLocale;
export type ComponentCopy = CatalogDocumentationCopy;

export const COMPONENT_COPY = {
  ja: {
    "developer-model": {
      category: "思想と契約",
      summary:
        "開発者は子の順序、軸、適応方針を宣言し、ランタイムは同じ平面で空間を解決する。",
      philosophy:
        "ikasueのcomponentは見た目の箱ではなく、情報、操作、配置要求を一つの契約として持つ。近いplane ownerが要求を解決し、子は親の実装詳細を知らない。",
      useWhen: "情報の表示、編集、配置を同じplane modelで組み立てたいとき。",
      avoidWhen:
        "framework固有のwidget階層や、装飾だけのwrapperを新しい公開componentとして増やしたいとき。",
      implementation:
        "まず意味のあるcomponent contractを選び、`vertical`または`horizontal`で順序を宣言する。必要な空間は`resolvePlane`の結果として扱い、DOMの重なりで隠さない。",
      keyboard:
        "DOMの読み順をplaneの順序と一致させる。各widgetのTab、矢印、Escape、Enterの意味を、配置の都合で上書きしない。",
      accessibility:
        "planeはsemantic landmarkの代わりではない。見出し、label、role、状態名をcomponent contract側で公開し、構造を支援技術にも伝える。",
      goodFor: "情報密度の高い業務画面、編集と配置の組み合わせ",
      avoidFor: "装飾用container、自由な重なり、framework依存の状態管理",
      interaction:
        "情報を読み、選択や編集が必要なときだけ面積と操作能力を渡す。",
      propertyLabels: {},
    },
    "theme-root": {
      category: "基盤",
      summary:
        "OS font、白いcanvas、黒い構造線、意味のある状態色、密度、motionをdocument単位で供給する。",
      philosophy:
        "themeは装飾paletteではなく、すべてのcomponentが共有する判断規則。選択面、線、密度、motionだけを調整し、状態色を飾りにしない。",
      useWhen: "document全体の密度、選択、線、motionを一つの規則で揃えるとき。",
      avoidWhen:
        "componentごとに任意色を足したり、canvasと矛盾するsurface階層を作ったりするとき。",
      implementation:
        "アプリケーション境界に一つの`ThemeRoot`を置き、子孫へ意味のあるCSS tokenを継承させる。`motion: off`でも状態と方向は残す。",
      keyboard:
        "`ThemeRoot`はfocusを所有しない。子孫のfocus ring、Tab順、入力の手掛かりをそのまま保つ。",
      accessibility:
        "色とmotionだけに状態を預けない。減速やmotion offのときも、文章、icon、線、選択面で変化を示す。",
      goodFor: "document全体の表示規則、密度、状態表現の統一",
      avoidFor: "component単位の装飾テーマ、任意色のpalette管理",
      interaction: "子孫componentへ共通の表示規則を継承する。",
      propertyLabels: {
        density: "密度",
        selection: "選択面",
        motion: "動き",
        line: "境界線",
      },
    },
    text: {
      category: "基盤",
      summary:
        "静的な文章と編集欄を同じ情報componentとして扱い、editable capabilityがあるときだけ編集状態を持つ。",
      philosophy:
        "情報は最初からeditorではない。読む状態を標準にし、変更が必要な境界にだけ編集能力を加える。",
      useWhen: "metadata、短いform値、table cellのように通常は読む値に使う。",
      avoidWhen:
        "長文編集、rich text、常に入力状態を見せることが主目的のfieldには使わない。",
      implementation:
        "値を文章として描画し、必要な箇所に`editable`と最小限の`editor`種別を加える。確定した値は通常の状態更新として親へ返し、独自イベント名に依存しない。",
      keyboard:
        "EnterまたはF2で編集を開始し、Escapeで取消、Enterで確定する。Tabは確定して次のeditable valueへ移る。",
      accessibility:
        "編集時は実際のinputを使い、labelとエラーを読み上げ可能にする。表示時と編集時でaccessible nameを失わない。",
      goodFor: "metadata、短いform値、table cell、短いcommand",
      avoidFor: "長文編集、rich text、常時入力を主役にするfield",
      interaction: "読む状態から編集状態へ移り、確定または取消して戻る。",
      propertyLabels: {
        editable: "編集可能",
        editor: "編集形式",
        state: "差分状態",
        value: "値",
      },
    },
    rule: {
      category: "基盤",
      summary: "cardを作らず、意味の切れ目だけを一枚の線と余白で示す。",
      philosophy:
        "境界線はcontainerを増やすためではなく、隣り合う意味の差を一度だけ示す。二重囲いとsurface階層を作らない。",
      useWhen: "意味のある境界を余白と一本の線で示したいとき。",
      avoidWhen: "すべての領域を囲み、cardの分類を増やしたいとき。",
      implementation:
        "意味のある兄弟要素の間に`Rule`を置き、planeの向きに合わせて`axis`を選ぶ。見出し自体が境界を示すなら線を追加しない。",
      keyboard: "操作対象ではないため、Tab順に入れない。",
      accessibility:
        "構造を伝えるときはsemantic separatorを使い、装飾だけの線は支援技術から隠す。",
      goodFor: "章や領域の境界、方向を示す線",
      avoidFor: "cardの枠、反復する装飾border",
      interaction: "操作は持たず、余白と線で読みの境界を示す。",
      propertyLabels: { axis: "方向", weight: "太さ" },
    },
    "status-icon": {
      category: "基盤",
      summary:
        "status chipの代わりに、意味のあるicon、状態色、説明を組み合わせて状態を短く示す。",
      philosophy:
        "反復業務では状態を素早く認識できることが重要。ただし色や形だけに頼らず、accessible nameに言葉の説明を残す。",
      useWhen: "同期、検証、短い進行状態を反復表示するとき。",
      avoidWhen: "重要な状態を色だけ、または名前のないglyphだけで伝えるとき。",
      implementation:
        "安定したlabelとtooltipをiconに組み合わせる。黒は構造に使い、`kind`の色は状態だけに使う。",
      keyboard:
        "受動的な状態はTab順に入れない。詳しい説明を開く場合だけbuttonにしてfocus対象を見せる。",
      accessibility:
        "状態をaccessible nameまたは説明文に含め、iconの形や文章など色以外の手掛かりも添える。",
      goodFor: "同期状態、検証状態、短い進行状態の反復表示",
      avoidFor: "色だけで判断させる警告、説明のないiconの羅列",
      interaction: "受動的に状態を示し、必要ならfocusで説明を表示する。",
      propertyLabels: { kind: "状態", label: "説明" },
    },
    vertical: {
      category: "配置",
      summary:
        "順序付きの子要素を縦方向のplaneへ置き、elasticまたはwrapの方針とfocus navigationで高さに適応する。",
      philosophy:
        "開発者が宣言するのは子の順序、適応方針、focus、navigation。利用可能な高さへの割り当てはplane resolverが決定し、collapsedな子も順序を保ったままrailから選べる。",
      useWhen: "form、説明、作業列など、DOM順が縦の読み順になるとき。",
      avoidWhen: "横方向の比較や、意味のないwrapperを増やすためには使わない。",
      implementation:
        "`vertical(children, { fit, gap, available, focus, navigation })`で`PlaneSpec`を作り、各childの`basis`とboundedな`available`を指定する。`resolvePlane`のoffset、size、line、state、navigation boundsを描画へ反映する。",
      keyboard:
        "Tabは縦のDOM順に進める。矢印キーを子へ勝手に割り当てず、子componentのwidget契約を保つ。",
      accessibility:
        "単なるlayoutはlandmarkにしない。list、group、formなど実際の意味がある場合だけsemantic roleを付ける。",
      goodFor: "縦並びのform、説明、作業列",
      avoidFor: "横方向の関連項目、個別componentの選択状態の所有",
      interaction: "子の順序を保ち、狭い高さでは指定された方針で適応する。",
      propertyLabels: {
        fit: "適応",
        gap: "間隔",
        items: "項目数",
        basis: "要素サイズ",
        available: "利用可能範囲",
      },
    },
    horizontal: {
      category: "配置",
      summary:
        "順序付きの子要素を横方向のplaneへ置き、幅に応じてfocus navigation、縮小、または折返しで適応する。",
      philosophy:
        "横の関係は同じaxisの読み順として宣言する。狭いときも子の意味を別のoverlayや縮小しすぎる領域へ逃がさず、focusした領域とrailの状態を明示する。",
      useWhen: "toolbar、関連action、短い比較項目を横方向に並べるとき。",
      avoidWhen: "縦の読み順を無理に横へ押し込むとき。",
      implementation:
        "`horizontal(children, { fit, gap, available, focus, navigation })`を作り、各childの`basis`とboundedな`available`を指定する。`resolvePlane`が返すline、offset、size、state、navigation boundsを使って配置する。",
      keyboard:
        "Tab順は意味のあるDOM順を保つ。矢印キーはChoiceGroupやDataTableなど、所有するwidgetだけが使う。",
      accessibility:
        "横配置を読み上げ順の変更と誤解しないよう、見出しとlabelをDOM順に揃える。collapsedな領域もrailのregion selectionからfocusできる。",
      goodFor: "toolbar、関連action、短い比較項目",
      avoidFor: "長い文章、縦のform、overflowを隠すための横配置",
      interaction: "子の順序を保ち、幅が足りないときは契約した方針で適応する。",
      propertyLabels: {
        fit: "適応",
        gap: "間隔",
        items: "項目数",
        basis: "要素サイズ",
        available: "利用可能範囲",
      },
    },
    "icon-action": {
      category: "アクション",
      summary:
        "反復する操作をiconで短く示し、hoverとfocusで安定した説明を提供する。",
      philosophy:
        "操作の見た目は軽く保つが、意味は省略しない。icon、accessible label、tooltip、busy状態を同じ契約で扱う。",
      useWhen: "保存、追加、編集、削除など、利用者が反復して覚える操作に使う。",
      avoidWhen:
        "初回利用者に説明文が必要な主操作や、iconだけでは意味が曖昧な操作に使わない。",
      implementation:
        "実際のbuttonに`action`、stable label、`state`を渡す。busy中は二重実行を防ぐが、accessible nameと位置は保つ。",
      keyboard:
        "Tabでfocusし、EnterまたはSpaceで実行する。busy中もfocus ringを消さない。",
      accessibility:
        "icon-onlyでもaccessible nameを必須にし、hoverだけでなくfocusでもtooltipを表示する。",
      goodFor: "反復する保存、追加、編集、削除",
      avoidFor: "意味が一意でない主操作、説明文が必要な初回操作",
      interaction:
        "focusまたはhoverで説明を確認し、buttonとして一度だけ実行する。",
      propertyLabels: { action: "操作", state: "状態" },
    },
    "action-strip": {
      category: "アクション",
      summary:
        "関連するicon actionを同じbaselineに並べ、activeまたはbusyな操作だけを淡い面で強調する。",
      philosophy:
        "action groupに新しい箱を足さず、近接と順序で関係を示す。選択面は操作対象に面積を渡すために使う。",
      useWhen: "同じ対象へ繰り返し行う短い操作を一列でまとめるとき。",
      avoidWhen: "説明が長い操作、異なる対象の操作を一列へ混ぜるとき。",
      implementation:
        "`horizontal`でactionの順序を宣言し、各buttonの`active`と`busy`を個別に管理する。wrapperのsurfaceでgroupを囲まない。",
      keyboard: "Tabで順番に移動し、各buttonのEnterまたはSpaceを保つ。",
      accessibility:
        "groupに目的をlabelし、各icon actionに個別のaccessible nameを付ける。activeはaria-pressedなどnativeに近い状態で示す。",
      goodFor: "同じ対象への保存、履歴、更新などの操作列",
      avoidFor: "無関係な操作の寄せ集め、長文buttonの代替",
      interaction: "近い操作を認識し、activeな操作へ静かな面積を渡す。",
      propertyLabels: { active: "選択中", density: "密度" },
    },
    "boolean-text": {
      category: "情報と入力",
      summary: "空のcheckboxを主役にせず、文章全体を押して真偽を切り替える。",
      philosophy:
        "booleanの本体はboxではなく文章の意味。falseは静かに、trueはcheckと淡い選択面で示す。",
      useWhen: "自動保存、公開、同期など短い真偽設定を文章で説明できるとき。",
      avoidWhen:
        "選択肢が複数あるときや、長い説明と複雑なvalidationが必要なとき。",
      implementation:
        "label全体をnative checkboxのlabelとして扱い、`checked`と`label`を状態として管理する。CSSの色だけで値を表さない。",
      keyboard:
        "Tabでfocusし、Spaceで切り替える。label全体がfocus targetの意味を壊さない。",
      accessibility:
        "native checkboxとlabelを使い、checked状態を支援技術へ公開する。trueのcheckだけを頼りにしない。",
      goodFor: "短い真偽設定、自動保存、公開可否",
      avoidFor: "radio相当の選択、複雑なform field",
      interaction: "文章を読み、同じlabelを押して値を切り替える。",
      propertyLabels: { checked: "値", label: "文章" },
    },
    "choice-group": {
      category: "情報と入力",
      summary: "選択された意味へ面積を渡し、横・縦で同じ選択grammarを保つ。",
      philosophy:
        "選択は濃いborderではなく静かな面積で示す。ChoiceGroupは一つの値を即時に所有し、各choiceの意味は文章で残す。",
      useWhen: "少数の相互排他的な選択肢を同じplaneで比較するとき。",
      avoidWhen:
        "選択肢が多いとき、複数選択、長い説明、階層的な選択が必要なとき。",
      implementation:
        "native radio groupに近いcontractで`direction`と`selected`を管理し、`horizontal`または`vertical`で選択肢を並べる。",
      keyboard: "Tabでgroupへ入り、矢印キーで選択を移し、Spaceで現在値を選ぶ。",
      accessibility:
        "fieldsetとlegend、または適切なradio roleでgroup名を公開する。選択中は色以外に文章や選択面を残す。",
      goodFor: "少数の表示モード、密度、レビュー段階の選択",
      avoidFor: "複数選択、長いoption list、複雑な階層選択",
      interaction: "選択肢を比較し、選択中の値へ明確な面積を渡す。",
      propertyLabels: { direction: "方向", selected: "選択" },
    },
    "form-list": {
      category: "情報と入力",
      summary:
        "labelと情報値を縦の順序として示し、表示と編集を同じplaneで扱う。",
      philosophy:
        "formはboxの集合ではなく情報の順序。`FormList`がvaluesとstatusを所有し、子のfocusとdraftは編集途中の局所状態に留める。",
      useWhen:
        "短いmetadataや設定値を、読みやすいlabel/valueの列で編集するとき。",
      avoidWhen:
        "rich text editor、長い段階的form、値の所有権を子へ分散したいとき。",
      implementation:
        "`FormList`がvalues、validation status、確定結果を所有する。子`Text`にはfocusとdraftだけを渡し、child focus/draftで元データをrecolorしない。",

      keyboard:
        "Tabはeditable valueだけを順に移動し、Enter/F2で編集、Escapeで取消、EnterまたはTabで確定する。",
      accessibility:
        "各labelとfieldを明確に関連付け、errorやstatusをそのfieldへ紐付ける。draft中の見た目を保存済みデータの状態と混同させない。",
      goodFor: "短い設定、metadata、段階の少ない業務form",
      avoidFor: "長文編集、複雑なwizard、子がform stateを所有する構成",
      interaction: "labelを読み、必要な値だけ編集し、FormListへ結果を返す。",
      propertyLabels: { marker: "項目記号", state: "差分例" },
    },
    "data-table": {
      category: "データ",
      summary:
        "cellを操作単位にし、選択cellと同じrow/columnを淡く示して文脈を保つ。",
      philosophy:
        "tableはlayoutのための格子ではなく、データを判断するplane。選択、copy、paste、editをcell contractとして公開する。",
      useWhen: "業務データの比較、copy/paste、inline editが必要なとき。",
      avoidWhen: "単純な二列の説明や、layout目的で表を使いたいとき。",
      implementation:
        "行と列を`horizontal` planeの子として扱い、DataTableがcellの初期値、現在値、statusを所有する。選択やfocusはstatusを変えず、commitされた差分だけを描画する。clipboard失敗時も選択を残す。",
      keyboard:
        "矢印キーでcellを移動し、Home/Endでaxisの端へ移る。Ctrl/Cmd+C/V、Enter、F2はtable contractに従う。",
      accessibility:
        "caption、header、row/column scopeを正しく付け、現在cellと編集状態を公開する。row/columnの色は補助情報に留める。",
      goodFor: "業務データ、比較、copy/paste、inline edit",
      avoidFor: "カードgrid、装飾的な表、layout専用のtable",
      interaction:
        "cellを選び、行列の文脈を保ったままコピー、貼り付け、編集する。",
      propertyLabels: {
        editable: "編集",
        selection: "選択強調",
        changes: "差分例",
      },
    },
    "history-gutter": {
      category: "データ",
      summary: "線と点だけでrevisionを示し、選択revisionだけに面積を渡す。",
      philosophy:
        "変更履歴は別surfaceではなく、現在情報の横にある時間軸。線、点、差分色でrevisionの関係を読み取れるようにする。",
      useWhen: "現在値と過去revisionを同じ視野で比較したいとき。",
      avoidWhen: "長い監査ログや、履歴操作が主役で独立した画面が必要なとき。",
      implementation:
        "`vertical`でrevisionの順序を保ち、selected revisionへ面積を渡す。差分の色は文章や記号と組み合わせる。",
      keyboard:
        "Tabでgutterへ入り、矢印キーでrevisionを移動、Enterで選択を確定する。",
      accessibility:
        "revisionの時刻、作成者、状態をaccessible labelに含め、選択中のrevisionを明示する。線と点だけで意味を伝えない。",
      goodFor: "revision比較、変更の追跡、現在値への復帰",
      avoidFor: "独立した監査画面、無制限のevent log",
      interaction: "時間軸を読み、revisionを選んで現在の判断材料にする。",
      propertyLabels: { selected: "revision", compact: "簡潔表示" },
    },
    "progress-region": {
      category: "フィードバック",
      summary: "処理対象regionの内容を残したまま、そのplaneだけに進行を示す。",
      philosophy:
        "中央spinnerで対象を曖昧にしない。以前の情報を読めるまま残し、処理されているregionの面と状態を明示する。",
      useWhen: "既存情報を参照しながら非同期更新を待つとき。",
      avoidWhen: "対象が画面全体で、region単位の進行を説明できないとき。",
      implementation:
        "対象regionを`vertical`の子として維持し、`loading`と`pattern`をそのregionの状態にする。内容を空にしてspinnerへ置き換えない。",
      keyboard:
        "loading中も既存のfocusを不用意に奪わず、完了後の状態を同じ順序で読めるようにする。",
      accessibility:
        "busy状態と短い進行説明を公開し、motionをoffにしても以前の内容と完了状態を伝える。",
      goodFor: "保存、同期、部分更新、計算中のregion",
      avoidFor: "対象不明の全画面spinner、内容の不可逆な置換",
      interaction: "以前の情報を読みながら、対象regionの進行と完了を確認する。",
      propertyLabels: { loading: "処理中", pattern: "表現" },
    },
    "message-region": {
      category: "フィードバック",
      summary:
        "短いstatus messageを対象regionへ結び、必要ならそのplaneへ注意を移す。",
      philosophy:
        "通知を別の棚へ積まず、原因になった情報の近くへ戻れるlinkとして扱う。messageの色は状態を示すが、移動先と文章も残す。",
      useWhen:
        "保存結果、検証、同期など特定regionに結び付く短いmessageを示すとき。",
      avoidWhen:
        "長い説明、無関係なglobal announcement、複数対象を一つのmessageに混ぜるとき。",
      implementation:
        "`target`をplane上のregion idに結び、messageをbuttonまたはlinkとしてrenderする。クリック後は対象regionへfocusを戻す。",
      keyboard: "Tabでmessageへ移り、EnterまたはSpaceで対象regionへ移動する。",
      accessibility:
        "statusのkindと文章をlive regionに公開し、移動先のheadingやlabelへfocusを安全に置く。色だけで緊急度を示さない。",
      goodFor: "保存結果、検証、同期などregionに結び付く状態",
      avoidFor: "長文通知、対象のないglobal message、色だけの警告",
      interaction: "messageを読み、必要なら対象regionへ戻って対処する。",
      propertyLabels: { kind: "状態", target: "対象" },
    },
    "bottom-dialog": {
      category: "フィードバック",
      summary:
        "modalをZ軸へ重ねず、下端からplane内へrowを追加し、根拠を読みながら判断できるようにする。",
      philosophy:
        "dialogも情報を隠す例外にしない。決定領域が入る場所を明示し、上の内容を押し縮めて同じplaneに残す。",
      useWhen: "削除確認、短いsystem判断、補助commandを現在情報と並べるとき。",
      avoidWhen:
        "長いform、常設detail、根拠を隠さないと成立しない操作に使わない。",
      implementation:
        "`vertical`の最後にdialog rowを追加し、`intent`と`dismiss`をcontractとして管理する。close後はopenerへfocusを戻す。",
      keyboard:
        "開いたらdialog内の最初のactionへfocusし、Escapeで取消可能なら閉じる。確定後はopenerへ戻る。",
      accessibility:
        "dialogのlabel、説明、button名を公開し、behind contentを読み上げから隠さない。色とmotionは補助にする。",
      goodFor: "削除確認、短い判断、現在情報に紐付く補助command",
      avoidFor: "長いform、常設detail、根拠を覆い隠すmodal",
      interaction: "追加された下端rowで判断し、閉じたら元の情報とfocusへ戻る。",
      propertyLabels: { intent: "目的", dismiss: "取消可能" },
    },
  },
  en: {
    "developer-model": {
      category: "Philosophy & contracts",
      summary:
        "The developer declares child order, axis, and fit policy; the runtime resolves space on one shared plane.",
      philosophy:
        "An ikasue component is a contract for information, interaction, and placement—not a visual box. The nearest plane owner resolves allocation while children stay independent of parent implementation details.",
      useWhen:
        "You want information, editing, and placement to share one plane model.",
      avoidWhen:
        "You are adding a decorative wrapper or replacing a framework-specific widget and state model.",
      implementation:
        "Choose a meaningful component contract, declare order with `vertical` or `horizontal`, and treat `resolvePlane` output as layout data. Do not hide the result with overlapping DOM.",
      keyboard:
        "Keep DOM reading order aligned with plane order. Do not override each widget’s Tab, arrow, Escape, or Enter contract for layout convenience.",
      accessibility:
        "A plane is not a semantic landmark. Components still expose headings, labels, roles, and state names so assistive technology can understand the structure.",
      goodFor:
        "Information-dense workspaces combining data, editing, and placement",
      avoidFor:
        "Decorative containers, arbitrary overlap, framework-owned state replacement",
      interaction:
        "Read information first; give space and interaction capability only when selection or editing needs it.",
      propertyLabels: {},
    },
    "theme-root": {
      category: "Foundation",
      summary:
        "Provides OS fonts, a white canvas, black structural lines, semantic status colors, density, and motion at document scope.",
      philosophy:
        "Theme is a shared decision rule, not a decorative palette. Tune selection surface, lines, density, and motion; do not turn status colors into decoration.",
      useWhen:
        "A whole document needs one rule for density, selection, lines, and motion.",
      avoidWhen:
        "You are adding arbitrary per-component colors or surface layers that contradict the canvas.",
      implementation:
        "Place one `ThemeRoot` at the application boundary and inherit semantic CSS tokens. With `motion: off`, state and direction still remain visible.",
      keyboard:
        "`ThemeRoot` does not own focus. Preserve descendant focus rings, Tab order, and input cues.",
      accessibility:
        "Never make color or motion the only status cue. With reduced or disabled motion, use text, icons, lines, and selection surfaces.",
      goodFor: "Document-wide display rules, density, and status expression",
      avoidFor: "Per-component decoration themes and arbitrary color palettes",
      interaction: "Pass shared display rules down to descendant components.",
      propertyLabels: {
        density: "Density",
        selection: "Selection surface",
        motion: "Motion",
        line: "Boundary line",
      },
    },
    text: {
      category: "Foundation",
      summary:
        "Treats static copy and an editing field as one information component, entering edit mode only when the editable capability is present.",
      philosophy:
        "Information is not an editor by default. Reading is the calm baseline; add editing capability only at the boundary where a change is needed.",
      useWhen:
        "A metadata value, short form value, or table cell is normally read and sometimes changed.",
      avoidWhen:
        "Long-form editing, rich text, or a field whose primary purpose is always-on input.",
      implementation:
        "Render the value as text, add `editable` and the smallest `editor` kind where needed, and return the confirmed value through normal state updates without relying on a custom event name.",
      keyboard:
        "Enter or F2 starts editing, Escape cancels, and Enter confirms. Tab confirms before moving to the next editable value.",
      accessibility:
        "Use a real input while editing and keep its label and errors available. Do not lose the accessible name when switching between display and edit modes.",
      goodFor: "Metadata, short form values, table cells, and short commands",
      avoidFor: "Long-form editing, rich text, and always-on input fields",
      interaction:
        "Move from reading to editing, then return after confirming or cancelling.",
      propertyLabels: {
        editable: "Editable",
        editor: "Editor kind",
        state: "Change state",
        value: "Value",
      },
    },
    rule: {
      category: "Foundation",
      summary:
        "Shows a meaningful break with one line and space without creating a card.",
      philosophy:
        "A boundary line names a difference between adjacent meanings once; it does not multiply containers or surface levels.",
      useWhen:
        "A semantic boundary should be clear through one line and measured space.",
      avoidWhen: "Every region is being boxed to create a card taxonomy.",
      implementation:
        "Place `Rule` between meaningful siblings and choose `axis` to match the plane. If a heading already names the break, do not add a decorative line.",
      keyboard: "It is not interactive, so it stays out of the Tab order.",
      accessibility:
        "Use a semantic separator when the line conveys structure; hide purely decorative lines from assistive technology.",
      goodFor: "Section boundaries and directional structure",
      avoidFor: "Card borders and repeated decorative borders",
      interaction:
        "It has no action; space and one line establish a reading boundary.",
      propertyLabels: { axis: "Axis", weight: "Weight" },
    },
    "status-icon": {
      category: "Foundation",
      summary:
        "Combines a meaningful icon, semantic color, and a description to show a compact status.",
      philosophy:
        "Repeated work benefits from quick status recognition, but shape and color are not enough. Keep a spoken explanation in the accessible name.",
      useWhen:
        "A sync, validation, or short progress status repeats in a dense surface.",
      avoidWhen:
        "An important state would be communicated only by color or an unnamed glyph.",
      implementation:
        "Pair a stable label and tooltip with the icon. Black is structural; `kind` colors are reserved for status.",
      keyboard:
        "Passive status stays out of the Tab order. If details open, use a real button with a visible focus target.",
      accessibility:
        "Include the status in the accessible name or description, and add a non-color cue such as text or icon shape.",
      goodFor: "Repeated sync, validation, and short progress states",
      avoidFor: "Color-only warnings and unnamed icon collections",
      interaction:
        "Show status passively, with a focusable explanation when more detail is available.",
      propertyLabels: { kind: "Status", label: "Description" },
    },
    vertical: {
      category: "Layout",
      summary:
        "Places ordered children on a vertical plane and adapts to height with elastic or wrap plus focus navigation.",
      philosophy:
        "The developer declares order, fit, focus, and navigation. The plane resolver allocates available height; collapsed children keep their order and remain selectable from the rail.",
      useWhen:
        "A form, explanation, or work column reads in vertical DOM order.",
      avoidWhen:
        "Horizontal comparison or another decorative wrapper is the real need.",
      implementation:
        "Create `PlaneSpec` with `vertical(children, { fit, gap, available, focus, navigation })`, declare each child `basis` and bounded `available` extent, then render `offset`, `size`, `line`, `state`, and navigation bounds from `resolvePlane`.",
      keyboard:
        "Tab follows vertical DOM order. Do not assign arrow keys to children unless their own widget contract owns them.",
      accessibility:
        "A layout primitive is not a landmark. Add list, group, or form semantics only when the content has that meaning.",
      goodFor: "Vertical forms, explanations, and work columns",
      avoidFor: "Horizontal relationships and owning child selection state",
      interaction:
        "Preserve child order and adapt a tight height according to the declared policy.",
      propertyLabels: {
        fit: "Fit",
        gap: "Gap",
        items: "Items",
        basis: "Item basis",
        available: "Available extent",
      },
    },
    horizontal: {
      category: "Layout",
      summary:
        "Places ordered children on a horizontal plane and adapts to width with focus navigation, elastic allocation, or wrapping.",
      philosophy:
        "A horizontal relationship is an ordered reading axis. When width is tight, the resolver keeps the focused region readable and reports collapsed siblings instead of sending meaning into an overlay.",
      useWhen:
        "A toolbar, related action set, or short comparison belongs on one horizontal axis.",
      avoidWhen: "Vertical reading order is being forced into a row.",
      implementation:
        "Create `horizontal(children, { fit, gap, available, focus, navigation })`, declare each child `basis` and bounded `available` extent, and use `resolvePlane` output for line, offset, size, state, and navigation bounds.",
      keyboard:
        "Keep meaningful DOM order. Arrow keys belong to widgets such as ChoiceGroup or DataTable, not to layout by default.",
      accessibility:
        "Do not let horizontal placement silently change reading order. Keep headings and labels aligned with DOM order, and make collapsed regions reachable through region selection.",
      goodFor: "Toolbars, related actions, and short comparisons",
      avoidFor: "Long prose, vertical forms, and hiding overflow behind a row",
      interaction:
        "Preserve order and adapt a tight width according to the declared policy.",
      propertyLabels: {
        fit: "Fit",
        gap: "Gap",
        items: "Items",
        basis: "Item basis",
        available: "Available extent",
      },
    },
    "icon-action": {
      category: "Actions",
      summary:
        "Uses a compact icon for repeated work and provides a stable explanation on hover and focus.",
      philosophy:
        "Keep repeated actions visually light without dropping meaning. Icon, accessible label, tooltip, and busy state are one contract.",
      useWhen:
        "A save, add, edit, or delete action is repeated enough to become familiar.",
      avoidWhen:
        "A primary action needs an explanatory sentence or an icon would be ambiguous to a first-time user.",
      implementation:
        "Use a real button with `action`, stable label, and `state`. Busy prevents duplicate activation while preserving name and position.",
      keyboard:
        "Tab focuses it; Enter or Space activates it. Keep the focus ring visible while busy.",
      accessibility:
        "Require an accessible name for icon-only actions, and show the tooltip on focus as well as hover.",
      goodFor: "Repeated save, add, edit, and delete actions",
      avoidFor:
        "Ambiguous primary actions and first-use actions that need prose",
      interaction:
        "Confirm the explanation on focus or hover, then activate the button once.",
      propertyLabels: { action: "Action", state: "State" },
    },
    "action-strip": {
      category: "Actions",
      summary:
        "Aligns related icon actions on one baseline and gives quiet area to the active or busy action.",
      philosophy:
        "Do not add another box around an action group. Proximity and order establish the relationship; selection surface gives the active action area.",
      useWhen: "Several short actions repeatedly operate on the same subject.",
      avoidWhen:
        "Long actions or unrelated actions are being forced into one row.",
      implementation:
        "Declare action order with `horizontal` and track each button’s `active` and `busy` state independently. Avoid a wrapper surface for the group.",
      keyboard:
        "Move through the buttons with Tab and preserve each button’s Enter or Space behavior.",
      accessibility:
        "Label the group’s purpose and give every icon action its own accessible name. Expose active state with a native-like state such as `aria-pressed`.",
      goodFor: "Save, history, and refresh actions for one subject",
      avoidFor: "Unrelated collections and a long-button replacement",
      interaction:
        "Recognize the nearby actions and give quiet area to the active one.",
      propertyLabels: { active: "Active", density: "Density" },
    },
    "boolean-text": {
      category: "Information & input",
      summary:
        "Makes the sentence the target for toggling a boolean instead of centering an empty checkbox.",
      philosophy:
        "The boolean is the meaning of the sentence, not the box. False is quiet; true adds a check and a quiet selection surface.",
      useWhen:
        "A short sentence can explain a setting such as autosave, publishing, or sync.",
      avoidWhen:
        "There are several choices, long explanations, or complex validation rules.",
      implementation:
        "Use the full label as the native checkbox label and keep `checked` and `label` in state. Never use color alone to express the value.",
      keyboard:
        "Tab focuses it and Space toggles it. The full label remains a meaningful focus target.",
      accessibility:
        "Use a native checkbox and label and expose the checked state. Do not make the checkmark the only cue.",
      goodFor: "Short boolean settings such as autosave and publishing",
      avoidFor: "Radio-like choices and complex form fields",
      interaction:
        "Read the sentence and press the same label to toggle its value.",
      propertyLabels: { checked: "Value", label: "Sentence" },
    },
    "choice-group": {
      category: "Information & input",
      summary:
        "Gives area to the selected meaning while preserving one selection grammar in rows and columns.",
      philosophy:
        "Selection is a quiet surface, not a heavy border. ChoiceGroup owns one immediate value and keeps each option’s meaning in text.",
      useWhen:
        "A small set of mutually exclusive options should be compared on one plane.",
      avoidWhen:
        "There are many options, multiple selection, long explanations, or hierarchical choice.",
      implementation:
        "Manage `direction` and `selected` with a native-radio-like contract, placing choices with `horizontal` or `vertical`.",
      keyboard:
        "Enter the group with Tab, move with arrow keys, and choose the current value with Space.",
      accessibility:
        "Expose the group name with fieldset/legend or an appropriate radio role. Keep text and selection surface alongside color.",
      goodFor: "A few display modes, density options, or review stages",
      avoidFor:
        "Multiple selection, long option lists, and hierarchical choice",
      interaction: "Compare options and give clear area to the selected value.",
      propertyLabels: { direction: "Direction", selected: "Selected" },
    },
    "form-list": {
      category: "Information & input",
      summary:
        "Presents labels and values as a readable vertical order while keeping display and editing on one plane.",
      philosophy:
        "A form is an order of information, not a collection of boxes. `FormList` owns values and status; child focus and draft stay local to editing.",
      useWhen:
        "Short metadata or settings need a readable label/value sequence with occasional editing.",
      avoidWhen:
        "Rich text, long multi-step forms, or a design that distributes value ownership to children.",
      implementation:
        "Let `FormList` own values, validation status, and confirmed results. Pass only focus and draft to child `Text`; child focus/draft must not recolor source data.",
      keyboard:
        "Tab visits editable values, Enter/F2 starts editing, Escape cancels, and Enter or Tab confirms.",
      accessibility:
        "Associate each label and field and connect errors/status to that field. Do not make draft appearance look like a saved-data status.",
      goodFor: "Short settings, metadata, and low-step business forms",
      avoidFor: "Long editing, complex wizards, and child-owned form state",
      interaction:
        "Read a label, edit only the needed value, and return the result to FormList.",
      propertyLabels: { marker: "Item marker", state: "Example state" },
    },
    "data-table": {
      category: "Data",
      summary:
        "Makes the cell the task unit and lightly marks its row and column to preserve context.",
      philosophy:
        "A table is a data plane, not a grid used only for layout. Selection, copy, paste, and edit are explicit cell contracts.",
      useWhen: "Business data needs comparison, copy/paste, or inline editing.",
      avoidWhen:
        "A simple two-column explanation or a decorative layout table is enough.",
      implementation:
        "Treat rows and columns as horizontal plane children. DataTable owns each cell's initial value, current value, and status; focus and selection do not change status, and only committed differences render as modified. Keep selection usable when clipboard permission fails.",
      keyboard:
        "Arrow keys move by cell; Home/End reach axis extremes. Ctrl/Cmd+C/V, Enter, and F2 follow the table contract.",
      accessibility:
        "Use caption, headers, and row/column scope correctly; expose the current cell and edit state. Row/column color is only supporting information.",
      goodFor: "Business data, comparison, copy/paste, and inline editing",
      avoidFor: "Card grids, decorative tables, and layout-only tables",
      interaction:
        "Select a cell and copy, paste, or edit while preserving row and column context.",
      propertyLabels: {
        editable: "Editable",
        selection: "Selection emphasis",
        changes: "Example changes",
      },
    },
    "history-gutter": {
      category: "Data",
      summary:
        "Uses one line and points to show revisions and gives area only to the selected revision.",
      philosophy:
        "History is a timeline beside current information, not a separate surface. Line, points, and change cues should make revision relationships readable.",
      useWhen:
        "Current and previous revisions should remain in the same field of view.",
      avoidWhen:
        "A long audit log or a standalone history workspace is the real task.",
      implementation:
        "Keep revision order with `vertical` and give area to the selected revision. Pair change color with text or symbols.",
      keyboard:
        "Tab enters the gutter; arrow keys move between revisions and Enter confirms the selection.",
      accessibility:
        "Include time, author, and state in each accessible label and identify the selected revision. Do not rely on line and points alone.",
      goodFor:
        "Revision comparison, change tracking, and returning to a prior value",
      avoidFor: "Standalone audit screens and unbounded event logs",
      interaction:
        "Read the timeline and select a revision as evidence for the current decision.",
      propertyLabels: { selected: "Revision", compact: "Compact" },
    },
    "progress-region": {
      category: "Feedback",
      summary:
        "Keeps a region’s content readable while showing progress on that plane only.",
      philosophy:
        "A centered spinner should not obscure the target. Keep prior information visible and identify the region that is being processed.",
      useWhen:
        "Existing information remains useful while an async update runs.",
      avoidWhen:
        "The entire page is the target and a region-specific progress explanation would be misleading.",
      implementation:
        "Keep the target region as a `vertical` child and put `loading` and `pattern` in that region’s state. Do not replace its content with a spinner.",
      keyboard:
        "Do not steal existing focus during loading; keep the completed state in the same readable order.",
      accessibility:
        "Expose busy state and a short progress description. With motion off, prior content and completion remain understandable.",
      goodFor:
        "Save, sync, partial update, and in-progress calculation regions",
      avoidFor:
        "Targetless full-page spinners and irreversible content replacement",
      interaction:
        "Read prior information while confirming progress and completion for the target region.",
      propertyLabels: { loading: "Loading", pattern: "Pattern" },
    },
    "message-region": {
      category: "Feedback",
      summary:
        "Links a short status message to its target region and can move attention back to that plane.",
      philosophy:
        "Do not stack notices in a detached shelf. Make the message a route back to the information that caused it; keep target and prose alongside color.",
      useWhen:
        "A save, validation, or sync message belongs to one known region.",
      avoidWhen:
        "The explanation is long, global, or mixes several unrelated targets.",
      implementation:
        "Bind `target` to a region id and render the message as a button or link. After activation, return focus to the target region.",
      keyboard:
        "Tab reaches the message; Enter or Space moves to its target region.",
      accessibility:
        "Expose kind and prose in a live status and move focus safely to the target heading or label. Do not communicate urgency with color alone.",
      goodFor: "Save results, validation, and sync state tied to a region",
      avoidFor:
        "Long notices, targetless global messages, and color-only warnings",
      interaction:
        "Read the message and return to its target region when action is needed.",
      propertyLabels: { kind: "Status", target: "Target" },
    },
    "bottom-dialog": {
      category: "Feedback",
      summary:
        "Adds a bottom row inside the plane instead of covering evidence with a Z-axis modal.",
      philosophy:
        "A dialog is not an exception that hides information. It enters from a named edge, reallocates the plane, and leaves the evidence above it.",
      useWhen:
        "A delete confirmation, short system decision, or helper action belongs with current information.",
      avoidWhen:
        "A long form, permanent detail view, or decision that requires hiding its evidence.",
      implementation:
        "Append a dialog row to a `vertical` plane and manage `intent` and `dismiss` as its contract. Return focus to the opener after close.",
      keyboard:
        "Move focus to the first dialog action, close with Escape when dismissible, and return to the opener after confirmation or close.",
      accessibility:
        "Expose dialog label, description, and button names without hiding the content behind it. Color and motion remain supporting cues.",
      goodFor:
        "Delete confirmation, short decisions, and helper actions tied to current data",
      avoidFor: "Long forms, permanent detail, and evidence-obscuring modals",
      interaction:
        "Decide in the added bottom row, then return to the original information and focus.",
      propertyLabels: { intent: "Intent", dismiss: "Dismissible" },
    },
  },
} satisfies Record<DocsLocale, Record<CatalogComponentId, ComponentCopy>>;

type SourceRecipe = CatalogSourceRecipe;

export const COMPONENT_SOURCE_RECIPES: Record<
  CatalogComponentId,
  SourceRecipe
> = {
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
      '[{ id: "one", basis: 2, min: 1 }, { id: "two", basis: 2, min: 1 }, { id: "three", basis: 2, min: 1 }]',
    planeOptions:
      '{ fit: "elastic", gap: 2, available: 6, focus: "two", navigation: true }',
    componentProps:
      '{ fit: "elastic", gap: "md", items: "3", basis: "2", available: "6" }',
    ownership: "Vertical owns order and fit resolution, not child semantics.",
    rustState: "axis: Axis::Vertical, fit: Fit::Elastic",
  },
  horizontal: {
    axis: "horizontal",
    children:
      '[{ id: "one", basis: 2, min: 1 }, { id: "two", basis: 2, min: 1 }, { id: "three", basis: 2, min: 1 }]',
    planeOptions:
      '{ fit: "elastic", gap: 1, available: 6, focus: "two", navigation: true }',
    componentProps:
      '{ fit: "elastic", gap: "sm", items: "3", basis: "2", available: "6" }',
    ownership:
      "Horizontal owns order and fit resolution, not child keyboard behavior.",
    rustState: "axis: Axis::Horizontal, fit: Fit::Elastic",
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
    planeOptions:
      '{ fit: "elastic", gap: 1, available: 8, focus: "status", navigation: true }',
    componentProps:
      '{ editable: true, selection: "row-column", changes: true }',
    ownership:
      "DataTable owns cell selection and cell state; focus does not modify status, and only committed differences do. Clipboard failure does not erase selection.",
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
  plane: {
    axis: plane.axis,
    fit: plane.fit,
    gap: plane.gap,
    focus: plane.focus,
    navigation: plane.navigation,
  },
  ownership: ${JSON.stringify(recipe.ownership)},
};

renderPlane({ contract, resolved });
// resolved.children provides stable index, offset, size, and line values.`;
}

function rustSource(id: CatalogComponentId, recipe: SourceRecipe): string {
  const axis =
    recipe.axis === "vertical" ? "Axis::Vertical" : "Axis::Horizontal";
  const children: readonly [string, string] =
    recipe.axis === "vertical" ? ["filters", "results"] : ["save", "history"];
  return `#[derive(Debug)]
struct PlaneChild<'a> { id: &'a str, basis: f32, min: f32 }

#[derive(Debug)]
struct PlaneSpec<'a> {
    axis: Axis,
    fit: Fit,
    gap: f32,
    focus: Option<&'a str>,
    navigation: bool,
    children: Vec<PlaneChild<'a>>,
}

let plane = PlaneSpec {
    axis: ${axis},
    fit: Fit::Elastic,
    gap: 1.0,
    focus: Some("filters"),
    navigation: true,
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
  const recipe = COMPONENT_SOURCE_RECIPES[id];
  return {
    javascript: javascriptSource(id, recipe),
    rust: rustSource(id, recipe),
  };
}

const COMPONENT_PAGE_DESCRIPTIONS: Record<CatalogComponentId, string> = {
  "developer-model":
    "Information, editable capability, and negotiated layout as one contract.",
  "theme-root":
    "Document-level density, motion, selection, and structural tokens.",
  text: "Readable information with an optional editing capability.",
  rule: "A single semantic boundary without a container surface.",
  "status-icon":
    "Semantic state communicated by icon, color, and accessible explanation.",
  vertical:
    "A vertical plane that resolves ordered children against available height.",
  horizontal:
    "A horizontal plane that resolves ordered children against available width.",
  "icon-action":
    "A labeled, keyboard-ready icon-only action for repeated work.",
  "action-strip": "A quiet baseline group for related icon actions.",
  "boolean-text": "A sentence-shaped boolean control with native semantics.",
  "choice-group":
    "Single selection with the selected meaning owning quiet area.",
  "form-list": "A readable sequence of labels and information values.",
  "data-table":
    "Cell-oriented business data with selection, clipboard, and editing.",
  "history-gutter": "A compact revision timeline beside current information.",
  "progress-region":
    "Region-local progress that keeps useful previous content visible.",
  "message-region": "A status message linked to the region it explains.",
  "bottom-dialog":
    "A bottom-entering decision region that keeps evidence readable.",
};

export const COMPONENT_PAGE_COPY = Object.fromEntries(
  BASE_CATALOG_COMPONENTS.map((component) => {
    const description = COMPONENT_PAGE_DESCRIPTIONS[component.id];
    return [
      component.id,
      {
        ja: {
          title: `${component.name} / ${component.ja}`,
          description,
        },
        en: { title: component.name, description },
      },
    ];
  }),
) as Record<CatalogComponentId, Record<CatalogLocale, CatalogPageCopy>>;

export const COMPONENT_MATRIX_PAGE_COPY = {
  ja: {
    title: "Component matrix / コンポーネント一覧",
    description:
      "The current 17 runtime components and their planar responsibilities.",
  },
  en: {
    title: "Component matrix",
    description:
      "The current 17 runtime components and their planar responsibilities.",
  },
} as const satisfies Record<CatalogLocale, CatalogPageCopy>;

export const PHILOSOPHY_PAGE_COPY = {
  ja: {
    title: "Design philosophy / 平面適応UIの思想",
    description: "ikasueの平面中心の原則。",
  },
  en: {
    title: "Design philosophy",
    description: "The plane-centered principles behind ikasue.",
  },
} as const satisfies Record<CatalogLocale, CatalogPageCopy>;

export const CATALOG_PAGE_COPY = {
  philosophy: PHILOSOPHY_PAGE_COPY,
  ...COMPONENT_PAGE_COPY,
} as const satisfies Record<
  CatalogPageId,
  Record<CatalogLocale, CatalogPageCopy>
>;

const PHILOSOPHY_PRINCIPLES = {
  ja: [
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
      "収まる間は順序を保ち、必要になったときだけelastic、wrap、focus navigationへ決定的に適応する。",
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
  ],
  en: [
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
      "Preserve order while content fits, then deterministically adapt with elastic, wrap, and focus navigation without overflow-driven containers.",
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
  ],
} as const satisfies Record<CatalogLocale, readonly CatalogPrinciple[]>;

const PHILOSOPHY_DOCUMENTATION = {
  ja: {
    category: "思想と契約",
    summary: PHILOSOPHY_METADATA.summary,
    philosophy:
      "情報と操作は同じ平面に存在し、必要になった領域が所属するedgeから現れて既存空間を再配分する。",
    useWhen: "業務画面の情報、操作、配置を一枚のplane modelで考えるとき。",
    avoidWhen:
      "情報を隠すoverlay、装飾のためのcard階層、任意方向のmotionを使うとき。",
    implementation:
      "`PlaneSpec`のaxis、fit、gap、childrenを宣言し、`resolvePlane`のoffset、size、line、overflowを描画へ反映する。",
    keyboard:
      "DOMの読み順をplaneの順序と一致させ、各componentのTab、矢印、Escape、Enterの契約を保つ。",
    accessibility:
      "見出し、label、role、状態名を公開し、色、motion、配置だけに意味を預けない。",
    goodFor: "情報密度の高いworkspace、編集と配置の組み合わせ",
    avoidFor: "装飾用container、自由な重なり、根拠を隠すmodal",
    interaction:
      "情報を読み、必要な領域へ面積と操作能力を渡しながら仕事を進める。",
    propertyLabels: {},
  },
  en: {
    category: "Philosophy & contracts",
    summary:
      "Treat every UI as order and area allocation on one plane; new regions make room without covering existing information.",
    philosophy:
      "Information and interaction share one plane. New regions enter from their owning edge and reallocate existing space.",
    useWhen:
      "Information, interaction, and placement should be reasoned about with one plane model.",
    avoidWhen:
      "Information is being hidden behind overlays, decorative card layers, or arbitrary motion.",
    implementation:
      "Declare axis, fit, gap, and children in `PlaneSpec`, then render `offset`, `size`, `line`, and `overflow` from `resolvePlane`.",
    keyboard:
      "Keep DOM reading order aligned with plane order and preserve each component's Tab, arrow, Escape, and Enter contract.",
    accessibility:
      "Expose headings, labels, roles, and state names; never make color, motion, or placement the only cue.",
    goodFor: "Information-dense workspaces combining editing and placement",
    avoidFor:
      "Decorative containers, arbitrary overlap, and evidence-obscuring modals",
    interaction:
      "Read information and give area and interaction capability to the region needed for the task.",
    propertyLabels: {},
  },
} as const satisfies Record<CatalogLocale, CatalogDocumentationCopy>;

function registryProperties(
  component: (typeof BASE_CATALOG_COMPONENTS)[number],
  documentation: Readonly<Record<CatalogLocale, CatalogDocumentationCopy>>,
): readonly CatalogProperty[] {
  return component.props.map((property) => {
    const labelJa = documentation.ja.propertyLabels[property.key];
    const labelEn = documentation.en.propertyLabels[property.key];
    if (!labelJa || !labelEn) {
      throw new Error(
        `Missing bilingual property label for ${component.id}.${property.key}`,
      );
    }
    return {
      ...property,
      label: labelJa,
      labelJa,
      labelEn,
    };
  });
}

export const COMPONENT_REGISTRY = BASE_CATALOG_COMPONENTS.map((component) => {
  const documentation = {
    ja: COMPONENT_COPY.ja[component.id],
    en: COMPONENT_COPY.en[component.id],
  };

  return {
    id: component.id,
    kind: "component",
    category: component.cat,
    displayName: component.name,
    displayNameJa: component.ja,
    catalogSummaryJa: component.summary,
    summary: {
      ja: documentation.ja.summary,
      en: documentation.en.summary,
    } satisfies CatalogLocalizedText,
    properties: registryProperties(component, documentation),
    documentation,
    source: COMPONENT_SOURCE_RECIPES[component.id],
    page: COMPONENT_PAGE_COPY[component.id],
    demo: component.demo,
  };
}) satisfies readonly CatalogComponentRegistryEntry[];

const PHILOSOPHY_REGISTRY_ENTRY = {
  id: PHILOSOPHY_METADATA.id,
  kind: "concept",
  category: PHILOSOPHY_METADATA.cat,
  displayName: PHILOSOPHY_METADATA.name,
  displayNameJa: PHILOSOPHY_METADATA.ja,
  catalogSummaryJa: PHILOSOPHY_METADATA.summary,
  summary: {
    ja: PHILOSOPHY_METADATA.summary,
    en: PHILOSOPHY_DOCUMENTATION.en.summary,
  } satisfies CatalogLocalizedText,
  properties: PHILOSOPHY_METADATA.props,
  documentation: PHILOSOPHY_DOCUMENTATION,
  page: PHILOSOPHY_PAGE_COPY,
  demo: PHILOSOPHY_METADATA.demo,
  principles: PHILOSOPHY_PRINCIPLES,
} satisfies CatalogConceptRegistryEntry;

export const COMPONENT_DOCUMENTATION_COPY = COMPONENT_COPY;

export const CONCEPT_REGISTRY = [
  PHILOSOPHY_REGISTRY_ENTRY,
] as const satisfies readonly CatalogConceptRegistryEntry[];

export const CATALOG_REGISTRY = [
  ...CONCEPT_REGISTRY,
  ...COMPONENT_REGISTRY,
] as const satisfies readonly CatalogRegistryEntry[];

export const RUNTIME_COMPONENT_REGISTRY = COMPONENT_REGISTRY;

export const CATALOG_CONCEPTS = CONCEPT_REGISTRY.map(
  (concept): CatalogConceptMetadata => ({
    id: concept.id,
    cat: concept.category,
    name: concept.displayName,
    ja: concept.displayNameJa,
    summary: concept.catalogSummaryJa,
    demo: concept.demo,
    props: concept.properties,
  }),
) as readonly CatalogConceptMetadata[];

export const CATALOG_COMPONENTS = COMPONENT_REGISTRY.map(
  (component): CatalogComponentMetadata => ({
    id: component.id,
    cat: component.category,
    name: component.displayName,
    ja: component.displayNameJa,
    summary: component.catalogSummaryJa,
    demo: component.demo,
    props: component.properties,
  }),
) as unknown as typeof BASE_CATALOG_COMPONENTS;

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

export function findRegistryEntry(
  id: CatalogComponentId,
): CatalogComponentRegistryEntry;
export function findRegistryEntry(
  id: CatalogConceptId,
): CatalogConceptRegistryEntry;
export function findRegistryEntry(id: CatalogPageId): CatalogRegistryEntry;
export function findRegistryEntry(id: CatalogPageId): CatalogRegistryEntry {
  const entry = CATALOG_REGISTRY.find((item) => item.id === id);
  if (!entry) {
    throw new Error(`Unknown catalog registry entry: ${id}`);
  }
  return entry;
}

export const getRegistryEntry = findRegistryEntry;
export const findCatalogRegistryEntry = findRegistryEntry;

export function componentDocumentationCopy(
  locale: CatalogLocale,
  id: CatalogComponentId,
): CatalogDocumentationCopy {
  return findRegistryEntry(id).documentation[locale];
}

export const getComponentDocumentation = componentDocumentationCopy;
export const getComponentCopy = componentDocumentationCopy;
export const getComponentSource = componentSource;

export const PRINCIPLES = PHILOSOPHY_REGISTRY_ENTRY.principles.ja;
export const PRINCIPLES_EN = PHILOSOPHY_REGISTRY_ENTRY.principles.en;

export function componentPhilosophy(id: CatalogPageId): string {
  return findRegistryEntry(id).documentation.ja.philosophy;
}

export function componentMeta(
  id: CatalogPageId,
): readonly [string, string, string] {
  const copy = findRegistryEntry(id).documentation.ja;
  return [copy.useWhen, copy.avoidWhen, copy.keyboard];
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
