import { isFlexBasis, isMinSize } from "./layout";
import type {
  BottomPanelOptions,
  BottomPanelSpec,
  DialogOptions,
  DialogSpec,
  LoadingRegionOptions,
  LoadingRegionSpec,
  SidePanelOptions,
  SidePanelSpec,
  SplitPane,
  SplitViewOptions,
  SplitViewSpec,
  SplitViewState,
} from "./types";

const clean = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";
const validPane = (pane: SplitPane): SplitPane | undefined => {
  if (
    typeof pane.id !== "string" ||
    !pane.id.trim() ||
    typeof pane.content !== "string"
  )
    return undefined;
  const result: { -readonly [K in keyof SplitPane]: SplitPane[K] } = {
    id: pane.id.trim(),
    content: pane.content,
  };
  if (typeof pane.label === "string") result.label = pane.label.trim();
  if (typeof pane.size === "string" && isFlexBasis(pane.size))
    result.size = pane.size.trim();
  if (typeof pane.minSize === "string" && isMinSize(pane.minSize))
    result.minSize = pane.minSize.trim();
  if (typeof pane.basis === "string" && isFlexBasis(pane.basis))
    result.basis = pane.basis.trim();
  if (
    typeof pane.grow === "number" &&
    Number.isFinite(pane.grow) &&
    pane.grow >= 0
  )
    result.grow = pane.grow;
  if (
    typeof pane.shrink === "number" &&
    Number.isFinite(pane.shrink) &&
    pane.shrink >= 0
  )
    result.shrink = pane.shrink;
  if (typeof pane.collapsible === "boolean")
    result.collapsible = pane.collapsible;
  if (typeof pane.disabled === "boolean") result.disabled = pane.disabled;
  return result;
};
const panes = (
  values: readonly SplitPane[] | null | undefined,
): SplitPane[] => {
  const ids = new Set<string>();
  return (values ?? []).map(validPane).filter((pane): pane is SplitPane => {
    if (!pane || ids.has(pane.id)) return false;
    ids.add(pane.id);
    return true;
  });
};
const sizes = (
  panes: readonly SplitPane[],
  requested?: readonly string[],
): string[] => {
  if (
    requested &&
    requested.length === panes.length &&
    requested.every(isFlexBasis)
  )
    return requested.map((value) => value.trim());
  return panes.map((pane) => pane.size ?? pane.basis ?? "1fr");
};

export function splitView(
  paneInput: readonly SplitPane[] = [],
  options?: SplitViewOptions,
): SplitViewSpec {
  const normalized = panes(paneInput);
  const orientation =
    options?.orientation === "vertical" ? "vertical" : "horizontal";
  const active =
    typeof options?.activePane === "string" &&
    normalized.some((pane) => pane.id === options.activePane && !pane.disabled)
      ? options.activePane
      : undefined;
  const collapsed: Record<string, boolean> = {};
  normalized.forEach((pane) => {
    collapsed[pane.id] = pane.disabled
      ? false
      : Boolean(options?.collapsed?.[pane.id]);
  });
  const result: { -readonly [K in keyof SplitViewSpec]: SplitViewSpec[K] } = {
    kind: "split-view",
    orientation,
    panes: normalized,
    sizes: sizes(normalized, options?.sizes),
    collapsible: Boolean(options?.collapsible),
    collapsed,
    motionOrigin:
      options?.motionOrigin ?? (orientation === "horizontal" ? "start" : "top"),
  };
  if (active !== undefined) result.activePane = active;
  if (options?.onActivePaneChange)
    result.onActivePaneChange = options.onActivePaneChange;
  if (options?.onSizesChange) result.onSizesChange = options.onSizesChange;
  if (options?.onCollapsedChange)
    result.onCollapsedChange = options.onCollapsedChange;
  return Object.freeze(result);
}

export function createSplitViewState(
  paneInput: readonly SplitPane[] = [],
  initial?: Partial<SplitViewState>,
): SplitViewState {
  const normalized = panes(paneInput);
  const paneIds = normalized.map((pane) => pane.id);
  const initialSizes =
    initial?.sizes &&
    initial.sizes.length === paneIds.length &&
    initial.sizes.every(isFlexBasis)
      ? initial.sizes.map((value) => value.trim())
      : normalized.map((pane) => pane.size ?? pane.basis ?? "1fr");
  const activePane =
    typeof initial?.activePane === "string" &&
    paneIds.includes(initial.activePane) &&
    !normalized.find((pane) => pane.id === initial.activePane)?.disabled
      ? initial.activePane
      : undefined;
  const collapsed: Record<string, boolean> = {};
  normalized.forEach((pane) => {
    collapsed[pane.id] = pane.disabled
      ? false
      : Boolean(initial?.collapsed?.[pane.id]);
  });
  const state: { -readonly [K in keyof SplitViewState]: SplitViewState[K] } = {
    paneIds,
    sizes: initialSizes,
    collapsed,
  };
  if (activePane !== undefined) state.activePane = activePane;
  return Object.freeze(state);
}
const same = (a: unknown, b: unknown) => Object.is(a, b);
export function setActivePane(
  state: SplitViewState,
  id: string,
): SplitViewState {
  if (!state.paneIds.includes(id) || state.activePane === id) return state;
  return Object.freeze({ ...state, activePane: id });
}
export function setPaneSizes(
  state: SplitViewState,
  value: readonly string[],
): SplitViewState {
  if (
    value.length !== state.paneIds.length ||
    !value.every(isFlexBasis) ||
    value.every((item, i) => same(item, state.sizes[i]))
  )
    return state;
  return Object.freeze({ ...state, sizes: value.map((item) => item.trim()) });
}
export function setPaneCollapsed(
  state: SplitViewState,
  id: string,
  value: boolean,
): SplitViewState {
  if (!state.paneIds.includes(id) || state.collapsed[id] === value)
    return state;
  return Object.freeze({
    ...state,
    collapsed: Object.freeze({ ...state.collapsed, [id]: value }),
  });
}

export function sidePanel(options?: SidePanelOptions): SidePanelSpec {
  const result: { -readonly [K in keyof SidePanelSpec]: SidePanelSpec[K] } = {
    kind: "side-panel",
    title: clean(options?.title),
    content: clean(options?.content),
    side: options?.side === "start" ? "start" : "end",
    open: Boolean(options?.open),
  };
  if (clean(options?.id)) result.id = clean(options?.id);
  if (options?.onClose) result.onClose = options.onClose;
  return Object.freeze(result);
}
export function bottomPanel(options?: BottomPanelOptions): BottomPanelSpec {
  const result: { -readonly [K in keyof BottomPanelSpec]: BottomPanelSpec[K] } =
    {
      kind: "bottom-panel",
      title: clean(options?.title),
      content: clean(options?.content),
      open: Boolean(options?.open),
    };
  if (clean(options?.id)) result.id = clean(options?.id);
  if (options?.onClose) result.onClose = options.onClose;
  return Object.freeze(result);
}
export function loadingRegion(
  options?: LoadingRegionOptions,
): LoadingRegionSpec {
  const result: {
    -readonly [K in keyof LoadingRegionSpec]: LoadingRegionSpec[K];
  } = {
    kind: "loading-region",
    content: clean(options?.content),
    busy: Boolean(options?.busy),
    label: clean(options?.label) || "Loading",
  };
  if (clean(options?.id)) result.id = clean(options?.id);
  if (
    typeof options?.progress === "number" &&
    Number.isFinite(options.progress) &&
    options.progress >= 0 &&
    options.progress <= 100
  )
    result.progress = options.progress;
  return Object.freeze(result);
}
export function dialog(options?: DialogOptions): DialogSpec {
  const result: { -readonly [K in keyof DialogSpec]: DialogSpec[K] } = {
    kind: "dialog",
    title: clean(options?.title),
    content: clean(options?.content),
    open: Boolean(options?.open),
    modal: options?.modal !== false,
  };
  if (clean(options?.id)) result.id = clean(options?.id);
  if (clean(options?.openerId)) result.openerId = clean(options?.openerId);
  if (options?.onClose) result.onClose = options.onClose;
  return Object.freeze(result);
}
