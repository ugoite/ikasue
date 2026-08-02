import { describe, expect, it } from "vitest";

import { getMountLabel, PACKAGE_NAME, ROOT_CLASS_NAME } from "./index";

describe("ikasue package skeleton", () => {
  it("exposes the package identity and root class", () => {
    expect(PACKAGE_NAME).toBe("@ugoite/ikasue");
    expect(ROOT_CLASS_NAME).toBe("ikasue-root");
  });

  it("normalizes an optional mount label", () => {
    expect(getMountLabel("  workspace  ")).toBe("workspace");
    expect(getMountLabel(" ")).toBe("ikasue workspace");
    expect(getMountLabel()).toBe("ikasue workspace");
  });
});
