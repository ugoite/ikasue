import { describe, expect, it } from "vitest";

import { getCatalogSiteNavItems } from "./shell";

describe("catalog site navigation", () => {
  it("keeps the four Japanese site links ordered and base-path safe", () => {
    expect(getCatalogSiteNavItems("ja", "/")).toEqual([
      expect.objectContaining({
        key: "philosophy",
        label: "思想",
        href: "/philosophy/",
      }),
      expect.objectContaining({
        key: "contracts",
        label: "契約",
        href: "/guides/behavioral-contracts/",
      }),
      expect.objectContaining({
        key: "components",
        label: "コンポーネント",
        href: "/catalog/",
      }),
      expect.objectContaining({
        key: "examples",
        label: "例",
        href: "/examples/",
      }),
    ]);
  });

  it("localizes English links and preserves the GitHub Pages base", () => {
    const items = getCatalogSiteNavItems("en", "/ikasue");

    expect(items.map((item) => item.label)).toEqual([
      "Philosophy",
      "Contracts",
      "Components",
      "Examples",
    ]);
    expect(items.map((item) => item.href)).toEqual([
      "/ikasue/en/philosophy/",
      "/ikasue/en/guides/behavioral-contracts/",
      "/ikasue/en/catalog/",
      "/ikasue/en/examples/",
    ]);
    expect(
      items.every((item) => /^[A-Za-z .&-]+$/.test(item.description)),
    ).toBe(true);
  });
});
