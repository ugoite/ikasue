import {
  resolvePlane,
  type PlaneAxis,
  type PlaneFit,
  type ResolvedPlane,
} from "./plane";

export type FocusCollapse = "sliver" | "zero";

export interface FocusViewport {
  readonly inline: number;
  readonly block: number;
}

export interface FocusLeaf {
  readonly kind: "leaf";
  readonly id: string;
  readonly basis?: number;
  readonly min?: number;
}

export interface EdgeRegion {
  readonly id: string;
  readonly edge: "left" | "right" | "top" | "bottom";
  readonly basis?: number;
  readonly min?: number;
  readonly temporary?: boolean;
  readonly restoreFocus?: string;
}

export interface FocusBranch {
  readonly kind: "branch";
  readonly id: string;
  readonly axis: PlaneAxis;
  readonly fit?: PlaneFit;
  readonly gap?: number;
  readonly basis?: number;
  readonly min?: number;
  readonly navigation?: boolean;
  readonly children: readonly FocusNode[];
  readonly edgeRegions?: readonly EdgeRegion[];
}

export type FocusNode = FocusLeaf | FocusBranch;

export interface FocusPlaneInput {
  readonly root: FocusBranch;
  readonly focus?: string;
  readonly viewport: FocusViewport;
  readonly collapse?: FocusCollapse;
}

export type FocusPlaneSpec = FocusPlaneInput;

export interface FocusRequest {
  readonly path: string;
  readonly level?: "compact" | "expanded" | "exclusive";
}

export interface FocusRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export type FocusRegionState =
  "focused" | "visible" | "compressed" | "collapsed";

export interface ResolvedFocusRegion {
  readonly path: string;
  readonly parentPath?: string;
  readonly id: string;
  readonly kind: FocusNode["kind"];
  readonly axis?: PlaneAxis;
  readonly rect: FocusRect;
  readonly state: FocusRegionState;
  readonly focused: boolean;
  readonly children: readonly string[];
}

export interface ResolvedEdgeRegion {
  readonly path: string;
  readonly parentPath: string;
  readonly id: string;
  readonly edge: EdgeRegion["edge"];
  readonly rect: FocusRect;
  readonly temporary: boolean;
  readonly restoreFocus?: string;
}

export interface FocusNavigationItem {
  readonly path: string;
  readonly id: string;
  readonly index: number;
  readonly active: boolean;
}

export interface FocusNavigation {
  readonly path: string;
  readonly axis: PlaneAxis;
  readonly kind: "edge-nav" | "elastic-tabs";
  readonly generated: true;
  readonly items: readonly FocusNavigationItem[];
  readonly focusIndex: number;
  readonly canPrevious: boolean;
  readonly canNext: boolean;
  readonly previous?: string;
  readonly next?: string;
}

export interface ResolvedFocusPlane {
  readonly root: FocusBranch;
  readonly viewport: FocusRect;
  readonly focusPath: string;
  readonly focusLeaf?: string;
  readonly collapse: FocusCollapse;
  readonly regions: readonly ResolvedFocusRegion[];
  readonly edges: readonly ResolvedEdgeRegion[];
  readonly navigation: readonly FocusNavigation[];
}

const DEFAULT_AXIS: PlaneAxis = "vertical";
const DEFAULT_FIT: PlaneFit = "elastic";
const DEFAULT_BASIS = 1;
const DEFAULT_GAP = 0;
const DEFAULT_COLLAPSE: FocusCollapse = "sliver";
const SLIVER_FRACTION = 0.08;

function isFiniteNonNegative(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function normalizeId(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const id = value.trim();
  return id && !id.includes("/") ? id : undefined;
}

function normalizePath(value: unknown): readonly string[] {
  if (typeof value !== "string") return [];
  return value
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function pathKey(path: readonly string[]): string {
  return path.join("/");
}

function normalizeExtent(value: unknown, fallback: number): number {
  return isFiniteNonNegative(value) ? value : fallback;
}

function normalizeBasisMin(
  basisValue: unknown,
  minValue: unknown,
): { readonly basis: number; readonly min: number } {
  const basis = normalizeExtent(basisValue, DEFAULT_BASIS);
  const min = isFiniteNonNegative(minValue) ? Math.min(minValue, basis) : 0;
  return { basis, min };
}

function normalizeEdge(value: unknown): EdgeRegion["edge"] | undefined {
  return value === "left" ||
    value === "right" ||
    value === "top" ||
    value === "bottom"
    ? value
    : undefined;
}

function normalizeEdgeRegions(value: unknown): readonly EdgeRegion[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const result: EdgeRegion[] = [];
  for (const candidate of value) {
    if (!candidate || typeof candidate !== "object") continue;
    const input = candidate as Record<string, unknown>;
    const id = normalizeId(input.id);
    const edge = normalizeEdge(input.edge);
    if (!id || !edge || seen.has(id)) continue;
    seen.add(id);
    const { basis, min } = normalizeBasisMin(input.basis, input.min);
    const restoreFocus = normalizeId(input.restoreFocus);
    result.push({
      id,
      edge,
      basis,
      min,
      temporary: input.temporary === true,
      ...(restoreFocus === undefined ? {} : { restoreFocus }),
    });
  }
  return result;
}

function normalizeNode(value: unknown): FocusNode | undefined {
  if (!value || typeof value !== "object") return undefined;
  const input = value as Record<string, unknown>;
  const id = normalizeId(input.id);
  if (!id) return undefined;
  const { basis, min } = normalizeBasisMin(input.basis, input.min);
  if (input.kind === "leaf") return { kind: "leaf", id, basis, min };
  if (input.kind !== "branch") return undefined;

  const axis: PlaneAxis =
    input.axis === "horizontal" || input.axis === "vertical"
      ? input.axis
      : DEFAULT_AXIS;
  const fit: PlaneFit =
    input.fit === "elastic" || input.fit === "wrap" ? input.fit : DEFAULT_FIT;
  const gap = normalizeExtent(input.gap, DEFAULT_GAP);
  const children: FocusNode[] = [];
  const seen = new Set<string>();
  if (Array.isArray(input.children)) {
    for (const childValue of input.children) {
      const child = normalizeNode(childValue);
      if (!child || seen.has(child.id)) continue;
      seen.add(child.id);
      children.push(child);
    }
  }
  return {
    kind: "branch",
    id,
    axis,
    fit,
    gap,
    basis,
    min,
    navigation: input.navigation === true,
    children,
    edgeRegions: normalizeEdgeRegions(input.edgeRegions),
  };
}

function emptyRoot(): FocusBranch {
  return {
    kind: "branch",
    id: "root",
    axis: DEFAULT_AXIS,
    fit: DEFAULT_FIT,
    gap: DEFAULT_GAP,
    basis: DEFAULT_BASIS,
    min: 0,
    navigation: false,
    children: [],
    edgeRegions: [],
  };
}

function firstLeafPath(
  node: FocusNode,
  prefix: readonly string[],
): readonly string[] | undefined {
  const path = [...prefix, node.id];
  if (node.kind === "leaf") return path;
  for (const child of node.children) {
    const result = firstLeafPath(child, path);
    if (result) return result;
  }
  return undefined;
}

function resolveRequestedPath(
  root: FocusBranch,
  requested: readonly string[],
): readonly string[] {
  const rootPath = [root.id];
  const segments =
    requested[0] === root.id ? requested : [root.id, ...requested];
  let node: FocusNode = root;
  let prefix = rootPath;
  let index = segments[0] === root.id ? 1 : 0;
  while (index < segments.length && node.kind === "branch") {
    const childMatch: FocusNode | undefined = node.children.find(
      (child) => child.id === segments[index],
    );
    if (!childMatch) break;
    node = childMatch;
    prefix = [...prefix, childMatch.id];
    index += 1;
  }
  if (node.kind === "leaf") return prefix;
  return firstLeafPath(node, prefix.slice(0, -1)) ?? [];
}

/** Normalizes recursive plane input and returns a stable v1 contract. */
export function normalizeFocusPlane(
  input: FocusPlaneInput | null = null,
): FocusPlaneSpec {
  const candidate = (input ?? {}) as Record<string, unknown>;
  const root = normalizeNode(candidate.root);
  const normalizedRoot = root?.kind === "branch" ? root : emptyRoot();
  const viewportValue =
    candidate.viewport && typeof candidate.viewport === "object"
      ? (candidate.viewport as Record<string, unknown>)
      : {};
  const viewport: FocusViewport = {
    inline: normalizeExtent(viewportValue.inline, 0),
    block: normalizeExtent(viewportValue.block, 0),
  };
  const requested = normalizePath(candidate.focus);
  const focusPath = resolveRequestedPath(normalizedRoot, requested);
  return {
    root: normalizedRoot,
    viewport,
    ...(focusPath.length ? { focus: pathKey(focusPath) } : {}),
    collapse:
      candidate.collapse === "zero" || candidate.collapse === "sliver"
        ? candidate.collapse
        : DEFAULT_COLLAPSE,
  };
}

/** Creates a focus request without exposing coordinates or DOM state. */
export function requestFocus(
  input: FocusPlaneInput | FocusPlaneSpec,
  request: FocusRequest | string,
): FocusPlaneSpec {
  const path = typeof request === "string" ? request : request.path;
  const level = typeof request === "string" ? undefined : request.level;
  return normalizeFocusPlane({
    ...input,
    focus: path,
    ...(level === "exclusive" ? { collapse: "zero" } : {}),
    ...(level === "compact" ? { collapse: "sliver" } : {}),
  });
}

function rectMain(rect: FocusRect, axis: PlaneAxis): number {
  return axis === "horizontal" ? rect.width : rect.height;
}

function setRectMain(
  rect: FocusRect,
  axis: PlaneAxis,
  offset: number,
  size: number,
  line: number,
  lines: number,
): FocusRect {
  if (axis === "horizontal") {
    const lineHeight = lines > 0 ? rect.height / lines : rect.height;
    return {
      x: rect.x + offset,
      y: rect.y + line * lineHeight,
      width: size,
      height: lineHeight,
    };
  }
  const lineWidth = lines > 0 ? rect.width / lines : rect.width;
  return {
    x: rect.x + line * lineWidth,
    y: rect.y + offset,
    width: lineWidth,
    height: size,
  };
}

interface EdgeAllocation {
  readonly content: FocusRect;
  readonly edges: readonly ResolvedEdgeRegion[];
}

function edgeExtent(edge: EdgeRegion): number {
  return edge.basis ?? DEFAULT_BASIS;
}

function allocateOppositeEdgeExtents(
  first: readonly EdgeRegion[],
  second: readonly EdgeRegion[],
  available: number,
): readonly [readonly number[], readonly number[]] {
  const requested = [...first, ...second].map(edgeExtent);
  const total = requested.reduce((sum, size) => sum + size, 0);
  const factor = total > available && total > 0 ? available / total : 1;
  const firstCount = first.length;
  return [
    requested.slice(0, firstCount).map((size) => size * factor),
    requested.slice(firstCount).map((size) => size * factor),
  ];
}

function allocateEdges(
  branch: FocusBranch,
  path: string,
  rect: FocusRect,
  edges: ResolvedEdgeRegion[],
): EdgeAllocation {
  const left = branch.edgeRegions?.filter((item) => item.edge === "left") ?? [];
  const right =
    branch.edgeRegions?.filter((item) => item.edge === "right") ?? [];
  const top = branch.edgeRegions?.filter((item) => item.edge === "top") ?? [];
  const bottom =
    branch.edgeRegions?.filter((item) => item.edge === "bottom") ?? [];
  const [leftSizes, rightSizes] = allocateOppositeEdgeExtents(
    left,
    right,
    rect.width,
  );
  const [topSizes, bottomSizes] = allocateOppositeEdgeExtents(
    top,
    bottom,
    rect.height,
  );
  const leftExtent = leftSizes.reduce((sum, size) => sum + size, 0);
  const rightExtent = rightSizes.reduce((sum, size) => sum + size, 0);
  const topExtent = topSizes.reduce((sum, size) => sum + size, 0);
  const bottomExtent = bottomSizes.reduce((sum, size) => sum + size, 0);
  const content: FocusRect = {
    x: rect.x + leftExtent,
    y: rect.y + topExtent,
    width: Math.max(0, rect.width - leftExtent - rightExtent),
    height: Math.max(0, rect.height - topExtent - bottomExtent),
  };

  const addEdge = (item: EdgeRegion, size: number, edgeIndex: number): void => {
    const itemPath = `${path}/@edge/${item.id}`;
    let itemRect: FocusRect;
    if (item.edge === "left") {
      const offset = leftSizes
        .slice(0, edgeIndex)
        .reduce((sum, value) => sum + value, 0);
      itemRect = {
        x: rect.x + offset,
        y: content.y,
        width: size,
        height: content.height,
      };
    } else if (item.edge === "right") {
      const offset = rightSizes
        .slice(0, edgeIndex)
        .reduce((sum, value) => sum + value, 0);
      itemRect = {
        x: content.x + content.width + offset,
        y: content.y,
        width: size,
        height: content.height,
      };
    } else if (item.edge === "top") {
      const offset = topSizes
        .slice(0, edgeIndex)
        .reduce((sum, value) => sum + value, 0);
      itemRect = {
        x: content.x,
        y: rect.y + offset,
        width: content.width,
        height: size,
      };
    } else {
      const offset = bottomSizes
        .slice(0, edgeIndex)
        .reduce((sum, value) => sum + value, 0);
      itemRect = {
        x: content.x,
        y: content.y + content.height + offset,
        width: content.width,
        height: size,
      };
    }
    edges.push({
      path: itemPath,
      parentPath: path,
      id: item.id,
      edge: item.edge,
      rect: itemRect,
      temporary: item.temporary === true,
      ...(item.restoreFocus === undefined
        ? {}
        : { restoreFocus: item.restoreFocus }),
    });
  };
  left.forEach((item, index) => addEdge(item, leftSizes[index] ?? 0, index));
  right.forEach((item, index) => addEdge(item, rightSizes[index] ?? 0, index));
  top.forEach((item, index) => addEdge(item, topSizes[index] ?? 0, index));
  bottom.forEach((item, index) =>
    addEdge(item, bottomSizes[index] ?? 0, index),
  );
  return {
    content,
    edges: edges.slice(
      -left.length - right.length - top.length - bottom.length,
    ),
  };
}

interface ChildAllocation {
  readonly resolved: ResolvedPlane | undefined;
  readonly sizes: readonly number[];
  readonly offsets: readonly number[];
  readonly lines: readonly number[];
  readonly lineCount: number;
  readonly constrained: boolean;
}

function requestedExtent(branch: FocusBranch): number {
  const gap = branch.gap ?? DEFAULT_GAP;
  return branch.children.reduce(
    (sum, child, index) =>
      sum + (child.basis ?? DEFAULT_BASIS) + (index > 0 ? gap : 0),
    0,
  );
}

function focusedChildId(
  path: string,
  focusPath: readonly string[],
): string | undefined {
  const current = path.split("/");
  if (focusPath.length <= current.length) return undefined;
  if (current.some((segment, index) => focusPath[index] !== segment))
    return undefined;
  return focusPath[current.length];
}

function focusedAllocation(
  branch: FocusBranch,
  available: number,
  focusIndex: number,
  collapse: FocusCollapse,
): ChildAllocation {
  const count = branch.children.length;
  if (count === 0)
    return {
      resolved: undefined,
      sizes: [],
      offsets: [],
      lines: [],
      lineCount: 0,
      constrained: true,
    };
  if (collapse === "zero") {
    return {
      resolved: undefined,
      sizes: branch.children.map((_, index) =>
        index === focusIndex ? available : 0,
      ),
      offsets: branch.children.map(() => 0),
      lines: branch.children.map(() => 0),
      lineCount: 1,
      constrained: true,
    };
  }
  const gap = branch.gap ?? DEFAULT_GAP;
  const gapBudget = gap * Math.max(0, count - 1);
  const usable = Math.max(0, available - gapBudget);
  const slivers = branch.children.map((child, index) => {
    if (index === focusIndex) return 0;
    const basis = child.basis ?? DEFAULT_BASIS;
    const min = child.min ?? 0;
    return Math.min(basis, Math.max(min, available * SLIVER_FRACTION));
  });
  const sliverTotal = slivers.reduce((sum, size) => sum + size, 0);
  const focusedMin = branch.children[focusIndex]?.min ?? 0;
  const maxSliverTotal = Math.max(0, usable - Math.min(focusedMin, usable));
  const factor =
    sliverTotal > maxSliverTotal ? maxSliverTotal / sliverTotal : 1;
  const sizes = slivers.map((size, index) =>
    index === focusIndex ? 0 : size * factor,
  );
  const used = sizes.reduce((sum, size) => sum + size, 0);
  sizes[focusIndex] = Math.max(0, usable - used);
  const offsets: number[] = [];
  let offset = 0;
  for (const size of sizes) {
    offsets.push(offset);
    offset += size + gap;
  }
  return {
    resolved: undefined,
    sizes,
    offsets,
    lines: branch.children.map(() => 0),
    lineCount: 1,
    constrained: true,
  };
}

function allocateChildren(
  branch: FocusBranch,
  rect: FocusRect,
  path: string,
  focusPath: readonly string[],
  collapse: FocusCollapse,
): ChildAllocation {
  const available = rectMain(rect, branch.axis);
  const focusId = focusedChildId(path, focusPath);
  const focusIndex =
    focusId === undefined
      ? -1
      : branch.children.findIndex((child) => child.id === focusId);
  if (
    branch.navigation === true &&
    focusIndex >= 0 &&
    requestedExtent(branch) > available
  ) {
    return focusedAllocation(branch, available, focusIndex, collapse);
  }
  const childInputs = branch.children.map((child) => ({
    id: child.id,
    basis: child.basis ?? DEFAULT_BASIS,
    min: child.min ?? 0,
  }));
  const resolved = resolvePlane({
    axis: branch.axis,
    fit: branch.fit ?? DEFAULT_FIT,
    gap: branch.gap ?? DEFAULT_GAP,
    available,
    ...(focusId === undefined ? {} : { focus: focusId }),
    navigation: branch.navigation === true,
    children: childInputs,
  });
  return {
    resolved,
    sizes: resolved.children.map((child) => child.size),
    offsets: resolved.children.map((child) => child.offset),
    lines: resolved.children.map((child) => child.line),
    lineCount: resolved.lines,
    constrained: false,
  };
}

function addNavigation(
  branch: FocusBranch,
  path: string,
  focusPath: readonly string[],
  allocation: ChildAllocation,
  navigation: FocusNavigation[],
): void {
  if (!allocation.constrained || branch.navigation !== true) return;
  const focusId = focusedChildId(path, focusPath);
  const focusIndex =
    focusId === undefined
      ? -1
      : branch.children.findIndex((child) => child.id === focusId);
  if (focusIndex < 0 || branch.children.length < 2) return;
  const items = branch.children.map((child, index) => ({
    path: `${path}/${child.id}`,
    id: child.id,
    index,
    active: index === focusIndex,
  }));
  const canPrevious = focusIndex > 0;
  const canNext = focusIndex < branch.children.length - 1;
  const previous = canPrevious ? items[focusIndex - 1]?.path : undefined;
  const next = canNext ? items[focusIndex + 1]?.path : undefined;
  navigation.push({
    path,
    axis: branch.axis,
    kind: branch.axis === "horizontal" ? "edge-nav" : "elastic-tabs",
    generated: true,
    items,
    focusIndex,
    canPrevious,
    canNext,
    ...(previous === undefined ? {} : { previous }),
    ...(next === undefined ? {} : { next }),
  });
}

function regionState(
  path: string,
  size: number,
  focusPath: string,
  constrained: boolean,
  collapse: FocusCollapse,
): FocusRegionState {
  if (path === focusPath) return "focused";
  if (focusPath.startsWith(`${path}/`)) return "focused";
  if (constrained)
    return size === 0
      ? "collapsed"
      : collapse === "sliver"
        ? "compressed"
        : "collapsed";
  return size === 0 ? "collapsed" : "visible";
}

/** Resolves a recursive focus window into semantic rectangles and navigation. */
export function resolveFocusPlane(
  input: FocusPlaneInput | FocusPlaneSpec,
): ResolvedFocusPlane {
  const spec = normalizeFocusPlane(input);
  const focusSegments = normalizePath(spec.focus);
  const focusPath = pathKey(focusSegments);
  const viewport: FocusRect = {
    x: 0,
    y: 0,
    width: spec.viewport.inline,
    height: spec.viewport.block,
  };
  const regions: ResolvedFocusRegion[] = [];
  const edges: ResolvedEdgeRegion[] = [];
  const navigation: FocusNavigation[] = [];

  const visit = (
    node: FocusNode,
    path: string,
    rect: FocusRect,
    parentPath: string | undefined,
    constrained: boolean,
  ): void => {
    const active = focusPath === path || focusPath.startsWith(`${path}/`);
    if (node.kind === "leaf") {
      regions.push({
        path,
        ...(parentPath === undefined ? {} : { parentPath }),
        id: node.id,
        kind: "leaf",
        rect,
        state: regionState(
          path,
          Math.max(rect.width, rect.height),
          focusPath,
          constrained,
          spec.collapse ?? DEFAULT_COLLAPSE,
        ),
        focused: active,
        children: [],
      });
      return;
    }
    const edgeAllocation = allocateEdges(node, path, rect, edges);
    const children = node.children.map((child) => `${path}/${child.id}`);
    regions.push({
      path,
      ...(parentPath === undefined ? {} : { parentPath }),
      id: node.id,
      kind: "branch",
      axis: node.axis,
      rect,
      state: active ? "focused" : constrained ? "compressed" : "visible",
      focused: active,
      children,
    });
    const allocation = allocateChildren(
      node,
      edgeAllocation.content,
      path,
      focusSegments,
      spec.collapse ?? DEFAULT_COLLAPSE,
    );
    addNavigation(node, path, focusSegments, allocation, navigation);
    node.children.forEach((child, index) => {
      const size = allocation.sizes[index] ?? 0;
      const offset = allocation.offsets[index] ?? 0;
      const line = allocation.lines[index] ?? 0;
      const childRect = setRectMain(
        edgeAllocation.content,
        node.axis,
        offset,
        size,
        line,
        allocation.lineCount,
      );
      const childPath = `${path}/${child.id}`;
      visit(child, childPath, childRect, path, allocation.constrained);
    });
  };

  visit(spec.root, spec.root.id, viewport, undefined, false);
  const focusLeaf = focusSegments.length
    ? focusSegments[focusSegments.length - 1]
    : undefined;
  return {
    root: spec.root,
    viewport,
    focusPath,
    ...(focusLeaf === undefined ? {} : { focusLeaf }),
    collapse: spec.collapse ?? DEFAULT_COLLAPSE,
    regions,
    edges,
    navigation,
  };
}

/** Returns the focus that should receive focus after a temporary edge closes. */
export function restoreFocusAfterEdgeDismissal(
  resolved: ResolvedFocusPlane,
  edgeId: string,
): string | undefined {
  const edge = resolved.edges.find(
    (candidate) => candidate.id === edgeId && candidate.temporary,
  );
  if (!edge) return resolved.focusPath || undefined;
  const candidate = edge.restoreFocus;
  if (candidate && resolved.regions.some((region) => region.path === candidate))
    return candidate;
  return resolved.focusPath || undefined;
}
