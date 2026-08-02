import { describe, expect, it } from "vitest";

import { horizontal, normalizePlane, resolvePlane, vertical } from "./plane";

describe("plane model", () => {
  it("creates typed vertical and horizontal primitives", () => {
    expect(vertical(["one", "two"]).axis).toBe("vertical");
    expect(horizontal(["one", "two"]).axis).toBe("horizontal");
  });

  it("preserves normalized child order and calculates offsets", () => {
    const resolved = resolvePlane(
      vertical(["first", "second", "third"], { gap: 0.5 }),
    );

    expect(resolved.children.map((child) => child.id)).toEqual([
      "first",
      "second",
      "third",
    ]);
    expect(resolved.children.map((child) => child.offset)).toEqual([0, 1.5, 3]);
  });

  it("shrinks elastic children toward their minimum", () => {
    const resolved = resolvePlane(
      horizontal(
        [
          { id: "left", basis: 4, min: 1 },
          { id: "right", basis: 2, min: 1 },
        ],
        { fit: "elastic", available: 4 },
      ),
    );

    expect(resolved.children.map((child) => child.size)).toEqual([2.5, 1.5]);
    expect(resolved.overflow).toBe(false);
  });

  it("wraps ordered children into deterministic lines", () => {
    const resolved = resolvePlane(
      horizontal(
        [
          { id: "a", basis: 2 },
          { id: "b", basis: 1 },
          { id: "c", basis: 2 },
        ],
        { fit: "wrap", gap: 1, available: 4 },
      ),
    );

    expect(
      resolved.children.map((child) => [child.line, child.offset]),
    ).toEqual([
      [0, 0],
      [0, 2],
      [1, 0],
    ]);
    expect(resolved.lines).toBe(2);
  });

  it("keeps intrinsic scroll children and reports overflow", () => {
    const resolved = resolvePlane(
      vertical(["a", "b", "c"], { fit: "scroll", available: 2 }),
    );

    expect(resolved.children.map((child) => child.size)).toEqual([1, 1, 1]);
    expect(resolved.extent).toBe(3);
    expect(resolved.overflow).toBe(true);
  });

  it("uses safe defaults and drops invalid child entries", () => {
    expect(
      normalizePlane({
        axis: "diagonal" as "vertical",
        fit: "focus" as "elastic",
        gap: Number.NaN,
        children: [
          "",
          " ok ",
          { id: "bounded", basis: 2, min: 4 },
          42 as never,
        ],
      }),
    ).toEqual({
      axis: "vertical",
      fit: "elastic",
      gap: 0,
      children: [{ id: "ok" }, { id: "bounded", basis: 2, min: 2 }],
    });
  });
});
