export type ExampleLocale = "ja" | "en";
export type ExampleKind =
  "operations" | "editor" | "planning" | "field" | "observability";

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

const SOURCES: Record<
  ExampleKind,
  Pick<ExampleCopy, "components" | "javascript" | "rust">
> = {
  operations: {
    components: [
      "Horizontal",
      "Vertical",
      "DataTable",
      "MessageRegion",
      "StatusIcon",
    ],
    javascript: `import { horizontal, resolvePlane, vertical } from "@ugoite/ikasue";

const components = [
  "Horizontal",
  "Vertical",
  "DataTable",
  "MessageRegion",
  "StatusIcon",
];
const filters = horizontal(["status", "owner", "sla"], {
  fit: "wrap",
  gap: 1,
  available: 7,
});
const dashboard = vertical(
  [
    { id: "filters", basis: 2, min: 1 },
    { id: "queue", basis: 5, min: 3 },
    { id: "detail", basis: 4, min: 2 },
  ],
  { fit: "elastic", gap: 1, available: 12 },
);

const contract = {
  components,
  dataTable: { selection: "row-column", editable: true },
  messageRegion: { target: "detail", kind: "warning" },
  statusIcon: { kind: "live" },
};
renderDashboard({ filters, layout: resolvePlane(dashboard), contract });`,
    rust: `struct PlaneChild<'a> { id: &'a str, basis: f32, min: f32 }
struct PlaneSpec<'a> {
    axis: Axis,
    fit: Fit,
    gap: f32,
    children: Vec<PlaneChild<'a>>,
}

let dashboard = PlaneSpec {
    axis: Axis::Vertical,
    fit: Fit::Elastic,
    gap: 1.0,
    children: vec![
        PlaneChild { id: "filters", basis: 2.0, min: 1.0 },
        PlaneChild { id: "queue", basis: 5.0, min: 3.0 },
        PlaneChild { id: "detail", basis: 4.0, min: 2.0 },
    ],
};
let layout = resolve_plane(&dashboard, 12.0);
let data_table = DataTable::new().selection("row-column").editable(true);
let message = MessageRegion::warning().target("detail");
let status = StatusIcon::live();
render_dashboard(layout, data_table, message, status);`,
  },
  editor: {
    components: [
      "Horizontal",
      "Vertical",
      "FormList",
      "Text",
      "Rule",
      "ActionStrip",
    ],
    javascript: `import { horizontal, resolvePlane, vertical } from "@ugoite/ikasue";

const components = ["Horizontal", "Vertical", "FormList", "Text", "Rule", "ActionStrip"];
const editor = vertical(["title", "slug", "body", "status"], {
  fit: "scroll",
  gap: 1,
  available: 8,
});
const page = horizontal(
  [
    { id: "editor", basis: 5, min: 3 },
    { id: "preview", basis: 7, min: 4 },
  ],
  { fit: "elastic", gap: 1, available: 12 },
);

const contract = {
  components,
  formList: { owns: ["values", "status"] },
  text: { draft: "local", doesNotRecolorSavedData: true },
  rule: { separates: "editor / preview" },
  actionStrip: { actions: ["save", "review"] },
};
renderEditor({ fields: editor, layout: resolvePlane(page), contract });`,
    rust: `let page = PlaneSpec {
    axis: Axis::Horizontal,
    fit: Fit::Elastic,
    gap: 1.0,
    children: vec![
        PlaneChild { id: "editor", basis: 5.0, min: 3.0 },
        PlaneChild { id: "preview", basis: 7.0, min: 4.0 },
    ],
};
let layout = resolve_plane(&page, 12.0);
let form_list = FormList::new()
    .owns(["values", "status"])
    .keeps_child_draft_local();
let title = Text::editable("title");
let boundary = Rule::horizontal();
let actions = ActionStrip::new(["save", "review"]);
render_editor(layout, form_list, title, boundary, actions);`,
  },
  planning: {
    components: [
      "Horizontal",
      "Vertical",
      "ChoiceGroup",
      "ActionStrip",
      "StatusIcon",
    ],
    javascript: `import { horizontal, resolvePlane, vertical } from "@ugoite/ikasue";

const components = ["Horizontal", "Vertical", "ChoiceGroup", "ActionStrip", "StatusIcon"];
const days = horizontal(
  [
    { id: "mon", basis: 3, min: 2 },
    { id: "tue", basis: 3, min: 2 },
    { id: "wed", basis: 3, min: 2 },
    { id: "thu", basis: 3, min: 2 },
  ],
  { fit: "scroll", gap: 1, available: 9 },
);
const monday = vertical(["standup", "review", "handoff"], {
  fit: "wrap",
  gap: 1,
});

const contract = {
  components,
  choiceGroup: { direction: "horizontal", selected: "standard" },
  actionStrip: { actions: ["week", "resources", "add"] },
  statusIcon: { kind: "confirmed" },
  axisRule: "days compare horizontally; events read vertically",
};
renderCalendar({ days: resolvePlane(days), monday, contract });`,
    rust: `let days = PlaneSpec {
    axis: Axis::Horizontal,
    fit: Fit::Scroll,
    gap: 1.0,
    children: vec![
        PlaneChild { id: "mon", basis: 3.0, min: 2.0 },
        PlaneChild { id: "tue", basis: 3.0, min: 2.0 },
        PlaneChild { id: "wed", basis: 3.0, min: 2.0 },
        PlaneChild { id: "thu", basis: 3.0, min: 2.0 },
    ],
};
let day_layout = resolve_plane(&days, 9.0);
let day_events = PlaneSpec {
    axis: Axis::Vertical,
    fit: Fit::Wrap,
    gap: 1.0,
    children: events_for("mon"),
};
let choices = ChoiceGroup::new(Choice::Standard).horizontal();
let actions = ActionStrip::new(["week", "resources", "add"]);
let confirmed = StatusIcon::confirmed();
render_calendar(day_layout, day_events, choices, actions, confirmed);`,
  },
  field: {
    components: [
      "Vertical",
      "Horizontal",
      "FormList",
      "BooleanText",
      "BottomDialog",
      "StatusIcon",
    ],
    javascript: `import { horizontal, resolvePlane, vertical } from "@ugoite/ikasue";

const components = ["Vertical", "Horizontal", "FormList", "BooleanText", "BottomDialog", "StatusIcon"];
const actions = horizontal(["arrived", "photo", "call"], {
  fit: "wrap",
  gap: 1,
  available: 4,
});
const job = vertical(
  [
    "location",
    "checklist",
    "photos",
    { id: "bottom-dialog", basis: 2, min: 2 },
  ],
  { fit: "scroll", gap: 1, available: 10 },
);

const contract = {
  components,
  formList: { owns: ["checklist", "evidence"] },
  booleanText: { id: "offline-ready", value: true },
  bottomDialog: { intent: "confirm", dismiss: true, preserves: ["location", "photos"] },
  statusIcon: { kind: "synced" },
};
renderFieldJob({
  actions: resolvePlane(actions),
  job: resolvePlane(job),
  contract,
});`,
    rust: `let actions = PlaneSpec {
    axis: Axis::Horizontal,
    fit: Fit::Wrap,
    gap: 1.0,
    children: vec![
        PlaneChild { id: "arrived", basis: 1.0, min: 1.0 },
        PlaneChild { id: "photo", basis: 1.0, min: 1.0 },
        PlaneChild { id: "call", basis: 1.0, min: 1.0 },
    ],
};
let job = PlaneSpec {
    axis: Axis::Vertical,
    fit: Fit::Scroll,
    gap: 1.0,
    children: vec![
        PlaneChild { id: "location", basis: 3.0, min: 2.0 },
        PlaneChild { id: "checklist", basis: 4.0, min: 3.0 },
        PlaneChild { id: "photos", basis: 3.0, min: 2.0 },
        PlaneChild { id: "bottom-dialog", basis: 2.0, min: 2.0 },
    ],
};
let dialog = BottomDialog::confirm().dismissible(true);
let offline = BooleanText::checked("offline-ready");
let form = FormList::new().owns(["checklist", "evidence"]);
let status = StatusIcon::synced();
render_field_job(resolve_plane(&actions, 4.0), resolve_plane(&job, 10.0), dialog, offline, form, status);`,
  },
  observability: {
    components: [
      "Horizontal",
      "Vertical",
      "DataTable",
      "MessageRegion",
      "ProgressRegion",
      "StatusIcon",
    ],
    javascript: `import { horizontal, resolvePlane, vertical } from "@ugoite/ikasue";

const components = ["Horizontal", "Vertical", "DataTable", "MessageRegion", "ProgressRegion", "StatusIcon"];
const timeline = vertical(["14:02 deploy", "14:07 alert", "14:11 investigation"], {
  fit: "scroll",
  gap: 1,
  available: 7,
});
const consolePlane = horizontal(
  [
    { id: "timeline", basis: 4, min: 3 },
    { id: "services", basis: 4, min: 3 },
    { id: "incident", basis: 8, min: 5 },
  ],
  { fit: "elastic", gap: 1, available: 13 },
);

const contract = {
  components,
  dataTable: { rows: "service state", selection: "service" },
  messageRegion: { kind: "warning", target: "incident" },
  progressRegion: { retainsPreviousContent: true, target: "metrics" },
  statusIcon: { kind: "degraded", label: "invoice-worker" },
};
renderIncidentConsole({
  timeline: resolvePlane(timeline),
  layout: resolvePlane(consolePlane),
  contract,
});`,
    rust: `let console = PlaneSpec {
    axis: Axis::Horizontal,
    fit: Fit::Elastic,
    gap: 1.0,
    children: vec![
        PlaneChild { id: "timeline", basis: 4.0, min: 3.0 },
        PlaneChild { id: "services", basis: 4.0, min: 3.0 },
        PlaneChild { id: "incident", basis: 8.0, min: 5.0 },
    ],
};
let layout = resolve_plane(&console, 13.0);
let services = DataTable::new().selection("service");
let message = MessageRegion::warning().target("incident");
let progress = ProgressRegion::retain_previous(ProgressPattern::Wave);
let status = StatusIcon::degraded("invoice-worker");
render_incident_console(layout, services, message, progress, status);`,
  },
};

const COPY: Record<
  ExampleLocale,
  Record<ExampleKind, Omit<ExampleCopy, "components" | "javascript" | "rust">>
> = {
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
        "dayを横に比較し、各dayのeventを縦に読むplanning/calendar画面です。幅が足りないときはscrollを明示し、後ろの予定を無言で捨てません。",
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
        "A planning/calendar surface that compares days horizontally and reads events vertically within each day. When the width is short, scroll is explicit so later appointments are not silently discarded.",
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
};

export function exampleCopy(
  locale: ExampleLocale,
  kind: ExampleKind,
): ExampleCopy {
  return { ...COPY[locale][kind], ...SOURCES[kind] };
}
