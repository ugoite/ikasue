import type { CatalogComponentId } from "../../../src/catalog/types";

export interface ComponentGuidance {
  readonly useWhen: string;
  readonly avoidWhen: string;
  readonly implementation: string;
  readonly keyboard: string;
  readonly accessibility: string;
}

export const COMPONENT_GUIDANCE = {
  "developer-model": {
    useWhen:
      "You need a shared vocabulary for information, editable capability, and negotiated layout. / 表示と編集、配置要求を同じ契約で扱うとき。",
    avoidWhen:
      "Do not use it as a visual wrapper or a replacement for a framework-specific component model. / 装飾用wrapperやframework固有APIの代替にはしない。",
    implementation:
      "Start with an information component, then add `editable` and an editor kind only where the workflow requires it. Let the nearest layout owner answer `ikasue:layout-request`.",
    keyboard:
      "Keep the keyboard order equal to the visual reading order; editing follows Enter/F2, Escape, and Tab contracts.",
    accessibility:
      "Expose the information role and editable state separately so a screen reader can distinguish reading from editing.",
  },
  "theme-root": {
    useWhen:
      "You want one document-level source for density, motion, selection surfaces, and structural lines. / document全体の判断規則を揃えるとき。",
    avoidWhen:
      "Do not turn theme tokens into decorative color palettes or component-local overrides that contradict the canvas.",
    implementation:
      "Mount one ThemeRoot at the application boundary and let descendants inherit its CSS custom properties; prefer semantic state tokens over arbitrary colors.",
    keyboard:
      "ThemeRoot does not own focus. It must preserve the focus ring, tab order, and input affordances of its descendants.",
    accessibility:
      "When motion is `off` or reduced motion is requested, retain state changes as a structural cue rather than hiding them.",
  },
  text: {
    useWhen:
      "A value is primarily read but sometimes edited: metadata, a form value, a table cell, or a short command. / 読むことが標準で、必要時だけ編集する情報。",
    avoidWhen:
      "Do not use it for long multi-step forms, rich text, or an input that must be permanently prominent.",
    implementation:
      "Render the value as text by default. Add `editable` and the smallest suitable editor kind only on the capability boundary; emit one commit event after validation.",
    keyboard:
      "Enter or F2 starts editing, Escape cancels, Enter commits, and Tab commits then moves to the next editable value.",
    accessibility:
      "Use a real input while editing, preserve its accessible name, and announce validation errors without replacing the value silently.",
  },
  rule: {
    useWhen:
      "A semantic boundary needs to be stated once with space and a line. / 意味の切れ目を一度だけ示したいとき。",
    avoidWhen:
      "Do not wrap every region in rules; repeated borders create the card taxonomy the system is designed to avoid.",
    implementation:
      "Place Rule between meaningful siblings and choose its axis from the layout direction. Keep the rule decorative only when a heading already supplies the boundary.",
    keyboard: "Rule is not interactive and must not enter the tab sequence.",
    accessibility:
      "Use a semantic separator when it conveys structure; avoid announcing purely decorative lines.",
  },
  "status-icon": {
    useWhen:
      "A repeated status is recognizable by icon and semantic color, with text available on demand. / 反復状態をiconで示すとき。",
    avoidWhen:
      "Do not make color or an unlabeled glyph the only way to understand a high-stakes state.",
    implementation:
      "Pair the icon with a stable accessible label and tooltip. Keep black for structure and reserve status colors for status.",
    keyboard:
      "If the status opens more detail, it must be a button with a visible focus target; a passive status remains unfocusable.",
    accessibility:
      "Provide the state in the accessible name or live description, and include a non-color cue such as the icon shape or text.",
  },
  stack: {
    useWhen:
      "Children need predictable vertical order, gap, and alignment without a surface. / 順序・gap・alignmentだけが必要な縦配置。",
    avoidWhen:
      "Do not put focus negotiation, overflow navigation, or decoration into Stack; those belong to their own contracts.",
    implementation:
      "Use Stack for the smallest vertical composition and keep its children semantically ordered in DOM order.",
    keyboard:
      "Stack does not add keyboard behavior; descendants retain normal sequential focus.",
    accessibility:
      "Use a list or group role only when the content is actually a list or group; layout alone is not a landmark.",
  },
  cluster: {
    useWhen:
      "Related short actions or values share a horizontal baseline and may wrap. / 関連する短い要素を横にまとめるとき。",
    avoidWhen:
      "Do not rely on Cluster to hide important content when the viewport is tight; use AxisFlow for negotiated space.",
    implementation:
      "Allow wrapping and preserve a meaningful DOM order. Use the active child surface sparingly so selection does not become a new container.",
    keyboard:
      "Use the interaction model of the children; a cluster of tabs or choices should implement that widget's arrow-key behavior.",
    accessibility:
      "Give the cluster a group label only when it has a user-facing grouping; do not add an empty group landmark.",
  },
  "focus-plane": {
    useWhen:
      "Two or more adjacent regions compete for space, such as list/detail or editor/history. / 隣接領域がfocusに応じて幅を譲るとき。",
    avoidWhen:
      "Do not use it for a fixed two-column marketing layout or as a free-form drag splitter.",
    implementation:
      "Make one region the initial focus, render the separator arrow as a button, and let FocusRegion request changes through the bubbling layout event.",
    keyboard:
      "Arrow controls move focus between regions; the focused region remains reachable even when another region expands.",
    accessibility:
      "Label each region, expose the current focus allocation, and make separator controls keyboard-operable with an understandable name.",
  },
  "focus-region": {
    useWhen:
      "A nested component needs more space without knowing its parent's visual tree. / 子componentが親の配置実装を知らずにfocusを要求するとき。",
    avoidWhen:
      "Do not dispatch layout requests from purely decorative content or use named scopes when nearest ownership is sufficient.",
    implementation:
      "Dispatch `ikasue:layout-request` with a target such as `secondary`; the nearest FocusPlane decides the feasible ratio for the viewport.",
    keyboard:
      "A focus request must not steal focus. Keep the originating control focused unless the component's own interaction explicitly moves it.",
    accessibility:
      "Announce only meaningful layout changes and keep the requested region's heading available as its accessible context.",
  },
  "axis-flow": {
    useWhen:
      "A workspace accepts an arbitrary number of regions along one axis and needs an end navigation when the viewport cannot fit them. / 可変数の領域を軸上に並べるとき。",
    avoidWhen:
      "Do not use it for a short static row where ordinary flow is enough.",
    implementation:
      "Choose `horizontal` or `vertical`, a focus strategy, and render end navigation on that same axis. Keep off-screen content in the logical order.",
    keyboard:
      "Arrow keys follow the chosen axis; Home/End reach the first and last region, and the end control remains keyboard reachable.",
    accessibility:
      "Expose the flow as a labeled region or list when appropriate, and announce the active item and position without relying on motion.",
  },
  "edge-region": {
    useWhen:
      "Detail or tooling belongs to a known edge and should reclaim space by pushing the current content. / 所在する辺からdetailやtoolを追加するとき。",
    avoidWhen:
      "Do not use it for an urgent alert that must interrupt all context; use a semantic live region for that case.",
    implementation:
      "Add a track at `right`, `left`, or `bottom`; closed means the track is removed from the allocation, not painted over the content.",
    keyboard:
      "The trigger is a button, Escape closes when dismissal is allowed, and focus returns to the trigger after the region closes.",
    accessibility:
      "Use a labeled region or dialog only when its semantics require it; never trap focus in a region that is not modal.",
  },
  "bottom-dock": {
    useWhen:
      "A short confirmation, detail view, or command area should enter from the bottom while the upper context stays visible. / 上の文脈を保った下端作業領域。",
    avoidWhen:
      "Do not use it for a long form or a permanent navigation system.",
    implementation:
      "Treat the dock as a new bottom row with an explicit purpose and size. Reserve space in layout before revealing its controls.",
    keyboard:
      "Focus enters the first meaningful control when opened, follows DOM order, and returns to the opener on close.",
    accessibility:
      "Give the dock a heading and landmark appropriate to its purpose; use dialog semantics only when it temporarily owns the task.",
  },
  "edge-nav": {
    useWhen:
      "Primary navigation needs a persistent edge clue but should expand only when the user asks for its vocabulary. / 常設railと展開nav。",
    avoidWhen:
      "Do not hide the only navigation path behind an unlabeled icon or use it for a transient tool palette.",
    implementation:
      "Keep the rail visible, expand from the left, and reallocate the main track. The selected item remains visible in both states.",
    keyboard:
      "The rail toggle, navigation items, and close action follow a predictable sequence; Arrow keys may move within the navigation list.",
    accessibility:
      "Use a navigation landmark with a label, a real button for the toggle, and `aria-current` for the selected destination.",
  },
  "elastic-tabs": {
    useWhen:
      "Siblings share one level and switching should grant space to the selected panel. / 同一階層のpanel切替。",
    avoidWhen:
      "Do not use tabs for unrelated destinations, more tabs than can be named, or simultaneous comparison of panels.",
    implementation:
      "Use automatic activation for nearby cheap panels and manual activation for expensive panels. Keep panel entry direction aligned with tab order.",
    keyboard:
      "Arrow keys move between tabs, Home/End jump to extremes, and Enter/Space activates manual tabs.",
    accessibility:
      "Implement the tabs pattern with `tablist`, `tab`, `tabpanel`, selected state, and a deterministic focus relationship.",
  },
  "icon-action": {
    useWhen:
      "A repeated action is familiar enough to be represented by an icon, with explanation available on hover and focus. / 反復操作のicon action。",
    avoidWhen:
      "Do not use an icon-only action for a novel, destructive, or ambiguous action without a visible adjacent label or confirmation.",
    implementation:
      "Use a real button, stable icon, accessible name, and tooltip. Busy state disables duplicate activation without erasing the action name.",
    keyboard:
      "Enter and Space activate; disabled and busy states are not activatable, and the tooltip appears on keyboard focus as well as hover.",
    accessibility:
      "Every icon-only action has an accessible label and a visible tooltip on focus; status is not conveyed by color alone.",
  },
  "action-strip": {
    useWhen:
      "Several closely related actions share a baseline and should remain visually quiet until active or busy. / 関連actionの操作列。",
    avoidWhen:
      "Do not group unrelated actions just because they fit on one line, and do not put primary navigation in an action strip.",
    implementation:
      "Compose labeled IconActions in order, expose the active action with a light selection surface, and let wrapping follow the viewport.",
    keyboard:
      "Use roving focus only for a true toolbar; otherwise preserve normal tab order so each action is discoverable.",
    accessibility:
      "Label a toolbar when the strip is a toolbar and ensure every action still has its own accessible name and state.",
  },
  "boolean-text": {
    useWhen:
      "The sentence is the actual meaning of a boolean preference and the whole sentence should be the hit target. / 文章を真偽として切り替える設定。",
    avoidWhen:
      "Do not remove a familiar native checkbox when users need a dense, standard form control or when the label cannot carry the meaning.",
    implementation:
      "Use a native checkbox semantics under the text grammar, render checked state with a check and quiet surface, and emit change immediately.",
    keyboard:
      "Space toggles the value and focus remains on the text control; Enter may submit only when the surrounding form defines that behavior.",
    accessibility:
      "Keep checkbox role, checked state, and label association even when the visual box is omitted.",
  },
  "choice-group": {
    useWhen:
      "Exactly one option should be chosen and the selected meaning can own a little more area. / 単一選択でradio circleを前面に出さないとき。",
    avoidWhen:
      "Do not use it for multiple selection, navigation between pages, or a value whose options are better searched than scanned.",
    implementation:
      "Render a labeled group with radio semantics, select immediately, and use horizontal or vertical layout without changing the selection grammar.",
    keyboard:
      "Arrow keys change the selected option within the group; Tab enters and leaves the group once.",
    accessibility:
      "Expose radiogroup and radio roles, group label, checked state, and a visible focus indicator independent of the selection surface.",
  },
  "form-list": {
    useWhen:
      "A form is a readable ordered sequence of labels and information values rather than a grid of boxes. / 情報の順序を中心にしたform。",
    avoidWhen:
      "Do not use it for dense spreadsheet editing or when a native fieldset and legend communicate the grouping better.",
    implementation:
      "Place each label above its Text value, keep the editable capability local, and use marker style only when it adds meaning.",
    keyboard:
      "Tab moves through editable information only; each Text preserves Enter/F2, Escape, commit, and validation behavior.",
    accessibility:
      "Associate every label with its control and expose mixed or error state in text and programmatic descriptions.",
  },
  "data-table": {
    useWhen:
      "Users inspect, copy, paste, or edit a rectangular set of business data with the cell as the task unit. / cell中心の業務データ。",
    avoidWhen:
      "Do not use it for page layout or a small key-value list that is clearer as a FormList.",
    implementation:
      "Keep headers meaningful, select a cell, lightly highlight its row and column, and enable editing only for permitted cells.",
    keyboard:
      "Arrow keys move cells, Home/End move within the axis, Ctrl/Cmd+C/V handles clipboard, and Enter/F2 edits when enabled.",
    accessibility:
      "Use a real table with headers and selection announcements; clipboard permission failures must leave the cell usable.",
  },
  "history-gutter": {
    useWhen:
      "Revisions belong beside the current information and users need a compact timeline of current, previous, and initial states. / 横の時間軸として履歴を示すとき。",
    avoidWhen:
      "Do not use it as a detached audit dashboard or when revision labels need long explanations in the main flow.",
    implementation:
      "Draw one line with points for revisions, highlight only the selected point, and link the selected revision to the content it explains.",
    keyboard:
      "Arrow keys move between revisions and Enter activates the selected revision; focus stays near the current content.",
    accessibility:
      "Expose the gutter as a labeled list or navigation of revisions, not as an unexplained decorative line.",
  },
  "progress-region": {
    useWhen:
      "A known region is processing and its previous content is still useful context. / 内容を残したまま対象regionだけをloading表示。",
    avoidWhen:
      "Do not cover the whole document for a local operation or replace a useful result with an indeterminate spinner.",
    implementation:
      "Keep the old content mounted, apply a wave/scan/edge structural motion to that region, and remove it when the operation settles.",
    keyboard:
      "Do not block unrelated focus; disable only controls that would duplicate the active operation.",
    accessibility:
      "Mark the region busy and provide a concise live status; `prefers-reduced-motion` must still show busy state structurally.",
  },
  "message-region": {
    useWhen:
      "A short status belongs to a region and selecting the message should give that region attention. / 対象regionと結びついた短いmessage。",
    avoidWhen:
      "Do not use it as a global notification queue or let a warning depend only on its status color.",
    implementation:
      "Link the message to its target, use the semantic status color sparingly, and request a temporary focus allocation when activated.",
    keyboard:
      "The message is a button when actionable, supports Enter/Space, and returns focus predictably after the region settles.",
    accessibility:
      "Use a live region for new status when appropriate, provide a text label, and connect the message to its target with descriptive relationships.",
  },
  "bottom-dialog": {
    useWhen:
      "A short decision should enter from below while the information that justifies it remains readable. / 根拠を隠さない確認dialog。",
    avoidWhen:
      "Do not use it for long forms, unrelated navigation, or a truly blocking alert that requires a different modal policy.",
    implementation:
      "Add a bottom row with a heading, explicit primary and dismiss actions, and a reallocated track; do not use a z-index overlay.",
    keyboard:
      "On open, focus the dialog heading or first action as appropriate; Tab stays within a genuinely modal decision and Escape dismisses when allowed.",
    accessibility:
      "Use dialog semantics only for the temporary decision, label it with a heading, describe its intent, and restore focus to the opener.",
  },
} satisfies Record<CatalogComponentId, ComponentGuidance>;
