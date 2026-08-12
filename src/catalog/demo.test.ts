import { describe, expect, it } from "vitest";
import { isIkaViewProps } from "../contract";
import { COMPONENT_IDS, findRegistryEntry } from "./registry";
import { componentDemo, componentSourceForProps } from "./demo";

describe("component demo contract", () => {
  it("gives every registered component a valid, non-empty interactive example", () => {
    for (const id of COMPONENT_IDS) {
      const demo = componentDemo(id);
      const entry = findRegistryEntry(id);
      expect(isIkaViewProps(id, demo.props), id).toBe(true);
      expect(demo.controls.length, id).toBeGreaterThan(0);
      expect(
        new Set(demo.controls.map((control) => control.key)).size,
        id,
      ).toBe(demo.controls.length);
      if (entry?.kind !== "component") continue;
      for (const property of entry.properties)
        expect(
          demo.controls.some((control) => control.key === property.name),
          `${id}.${property.name}`,
        ).toBe(true);
    }
  });

  it("keeps provider code synchronized with selected JSON-safe options", () => {
    const props = componentDemo("alert").props;
    const typescript = componentSourceForProps("alert", props, "typescript");
    const rust = componentSourceForProps("alert", props, "rust");

    expect(typescript).toContain('"ika-alert"');
    expect(typescript).toContain("Attention required");
    expect(typescript).toContain("Record<string, unknown>");
    expect(rust).toContain("ika-alert");
    expect(rust).toContain("Attention required");
    expect(rust).toContain("web_sys::window()");
    expect(rust).toContain(".document()");
    expect(
      componentSourceForProps(
        "alert",
        { ...props, severity: "danger" },
        "typescript",
      ),
    ).toContain('"danger"');
  });
});
