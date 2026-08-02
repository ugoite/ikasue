import type { CatalogComponentId } from "../../../src/catalog/types";

export type DocsLocale = "ja" | "en";

export interface ComponentCopy {
  readonly category: string;
  readonly summary: string;
  readonly philosophy: string;
  readonly useWhen: string;
  readonly avoidWhen: string;
  readonly implementation: string;
  readonly keyboard: string;
  readonly accessibility: string;
  readonly goodFor: string;
  readonly avoidFor: string;
  readonly interaction: string;
  readonly propertyLabels: Readonly<Record<string, string>>;
}

export interface ComponentUiCopy {
  readonly catalogLink: string;
  readonly demoId: string;
  readonly contract: string;
  readonly useWhen: string;
  readonly avoidWhen: string;
  readonly implementation: string;
  readonly integrationSketch: string;
  readonly properties: string;
  readonly propertiesCaption: (name: string) => string;
  readonly key: string;
  readonly type: string;
  readonly defaultValue: string;
  readonly values: string;
  readonly noProps: string;
  readonly behaviorAccessibility: string;
  readonly goodFor: string;
  readonly avoidFor: string;
  readonly interaction: string;
  readonly keyboard: string;
  readonly accessibility: string;
  readonly matrixNote: string;
  readonly matrixCaption: string;
  readonly component: string;
  readonly category: string;
  readonly summary: string;
  readonly demo: string;
  readonly openCatalog: string;
}

export const COMPONENT_COPY = {
  ja: {
    "developer-model": {
      category: "思想と契約",
      summary:
        "表示と編集を別の種類に分けず、情報へ編集能力を加える。配置は固定列ではなく軸と焦点の要求で決める。",
      philosophy:
        "情報、編集能力、配置要求を一つの契約で扱う。見た目のwrapperではなく、近い配置所有者が要求に答える。",
      useWhen: "情報の読み取り、編集、配置要求を同じ語彙で設計したいとき。",
      avoidWhen:
        "見た目だけのwrapperや、特定frameworkのcomponentモデルの代わりには使わない。",
      implementation:
        "まず情報componentを置き、必要なworkflowの境界だけに`editable`とeditor種別を加える。近い配置所有者に`ikasue:layout-request`を処理させる。",
      keyboard:
        "キーボードの順序を視覚的な読み順と揃える。編集はEnter、F2、Escape、Tabの契約に従う。",
      accessibility:
        "情報の役割と編集可能状態を分けて公開し、読み取り中か編集中かをスクリーンリーダーが識別できるようにする。",
      goodFor: "情報表示、編集可能な値、領域間の配置交渉",
      avoidFor: "装飾用wrapper、framework固有の状態管理の置き換え",
      interaction: "情報を読み、必要なときだけ編集能力を有効にする。",
      propertyLabels: {},
    },
    "theme-root": {
      category: "基盤",
      summary:
        "OSフォント、白いcanvas、黒い構造線、状態色、密度、motionをdocument単位で供給する。",
      philosophy:
        "themeは装飾presetではなく、全componentが共有する判断規則。選択面、線、密度、motionだけを調整する。",
      useWhen:
        "document全体の密度、motion、選択面、構造線を一つの規則で揃えるとき。",
      avoidWhen:
        "theme tokenを装飾paletteにしたり、canvasと矛盾するcomponent固有の上書きを重ねたりしない。",
      implementation:
        "アプリケーション境界に一つの`ThemeRoot`を置き、子孫へCSS custom propertyを継承させる。任意色ではなく意味のある状態tokenを使う。",
      keyboard:
        "`ThemeRoot`はfocusを所有しない。子孫のfocus ring、Tab順、入力の手掛かりをそのまま保つ。",
      accessibility:
        "motionがoffまたは減速指定のときも状態変化を構造的な手掛かりで示し、動きだけを情報にしない。",
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
        "静的な文章と入力欄を同じ情報componentとして扱う。編集可能なときだけ破線と編集cursorを持つ。",
      philosophy:
        "情報は最初からeditorではない。読む状態を標準にし、編集可能な情報だけが編集の手掛かりを持つ。",
      useWhen:
        "metadata、form値、table cell、短いcommandのように、通常は読み、必要時だけ編集する値に使う。",
      avoidWhen:
        "長い段階的form、rich text、常に入力状態を見せる必要がある欄には使わない。",
      implementation:
        "既定では値を文章として描画し、必要な境界だけに`editable`と最小限のeditor種別を加える。検証後に一度だけcommit eventを送る。",
      keyboard:
        "EnterまたはF2で編集を開始し、Escapeで取消、Enterで確定する。Tabは確定して次の編集可能な値へ移る。",
      accessibility:
        "編集時は実際のinputを使い、accessible nameを保つ。検証エラーは値を黙って置き換えずに通知する。",
      goodFor: "metadata、form値、table cell、短いcommand",
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
        "境界線はcontainerを作るためではなく、意味の切れ目を一度だけ示す。二重囲いと階層surfaceを作らない。",
      useWhen: "意味のある境界を、余白と一本の線で一度だけ示したいとき。",
      avoidWhen: "すべての領域を線で囲み、cardの分類を増やすためには使わない。",
      implementation:
        "意味のある兄弟要素の間に`Rule`を置き、layoutの向きに合わせて軸を選ぶ。見出しが境界を示すなら装飾線に留める。",
      keyboard: "操作対象ではないため、Tab順に入れない。",
      accessibility:
        "構造を伝えるときは意味のあるseparatorを使い、装飾だけの線は読み上げさせない。",
      goodFor: "章や領域の境界、方向を示す線",
      avoidFor: "cardの枠、装飾目的の反復border",
      interaction: "操作は持たず、余白と線で読みの境界を示す。",
      propertyLabels: { axis: "方向", weight: "太さ" },
    },
    "status-icon": {
      category: "基盤",
      summary:
        "status chipの代わりに、意味のあるiconと状態色を表示し、詳しい説明は必要時に示す。",
      philosophy:
        "反復業務では状態をiconと色で素早く認識できるようにする。ただし言語による説明をaccessible nameに残す。",
      useWhen: "反復する状態をiconと意味のある色で短く示せるとき。",
      avoidWhen:
        "重要な状態を色だけ、または名前のないglyphだけで伝えるためには使わない。",
      implementation:
        "安定したaccessible labelとtooltipをiconに組み合わせる。黒は構造に使い、状態色は状態だけに使う。",
      keyboard:
        "詳しい情報を開くならbuttonにしてfocus対象を見せる。受動的な状態はTab順に入れない。",
      accessibility:
        "状態をaccessible nameまたはlive descriptionに含め、iconの形や文章など色以外の手掛かりも添える。",
      goodFor: "同期状態、検証状態、短い進行状態の反復表示",
      avoidFor: "色だけで判断させる警告、説明のないiconの羅列",
      interaction: "受動的に状態を示し、必要ならfocusで説明を表示する。",
      propertyLabels: { kind: "状態", label: "説明" },
    },
    stack: {
      category: "配置",
      summary: "装飾なしで、縦方向の順序、gap、alignmentだけを予測可能に扱う。",
      philosophy:
        "`Stack`は縦順序だけを保証する。focusによる伸縮やoverflow navigationを含めず、基礎として保つ。",
      useWhen: "要素を予測可能な縦順序とgap、alignmentで並べたいとき。",
      avoidWhen:
        "focusの交渉、overflow navigation、装飾を`Stack`へ持ち込まない。それぞれの契約に分ける。",
      implementation:
        "最小の縦方向compositionに`Stack`を使い、子要素の意味のある順序をDOM順にも保つ。",
      keyboard: "キーボード動作を追加せず、子孫の通常のfocus順を保つ。",
      accessibility:
        "実際にlistやgroupであるときだけそのroleを使う。layoutだけではlandmarkにしない。",
      goodFor: "縦並びのform、説明、操作群",
      avoidFor: "focus配分、横方向のwrap、surfaceの管理",
      interaction: "子要素をDOM順に読み進める。",
      propertyLabels: { gap: "間隔", align: "揃え方" },
    },
    cluster: {
      category: "配置",
      summary: "関連する短い要素を横のbaselineに揃え、狭い画面ではwrapさせる。",
      philosophy:
        "`Cluster`は横配置とwrapだけを保証する。複雑な領域退避は`AxisFlow`へ委ねる。",
      useWhen: "関連する短い操作や値を同じ横のbaselineにまとめたいとき。",
      avoidWhen:
        "狭いviewportで重要な内容を隠すために使わず、配置の交渉には`AxisFlow`を使う。",
      implementation:
        "wrapを許し、意味のあるDOM順を保つ。選択中の子の軽い強調に留め、新しいcontainerを作らない。",
      keyboard:
        "子要素の操作モデルに従う。tabやchoiceを含む場合は、そのwidgetの矢印キー動作を実装する。",
      accessibility:
        "利用者に伝えるgroupingがあるときだけlabelを付け、空のgroup landmarkは追加しない。",
      goodFor: "短いaction群、tag群、同列の値",
      avoidFor: "領域の退避、overflow navigation、無関係な要素の一括配置",
      interaction: "子要素を横に読み、必要なら次の行へwrapする。",
      propertyLabels: { gap: "間隔", wrap: "折り返し", active: "選択中の子" },
    },
    "focus-plane": {
      category: "配置",
      summary:
        "隣接する複数領域がfocusに応じて幅を譲り、desktopとmobileで隣の領域へ移る。",
      philosophy:
        "`FocusPlane`はtaskへ空間を譲る。separatorは隣接領域の方向を示す操作線であり、自由なdragより意味のある状態遷移を優先する。",
      useWhen:
        "一覧とdetail、editorと履歴のように隣接領域が空間を競合するとき。",
      avoidWhen:
        "固定二列のmarketing layoutや、自由に動かすdrag splitterには使わない。",
      implementation:
        "初期focusを一つ決め、境界矢印をbuttonとして描画する。`FocusRegion`のlayout eventを受け、viewportに応じた比率を決める。",
      keyboard:
        "矢印操作で領域間のfocus配分を変える。片方が広がっても、もう片方のfocus可能な内容へ到達できるようにする。",
      accessibility:
        "各領域にlabelを付け、現在の配分を公開する。境界操作には意味の分かる名前を付ける。",
      goodFor: "一覧とdetail、文書と履歴、検索とpreview",
      avoidFor: "単純な二列文章layout、自由なサイズ変更UI",
      interaction: "境界の矢印または内部focusで、隣接領域へ空間を渡す。",
      propertyLabels: {
        initial: "初期focus",
        focusOnInput: "内部focusで拡張",
        collapse: "0幅を許可",
      },
    },
    "focus-region": {
      category: "配置",
      summary:
        "子componentが親`FocusPlane`を直接知らず、eventで必要な領域と比率を要求する。",
      philosophy:
        "visual treeとcomponent treeを疎結合にする。子の要求へ最も近い`FocusPlane`がviewportに応じた比率を決める。",
      useWhen:
        "子componentが親の配置実装を知らずに、必要な領域へfocusを要求するとき。",
      avoidWhen:
        "装飾的な内容からlayout requestを送り、近い所有者で足りるのにnamed scopeを使わない。",
      implementation:
        "`ikasue:layout-request`を`secondary`などのtargetでdispatchし、最も近い`FocusPlane`に実行可能な比率を決めさせる。",
      keyboard:
        "focus requestだけで現在のfocusを奪わない。component自身の操作が移動させる場合を除き、要求元のcontrolを保つ。",
      accessibility:
        "意味のある配置変更だけを通知し、要求された領域の見出しをaccessible contextとして残す。",
      goodFor: "子から親へのfocus配分要求、疎結合なlayout event",
      avoidFor: "装飾要素からの要求、親を直接操作するための参照",
      interaction: "子が要求を送り、近い配置所有者が実際の空間を決める。",
      propertyLabels: { target: "要求先", scope: "探索範囲" },
    },
    "axis-flow": {
      category: "配置",
      summary:
        "任意数の領域を横または縦の軸に並べ、収まらないときは軸の終端にnavigationを生やす。",
      philosophy:
        "無限に要素を受け入れるAPIと有限viewportを両立する。収まらなくなった瞬間に終端navigationへ切り替える。",
      useWhen:
        "多数のdashboard領域やtoolを一つの軸上に並べ、表示数が変わるとき。",
      avoidWhen: "通常のflowで収まる短い静的rowには使わない。",
      implementation:
        "`horizontal`または`vertical`とfocus strategyを選ぶ。同じ軸の終端navigationを描画し、画面外の内容も論理順に保つ。",
      keyboard:
        "選んだ軸の矢印キーで移動し、HomeとEndで最初と最後へ移る。終端controlもキーボードで到達できるようにする。",
      accessibility:
        "必要に応じてlabel付きregionまたはlistとして公開し、motionに頼らずactive itemと位置を通知する。",
      goodFor: "多数のworkspace領域、tool群、可変数のpanel",
      avoidFor: "短いrow、固定された少数の要素",
      interaction: "軸方向に移動し、収まらない要素は終端navigationから選ぶ。",
      propertyLabels: { axis: "軸", items: "項目数", strategy: "focus配分" },
    },
    "edge-region": {
      category: "配置",
      summary:
        "detailやtoolを所在する辺から追加し、既存内容を押し縮めて場所を作る。overlayしない。",
      philosophy:
        "新しい領域は存在場所と同じ辺から追加する。重なりではなくtrackの増加なので、元の情報との位置関係を保てる。",
      useWhen: "右、左、下など既知の辺からdetailやtoolを追加したいとき。",
      avoidWhen:
        "すべての文脈を中断する緊急alertには使わず、意味のあるlive regionを使う。",
      implementation:
        "`right`、`left`、`bottom`のtrackを追加する。閉じた状態ではcontentを覆わず、配分からtrackを外す。",
      keyboard:
        "triggerはbuttonにし、許可されていればEscapeで閉じる。閉じた後はtriggerへfocusを戻す。",
      accessibility:
        "必要な意味に応じてlabel付きregionまたはdialogを使い、modalでない領域にfocus trapを設定しない。",
      goodFor: "補助detail、tool、右側の設定領域",
      avoidFor: "緊急通知、長いform、文脈を覆うmodal",
      interaction: "指定した辺から開き、既存の領域を押して閉じる。",
      propertyLabels: { edge: "出現辺", initial: "初期状態" },
    },
    "bottom-dock": {
      category: "配置",
      summary:
        "上の情報を保ったまま下端に短い作業領域を追加し、平面内で場所を確保する。",
      philosophy:
        "確認や補助情報は下端の新しいrowとして追加する。上の文脈を読みながら判断できるため、根拠を隠さない。",
      useWhen:
        "短い確認、detail、commandを上の文脈を残したまま下から追加するとき。",
      avoidWhen: "長いformや常設navigationのためには使わない。",
      implementation:
        "目的とサイズを明示した下端rowとして扱い、controlを見せる前にlayout上の場所を確保する。",
      keyboard:
        "開くと最初の意味のあるcontrolへfocusを移し、DOM順に進める。閉じたらopen操作の元へfocusを戻す。",
      accessibility:
        "目的に合うheadingとlandmarkを付け、一時的にtaskを所有するときだけdialogの意味を使う。",
      goodFor: "削除確認、短い補助detail、command area",
      avoidFor: "長い入力、常設navigation、画面全体を塞ぐdialog",
      interaction: "下端から現れ、上の内容を押し縮めながら操作を受ける。",
      propertyLabels: { size: "高さ", purpose: "用途" },
    },
    "edge-nav": {
      category: "ナビゲーション",
      summary:
        "左端のrailを手掛かりとして残し、開くとmain contentを横へ押してnavigationを展開する。",
      philosophy:
        "navigationは必要なときだけ語彙を展開する。閉じてもrailとiconが地理的手掛かりとして残る。",
      useWhen:
        "常設のedge clueを保ちながら、要求時だけnavigationの語彙を広げたいとき。",
      avoidWhen:
        "名前のないiconに唯一のnavigationを隠したり、一時的なtool paletteに使ったりしない。",
      implementation:
        "railを常に見せ、左から展開してmain trackを再配分する。選択項目は両方の状態で見えるようにする。",
      keyboard:
        "railのtoggle、navigation項目、close操作を予測可能な順序にする。項目内では矢印キーを使えるようにする。",
      accessibility:
        "label付きnavigation landmark、実際のtoggle button、選択先を示す`aria-current`を使う。",
      goodFor: "workspace navigation、常設rail、複数の主要destination",
      avoidFor: "一時的なtool群、labelのないiconだけのnavigation",
      interaction: "railを手掛かりにし、開くと左から展開してmainを押す。",
      propertyLabels: { initial: "初期状態", selected: "選択先" },
    },
    "elastic-tabs": {
      category: "ナビゲーション",
      summary:
        "同じ階層の兄弟panelを切り替え、選択中のpanelへ面積と淡い選択面を譲る。",
      philosophy:
        "選択された情報へ面積を譲り、下線だけより明確に現在位置を示す。panelはtabと同じ方向から交代する。",
      useWhen:
        "同じ階層のpanelを一つずつ切り替え、選択中の内容に空間を渡したいとき。",
      avoidWhen:
        "無関係なdestination、名前を付けきれない多数のtab、同時比較が必要なpanelには使わない。",
      implementation:
        "近くて軽いpanelはautomatic activation、重いpanelはmanual activationにする。panelの出現方向をtab順と揃える。",
      keyboard:
        "矢印キーでtab間を移動し、HomeとEndで端へ移る。manual activationはEnterまたはSpaceで確定する。",
      accessibility:
        "`tablist`、`tab`、`tabpanel`、selected state、決定的なfocus関係を実装する。",
      goodFor: "同じ階層の単一panel切り替え、設定の章、workspace view",
      avoidFor: "複数panelの同時表示、別階層へのnavigation、長すぎるtab名",
      interaction: "tabを選ぶと、対応するpanelへ面積を渡して切り替える。",
      propertyLabels: {
        selected: "選択",
        activation: "有効化方式",
        directional: "方向の動き",
      },
    },
    "icon-action": {
      category: "アクション",
      summary: "反復する業務actionをiconで示し、hoverとfocusで説明を補う。",
      philosophy:
        "actionは反復されるほどiconだけで理解できる。初回学習と多言語対応はtooltip、accessible name、documentationが担う。",
      useWhen: "利用者が繰り返し行い、iconで意味を認識できるactionに使う。",
      avoidWhen:
        "新規、破壊的、曖昧なactionを、隣接labelや確認なしのiconだけで表さない。",
      implementation:
        "実際のbutton、安定したicon、accessible name、tooltipを使う。busy中もaction名を消さず、二重実行だけを防ぐ。",
      keyboard:
        "EnterとSpaceで実行する。disabledとbusyは実行できず、tooltipはhoverだけでなくkeyboard focusでも表示する。",
      accessibility:
        "iconだけのactionにaccessible labelを付け、focus時にも見えるtooltipを示す。状態を色だけで伝えない。",
      goodFor: "保存、追加、編集、削除など反復する短いaction",
      avoidFor: "意味が初見で分からないaction、確認が必要な破壊的action",
      interaction: "iconを押すかfocusして説明を確認し、buttonとして実行する。",
      propertyLabels: { action: "操作", state: "状態" },
    },
    "action-strip": {
      category: "アクション",
      summary:
        "関連するicon actionを一列に並べ、activeまたはbusyのactionだけを淡い面で強調する。",
      philosophy:
        "複数actionを箱で囲まず、近接と同じbaselineでgroup化する。activeやbusyだけを面で強調する。",
      useWhen: "密接に関連する複数のactionを静かに同じ列へ置きたいとき。",
      avoidWhen:
        "同じ行に入るという理由だけで無関係なactionをまとめず、主要navigationも入れない。",
      implementation:
        "label付き`IconAction`を順序通りに並べ、active actionを淡い選択面で示す。wrapはviewportに任せる。",
      keyboard:
        "本当のtoolbarならroving focusを使い、それ以外は通常のTab順で各actionを発見できるようにする。",
      accessibility:
        "toolbarである場合だけlabel付きtoolbarにし、各action自身の名前と状態も公開する。",
      goodFor: "保存、履歴、更新など近接した操作群",
      avoidFor: "主要navigation、無関係なactionの寄せ集め",
      interaction: "列のactionを個別に実行し、activeやbusyだけ面で確認する。",
      propertyLabels: { active: "選択中", density: "密度" },
    },
    "boolean-text": {
      category: "情報と入力",
      summary:
        "空のboxを描かず、文章全体を押して真偽を切り替える。trueはcheckと淡い面で示す。",
      philosophy:
        "booleanの本体はboxではなく文章の意味。falseは静かに、trueはcheckと選択面で示す。",
      useWhen:
        "文章そのものがboolean設定の意味であり、文章全体をhit targetにしたいとき。",
      avoidWhen:
        "密な標準form controlが必要なときや、labelだけでは意味を持てないときはnative checkboxを使う。",
      implementation:
        "文章の見た目を使いながらnative checkboxの意味を保ち、checkedをcheckと静かな面で示して即時changeする。",
      keyboard:
        "Spaceで値を切り替え、focusは文章のcontrolに残す。Enterの送信は周囲のformの規則に任せる。",
      accessibility:
        "見た目のboxを省いてもcheckbox role、checked state、labelの関連付けを保つ。",
      goodFor: "自動保存、設定、同意など短いboolean文",
      avoidFor: "複雑なform、boxの標準表示が重要な入力",
      interaction: "文章を押すかSpaceで、文章の意味を真偽として切り替える。",
      propertyLabels: { checked: "値", label: "文章" },
    },
    "choice-group": {
      category: "情報と入力",
      summary:
        "radio circleを前面に出さず、選択された意味へ少し面積を譲る単一選択group。",
      philosophy:
        "選択肢の中で現在値へ面積を渡す。`ElasticTabs`と同じselection grammarを使い、値は即時commitする。",
      useWhen: "一つだけ選び、選択された意味を少し広い面で示したいとき。",
      avoidWhen:
        "複数選択、page間navigation、検索して選ぶ方がよい多数の値には使わない。",
      implementation:
        "label付きgroupとradio semanticsを描画して即時選択する。横と縦で同じselection grammarを保つ。",
      keyboard:
        "group内の矢印キーで選択肢を変え、Tabではgroupへ入り、groupから一度に出る。",
      accessibility:
        "radiogroupとradio role、group label、checked state、選択面に依存しないfocus indicatorを公開する。",
      goodFor: "少数の単一選択、表示密度の異なるview選択",
      avoidFor: "複数選択、多数の検索可能な選択肢、page navigation",
      interaction: "候補を選ぶと、その候補へ面積を渡して即時に値を確定する。",
      propertyLabels: { direction: "方向", selected: "選択" },
    },
    "form-list": {
      category: "情報と入力",
      summary:
        "項目名の下へTextを並べ、boxの集合ではなく情報の順序としてformを表す。",
      philosophy:
        "formはboxの集合ではなく情報の順序。labelの下にTextを置き、Tabは編集可能な情報だけを移動する。",
      useWhen: "labelと情報値が読みやすい順序で並ぶformを作りたいとき。",
      avoidWhen:
        "密なspreadsheet編集や、native fieldsetとlegendの方がgroupingを伝えやすい場合には使わない。",
      implementation:
        "各labelの下にText値を置き、編集能力を局所化する。marker styleは意味を加える場合だけ使う。",
      keyboard:
        "Tabは編集可能な情報だけを移動する。各TextはEnter、F2、Escape、確定、検証の動作を保つ。",
      accessibility:
        "すべてのlabelをcontrolに関連付け、mixedやerror stateを文章とprogrammatic descriptionで公開する。",
      goodFor: "設定、metadata、順序を持つ読みやすいform",
      avoidFor: "spreadsheet編集、複雑なgrouping、長文入力",
      interaction: "上から読み、必要なTextだけを編集して次へ移る。",
      propertyLabels: { marker: "項目記号", state: "差分例" },
    },
    "data-table": {
      category: "データ",
      summary:
        "cellを操作単位にし、選択cellのrowとcolumnを淡く示してcopy、paste、editを支える。",
      philosophy:
        "cellが操作単位。選択cellを明確にしつつrowとcolumnの文脈は淡く残し、indexやlock iconを既定表示しない。",
      useWhen:
        "業務データを閲覧、copy、paste、編集し、cellが作業単位になるとき。",
      avoidWhen:
        "page layoutや、FormListの方が明快な小さなkey-value一覧には使わない。",
      implementation:
        "意味のあるheaderを保ち、cellを選択してrowとcolumnを淡く強調する。許可されたcellだけ編集可能にする。",
      keyboard:
        "矢印キーでcellを移動し、HomeとEndで軸内を移動する。CtrlまたはCmdとC、Vでclipboardを扱い、EnterまたはF2で編集する。",
      accessibility:
        "実際のtableとheaderを使い、選択を通知する。clipboard権限に失敗してもcellを使える状態に残す。",
      goodFor: "業務データ、cell単位の選択、copyとpaste、inline edit",
      avoidFor: "layout目的のtable、小さなkey-value情報",
      interaction:
        "cellを選び、周囲のrowとcolumnを確認しながら移動または編集する。",
      propertyLabels: {
        editable: "編集",
        selection: "選択強調",
        changes: "差分例",
      },
    },
    "history-gutter": {
      category: "データ",
      summary:
        "現在の情報の横に線と点でrevisionを示し、選択revisionだけを面で強調する。",
      philosophy:
        "変更履歴は別cardではなく、現在情報の横にある時間軸。線、点、差分色だけでrevisionを示す。",
      useWhen:
        "現在、previous、initialなどのrevisionを隣の情報と照合したいとき。",
      avoidWhen:
        "独立したaudit dashboardや、長いrevision説明を主flowに置く場合には使わない。",
      implementation:
        "一本の線とrevisionの点を描き、選択点だけを強調する。選択revisionを説明対象のcontentに結び付ける。",
      keyboard:
        "矢印キーでrevision間を移動し、Enterで選択する。focusは現在のcontentの近くに保つ。",
      accessibility:
        "gutterをlabel付きのrevision listまたはnavigationとして公開し、説明のない装飾線にしない。",
      goodFor: "現在値の横に置く短いrevision timeline",
      avoidFor: "独立した監査画面、長い履歴説明の一覧",
      interaction: "点を選び、隣のcontentで該当revisionを確認する。",
      propertyLabels: { selected: "revision", compact: "簡潔表示" },
    },
    "progress-region": {
      category: "フィードバック",
      summary:
        "以前のcontentを残したまま、処理中のregionだけに黒いwaveを流してloadingを示す。",
      philosophy:
        "中央spinnerで対象を不明にしない。対象regionに黒いmotionを流し、以前の情報を読めるままにする。",
      useWhen: "既存のcontentも文脈として役立つ既知のregionが処理中のとき。",
      avoidWhen:
        "局所的な処理でdocument全体を覆ったり、有用な結果をindeterminate spinnerで置き換えたりしない。",
      implementation:
        "古いcontentをmountしたままregionにwave、scan、edgeの構造的なmotionを加え、処理終了時に外す。",
      keyboard:
        "無関係なfocusを止めず、二重実行を起こすcontrolだけを無効にする。",
      accessibility:
        "regionをbusyとして示し、簡潔なlive statusを提供する。減速指定でも構造でbusyを示す。",
      goodFor: "検索結果、panel、tableなど局所的な処理状態",
      avoidFor: "document全体のloading、既存contentを隠すspinner",
      interaction: "対象regionを読み続けながら、処理の完了を待つ。",
      propertyLabels: { loading: "処理中", pattern: "表示パターン" },
    },
    "message-region": {
      category: "フィードバック",
      summary:
        "短いstatus messageを対象regionに結び、押すとそのregionへfocusと空間を渡す。",
      philosophy:
        "messageを通知棚へ積まず、対象regionへのlinkとして機能させる。押すと一時的にその領域を強調する。",
      useWhen:
        "短いstatusを特定regionに結び、選択時にそのregionへ注意を向けたいとき。",
      avoidWhen:
        "global notification queueとして使ったり、status colorだけにwarningを依存させたりしない。",
      implementation:
        "messageをtargetへ結び、意味のある状態色を控えめに使う。activate時だけ一時的なfocus配分を要求する。",
      keyboard:
        "操作可能なmessageはbuttonにしてEnterとSpaceを受け、regionが落ち着いた後のfocusを予測可能に戻す。",
      accessibility:
        "必要なら新しいstatusをlive regionで伝え、文章labelを付ける。messageとtargetを説明的な関係で結ぶ。",
      goodFor: "validation、同期、処理結果を対象regionへ結ぶ短いmessage",
      avoidFor: "global toast、色だけのwarning、対象のない通知",
      interaction:
        "messageを選ぶと対象regionが広がり、関連する状態を確認できる。",
      propertyLabels: { kind: "状態", target: "対象" },
    },
    "bottom-dialog": {
      category: "フィードバック",
      summary:
        "modalを上へ重ねず、下端から平面内へdialogを追加し、上の情報を読みながら判断できる。",
      philosophy:
        "dialogもZ軸へ逃がさない。下端からrowを追加して元の情報を押し縮め、不可逆判断でも根拠を隠さない。",
      useWhen:
        "削除確認など、根拠となる情報を見ながら短い判断をしてほしいとき。",
      avoidWhen:
        "長いform、無関係なnavigation、別のmodal policyが必要な完全遮断alertには使わない。",
      implementation:
        "heading、primary action、dismiss actionを持つ下端rowを追加し、trackを再配分する。z-index overlayは使わない。",
      keyboard:
        "開いたらheadingまたは最初のactionへfocusを移す。本当にmodalな判断だけTabを閉じ込め、許可されていればEscapeで閉じる。",
      accessibility:
        "一時的な判断にだけdialog semanticsを使い、headingでlabelし、意図を説明してopen操作元へfocusを戻す。",
      goodFor: "削除確認、短いsystem判断、補助command",
      avoidFor: "長いform、常設detail、完全に文脈を遮るalert",
      interaction:
        "下端から追加されたdialogで判断し、閉じると元のfocusへ戻る。",
      propertyLabels: { intent: "目的", dismiss: "取消可能" },
    },
  } satisfies Record<CatalogComponentId, ComponentCopy>,
  en: {
    "developer-model": {
      category: "Philosophy & contracts",
      summary:
        "Treat display and editing as capabilities of information, while layout follows axis and focus requests instead of fixed columns.",
      philosophy:
        "Use one contract for information, editing capability, and layout requests. The nearest layout owner answers the request; this is not a visual wrapper.",
      useWhen:
        "You need one vocabulary for readable information, editing, and negotiated placement.",
      avoidWhen:
        "Do not use it as a visual wrapper or as a replacement for a framework-specific component model.",
      implementation:
        "Start with an information component, then add `editable` and the smallest editor kind at the workflow boundary. Let the nearest owner handle `ikasue:layout-request`.",
      keyboard:
        "Keep keyboard order equal to visual reading order. Editing follows Enter, F2, Escape, and Tab contracts.",
      accessibility:
        "Expose information role and editable state separately so a screen reader can distinguish reading from editing.",
      goodFor:
        "Information display, editable values, and negotiated region layout",
      avoidFor:
        "Decorative wrappers and framework-specific state-model replacement",
      interaction:
        "Read information by default and enable editing only at the capability boundary.",
      propertyLabels: {},
    },
    "theme-root": {
      category: "Foundation",
      summary:
        "Provides document-level rules for OS typography, the white canvas, structural black, state colors, density, and motion.",
      philosophy:
        "Theme is a shared decision system, not a decorative preset. Adjust selection surfaces, lines, density, and motion consistently.",
      useWhen:
        "You need one document-wide source for density, motion, selection surfaces, and structural lines.",
      avoidWhen:
        "Do not turn theme tokens into a decorative palette or layer component overrides that contradict the canvas.",
      implementation:
        "Mount one `ThemeRoot` at the application boundary and let descendants inherit CSS custom properties. Prefer semantic state tokens over arbitrary colors.",
      keyboard:
        "`ThemeRoot` owns no focus. Preserve descendant focus rings, tab order, and input affordances.",
      accessibility:
        "When motion is off or reduced, keep state changes visible through structural cues instead of motion alone.",
      goodFor: "Document-wide display rules, density, and state treatment",
      avoidFor:
        "Component-local decorative themes and arbitrary color palettes",
      interaction:
        "Descendants inherit shared display rules without adding an interactive surface.",
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
        "Treat static text and text input as one information component, adding editing cues only when the value is editable.",
      philosophy:
        "Information is not an editor by default. Reading is the default state; editable information owns the editing cues.",
      useWhen:
        "A value is mostly read but sometimes edited, such as metadata, a form value, a table cell, or a short command.",
      avoidWhen:
        "Do not use it for long multi-step forms, rich text, or permanently prominent input.",
      implementation:
        "Render the value as text by default. Add `editable` and the smallest suitable editor at the capability boundary, then emit one commit event after validation.",
      keyboard:
        "Enter or F2 starts editing, Escape cancels, Enter commits, and Tab commits before moving to the next editable value.",
      accessibility:
        "Use a real input while editing, preserve its accessible name, and announce validation errors without silently replacing the value.",
      goodFor: "Metadata, form values, table cells, and short commands",
      avoidFor: "Long-form editing, rich text, and always-on input fields",
      interaction:
        "Move from reading to editing, then commit or cancel back to reading.",
      propertyLabels: {
        editable: "Editable",
        editor: "Editor",
        state: "Change state",
        value: "Value",
      },
    },
    rule: {
      category: "Foundation",
      summary:
        "States a meaningful boundary once with space and a single line, without creating a card.",
      philosophy:
        "A rule marks a boundary rather than creating a container. Avoid nested frames and surface hierarchies.",
      useWhen:
        "A meaningful boundary should be stated once with space and one line.",
      avoidWhen:
        "Do not wrap every region in rules; repeated borders create the card taxonomy this system avoids.",
      implementation:
        "Place `Rule` between meaningful siblings and choose its axis from layout direction. Keep it decorative when a heading already states the boundary.",
      keyboard: "Rule is not interactive and must not enter the tab sequence.",
      accessibility:
        "Use a semantic separator when it conveys structure; do not announce purely decorative lines.",
      goodFor: "Section boundaries and directional separators",
      avoidFor: "Card frames and repeated decorative borders",
      interaction:
        "It has no interaction; space and a line clarify reading boundaries.",
      propertyLabels: { axis: "Axis", weight: "Weight" },
    },
    "status-icon": {
      category: "Foundation",
      summary:
        "Uses a meaningful icon and state color instead of a status chip, with detail available on demand.",
      philosophy:
        "Repeated work benefits from quick icon-and-color recognition, but language remains available in the accessible name.",
      useWhen:
        "A repeated status can be recognized by an icon and semantic color.",
      avoidWhen:
        "Do not make color or an unlabeled glyph the only explanation for an important state.",
      implementation:
        "Pair the icon with a stable accessible label and tooltip. Keep black for structure and reserve status colors for status.",
      keyboard:
        "If it opens detail, make it a button with a visible focus target. A passive status remains out of the tab sequence.",
      accessibility:
        "Expose state in the accessible name or live description, and add a non-color cue such as shape or text.",
      goodFor: "Repeated sync, validation, and progress states",
      avoidFor: "Color-only warnings and unlabeled icon collections",
      interaction:
        "Show status passively, with explanation available on focus when needed.",
      propertyLabels: { kind: "Status", label: "Label" },
    },
    stack: {
      category: "Layout",
      summary:
        "Provides predictable vertical order, gap, and alignment without decoration.",
      philosophy:
        "`Stack` guarantees vertical order only. Focus expansion and overflow navigation belong to other contracts.",
      useWhen: "Children need predictable vertical order, gap, and alignment.",
      avoidWhen:
        "Do not put focus negotiation, overflow navigation, or decoration into `Stack`; keep those contracts separate.",
      implementation:
        "Use `Stack` for the smallest vertical composition and preserve meaningful child order in the DOM.",
      keyboard:
        "Add no keyboard behavior; descendants keep normal sequential focus.",
      accessibility:
        "Use list or group roles only when content is actually a list or group. Layout alone is not a landmark.",
      goodFor: "Vertical forms, explanations, and action groups",
      avoidFor: "Focus allocation, horizontal wrapping, and surface management",
      interaction: "Children are read and reached in DOM order.",
      propertyLabels: { gap: "Gap", align: "Alignment" },
    },
    cluster: {
      category: "Layout",
      summary:
        "Aligns related short elements on a horizontal baseline and wraps them when space is tight.",
      philosophy:
        "`Cluster` guarantees horizontal placement and wrapping. Complex region evacuation belongs to `AxisFlow`.",
      useWhen:
        "Related short actions or values share a horizontal baseline and may wrap.",
      avoidWhen:
        "Do not hide important content when the viewport is tight; use `AxisFlow` for negotiated space.",
      implementation:
        "Allow wrapping and preserve meaningful DOM order. Keep selected-child emphasis light instead of creating another container.",
      keyboard:
        "Use the children’s interaction model. Tabs or choices inside it keep their widget-specific arrow-key behavior.",
      accessibility:
        "Add a group label only when the grouping is user-facing; do not add an empty group landmark.",
      goodFor: "Short action groups, tags, and same-line values",
      avoidFor:
        "Region evacuation, overflow navigation, and unrelated grouping",
      interaction:
        "Read across the row, wrapping to the next line when necessary.",
      propertyLabels: { gap: "Gap", wrap: "Wrap", active: "Active child" },
    },
    "focus-plane": {
      category: "Layout",
      summary:
        "Lets adjacent regions yield width to focus, with directional controls for moving to a neighbor.",
      philosophy:
        "`FocusPlane` gives space to the task. Its separator is an operation line that names direction, not a free-form drag splitter.",
      useWhen:
        "Adjacent regions compete for space, such as list and detail or editor and history.",
      avoidWhen:
        "Do not use it for a fixed two-column marketing layout or a free-form drag splitter.",
      implementation:
        "Choose an initial focus, render a separator button, and let the nearest `FocusPlane` resolve `FocusRegion` layout events for the viewport.",
      keyboard:
        "Arrow controls change allocation between regions. Focusable content remains reachable when the other region expands.",
      accessibility:
        "Label each region, expose the current allocation, and give separator controls understandable names.",
      goodFor: "List/detail, document/history, and search/preview workspaces",
      avoidFor: "Simple two-column copy and freeform resizing",
      interaction:
        "A separator or internal focus gives space to the adjacent region.",
      propertyLabels: {
        initial: "Initial focus",
        focusOnInput: "Expand on internal focus",
        collapse: "Allow zero width",
      },
    },
    "focus-region": {
      category: "Layout",
      summary:
        "Lets a child request space from its nearest `FocusPlane` through an event instead of a direct reference.",
      philosophy:
        "Keep visual and component trees loosely coupled. The nearest `FocusPlane` turns the child’s request into a feasible ratio.",
      useWhen:
        "A nested component needs space without knowing its parent’s layout implementation.",
      avoidWhen:
        "Do not dispatch requests from decorative content or use named scopes when nearest ownership is sufficient.",
      implementation:
        "Dispatch `ikasue:layout-request` with a target such as `secondary`; the nearest `FocusPlane` resolves the viewport ratio.",
      keyboard:
        "A layout request must not steal focus. Keep the originating control focused unless its own interaction explicitly moves it.",
      accessibility:
        "Announce only meaningful layout changes and retain the requested region’s heading as accessible context.",
      goodFor: "Child-to-parent focus allocation and decoupled layout events",
      avoidFor: "Decorative requests and direct parent manipulation",
      interaction:
        "The child requests; the nearest layout owner decides the actual space.",
      propertyLabels: { target: "Target", scope: "Scope" },
    },
    "axis-flow": {
      category: "Layout",
      summary:
        "Accepts any number of regions on one axis and adds end navigation when the viewport cannot fit them.",
      philosophy:
        "Reconcile an unbounded item API with a finite viewport. When items no longer fit, turn the axis end into navigation.",
      useWhen:
        "Many dashboard regions or tools share an axis and the visible count changes.",
      avoidWhen:
        "Do not use it for a short static row that ordinary flow can handle.",
      implementation:
        "Choose `horizontal` or `vertical` and a focus strategy. Render end navigation on that axis while preserving logical order off screen.",
      keyboard:
        "Arrow keys follow the chosen axis; Home and End reach the extremes, and the end control remains keyboard reachable.",
      accessibility:
        "Expose a labeled region or list when appropriate, and announce active item and position without relying on motion.",
      goodFor: "Large workspaces, tool groups, and variable panel counts",
      avoidFor: "Short rows and fixed small sets of elements",
      interaction:
        "Move along the axis and choose overflow items from end navigation.",
      propertyLabels: {
        axis: "Axis",
        items: "Item count",
        strategy: "Focus strategy",
      },
    },
    "edge-region": {
      category: "Layout",
      summary:
        "Adds detail or tooling from its named edge and makes room by pushing existing content, never overlaying it.",
      philosophy:
        "New regions enter from the edge where they belong. A new track preserves the spatial relationship with the original information.",
      useWhen:
        "Detail or tooling belongs to a known edge and should reclaim space by pushing current content.",
      avoidWhen:
        "Do not use it for an urgent alert that must interrupt all context; use a semantic live region instead.",
      implementation:
        "Add a `right`, `left`, or `bottom` track. Closed removes the track from allocation rather than painting over content.",
      keyboard:
        "Use a button for the trigger, allow Escape to close when permitted, and return focus to the trigger after closing.",
      accessibility:
        "Use a labeled region or dialog only when its semantics require it; never trap focus in a non-modal region.",
      goodFor: "Auxiliary detail, tooling, and right-side settings",
      avoidFor: "Urgent notices, long forms, and context-covering modals",
      interaction:
        "Open from the named edge, push existing space, and close back into the original allocation.",
      propertyLabels: { edge: "Opening edge", initial: "Initial state" },
    },
    "bottom-dock": {
      category: "Layout",
      summary:
        "Adds a short work area at the bottom while keeping the upper context visible in the same plane.",
      philosophy:
        "Confirmation and supporting information become a new bottom row, so the evidence for a decision stays readable.",
      useWhen:
        "A short confirmation, detail view, or command area should enter from the bottom while context remains visible.",
      avoidWhen:
        "Do not use it for a long form or a permanent navigation system.",
      implementation:
        "Treat the dock as an explicit bottom row with purpose and size. Reserve layout space before revealing its controls.",
      keyboard:
        "Move focus to the first meaningful control on open, follow DOM order, and return focus to the opener on close.",
      accessibility:
        "Give the dock an appropriate heading and landmark; use dialog semantics only when it temporarily owns the task.",
      goodFor:
        "Delete confirmation, short supporting detail, and command areas",
      avoidFor:
        "Long input, permanent navigation, and context-blocking dialogs",
      interaction:
        "Enter from below, push the upper content, and receive the short task.",
      propertyLabels: { size: "Height", purpose: "Purpose" },
    },
    "edge-nav": {
      category: "Navigation",
      summary:
        "Keeps a persistent rail clue and expands from the left by pushing the main content aside.",
      philosophy:
        "Navigation expands its vocabulary only when needed. The closed rail and icons retain a geographic clue.",
      useWhen:
        "Primary navigation needs a persistent edge clue but should expand only on request.",
      avoidWhen:
        "Do not hide the only navigation path behind an unlabeled icon or use it for a transient tool palette.",
      implementation:
        "Keep the rail visible, expand from the left, and reallocate the main track. Keep the selected item visible in both states.",
      keyboard:
        "Keep rail toggle, navigation items, and close action predictable. Arrow keys may move within the navigation list.",
      accessibility:
        "Use a labeled navigation landmark, a real toggle button, and `aria-current` for the selected destination.",
      goodFor: "Workspace navigation, persistent rails, and major destinations",
      avoidFor: "Transient tools and icon-only unlabeled navigation",
      interaction:
        "Use the rail as a clue; opening it expands from the left and pushes the main track.",
      propertyLabels: { initial: "Initial state", selected: "Selected item" },
    },
    "elastic-tabs": {
      category: "Navigation",
      summary:
        "Switches sibling panels and gives the selected panel area and a quiet selection surface.",
      philosophy:
        "Area makes the current information clearer than an underline alone. Panels change from the same direction as tab order.",
      useWhen:
        "Siblings share one level and switching should grant space to the selected panel.",
      avoidWhen:
        "Do not use tabs for unrelated destinations, unnamed tab sprawl, or simultaneous panel comparison.",
      implementation:
        "Use automatic activation for nearby cheap panels and manual activation for expensive panels. Align panel entry with tab order.",
      keyboard:
        "Arrow keys move between tabs, Home and End jump to extremes, and Enter or Space activates manual tabs.",
      accessibility:
        "Implement `tablist`, `tab`, `tabpanel`, selected state, and a deterministic focus relationship.",
      goodFor: "Single-panel switching within one level and workspace views",
      avoidFor:
        "Simultaneous comparison, cross-level navigation, and overly long tab names",
      interaction: "Select a tab and give its panel the available area.",
      propertyLabels: {
        selected: "Selected",
        activation: "Activation",
        directional: "Directional motion",
      },
    },
    "icon-action": {
      category: "Actions",
      summary:
        "Represents repeated work actions with icons, adding explanation on hover and focus.",
      philosophy:
        "Repeated actions become recognizable as icons. Tooltips, accessible names, and documentation handle learning and language.",
      useWhen:
        "An action is repeated often enough for its icon to be familiar.",
      avoidWhen:
        "Do not use an icon-only action for a novel, destructive, or ambiguous action without adjacent labeling or confirmation.",
      implementation:
        "Use a real button, stable icon, accessible name, and tooltip. Busy state prevents duplicate activation without erasing the action name.",
      keyboard:
        "Enter and Space activate. Disabled and busy states cannot activate, and tooltips appear on keyboard focus as well as hover.",
      accessibility:
        "Every icon-only action has an accessible label and a visible focus tooltip; state is not conveyed by color alone.",
      goodFor: "Repeated save, add, edit, and delete actions",
      avoidFor:
        "Unfamiliar actions and destructive actions without confirmation",
      interaction:
        "Focus or press the icon action, read its explanation, and activate it as a button.",
      propertyLabels: { action: "Action", state: "State" },
    },
    "action-strip": {
      category: "Actions",
      summary:
        "Places related icon actions on one line and softly emphasizes only active or busy actions.",
      philosophy:
        "Group related actions by proximity and baseline rather than a container. Give area only to active or busy actions.",
      useWhen:
        "Several closely related actions should remain quiet in one row until active or busy.",
      avoidWhen:
        "Do not group unrelated actions because they fit, and do not put primary navigation in an action strip.",
      implementation:
        "Compose labeled `IconAction` items in order, expose the active action with a light surface, and let wrapping follow the viewport.",
      keyboard:
        "Use roving focus only for a true toolbar; otherwise preserve normal tab order so every action remains discoverable.",
      accessibility:
        "Label it as a toolbar only when it is one, and keep each action’s accessible name and state independent.",
      goodFor: "Related save, history, and refresh actions",
      avoidFor: "Primary navigation and unrelated action collections",
      interaction:
        "Activate individual actions and use the surface to confirm active or busy state.",
      propertyLabels: { active: "Active", density: "Density" },
    },
    "boolean-text": {
      category: "Information & input",
      summary:
        "Makes the sentence the hit target for a boolean value, showing true with a check and quiet surface.",
      philosophy:
        "The meaning of a boolean is the sentence, not a box. False stays quiet; true gains a check and selection surface.",
      useWhen:
        "The sentence is the meaning of a boolean preference and should be the hit target.",
      avoidWhen:
        "Do not remove a familiar native checkbox when dense standard form behavior or a stronger visual box is needed.",
      implementation:
        "Keep native checkbox semantics under the text grammar, render checked state with a check and quiet surface, and emit change immediately.",
      keyboard:
        "Space toggles the value while focus stays on the text control. Enter submits only when the surrounding form defines it.",
      accessibility:
        "Keep checkbox role, checked state, and label association even when the visual box is omitted.",
      goodFor: "Short boolean sentences for settings, consent, and auto-save",
      avoidFor: "Complex forms and inputs where the native box is important",
      interaction: "Press the sentence or Space to toggle its boolean meaning.",
      propertyLabels: { checked: "Value", label: "Sentence" },
    },
    "choice-group": {
      category: "Information & input",
      summary:
        "Presents one selection without foregrounding radio circles, giving the selected meaning a little more area.",
      philosophy:
        "The selected option owns a little more area. It shares selection grammar with `ElasticTabs` while committing a value immediately.",
      useWhen:
        "Exactly one option should be chosen and the selected meaning can own a little more area.",
      avoidWhen:
        "Do not use it for multiple selection, page navigation, or many values better searched than scanned.",
      implementation:
        "Render a labeled group with radio semantics and select immediately. Keep the same selection grammar in horizontal and vertical layouts.",
      keyboard:
        "Arrow keys change the option within the group; Tab enters and leaves the group once.",
      accessibility:
        "Expose radiogroup and radio roles, group label, checked state, and a focus indicator independent of the selection surface.",
      goodFor: "Small single-choice sets and density/view selection",
      avoidFor:
        "Multiple selection, large searchable sets, and page navigation",
      interaction:
        "Choose an option and commit it immediately while giving it the available area.",
      propertyLabels: { direction: "Direction", selected: "Selected" },
    },
    "form-list": {
      category: "Information & input",
      summary:
        "Places Text values under their labels, presenting a form as readable information order rather than boxes.",
      philosophy:
        "A form is an information sequence, not a collection of boxes. Text values receive editing capability locally.",
      useWhen:
        "A form is a readable ordered sequence of labels and information values.",
      avoidWhen:
        "Do not use it for dense spreadsheet editing or when native fieldset and legend communicate grouping better.",
      implementation:
        "Place each label above its Text value, keep editing local, and use marker style only when it adds meaning.",
      keyboard:
        "Tab moves through editable information only. Each Text preserves Enter, F2, Escape, commit, and validation behavior.",
      accessibility:
        "Associate every label with its control and expose mixed or error state in text and programmatic descriptions.",
      goodFor: "Settings, metadata, and readable ordered forms",
      avoidFor: "Spreadsheet editing, complex grouping, and long-form input",
      interaction:
        "Read from top to bottom and edit only the Text values that need it.",
      propertyLabels: { marker: "Marker", state: "Example state" },
    },
    "data-table": {
      category: "Data",
      summary:
        "Makes the cell the task unit, lightly showing its row and column context for copy, paste, and editing.",
      philosophy:
        "The cell is the operation unit. Keep row and column context quiet, and do not add index or lock icons by default.",
      useWhen:
        "Users inspect, copy, paste, or edit rectangular business data with the cell as the task unit.",
      avoidWhen:
        "Do not use it for page layout or a small key-value list clearer as a FormList.",
      implementation:
        "Keep headers meaningful, select a cell, lightly highlight its row and column, and enable editing only for permitted cells.",
      keyboard:
        "Arrow keys move cells, Home and End move within an axis, Ctrl or Cmd+C/V handles the clipboard, and Enter or F2 edits.",
      accessibility:
        "Use a real table with headers and selection announcements; clipboard failures must leave the cell usable.",
      goodFor:
        "Business data, cell selection, clipboard work, and inline editing",
      avoidFor: "Layout tables and small key-value information",
      interaction:
        "Select a cell, inspect its row and column context, then move or edit.",
      propertyLabels: {
        editable: "Editable",
        selection: "Selection emphasis",
        changes: "Example changes",
      },
    },
    "history-gutter": {
      category: "Data",
      summary:
        "Shows revisions beside current information with a line and points, emphasizing only the selected revision.",
      philosophy:
        "History is a timeline beside current information, not a separate card. Line, points, and change color carry the meaning.",
      useWhen:
        "Current, previous, and initial revisions need comparison beside the information they explain.",
      avoidWhen:
        "Do not use it as a detached audit dashboard or for long revision explanations in the main flow.",
      implementation:
        "Draw one line with revision points, highlight only the selected point, and connect it to the content it explains.",
      keyboard:
        "Arrow keys move between revisions and Enter activates the selected revision. Keep focus near current content.",
      accessibility:
        "Expose the gutter as a labeled revision list or navigation, not as an unexplained decorative line.",
      goodFor: "A compact revision timeline beside current information",
      avoidFor: "Detached audit screens and long history descriptions",
      interaction:
        "Select a point and inspect the matching revision beside it.",
      propertyLabels: { selected: "Revision", compact: "Compact" },
    },
    "progress-region": {
      category: "Feedback",
      summary:
        "Keeps previous content visible while a black wave marks processing in the affected region.",
      philosophy:
        "A central spinner hides the target. Structural motion belongs to the target region while its previous information remains readable.",
      useWhen:
        "A known region is processing and its previous content is still useful context.",
      avoidWhen:
        "Do not cover the whole document for a local operation or replace useful results with an indeterminate spinner.",
      implementation:
        "Keep old content mounted, apply wave, scan, or edge motion to the region, and remove it when processing settles.",
      keyboard:
        "Do not block unrelated focus; disable only controls that would duplicate the active operation.",
      accessibility:
        "Mark the region busy and provide a concise live status. Reduced motion must still show busy state structurally.",
      goodFor: "Local loading in search results, panels, and tables",
      avoidFor: "Document-wide loading and spinners that hide existing content",
      interaction:
        "Continue reading the affected region while waiting for its operation to finish.",
      propertyLabels: { loading: "Loading", pattern: "Pattern" },
    },
    "message-region": {
      category: "Feedback",
      summary:
        "Links a short status message to a target region and gives that region attention when selected.",
      philosophy:
        "A message is a link to its target, not a pile in a notification shelf. Activation temporarily gives the region space and status emphasis.",
      useWhen:
        "A short status belongs to one region and selecting it should focus that region.",
      avoidWhen:
        "Do not use it as a global notification queue or make a warning depend only on status color.",
      implementation:
        "Link the message to its target, use semantic status color sparingly, and request temporary focus allocation on activation.",
      keyboard:
        "An actionable message is a button that supports Enter and Space and restores focus predictably after the region settles.",
      accessibility:
        "Use a live region for new status when appropriate, provide a text label, and connect message and target descriptively.",
      goodFor: "Short validation, sync, and result messages tied to a region",
      avoidFor: "Global toasts, color-only warnings, and untargeted notices",
      interaction:
        "Select the message to expand its target and inspect the related state.",
      propertyLabels: { kind: "Status", target: "Target" },
    },
    "bottom-dialog": {
      category: "Feedback",
      summary:
        "Adds a dialog from the bottom within the plane so the information behind a short decision stays readable.",
      philosophy:
        "A dialog does not escape to the z-axis. It becomes a bottom row that pushes content, keeping the evidence for an irreversible decision visible.",
      useWhen:
        "A short decision should enter from below while the information that justifies it remains readable.",
      avoidWhen:
        "Do not use it for long forms, unrelated navigation, or a blocking alert with a different modal policy.",
      implementation:
        "Add a bottom row with a heading, primary action, dismiss action, and reallocated track. Do not use a z-index overlay.",
      keyboard:
        "Focus the heading or first action on open. Trap Tab only for a genuinely modal decision, and allow Escape when permitted.",
      accessibility:
        "Use dialog semantics only for the temporary decision, label it with a heading, describe its intent, and restore focus to the opener.",
      goodFor:
        "Delete confirmation, short system decisions, and supporting commands",
      avoidFor: "Long forms, permanent detail, and context-blocking alerts",
      interaction:
        "Make the decision in the added bottom dialog, then return to the opener on close.",
      propertyLabels: { intent: "Intent", dismiss: "Dismissible" },
    },
  } satisfies Record<CatalogComponentId, ComponentCopy>,
} as const satisfies Record<
  DocsLocale,
  Record<CatalogComponentId, ComponentCopy>
>;

export const COMPONENT_UI_COPY: Record<DocsLocale, ComponentUiCopy> = {
  ja: {
    catalogLink: "インタラクティブカタログを開く ↗",
    demoId: "デモ ID:",
    contract: "契約",
    useWhen: "使う場面",
    avoidWhen: "避ける場面",
    implementation: "実装の入口",
    integrationSketch: "統合例",
    properties: "プロパティ",
    propertiesCaption: (name) => `${name} のプロパティ`,
    key: "キー",
    type: "型",
    defaultValue: "既定値",
    values: "値",
    noProps: "この概念的な実行項目には設定可能なプロパティがありません。",
    behaviorAccessibility: "振る舞いとアクセシビリティ",
    goodFor: "適する対象",
    avoidFor: "適さない対象",
    interaction: "操作",
    keyboard: "キーボード",
    accessibility: "アクセシビリティ",
    matrixNote:
      "インタラクティブカタログと同じメタデータから描画しています。この一覧には24の実行コンポーネントを掲載しています。",
    matrixCaption: "ikasue 実行コンポーネント一覧",
    component: "コンポーネント",
    category: "カテゴリ",
    summary: "概要",
    demo: "デモ",
    openCatalog: "カタログを開く ↗",
  },
  en: {
    catalogLink: "Open interactive catalog ↗",
    demoId: "Demo ID:",
    contract: "Contract",
    useWhen: "Use it when",
    avoidWhen: "Avoid it when",
    implementation: "Implementation",
    integrationSketch: "Integration sketch",
    properties: "Properties",
    propertiesCaption: (name) => `${name} properties`,
    key: "Key",
    type: "Type",
    defaultValue: "Default",
    values: "Values",
    noProps: "This conceptual runtime entry has no configurable properties.",
    behaviorAccessibility: "Behavior and accessibility",
    goodFor: "Good for",
    avoidFor: "Not for",
    interaction: "Interaction",
    keyboard: "Keyboard",
    accessibility: "Accessibility",
    matrixNote:
      "Rendered from the same metadata as the interactive catalog; this matrix intentionally lists all 24 runtime components.",
    matrixCaption: "ikasue runtime component matrix",
    component: "Component",
    category: "Category",
    summary: "Summary",
    demo: "Demo",
    openCatalog: "Open catalog ↗",
  },
};

export function componentCopy(
  locale: DocsLocale,
  id: CatalogComponentId,
): ComponentCopy {
  return COMPONENT_COPY[locale][id];
}
