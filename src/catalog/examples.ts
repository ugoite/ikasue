import { findRegistryEntry } from "./registry";
import type {
  CatalogComponentId,
  CatalogLocalizedText,
  CatalogProps,
  CatalogLocale,
} from "./types";
import type { PlaneAxis, PlaneFit } from "../plane";

export type ExampleLocale = CatalogLocale;
export type ExampleKind =
  "operations" | "editor" | "planning" | "field" | "observability";

export interface ExamplePageCopy {
  readonly eyebrow: string;
  readonly summary: string;
  readonly surfaceHeading: string;
  readonly implementationHeading: string;
  readonly implementationIntro: string;
  readonly componentsLabel: string;
}

export interface ExampleRegionSpec {
  readonly id: string;
  readonly componentId: CatalogComponentId;
  readonly label: CatalogLocalizedText;
  readonly basis: number;
  readonly min: number;
  readonly props: CatalogProps;
}

export interface ExamplePlaneSpec {
  readonly id: string;
  readonly componentId: "vertical" | "horizontal";
  readonly axis: PlaneAxis;
  readonly fit: PlaneFit;
  readonly gap: number;
  readonly available: number;
  readonly focus: string;
  readonly navigation: true;
  readonly regions: readonly ExampleRegionSpec[];
}

export interface ExampleSource {
  readonly javascript: string;
  readonly rust: string;
}

export interface ExampleSpec {
  readonly kind: ExampleKind;
  readonly planes: readonly ExamplePlaneSpec[];
  readonly source: ExampleSource;
}

export interface ExampleCopy {
  readonly eyebrow: string;
  readonly summary: string;
  readonly surfaceHeading: string;
  readonly implementationHeading: string;
  readonly implementationIntro: string;
  readonly componentsLabel: string;
  readonly components: readonly string[];
  readonly javascript: string;
  readonly rust: string;
}

/**
 * The bilingual surface data is kept beside the composition model. The
 * interactive renderer consumes the region labels and native component ids
 * below; these values remain available to recipes and future surface views.
 */
export const EXAMPLE_SURFACE_COPY = {
  ja: {
    operations: {
      kicker: "OPS / QUEUE",
      title: "処理キュー",
      status: "稼働中 · 18件",
      axis: "横: filter / 縦: queue → detail",
      controls: {
        scope: "環境",
        production: "本番",
        status: "状態",
        active: "対応中",
        owner: "担当",
        allOwners: "全員",
        search: "IDまたはタイトル",
        refresh: "更新",
      },
      queue: "待機キュー",
      queueCount: "4 / 18",
      queueHeaders: ["ID", "項目", "状態"],
      rows: [
        {
          id: "INC-204",
          title: "請求書同期",
          meta: "高 · 2分前",
          state: "要確認",
        },
        {
          id: "JOB-881",
          title: "在庫差分の再計算",
          meta: "中 · 8分前",
          state: "対応中",
        },
        {
          id: "REQ-447",
          title: "取引先アクセス",
          meta: "低 · 12分前",
          state: "待機",
        },
        {
          id: "OPS-120",
          title: "月次エクスポート",
          meta: "中 · 19分前",
          state: "待機",
        },
      ],
      selection: "選択中",
      detail: "選択アイテム",
      detailTitle: "請求書同期",
      detailRows: [
        ["担当", "M. Sato"],
        ["開始", "14:02 JST"],
        ["SLA", "残り 18分"],
        ["原因", "外部キーの不一致"],
      ],
      message: "同じ顧客の3件が保留中",
      assign: "担当を割り当て",
    },
    editor: {
      kicker: "EDITOR / PREVIEW",
      title: "リリースノート",
      status: "DRAFT · 未公開",
      axis: "横: editor ↔ preview / 縦: fields",
      editor: "編集",
      preview: "プレビュー",
      fields: {
        title: "タイトル",
        slug: "スラッグ",
        body: "本文",
        status: "状態",
      },
      titleValue: "平面を読むためのリリースノート",
      slugValue: "release-notes/plane-reading",
      bodyValue: "新しい情報は、既存の情報が所有するedgeへ入ります。",
      draft: "下書き",
      saved: "保存済み",
      save: "保存",
      open: "公開前の確認",
      previewTitle: "平面を読むためのリリースノート",
      previewIntro:
        "情報密度の高いworkspaceで、次の判断を迷わせないための小さな更新です。",
      previewItems: [
        "selectionは状態を伝える",
        "ruleは所属edgeを示す",
        "axisは読み順を守る",
      ],
      lastSaved: "最終保存 13:48 JST",
    },
    planning: {
      kicker: "PLANNING / WEEK",
      title: "現場スケジュール",
      status: "今週 · 4リソース",
      axis: "横: days / 縦: time",
      mode: "表示",
      week: "週",
      resources: "リソース",
      add: "予定を追加",
      calendarLabel: "2026年8月3日の週の予定",
      days: ["月 03", "火 04", "水 05", "木 06"],
      times: ["09:00", "11:00", "13:00", "15:00"],
      events: [
        ["キックオフ", "planning", ""],
        ["レビュー", "focus", ""],
        ["顧客訪問", "", "field"],
        ["引き継ぎ", "", ""],
        ["設計確認", "", "focus"],
        ["休憩", "", ""],
        ["リリース準備", "planning", ""],
        ["振り返り", "", "focus"],
      ],
      legend: ["確定", "選択中", "現場"],
    },
    field: {
      kicker: "FIELD / MOBILE",
      title: "設備点検ジョブ",
      status: "同期済み · 10:42",
      axis: "縦: context → checklist → evidence",
      job: "JOB-381",
      route: "渋谷区 · 2 / 5 stops",
      connection: "4G · オフライン準備済み",
      location: "青葉ビル 4F / 空調室",
      address: "東京都渋谷区神南 1-2-3",
      arrive: "到着を記録",
      photo: "写真",
      call: "連絡",
      checklist: "チェックリスト",
      checks: ["電源ランプを確認", "フィルターを交換", "異音がないことを確認"],
      evidence: "証跡",
      reading: "測定値",
      value: "23.4 °C",
      upload: "写真 3枚 · 送信待ち",
      note: "備考を追加",
      finish: "作業を完了",
    },
    observability: {
      kicker: "OBS / INCIDENT",
      title: "信頼性コンソール",
      status: "SEV-2 · 対応中",
      axis: "横: timeline / services / incident",
      timeline: "タイムライン",
      services: "サービス状態",
      incident: "INC-204 · 請求書同期",
      alert: "外部キーの不一致が再試行を止めています",
      timelineItems: [
        ["14:02", "デプロイ完了", "deploy"],
        ["14:07", "エラー率上昇", "alert"],
        ["14:11", "調査を開始", "focus"],
      ],
      serviceRows: [
        ["billing-api", "正常", "42 ms"],
        ["invoice-worker", "劣化", "1.8 s"],
        ["ledger-db", "正常", "18 ms"],
      ],
      metricLabels: ["再試行", "影響中", "経過"],
      metricValues: ["128", "3 customers", "09 min"],
      acknowledge: "引き受ける",
      retain: "前回のmetricsを保持中",
    },
  },
  en: {
    operations: {
      kicker: "OPS / QUEUE",
      title: "Processing queue",
      status: "LIVE · 18 items",
      axis: "horizontal: filters / vertical: queue → detail",
      controls: {
        scope: "Environment",
        production: "Production",
        status: "Status",
        active: "In progress",
        owner: "Owner",
        allOwners: "Everyone",
        search: "ID or title",
        refresh: "Refresh",
      },
      queue: "Waiting queue",
      queueCount: "4 / 18",
      queueHeaders: ["ID", "Item", "State"],
      rows: [
        {
          id: "INC-204",
          title: "Invoice sync",
          meta: "high · 2m ago",
          state: "Review",
        },
        {
          id: "JOB-881",
          title: "Recalculate inventory",
          meta: "medium · 8m ago",
          state: "Active",
        },
        {
          id: "REQ-447",
          title: "Partner access",
          meta: "low · 12m ago",
          state: "Queued",
        },
        {
          id: "OPS-120",
          title: "Monthly export",
          meta: "medium · 19m ago",
          state: "Queued",
        },
      ],
      selection: "Selected",
      detail: "Selected item",
      detailTitle: "Invoice sync",
      detailRows: [
        ["Owner", "M. Sato"],
        ["Started", "14:02 JST"],
        ["SLA", "18m remaining"],
        ["Cause", "External key mismatch"],
      ],
      message: "3 records for the same customer are pending",
      assign: "Assign owner",
    },
    editor: {
      kicker: "EDITOR / PREVIEW",
      title: "Release notes",
      status: "DRAFT · UNPUBLISHED",
      axis: "horizontal: editor ↔ preview / vertical: fields",
      editor: "Editor",
      preview: "Preview",
      fields: { title: "Title", slug: "Slug", body: "Body", status: "Status" },
      titleValue: "Release notes for reading a plane",
      slugValue: "release-notes/plane-reading",
      bodyValue:
        "New information enters the edge owned by existing information.",
      draft: "Draft",
      saved: "Saved",
      save: "Save",
      open: "Review before publish",
      previewTitle: "Release notes for reading a plane",
      previewIntro:
        "A small update for making the next decision clear in an information-dense workspace.",
      previewItems: [
        "selection carries state",
        "rules show ownership",
        "axes preserve reading order",
      ],
      lastSaved: "Last saved 13:48 JST",
    },
    planning: {
      kicker: "PLANNING / WEEK",
      title: "Field schedule",
      status: "THIS WEEK · 4 RESOURCES",
      axis: "horizontal: days / vertical: time",
      mode: "View",
      week: "Week",
      resources: "Resources",
      add: "Add schedule",
      calendarLabel: "Schedule for the week of August 3, 2026",
      days: ["MON 03", "TUE 04", "WED 05", "THU 06"],
      times: ["09:00", "11:00", "13:00", "15:00"],
      events: [
        ["Kickoff", "planning", ""],
        ["Review", "focus", ""],
        ["Customer visit", "", "field"],
        ["Handoff", "", ""],
        ["Design check", "", "focus"],
        ["Break", "", ""],
        ["Release prep", "planning", ""],
        ["Retrospective", "", "focus"],
      ],
      legend: ["Confirmed", "Selected", "Field"],
    },
    field: {
      kicker: "FIELD / MOBILE",
      title: "Equipment inspection job",
      status: "SYNCED · 10:42",
      axis: "vertical: context → checklist → evidence",
      job: "JOB-381",
      route: "Shibuya · stop 2 / 5",
      connection: "4G · offline-ready",
      location: "Aoba Building 4F / HVAC room",
      address: "1-2-3 Jinnan, Shibuya, Tokyo",
      arrive: "Record arrival",
      photo: "Photo",
      call: "Call",
      checklist: "Checklist",
      checks: [
        "Power indicator checked",
        "Filter replaced",
        "No abnormal noise",
      ],
      evidence: "Evidence",
      reading: "Reading",
      value: "23.4 °C",
      upload: "3 photos · waiting to send",
      note: "Add note",
      finish: "Complete job",
    },
    observability: {
      kicker: "OBS / INCIDENT",
      title: "Reliability console",
      status: "SEV-2 · ACTIVE",
      axis: "horizontal: timeline / services / incident",
      timeline: "Timeline",
      services: "Service state",
      incident: "INC-204 · Invoice sync",
      alert: "An external key mismatch is stopping retries",
      timelineItems: [
        ["14:02", "Deploy complete", "deploy"],
        ["14:07", "Error rate rising", "alert"],
        ["14:11", "Investigation started", "focus"],
      ],
      serviceRows: [
        ["billing-api", "Healthy", "42 ms"],
        ["invoice-worker", "Degraded", "1.8 s"],
        ["ledger-db", "Healthy", "18 ms"],
      ],
      metricLabels: ["Retries", "Affected", "Elapsed"],
      metricValues: ["128", "3 customers", "09 min"],
      acknowledge: "Acknowledge",
      retain: "Retaining previous metrics",
    },
  },
} as const;

export const EXAMPLE_PAGE_COPY = {
  ja: {
    operations: {
      eyebrow: "例 / OPERATIONS DASHBOARD",
      summary:
        "filter、queue、detail、statusを一つのworkspaceで判断する運用画面です。短い操作は横に、queueからdetailへの読み順は縦に置き、選択中のitemへspaceを渡します。",
      surfaceHeading: "Rendered surface / 実際のsurface",
      implementationHeading: "実装とコンポーネント契約",
      implementationIntro:
        "下のコードは、このsurfaceの同じplaneと状態所有を組み立てる例です。DataTableのselection、MessageRegionのtarget、StatusIconの状態をdetailの証拠として残します。",
      componentsLabel: "この例で使うikasueコンポーネント:",
    },
    editor: {
      eyebrow: "例 / EDITOR + PREVIEW",
      summary:
        "editorとpreviewを一つの横planeに置く編集画面です。FormListが確定したvaluesとstatusを所有し、Textのfocusやdraftは保存データの状態表示を変えません。",
      surfaceHeading: "Rendered surface / 実際のsurface",
      implementationHeading: "実装とコンポーネント契約",
      implementationIntro:
        "コードでは、fieldsを縦に読み、editorとpreviewを横に比較する構成を表します。Ruleは境界を示し、ActionStripは保存と確認の順序を保ちます。",
      componentsLabel: "この例で使うikasueコンポーネント:",
    },
    planning: {
      eyebrow: "例 / PLANNING CALENDAR",
      summary:
        "dayを横に比較し、各dayのeventを縦に読むplanning/calendar画面です。幅が足りないときはelasticとfocus navigationで一つのdayを読みやすく保ちます。",
      surfaceHeading: "Rendered surface / 実際のsurface",
      implementationHeading: "実装とコンポーネント契約",
      implementationIntro:
        "横方向のdaysと縦方向のeventsを別planeとして定義します。ChoiceGroupは表示モードを、ActionStripは週・resource・追加の操作を、StatusIconは確定状態を所有します。",
      componentsLabel: "この例で使うikasueコンポーネント:",
    },
    field: {
      eyebrow: "例 / FIELD MOBILE SERVICE",
      summary:
        "networkが不安定な現場で、job context、checklist、写真、短い判断を扱うmobile service画面です。縦のevidenceを保持し、actionだけを横に並べます。",
      surfaceHeading: "Rendered surface / 実際のsurface",
      implementationHeading: "実装とコンポーネント契約",
      implementationIntro:
        "コードはoffline-readyの状態と、確認用のBottomDialogがlocationやphotoを覆わずに追加される関係を示します。FormListはchecklistとevidenceを所有します。",
      componentsLabel: "この例で使うikasueコンポーネント:",
    },
    observability: {
      eyebrow: "例 / OBSERVABILITY INCIDENT CONSOLE",
      summary:
        "timeline、service status、incident detailを一つのconsoleで調べる画面です。MessageRegionはincidentへ戻るtargetを持ち、ProgressRegionはloading中も以前のmetricsを残します。",
      surfaceHeading: "Rendered surface / 実際のsurface",
      implementationHeading: "実装とコンポーネント契約",
      implementationIntro:
        "コードはtimeline、services、incidentを横に並べ、各責務を別regionとして扱います。DataTableはservice stateを、StatusIconは劣化したworkerを、MessageRegionはalertの所属先を示します。",
      componentsLabel: "この例で使うikasueコンポーネント:",
    },
  },
  en: {
    operations: {
      eyebrow: "EXAMPLE / OPERATIONS DASHBOARD",
      summary:
        "A dense operations workspace for judging filters, a queue, detail, and status together. Short controls sit on the horizontal edge; the queue-to-detail reading order stays vertical, giving the selected item more room.",
      surfaceHeading: "Rendered surface",
      implementationHeading: "Implementation and component contract",
      implementationIntro:
        "The code below builds the same plane and state ownership as the rendered surface. DataTable selection, the MessageRegion target, and StatusIcon state remain evidence beside the selected detail.",
      componentsLabel: "ikasue components used in this example:",
    },
    editor: {
      eyebrow: "EXAMPLE / EDITOR + PREVIEW",
      summary:
        "An editing surface with an editor and preview on one horizontal plane. FormList owns confirmed values and status; Text focus and draft remain local and do not recolor saved data.",
      surfaceHeading: "Rendered surface",
      implementationHeading: "Implementation and component contract",
      implementationIntro:
        "The code reads fields vertically while comparing editor and preview horizontally. Rule names the boundary, and ActionStrip preserves the order of save and review actions.",
      componentsLabel: "ikasue components used in this example:",
    },
    planning: {
      eyebrow: "EXAMPLE / PLANNING CALENDAR",
      summary:
        "A planning/calendar surface that compares days horizontally and reads events vertically within each day. When the width is short, focus navigation keeps one day readable without making overflow the plane adaptation policy.",
      surfaceHeading: "Rendered surface",
      implementationHeading: "Implementation and component contract",
      implementationIntro:
        "The two planes separate horizontal day comparison from vertical event reading. ChoiceGroup owns the view mode, ActionStrip owns week/resource/add actions, and StatusIcon marks confirmed work.",
      componentsLabel: "ikasue components used in this example:",
    },
    field: {
      eyebrow: "EXAMPLE / FIELD MOBILE SERVICE",
      summary:
        "A mobile service surface for a fragile network: job context, checklist, photos, and short decisions remain in one vertical evidence plane while actions use a compact horizontal strip.",
      surfaceHeading: "Rendered surface",
      implementationHeading: "Implementation and component contract",
      implementationIntro:
        "The code shows an offline-ready state and a BottomDialog added for confirmation without covering the location or photo evidence. FormList owns the checklist and evidence values.",
      componentsLabel: "ikasue components used in this example:",
    },
    observability: {
      eyebrow: "EXAMPLE / OBSERVABILITY INCIDENT CONSOLE",
      summary:
        "A console for investigating a timeline, service state, and incident detail together. MessageRegion points back to the incident target, while ProgressRegion retains previous metrics as new data loads.",
      surfaceHeading: "Rendered surface",
      implementationHeading: "Implementation and component contract",
      implementationIntro:
        "The code places timeline, services, and incident side by side while keeping each responsibility in its own region. DataTable represents service state, StatusIcon marks the degraded worker, and MessageRegion names the alert target.",
      componentsLabel: "ikasue components used in this example:",
    },
  },
} as const satisfies Record<
  ExampleLocale,
  Record<ExampleKind, ExamplePageCopy>
>;

const EXAMPLES: readonly ExampleSpec[] = [
  {
    kind: "operations",
    planes: [
      {
        id: "filters",
        componentId: "horizontal",
        axis: "horizontal",
        fit: "wrap",
        gap: 1,
        available: 7,
        focus: "filters",
        navigation: true,
        regions: [
          {
            id: "filters",
            componentId: "horizontal",
            label: { ja: "filter", en: "Filters" },
            basis: 4,
            min: 2,
            props: {
              gap: "sm",
              fit: "wrap",
              items: "3",
              basis: "1",
              available: "7",
            },
          },
        ],
      },
      {
        id: "dashboard",
        componentId: "vertical",
        axis: "vertical",
        fit: "elastic",
        gap: 1,
        available: 12,
        focus: "detail",
        navigation: true,
        regions: [
          {
            id: "queue",
            componentId: "data-table",
            label: { ja: "待機キュー", en: "Waiting queue" },
            basis: 5,
            min: 3,
            props: { editable: true, selection: "row-column", changes: true },
          },
          {
            id: "summary",
            componentId: "status-icon",
            label: { ja: "選択中", en: "Selected" },
            basis: 2,
            min: 1,
            props: { kind: "warning", label: "same customer · 3 pending" },
          },
          {
            id: "detail",
            componentId: "message-region",
            label: { ja: "選択アイテム", en: "Selected item" },
            basis: 4,
            min: 2,
            props: { kind: "warning", target: "secondary" },
          },
        ],
      },
    ],
    source: {
      javascript: `import { horizontal, resolvePlane, vertical } from "@ugoite/ikasue";

const components = ["horizontal", "vertical", "data-table", "message-region", "status-icon"];
const filters = horizontal(["status", "owner", "sla"], {
  fit: "wrap",
  gap: 1,
  available: 7,
});
const dashboard = vertical(
  [
    { id: "queue", basis: 5, min: 3 },
    { id: "summary", basis: 2, min: 1 },
    { id: "detail", basis: 4, min: 2 },
  ],
  { fit: "elastic", gap: 1, available: 12, focus: "detail", navigation: true },
);

const contract = {
  components,
  dataTable: { selection: "row-column", editable: true },
  messageRegion: { target: "detail", kind: "warning" },
  statusIcon: { kind: "warning", label: "same customer · 3 pending" },
};
renderDashboard({ filters, layout: resolvePlane(dashboard), contract });`,
      rust: `let dashboard = PlaneSpec {
    axis: Axis::Vertical,
    fit: Fit::Elastic,
    gap: 1.0,
    focus: Some("detail"),
    navigation: true,
    children: vec![
        PlaneChild { id: "queue", basis: 5.0, min: 3.0 },
        PlaneChild { id: "summary", basis: 2.0, min: 1.0 },
        PlaneChild { id: "detail", basis: 4.0, min: 2.0 },
    ],
};
let layout = resolve_plane(&dashboard, 12.0);
let data_table = DataTable::new().selection("row-column").editable(true);
let message = MessageRegion::warning().target("detail");
let status = StatusIcon::warning("same customer · 3 pending");
render_dashboard(layout, data_table, message, status);`,
    },
  },
  {
    kind: "editor",
    planes: [
      {
        id: "fields",
        componentId: "vertical",
        axis: "vertical",
        fit: "elastic",
        gap: 1,
        available: 8,
        focus: "body",
        navigation: true,
        regions: [
          {
            id: "title",
            componentId: "text",
            label: { ja: "タイトル", en: "Title" },
            basis: 1,
            min: 1,
            props: {
              editable: true,
              editor: "text",
              state: "clean",
              value: "Release notes",
            },
          },
          {
            id: "slug",
            componentId: "text",
            label: { ja: "スラッグ", en: "Slug" },
            basis: 1,
            min: 1,
            props: {
              editable: true,
              editor: "text",
              state: "clean",
              value: "release-notes/plane-reading",
            },
          },
          {
            id: "body",
            componentId: "form-list",
            label: { ja: "本文", en: "Body" },
            basis: 4,
            min: 2,
            props: { marker: "bullet", state: "mixed" },
          },
          {
            id: "status",
            componentId: "status-icon",
            label: { ja: "状態", en: "Status" },
            basis: 1,
            min: 1,
            props: { kind: "success", label: "Saved" },
          },
        ],
      },
      {
        id: "page",
        componentId: "horizontal",
        axis: "horizontal",
        fit: "elastic",
        gap: 1,
        available: 12,
        focus: "preview",
        navigation: true,
        regions: [
          {
            id: "editor",
            componentId: "action-strip",
            label: { ja: "編集", en: "Editor" },
            basis: 5,
            min: 3,
            props: { active: "save", density: "normal" },
          },
          {
            id: "boundary",
            componentId: "rule",
            label: { ja: "境界", en: "Boundary" },
            basis: 1,
            min: 1,
            props: { axis: "vertical", weight: "hairline" },
          },
          {
            id: "preview",
            componentId: "text",
            label: { ja: "プレビュー", en: "Preview" },
            basis: 7,
            min: 4,
            props: {
              editable: false,
              editor: "text",
              state: "clean",
              value: "Release notes for reading a plane",
            },
          },
        ],
      },
    ],
    source: {
      javascript: `import { horizontal, resolvePlane, vertical } from "@ugoite/ikasue";

const components = ["horizontal", "vertical", "form-list", "text", "rule", "action-strip"];
const fields = vertical(["title", "slug", "body", "status"], {
  fit: "elastic",
  gap: 1,
  available: 8,
  focus: "body",
  navigation: true,
});
const page = horizontal(
  [
    { id: "editor", basis: 5, min: 3 },
    { id: "boundary", basis: 1, min: 1 },
    { id: "preview", basis: 7, min: 4 },
  ],
  { fit: "elastic", gap: 1, available: 12, focus: "preview", navigation: true },
);
renderEditor({ fields: resolvePlane(fields), layout: resolvePlane(page), components });`,
      rust: `let page = PlaneSpec {
    axis: Axis::Horizontal,
    fit: Fit::Elastic,
    gap: 1.0,
    focus: Some("preview"),
    navigation: true,
    children: vec![
        PlaneChild { id: "editor", basis: 5.0, min: 3.0 },
        PlaneChild { id: "boundary", basis: 1.0, min: 1.0 },
        PlaneChild { id: "preview", basis: 7.0, min: 4.0 },
    ],
};
let layout = resolve_plane(&page, 12.0);
let form_list = FormList::new().owns(["values", "status"]);
let title = Text::editable("title");
let boundary = Rule::vertical();
let actions = ActionStrip::new(["save", "review"]);
render_editor(layout, form_list, title, boundary, actions);`,
    },
  },
  {
    kind: "planning",
    planes: [
      {
        id: "days",
        componentId: "horizontal",
        axis: "horizontal",
        fit: "elastic",
        gap: 1,
        available: 9,
        focus: "wed",
        navigation: true,
        regions: [
          {
            id: "mon",
            componentId: "choice-group",
            label: { ja: "月 03", en: "MON 03" },
            basis: 3,
            min: 2,
            props: { direction: "vertical", selected: "standard" },
          },
          {
            id: "tue",
            componentId: "status-icon",
            label: { ja: "火 04", en: "TUE 04" },
            basis: 3,
            min: 2,
            props: { kind: "success", label: "Confirmed" },
          },
          {
            id: "wed",
            componentId: "action-strip",
            label: { ja: "水 05", en: "WED 05" },
            basis: 3,
            min: 2,
            props: { active: "refresh", density: "normal" },
          },
          {
            id: "thu",
            componentId: "vertical",
            label: { ja: "木 06", en: "THU 06" },
            basis: 3,
            min: 2,
            props: {
              fit: "wrap",
              gap: "sm",
              items: "3",
              basis: "1",
              available: "6",
            },
          },
        ],
      },
      {
        id: "events",
        componentId: "vertical",
        axis: "vertical",
        fit: "wrap",
        gap: 1,
        available: 8,
        focus: "review",
        navigation: true,
        regions: [
          {
            id: "kickoff",
            componentId: "choice-group",
            label: { ja: "キックオフ", en: "Kickoff" },
            basis: 2,
            min: 1,
            props: { direction: "horizontal", selected: "standard" },
          },
          {
            id: "review",
            componentId: "status-icon",
            label: { ja: "レビュー", en: "Review" },
            basis: 2,
            min: 1,
            props: { kind: "warning", label: "Selected" },
          },
          {
            id: "handoff",
            componentId: "action-strip",
            label: { ja: "引き継ぎ", en: "Handoff" },
            basis: 2,
            min: 1,
            props: { active: "save", density: "compact" },
          },
        ],
      },
    ],
    source: {
      javascript: `import { horizontal, resolvePlane, vertical } from "@ugoite/ikasue";

const components = ["horizontal", "vertical", "choice-group", "action-strip", "status-icon"];
const days = horizontal(
  [
    { id: "mon", basis: 3, min: 2 },
    { id: "tue", basis: 3, min: 2 },
    { id: "wed", basis: 3, min: 2 },
    { id: "thu", basis: 3, min: 2 },
  ],
  { fit: "elastic", gap: 1, available: 9, focus: "wed", navigation: true },
);
const events = vertical(["kickoff", "review", "handoff"], {
  fit: "wrap",
  gap: 1,
  available: 8,
  focus: "review",
  navigation: true,
});
renderCalendar({ days: resolvePlane(days), events: resolvePlane(events), components });`,
      rust: `let days = PlaneSpec {
    axis: Axis::Horizontal,
    fit: Fit::Elastic,
    gap: 1.0,
    focus: Some("wed"),
    navigation: true,
    children: vec![
        PlaneChild { id: "mon", basis: 3.0, min: 2.0 },
        PlaneChild { id: "tue", basis: 3.0, min: 2.0 },
        PlaneChild { id: "wed", basis: 3.0, min: 2.0 },
        PlaneChild { id: "thu", basis: 3.0, min: 2.0 },
    ],
};
let day_layout = resolve_plane(&days, 9.0);
let events = PlaneSpec {
    axis: Axis::Vertical,
    fit: Fit::Wrap,
    gap: 1.0,
    focus: Some("review"),
    navigation: true,
    children: events_for("mon"),
};
let event_layout = resolve_plane(&events, 8.0);
let choices = ChoiceGroup::new(Choice::Standard).vertical();
let actions = ActionStrip::new(["week", "resources", "add"]);
let confirmed = StatusIcon::confirmed();
render_calendar(day_layout, event_layout, choices, actions, confirmed);`,
    },
  },
  {
    kind: "field",
    planes: [
      {
        id: "actions",
        componentId: "horizontal",
        axis: "horizontal",
        fit: "wrap",
        gap: 1,
        available: 4,
        focus: "photo",
        navigation: true,
        regions: [
          {
            id: "arrived",
            componentId: "boolean-text",
            label: { ja: "到着を記録", en: "Record arrival" },
            basis: 1,
            min: 1,
            props: { checked: true, label: "offline-ready" },
          },
          {
            id: "photo",
            componentId: "bottom-dialog",
            label: { ja: "写真", en: "Photo" },
            basis: 1,
            min: 1,
            props: { intent: "confirm", dismiss: true },
          },
          {
            id: "call",
            componentId: "status-icon",
            label: { ja: "連絡", en: "Call" },
            basis: 1,
            min: 1,
            props: { kind: "info", label: "4G · offline-ready" },
          },
        ],
      },
      {
        id: "job",
        componentId: "vertical",
        axis: "vertical",
        fit: "elastic",
        gap: 1,
        available: 10,
        focus: "evidence",
        navigation: true,
        regions: [
          {
            id: "location",
            componentId: "form-list",
            label: { ja: "現場", en: "Location" },
            basis: 3,
            min: 2,
            props: { marker: "bullet", state: "clean" },
          },
          {
            id: "checklist",
            componentId: "boolean-text",
            label: { ja: "チェックリスト", en: "Checklist" },
            basis: 4,
            min: 2,
            props: { checked: true, label: "No abnormal noise" },
          },
          {
            id: "evidence",
            componentId: "bottom-dialog",
            label: { ja: "証跡", en: "Evidence" },
            basis: 3,
            min: 2,
            props: { intent: "confirm", dismiss: true },
          },
        ],
      },
    ],
    source: {
      javascript: `import { horizontal, resolvePlane, vertical } from "@ugoite/ikasue";

const components = ["vertical", "horizontal", "form-list", "boolean-text", "bottom-dialog", "status-icon"];
const actions = horizontal(["arrived", "photo", "call"], {
  fit: "wrap", gap: 1, available: 4, focus: "photo", navigation: true,
});
const job = vertical(["location", "checklist", "evidence"], {
  fit: "elastic", gap: 1, available: 10, focus: "evidence", navigation: true,
});
renderFieldJob({ actions: resolvePlane(actions), job: resolvePlane(job), components });`,
      rust: `let job = PlaneSpec {
    axis: Axis::Vertical,
    fit: Fit::Elastic,
    gap: 1.0,
    focus: Some("evidence"),
    navigation: true,
    children: vec![
        PlaneChild { id: "location", basis: 3.0, min: 2.0 },
        PlaneChild { id: "checklist", basis: 4.0, min: 2.0 },
        PlaneChild { id: "evidence", basis: 3.0, min: 2.0 },
    ],
};
let layout = resolve_plane(&job, 10.0);
let dialog = BottomDialog::confirm().dismissible(true);
let offline = BooleanText::checked("offline-ready");
let form = FormList::new().owns(["checklist", "evidence"]);
render_field_job(layout, dialog, offline, form);`,
    },
  },
  {
    kind: "observability",
    planes: [
      {
        id: "timeline",
        componentId: "vertical",
        axis: "vertical",
        fit: "elastic",
        gap: 1,
        available: 7,
        focus: "investigation",
        navigation: true,
        regions: [
          {
            id: "deploy",
            componentId: "status-icon",
            label: { ja: "デプロイ完了", en: "Deploy complete" },
            basis: 2,
            min: 1,
            props: { kind: "success", label: "14:02" },
          },
          {
            id: "alert",
            componentId: "message-region",
            label: { ja: "エラー率上昇", en: "Error rate rising" },
            basis: 2,
            min: 1,
            props: { kind: "warning", target: "investigation" },
          },
          {
            id: "investigation",
            componentId: "progress-region",
            label: { ja: "調査を開始", en: "Investigation started" },
            basis: 2,
            min: 1,
            props: { loading: true, pattern: "wave" },
          },
        ],
      },
      {
        id: "console",
        componentId: "horizontal",
        axis: "horizontal",
        fit: "elastic",
        gap: 1,
        available: 13,
        focus: "incident",
        navigation: true,
        regions: [
          {
            id: "timeline",
            componentId: "vertical",
            label: { ja: "タイムライン", en: "Timeline" },
            basis: 4,
            min: 3,
            props: {
              fit: "elastic",
              gap: "sm",
              items: "3",
              basis: "1",
              available: "7",
            },
          },
          {
            id: "services",
            componentId: "data-table",
            label: { ja: "サービス状態", en: "Service state" },
            basis: 4,
            min: 3,
            props: {
              selection: "row-column",
              editable: false,
              changes: true,
            },
          },
          {
            id: "incident",
            componentId: "message-region",
            label: { ja: "INC-204 · 請求書同期", en: "INC-204 · Invoice sync" },
            basis: 8,
            min: 5,
            props: { kind: "warning", target: "incident" },
          },
        ],
      },
    ],
    source: {
      javascript: `import { horizontal, resolvePlane, vertical } from "@ugoite/ikasue";

const components = ["horizontal", "vertical", "data-table", "message-region", "progress-region", "status-icon"];
const timeline = vertical(["deploy", "alert", "investigation"], {
  fit: "elastic", gap: 1, available: 7, focus: "investigation", navigation: true,
});
const consolePlane = horizontal(
  [
    { id: "timeline", basis: 4, min: 3 },
    { id: "services", basis: 4, min: 3 },
    { id: "incident", basis: 8, min: 5 },
  ],
  { fit: "elastic", gap: 1, available: 13, focus: "incident", navigation: true },
);
renderIncidentConsole({ timeline: resolvePlane(timeline), layout: resolvePlane(consolePlane), components });`,
      rust: `let console = PlaneSpec {
    axis: Axis::Horizontal,
    fit: Fit::Elastic,
    gap: 1.0,
    focus: Some("incident"),
    navigation: true,
    children: vec![
        PlaneChild { id: "timeline", basis: 4.0, min: 3.0 },
        PlaneChild { id: "services", basis: 4.0, min: 3.0 },
        PlaneChild { id: "incident", basis: 8.0, min: 5.0 },
    ],
};
let layout = resolve_plane(&console, 13.0);
let services = DataTable::new().selection("row-column");
let message = MessageRegion::warning().target("incident");
let progress = ProgressRegion::retain_previous(ProgressPattern::Wave);
render_incident_console(layout, services, message, progress);`,
    },
  },
] as const;

const EXAMPLE_BY_KIND = Object.fromEntries(
  EXAMPLES.map((example) => [example.kind, example]),
) as Record<ExampleKind, ExampleSpec>;

export const EXAMPLE_SPECS = EXAMPLES;

export function exampleSpec(kind: ExampleKind): ExampleSpec {
  return EXAMPLE_BY_KIND[kind];
}

export function exampleSurfaceCopy(
  locale: ExampleLocale,
  kind: ExampleKind,
): (typeof EXAMPLE_SURFACE_COPY)[ExampleLocale][ExampleKind] {
  return EXAMPLE_SURFACE_COPY[locale][kind];
}

export function exampleComponentIds(
  kind: ExampleKind,
): readonly CatalogComponentId[] {
  const ids = new Set<CatalogComponentId>();
  for (const plane of exampleSpec(kind).planes) {
    ids.add(plane.componentId);
    for (const region of plane.regions) ids.add(region.componentId);
  }
  return [...ids];
}

export function exampleComponentNames(
  locale: ExampleLocale,
  kind: ExampleKind,
): readonly string[] {
  return exampleComponentIds(kind).map((id) => {
    const component = findRegistryEntry(id);
    return locale === "en" ? component.displayName : component.displayNameJa;
  });
}

export function exampleCopy(
  locale: ExampleLocale,
  kind: ExampleKind,
): ExampleCopy {
  const page = EXAMPLE_PAGE_COPY[locale][kind];
  const spec = exampleSpec(kind);
  return {
    ...page,
    components: exampleComponentNames(locale, kind),
    javascript: spec.source.javascript,
    rust: spec.source.rust,
  };
}
