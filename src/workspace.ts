/* eslint-disable @typescript-eslint/no-unnecessary-condition */

import { isMinSize, isSplitBasis } from "./layout";
import { isIkaView } from "./contract";
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
const record = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;
const booleanMap = (): Record<string, boolean> =>
  Object.create(null) as Record<string, boolean>;
const explicitlyCollapsed = (
  value: Readonly<Record<string, boolean>> | undefined,
  id: string,
): boolean =>
  value !== undefined &&
  Object.prototype.hasOwnProperty.call(value, id) &&
  value[id] === true;
const validPane = (value: unknown): SplitPane | undefined => {
  const pane = record(value);
  if (typeof pane?.id !== "string" || !pane.id.trim()) return undefined;
  const result: { -readonly [K in keyof SplitPane]: SplitPane[K] } = {
    id: pane.id.trim(),
  };
  if (typeof pane.content === "string") result.content = pane.content;
  if (typeof pane.label === "string") result.label = pane.label.trim();
  if (typeof pane.size === "string" && isSplitBasis(pane.size))
    result.size = pane.size.trim();
  if (typeof pane.minSize === "string" && isMinSize(pane.minSize))
    result.minSize = pane.minSize.trim();
  if (typeof pane.basis === "string" && isSplitBasis(pane.basis))
    result.basis = pane.basis.trim();
  if (
    typeof pane.basis === "number" &&
    Number.isFinite(pane.basis) &&
    pane.basis >= 0
  )
    result.basis = pane.basis;
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
const panes = (values: unknown): SplitPane[] => {
  const ids = new Set<string>();
  return (Array.isArray(values) ? values : [])
    .map(validPane)
    .filter((pane): pane is SplitPane => {
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
    Array.isArray(requested) &&
    requested.length === panes.length &&
    requested.every(isSplitBasis)
  )
    return requested.map((value) => value.trim());
  return panes.map(
    (pane) =>
      pane.size ??
      (typeof pane.basis === "number"
        ? `${String(pane.basis)}fr`
        : pane.basis) ??
      "1fr",
  );
};

export function splitView(
  paneInput: readonly SplitPane[],
  options: SplitViewOptions,
): SplitViewSpec {
  const input = options as SplitViewOptions | undefined;
  const normalized = panes(paneInput);
  const orientation =
    input?.orientation === "vertical" ? "vertical" : "horizontal";
  const active =
    typeof input?.activePane === "string" &&
    normalized.some((pane) => pane.id === input.activePane && !pane.disabled)
      ? input.activePane
      : undefined;
  const collapsible = input?.collapsible === true;
  const collapsed = booleanMap();
  normalized.forEach((pane) => {
    collapsed[pane.id] = pane.disabled
      ? false
      : collapsible &&
        pane.collapsible === true &&
        explicitlyCollapsed(input?.collapsed, pane.id);
  });
  const motionOrigin =
    input?.motionOrigin === "start" ||
    input?.motionOrigin === "end" ||
    input?.motionOrigin === "top" ||
    input?.motionOrigin === "bottom"
      ? input.motionOrigin
      : orientation === "horizontal"
        ? "start"
        : "top";
  const result: { -readonly [K in keyof SplitViewSpec]: SplitViewSpec[K] } = {
    kind: "split-view",
    orientation,
    panes: normalized,
    sizes: sizes(normalized, input?.sizes),
    collapsible,
    collapsed,
    motionOrigin,
  };
  if (active !== undefined) result.activePane = active;
  if (typeof input?.onActivePaneChange === "function")
    result.onActivePaneChange = input.onActivePaneChange;
  if (typeof input?.onSizesChange === "function")
    result.onSizesChange = input.onSizesChange;
  if (typeof input?.onCollapsedChange === "function")
    result.onCollapsedChange = input.onCollapsedChange;
  return Object.freeze(result);
}

export function createSplitViewState(
  paneInput: readonly SplitPane[],
  initial?: Partial<SplitViewState>,
): SplitViewState {
  const normalized = panes(paneInput);
  const paneIds = normalized.map((pane) => pane.id);
  const initialSizes =
    Array.isArray(initial?.sizes) &&
    initial.sizes.length === paneIds.length &&
    initial.sizes.every(isSplitBasis)
      ? initial.sizes.map((value) => value.trim())
      : normalized.map(
          (pane) =>
            pane.size ??
            (typeof pane.basis === "number"
              ? `${String(pane.basis)}fr`
              : pane.basis) ??
            "1fr",
        );
  const activePane =
    typeof initial?.activePane === "string" &&
    paneIds.includes(initial.activePane) &&
    !normalized.find((pane) => pane.id === initial.activePane)?.disabled
      ? initial.activePane
      : undefined;
  const collapsed = booleanMap();
  normalized.forEach((pane) => {
    collapsed[pane.id] = pane.disabled
      ? false
      : pane.collapsible === true &&
        explicitlyCollapsed(initial?.collapsed, pane.id);
  });
  const state: { -readonly [K in keyof SplitViewState]: SplitViewState[K] } = {
    sizes: initialSizes,
    collapsed,
  };
  if (activePane !== undefined) state.activePane = activePane;
  const frozen = Object.freeze(state);
  metaByState.set(frozen, {
    paneIds,
    disabled: new Set(
      normalized.filter((pane) => pane.disabled).map((pane) => pane.id),
    ),
    collapsible: new Set(
      normalized
        .filter((pane) => pane.collapsible === true)
        .map((pane) => pane.id),
    ),
  });
  return frozen;
}
const same = (a: unknown, b: unknown) => Object.is(a, b);
const metaByState = new WeakMap<
  SplitViewState,
  {
    readonly paneIds: readonly string[];
    readonly disabled: ReadonlySet<string>;
    readonly collapsible: ReadonlySet<string>;
  }
>();
const hasPane = (state: SplitViewState, id: string): boolean => {
  const meta = metaByState.get(state);
  if (meta) return meta.paneIds.includes(id);
  const collapsed = state?.collapsed;
  return (
    typeof collapsed === "object" &&
    collapsed !== null &&
    Object.prototype.hasOwnProperty.call(collapsed, id)
  );
};
const isDisabled = (state: SplitViewState, id: string): boolean =>
  metaByState.get(state)?.disabled.has(id) === true;
const isCollapsible = (state: SplitViewState, id: string): boolean =>
  metaByState.get(state)?.collapsible.has(id) ?? true;
export function setActivePane(
  state: SplitViewState,
  id: string,
): SplitViewState {
  if (!hasPane(state, id) || isDisabled(state, id) || state.activePane === id)
    return state;
  const next = Object.freeze({ ...state, activePane: id });
  const meta = metaByState.get(state);
  if (meta) metaByState.set(next, meta);
  return next;
}
export function setPaneSizes(
  state: SplitViewState,
  value: readonly string[],
): SplitViewState {
  if (
    !Array.isArray(value) ||
    value.length !==
      (metaByState.get(state)?.paneIds.length ?? state.sizes.length) ||
    !value.every(isSplitBasis) ||
    value.every((item, i) => same(item, state.sizes[i]))
  )
    return state;
  const next = Object.freeze({
    ...state,
    sizes: value.map((item) => item.trim()),
  });
  const meta = metaByState.get(state);
  if (meta) metaByState.set(next, meta);
  return next;
}
export function setPaneCollapsed(
  state: SplitViewState,
  id: string,
  value: boolean,
): SplitViewState {
  if (
    !hasPane(state, id) ||
    isDisabled(state, id) ||
    !isCollapsible(state, id) ||
    typeof value !== "boolean" ||
    state.collapsed[id] === value
  )
    return state;
  const next = Object.freeze({
    ...state,
    collapsed: Object.freeze({ ...state.collapsed, [id]: value }),
  });
  const meta = metaByState.get(state);
  if (meta) metaByState.set(next, meta);
  return next;
}

export function sidePanel(options?: SidePanelOptions): SidePanelSpec {
  const result: { -readonly [K in keyof SidePanelSpec]: SidePanelSpec[K] } = {
    kind: "side-panel",
    main: clean(options?.main),
    children: Array.isArray(options?.children)
      ? options.children.filter(isIkaView)
      : [],
    title: clean(options?.title),
    content: clean(options?.content),
    side: options?.side === "start" ? "start" : "end",
    open: Boolean(options?.open),
  };
  if (clean(options?.id)) result.id = clean(options?.id);
  if (typeof options?.onClose === "function") result.onClose = options.onClose;
  return Object.freeze(result);
}
export function bottomPanel(options?: BottomPanelOptions): BottomPanelSpec {
  const result: { -readonly [K in keyof BottomPanelSpec]: BottomPanelSpec[K] } =
    {
      kind: "bottom-panel",
      main: clean(options?.main),
      children: Array.isArray(options?.children)
        ? options.children.filter(isIkaView)
        : [],
      title: clean(options?.title),
      content: clean(options?.content),
      open: Boolean(options?.open),
    };
  if (clean(options?.id)) result.id = clean(options?.id);
  if (typeof options?.onClose === "function") result.onClose = options.onClose;
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
  if (typeof options?.onClose === "function") result.onClose = options.onClose;
  return Object.freeze(result);
}
