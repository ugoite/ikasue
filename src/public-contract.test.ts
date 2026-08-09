import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import * as api from "./index";

describe("public contract", () => {
  it("exports the standard factories and focused state utilities", () => {
    expect(api.flex(["a"]).kind).toBe("flex");
    expect(api.stack(["a"]).direction).toBe("column");
    expect(api.loadingRegion({ busy: true }).busy).toBe(true);
    expect(api.dialog({ modal: true }).modal).toBe(true);
    expect(
      api.setDataGridClipboard(api.createDataGridState(), "error").clipboard,
    ).toBe("error");
  });

  it("keeps the visual contract in CSS", () => {
    const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
    for (const token of [
      "--ikasue-surface",
      "--ikasue-ink",
      "--ikasue-line",
      "--ikasue-selection",
      "--ikasue-motion-duration",
    ])
      expect(css).toContain(token);
    expect(css).toContain("@container (max-width: 600px)");
    expect(css).toContain("--ikasue-motion-duration: 0ms");
    expect(css).not.toContain("box-shadow");
  });
});
