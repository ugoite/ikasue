import { describe, expect, it } from "vitest";
import { flex, grid, scrollArea, separator, stack } from "./layout";

describe("standard layout descriptors", () => {
  it("keeps layout sizing in CSS-facing fields", () => {
    expect(
      flex(["header", { id: "body", grow: 1, basis: "0" }], { gap: " 1rem " }),
    ).toMatchObject({ direction: "row", gap: "1rem" });
    expect(stack(["header"])).toMatchObject({
      direction: "column",
      wrap: "nowrap",
    });
    expect(
      grid(["a"], { columns: "1fr 2fr", rows: "auto", gap: "0.5rem" }),
    ).toMatchObject({ columns: "1fr 2fr", rows: "auto", gap: "0.5rem" });
    expect(grid([], { columns: "repeat(3, 1fr)" }).columns).toBe(
      "repeat(3, 1fr)",
    );
    expect(grid([], { columns: "minmax(0, 1fr) 2fr" }).columns).toBe(
      "minmax(0, 1fr) 2fr",
    );
    expect(
      grid([], { columns: "repeat(auto-fit, minmax(12rem, 1fr))" }).columns,
    ).toBe("repeat(auto-fit, minmax(12rem, 1fr))");
    expect(flex([{ id: "body", basis: "1fr" }]).children).toEqual([
      { id: "body" },
    ]);
  });

  it("normalizes malformed values to small defaults", () => {
    expect(
      flex(["ok", { id: "" }], { direction: "bad" as never, gap: "bad" }),
    ).toMatchObject({ direction: "row", gap: "0", children: ["ok"] });
    expect(
      scrollArea("body", { axis: "both", overscroll: "contain" }),
    ).toMatchObject({ axis: "both", overscroll: "contain" });
    expect(
      separator({ orientation: "vertical", role: "separator" }),
    ).toMatchObject({ orientation: "vertical", role: "separator" });
    expect(flex(null as never)).toMatchObject({ children: [] });
  });
});
