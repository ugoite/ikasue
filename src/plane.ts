/** The direction in which a plane places its children. */
export type PlaneAxis = "vertical" | "horizontal";

/**
 * The small set of adaptation policies supported by a plane.
 *
 * - `elastic` keeps children on one line and gives the focused child priority.
 * - `wrap` keeps child sizes and starts a new line when the available extent is full.
 *   A constrained navigable plane gives the focused child the whole extent so
 *   its owning rail, rather than overflow, becomes the way to move between children.
 */
export type PlaneFit = "elastic" | "wrap";

/** A serializable child descriptor that can be shared with non-DOM renderers. */
export interface PlaneChild {
  readonly id: string;
  /** Preferred size along the plane's main axis, expressed in abstract units. */
  readonly basis?: number;
  /** Smallest size allowed by the `elastic` policy. */
  readonly min?: number;
}

/** Strings are a convenient shorthand for children with the default size. */
export type PlaneChildInput = string | PlaneChild;

/** Options shared by the vertical and horizontal primitives. */
export interface PlaneOptions {
  readonly fit?: PlaneFit;
  readonly gap?: number;
  /** Available main-axis extent in abstract units. Omit it for intrinsic sizing. */
  readonly available?: number;
  /** Child id that owns the current focus. */
  readonly focus?: string;
  /** Whether the plane exposes ordered previous/next navigation. */
  readonly navigation?: boolean;
}

/** The normalized, framework-neutral description returned by a plane primitive. */
export interface PlaneSpec {
  readonly axis: PlaneAxis;
  readonly fit: PlaneFit;
  readonly gap: number;
  readonly available?: number;
  readonly focus?: string;
  readonly navigation: boolean;
  readonly children: readonly PlaneChild[];
}

/** State names shared by framework-neutral plane renderers. */
export type ResolvedPlaneChildState = "focused" | "visible" | "collapsed";

/** A child position calculated by {@link resolvePlane}. */
export interface ResolvedPlaneChild {
  readonly id: string;
  readonly index: number;
  /** Main-axis offset within the child's line. */
  readonly offset: number;
  readonly size: number;
  /** Zero-based line number; it is always zero unless `fit` is `wrap`. */
  readonly line: number;
  readonly state: ResolvedPlaneChildState;
  readonly focused: boolean;
  readonly collapsed: boolean;
  readonly visible: boolean;
}

/** Deterministic layout output for a normalized plane. */
export interface ResolvedPlane {
  readonly axis: PlaneAxis;
  readonly fit: PlaneFit;
  readonly gap: number;
  readonly available?: number;
  readonly focus?: string;
  readonly navigation: boolean;
  /** Zero-based index of the focused child, or -1 when there is no focus. */
  readonly focusIndex: number;
  readonly canPrevious: boolean;
  readonly canNext: boolean;
  readonly previous?: string;
  readonly next?: string;
  /** Main-axis extent required by the resolved children. */
  readonly extent: number;
  readonly lines: number;
  /** True when the selected fit leaves requested geometry beyond the extent. */
  readonly overflow: boolean;
  readonly children: readonly ResolvedPlaneChild[];
}

/** Input accepted by {@link normalizePlane}; malformed runtime values use defaults. */
export interface PlaneInput {
  readonly axis?: PlaneAxis;
  readonly children?: readonly PlaneChildInput[];
  readonly fit?: PlaneFit;
  readonly gap?: number;
  readonly available?: number;
  readonly focus?: string;
  readonly navigation?: boolean;
}

const DEFAULT_AXIS: PlaneAxis = "vertical";
const DEFAULT_FIT: PlaneFit = "elastic";
const DEFAULT_BASIS = 1;
const DEFAULT_GAP = 0;

function isFiniteNonNegative(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function normalizeChild(value: unknown): PlaneChild | undefined {
  if (typeof value === "string") {
    const id = value.trim();
    return id ? { id } : undefined;
  }
  if (!value || typeof value !== "object") return undefined;

  const candidate = value as { id?: unknown; basis?: unknown; min?: unknown };
  if (typeof candidate.id !== "string" || !candidate.id.trim())
    return undefined;
  const basis = isFiniteNonNegative(candidate.basis)
    ? candidate.basis
    : DEFAULT_BASIS;
  const min = isFiniteNonNegative(candidate.min)
    ? Math.min(candidate.min, basis)
    : 0;
  return { id: candidate.id.trim(), basis, min };
}

function normalizeAxis(value: unknown): PlaneAxis {
  return value === "horizontal" || value === "vertical" ? value : DEFAULT_AXIS;
}

function normalizeFit(value: unknown): PlaneFit {
  return value === "elastic" || value === "wrap" ? value : DEFAULT_FIT;
}

function normalizeFocus(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const focus = value.trim();
  return focus || undefined;
}

/**
 * Converts a plane description into a stable representation.
 *
 * Invalid axis, fit, spacing, extent, and child entries are ignored or replaced
 * with conservative defaults. Child order is always preserved.
 */
export function normalizePlane(input: PlaneInput | null = {}): PlaneSpec {
  const candidate = (input ?? {}) as {
    axis?: unknown;
    children?: unknown;
    fit?: unknown;
    gap?: unknown;
    available?: unknown;
    focus?: unknown;
    navigation?: unknown;
  };
  const children = Array.isArray(candidate.children)
    ? candidate.children
        .map((child) => normalizeChild(child))
        .filter((child): child is PlaneChild => child !== undefined)
    : [];
  const gap = isFiniteNonNegative(candidate.gap) ? candidate.gap : DEFAULT_GAP;
  const available = isFiniteNonNegative(candidate.available)
    ? candidate.available
    : undefined;
  const requestedFocus = normalizeFocus(candidate.focus);
  const focus =
    requestedFocus && children.some(({ id }) => id === requestedFocus)
      ? requestedFocus
      : undefined;

  return {
    axis: normalizeAxis(candidate.axis),
    fit: normalizeFit(candidate.fit),
    gap,
    ...(available === undefined ? {} : { available }),
    ...(focus === undefined ? {} : { focus }),
    navigation: candidate.navigation === true,
    children,
  };
}

/** Describes children ordered vertically on one plane. */
export function vertical(
  children: readonly PlaneChildInput[] = [],
  options: PlaneOptions = {},
): PlaneSpec {
  return normalizePlane({ axis: "vertical", children, ...options });
}

/** Describes children ordered horizontally on one plane. */
export function horizontal(
  children: readonly PlaneChildInput[] = [],
  options: PlaneOptions = {},
): PlaneSpec {
  return normalizePlane({ axis: "horizontal", children, ...options });
}

function shrinkSizes(
  children: readonly PlaneChild[],
  available: number,
  gap: number,
): readonly number[] {
  const space = Math.max(0, available - gap * Math.max(0, children.length - 1));
  const bases = children.map((child) => child.basis ?? DEFAULT_BASIS);
  const total = bases.reduce((sum, size) => sum + size, 0);
  if (total <= space || total === 0) return bases;

  const capacities = children.map((child, index) =>
    Math.max(0, (bases[index] ?? DEFAULT_BASIS) - (child.min ?? 0)),
  );
  const capacity = capacities.reduce((sum, size) => sum + size, 0);
  if (capacity === 0) return children.map((child) => child.min ?? 0);

  const amount = Math.min(total - space, capacity);
  return bases.map((size, index) =>
    Math.max(0, size - (amount * (capacities[index] ?? 0)) / capacity),
  );
}

function requestedExtent(children: readonly PlaneChild[], gap: number): number {
  return children.reduce(
    (sum, child, index) =>
      sum + (child.basis ?? DEFAULT_BASIS) + (index > 0 ? gap : 0),
    0,
  );
}

function focusIndex(plane: PlaneSpec): number {
  if (plane.focus !== undefined) {
    const index = plane.children.findIndex(({ id }) => id === plane.focus);
    if (index >= 0) return index;
  }
  return plane.navigation && plane.children.length > 0 ? 0 : -1;
}

function resolvedFocus(plane: PlaneSpec, index: number): string | undefined {
  const child = index >= 0 ? plane.children[index] : undefined;
  return child?.id;
}

function navigationBounds(
  plane: PlaneSpec,
  index: number,
): Pick<
  ResolvedPlane,
  "focusIndex" | "canPrevious" | "canNext" | "previous" | "next"
> {
  const canPrevious = plane.navigation && index > 0;
  const canNext =
    plane.navigation && index >= 0 && index < plane.children.length - 1;
  const previous = index > 0 ? plane.children[index - 1]?.id : undefined;
  const next = index >= 0 ? plane.children[index + 1]?.id : undefined;
  return {
    focusIndex: index,
    canPrevious,
    canNext,
    ...(canPrevious && previous !== undefined ? { previous } : {}),
    ...(canNext && next !== undefined ? { next } : {}),
  };
}

function childState(
  child: PlaneChild,
  index: number,
  focus: string | undefined,
  collapsed: boolean,
  offset: number,
  size: number,
  line: number,
): ResolvedPlaneChild {
  const focused = focus !== undefined && child.id === focus && !collapsed;
  return {
    id: child.id,
    index,
    offset,
    size,
    line,
    state: collapsed ? "collapsed" : focused ? "focused" : "visible",
    focused,
    collapsed,
    visible: !collapsed,
  };
}

function resolvedBase(
  plane: PlaneSpec,
  available: number | undefined,
  index: number,
): Pick<
  ResolvedPlane,
  "axis" | "fit" | "gap" | "available" | "focus" | "navigation"
> &
  Pick<
    ResolvedPlane,
    "focusIndex" | "canPrevious" | "canNext" | "previous" | "next"
  > {
  const focus = resolvedFocus(plane, index);
  return {
    axis: plane.axis,
    fit: plane.fit,
    gap: plane.gap,
    ...(available === undefined ? {} : { available }),
    ...(focus === undefined ? {} : { focus }),
    navigation: plane.navigation,
    ...navigationBounds(plane, index),
  };
}

function resolveFocused(
  plane: PlaneSpec,
  available: number,
  index: number,
): ResolvedPlane {
  const focus = resolvedFocus(plane, index);
  const children = plane.children.map((child, childIndex) =>
    childState(
      child,
      childIndex,
      focus,
      childIndex !== index,
      0,
      childIndex === index ? available : 0,
      0,
    ),
  );
  return {
    ...resolvedBase(plane, available, index),
    extent: available,
    lines: plane.children.length ? 1 : 0,
    overflow: false,
    children,
  };
}

function resolveSingleLine(
  plane: PlaneSpec,
  available: number | undefined,
): ResolvedPlane {
  const index = focusIndex(plane);
  const focus = resolvedFocus(plane, index);
  const requested = requestedExtent(plane.children, plane.gap);
  if (
    available !== undefined &&
    plane.navigation &&
    plane.children.length > 0 &&
    requested > available
  ) {
    return resolveFocused(plane, available, index);
  }

  const sizes: number[] =
    plane.fit === "elastic" && available !== undefined
      ? [...shrinkSizes(plane.children, available, plane.gap)]
      : plane.children.map((child) => child.basis ?? DEFAULT_BASIS);
  if (
    plane.fit === "elastic" &&
    available !== undefined &&
    requested <= available &&
    index >= 0
  ) {
    sizes[index] = (sizes[index] ?? DEFAULT_BASIS) + (available - requested);
  }
  const extent = sizes.reduce(
    (sum, size, index) => sum + size + (index > 0 ? plane.gap : 0),
    0,
  );
  const children: ResolvedPlaneChild[] = [];
  let offset = 0;
  for (const [index, child] of plane.children.entries()) {
    const size = sizes[index] ?? DEFAULT_BASIS;
    children.push(childState(child, index, focus, false, offset, size, 0));
    offset += size + plane.gap;
  }

  const minimumExtent = plane.children.reduce(
    (sum, child, index) => sum + (child.min ?? 0) + (index > 0 ? plane.gap : 0),
    0,
  );
  return {
    ...resolvedBase(plane, available, focusIndex(plane)),
    extent,
    lines: plane.children.length ? 1 : 0,
    overflow:
      available !== undefined &&
      (plane.fit === "elastic"
        ? minimumExtent > available
        : extent > available),
    children,
  };
}

function resolveWrapped(
  plane: PlaneSpec,
  available: number | undefined,
): ResolvedPlane {
  if (available === undefined || plane.children.length === 0)
    return resolveSingleLine(plane, available);

  const index = focusIndex(plane);
  if (
    plane.navigation &&
    requestedExtent(plane.children, plane.gap) > available
  ) {
    return resolveFocused(plane, available, index);
  }
  const focus = resolvedFocus(plane, index);
  const children: ResolvedPlaneChild[] = [];
  let line = 0;
  let offset = 0;
  let lineHasChild = false;
  let extent = 0;
  for (const [index, child] of plane.children.entries()) {
    const size = child.basis ?? DEFAULT_BASIS;
    const nextOffset = lineHasChild ? offset + plane.gap + size : size;
    if (lineHasChild && nextOffset > available) {
      extent = Math.max(extent, offset);
      line += 1;
      offset = 0;
      lineHasChild = false;
    }
    children.push(childState(child, index, focus, false, offset, size, line));
    offset = lineHasChild ? offset + plane.gap + size : size;
    lineHasChild = true;
    if (size > available) extent = Math.max(extent, size);
  }
  extent = Math.max(extent, offset);
  return {
    ...resolvedBase(plane, available, index),
    extent,
    lines: line + 1,
    overflow: children.some((child) => child.size > available),
    children,
  };
}

/**
 * Resolves a plane into ordered positions.
 *
 * An explicit `available` value takes precedence over the value stored on the
 * spec. With no extent, the result is intrinsic and never reports overflow.
 */
export function resolvePlane(
  input: PlaneInput | PlaneSpec,
  available?: number,
): ResolvedPlane {
  const plane = normalizePlane(input);
  const resolvedAvailable = isFiniteNonNegative(available)
    ? available
    : plane.available;
  return plane.fit === "wrap"
    ? resolveWrapped(plane, resolvedAvailable)
    : resolveSingleLine(plane, resolvedAvailable);
}
