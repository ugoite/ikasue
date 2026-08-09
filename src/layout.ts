import type {
  FlexAlign,
  FlexDirection,
  FlexJustify,
  FlexOptions,
  FlexSpec,
  FlexWrap,
  GridOptions,
  GridSpec,
  LayoutChild,
  ScrollAreaOptions,
  ScrollAreaSpec,
  SeparatorOptions,
  SeparatorSpec,
} from "./types";

const directions: readonly FlexDirection[] = ["row", "column"];
const wraps: readonly FlexWrap[] = ["nowrap", "wrap", "wrap-reverse"];
const aligns: readonly FlexAlign[] = [
  "start",
  "center",
  "end",
  "stretch",
  "baseline",
];
const justifies: readonly FlexJustify[] = [
  "start",
  "center",
  "end",
  "space-between",
  "space-around",
  "space-evenly",
];
const number = "(?:0|[0-9]+(?:\\.[0-9]+)?)";
const length = new RegExp(`^(?:0|${number}(?:px|rem|em|ch|vw|vh|%))$`);
const flexBasis = new RegExp(
  `^(?:auto|0|${number}(?:px|rem|em|ch|vw|vh|%|fr))$`,
);
const track = new RegExp(
  `^(?:auto|none|0|${number}(?:px|rem|em|ch|vw|vh|%|fr)|minmax\\((?:auto|none|0|${number}(?:px|rem|em|ch|vw|vh|%|fr)),(?:auto|none|0|${number}(?:px|rem|em|ch|vw|vh|%|fr))\\)|repeat\\([1-9][0-9]*,(?:auto|none|0|${number}(?:px|rem|em|ch|vw|vh|%|fr))\\)|fit-content\\((?:0|${number}(?:px|rem|em|ch|vw|vh|%))\\))$`,
);
const gap = (value: unknown): string => {
  if (typeof value !== "string") return "0";
  const normalized = value.trim();
  if (length.test(normalized)) return normalized;
  const calc =
    /^calc\((?:0|[0-9]+(?:\.[0-9]+)?(?:px|rem|em|ch|vw|vh|%))[ ]?[+-][ ]?(?:0|[0-9]+(?:\.[0-9]+)?(?:px|rem|em|ch|vw|vh|%))\)$/.test(
      normalized,
    );
  return calc ? normalized : "0";
};

export const isTrack = (value: unknown): value is string =>
  typeof value === "string" && track.test(value.trim());

export const isFlexBasis = (value: unknown): value is string =>
  typeof value === "string" && flexBasis.test(value.trim());

export const isMinSize = (value: unknown): value is string =>
  typeof value === "string" && length.test(value.trim());

const factor = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : undefined;

const child = (value: LayoutChild): LayoutChild | undefined => {
  if (typeof value === "string") return value;
  if (typeof value.id !== "string" || !value.id.trim()) return undefined;
  const result: { id: string; grow?: number; shrink?: number; basis?: string } =
    {
      id: value.id.trim(),
    };
  const grow = factor(value.grow);
  const shrink = factor(value.shrink);
  if (grow !== undefined) result.grow = grow;
  if (shrink !== undefined) result.shrink = shrink;
  if (typeof value.basis === "string" && isFlexBasis(value.basis))
    result.basis = value.basis.trim();
  return result;
};

const normalizedChildren = (
  children: readonly LayoutChild[] | null | undefined,
) =>
  Array.isArray(children)
    ? children
        .map(child)
        .filter((value): value is LayoutChild => value !== undefined)
    : [];

const common = (
  options: FlexOptions | null | undefined,
  direction: FlexDirection,
): Omit<FlexSpec, "kind" | "children"> => ({
  direction,
  wrap: wraps.includes(options?.wrap as FlexWrap)
    ? (options?.wrap as FlexWrap)
    : "nowrap",
  gap: gap(options?.gap),
  align: aligns.includes(options?.align as FlexAlign)
    ? (options?.align as FlexAlign)
    : "stretch",
  justify: justifies.includes(options?.justify as FlexJustify)
    ? (options?.justify as FlexJustify)
    : "start",
});

export function flex(
  children: readonly LayoutChild[] = [],
  options?: FlexOptions,
): FlexSpec {
  return Object.freeze({
    kind: "flex",
    ...common(
      options,
      directions.includes(options?.direction as FlexDirection)
        ? (options?.direction as FlexDirection)
        : "row",
    ),
    children: normalizedChildren(children),
  });
}

export function stack(
  children: readonly LayoutChild[] = [],
  options?: Omit<FlexOptions, "direction">,
): FlexSpec {
  return Object.freeze({
    kind: "flex",
    ...common(options, "column"),
    children: normalizedChildren(children),
  });
}

const trackList = (value: unknown): string => {
  if (typeof value !== "string") return "none";
  const normalized = value.trim();
  if (!normalized) return "none";
  return normalized.split(/ +/).every((item) => isTrack(item))
    ? normalized
    : "none";
};

export function grid(
  children: readonly string[] = [],
  options?: GridOptions,
): GridSpec {
  const values = Array.isArray(children)
    ? children.filter((value): value is string => typeof value === "string")
    : [];
  return Object.freeze({
    kind: "grid",
    columns: trackList(options?.columns),
    rows: trackList(options?.rows),
    gap: gap(options?.gap),
    align: aligns.includes(options?.align as FlexAlign)
      ? (options?.align as FlexAlign)
      : "stretch",
    justify: justifies.includes(options?.justify as FlexJustify)
      ? (options?.justify as FlexJustify)
      : "start",
    children: values,
  });
}

export function scrollArea(
  content = "",
  options?: ScrollAreaOptions,
): ScrollAreaSpec {
  return Object.freeze({
    kind: "scroll-area",
    content: typeof content === "string" ? content : "",
    axis:
      options?.axis === "x" || options?.axis === "both" ? options.axis : "y",
    overscroll: options?.overscroll === "contain" ? "contain" : "auto",
  });
}

export function separator(options?: SeparatorOptions): SeparatorSpec {
  const result: { -readonly [K in keyof SeparatorSpec]: SeparatorSpec[K] } = {
    kind: "separator",
    orientation:
      options?.orientation === "vertical" ? "vertical" : "horizontal",
  };
  if (options?.role === "separator") result.role = "separator";
  return Object.freeze(result);
}
