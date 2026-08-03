import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const docsRoot = join(repositoryRoot, "docs-site", "src");
const read = (relativePath: string): string =>
  readFileSync(join(docsRoot, relativePath), "utf8");

describe("Starlight site route ownership", () => {
  it("uses content routes for both landing pages and catalog pages", () => {
    for (const relativePath of [
      "content/docs/index.mdx",
      "content/docs/en/index.mdx",
      "content/docs/catalog/index.mdx",
      "content/docs/en/catalog/index.mdx",
    ]) {
      expect(existsSync(join(docsRoot, relativePath))).toBe(true);
    }

    for (const relativePath of [
      "pages/index.astro",
      "pages/en/index.astro",
      "pages/catalog.astro",
      "pages/en/catalog.astro",
    ]) {
      expect(existsSync(join(docsRoot, relativePath))).toBe(false);
    }
  });

  it("keeps CatalogPage as an embedded content component", () => {
    const catalogPage = read("components/CatalogPage.astro");

    expect(catalogPage).not.toMatch(/<!doctype\s+html/i);
    expect(catalogPage).not.toMatch(/<html\b|<body\b/i);
    expect(catalogPage).not.toMatch(/overflow\s*:\s*hidden/i);
    expect(catalogPage).toContain("embedded: true");
    expect(catalogPage).toContain('data-base-path={sitePath("")}');
  });

  it("keeps locale-aware internal links on the configured site path", () => {
    const componentMatrix = read("components/ComponentMatrix.astro");
    const componentDoc = read("components/ComponentDoc.astro");
    const catalogPage = read("components/CatalogPage.astro");

    expect(componentMatrix).toContain("catalogPath(component.id, locale)");
    expect(componentDoc).toContain("catalogPath(entry.id, locale)");
    expect(catalogPage).toContain('data-base-path={sitePath("")}');
    expect(`${componentMatrix}\n${componentDoc}`).not.toContain("_blank");
    expect(
      readFileSync(
        join(repositoryRoot, "docs-site", "astro.config.mjs"),
        "utf8",
      ),
    ).toContain('PageFrame: "./src/components/IkasuePageFrame.astro"');
  });

  it("does not introduce a second site navigation in catalog content", () => {
    const catalogPage = read("components/CatalogPage.astro");
    const catalogRoute = read("content/docs/catalog/index.mdx");
    const englishCatalogRoute = read("content/docs/en/catalog/index.mdx");

    expect(catalogRoute).toContain("<CatalogPage />");
    expect(englishCatalogRoute).toContain("<CatalogPage />");
    expect(catalogPage).toContain("data-catalog-mount");
    expect(catalogPage).not.toContain("site-nav");
    expect(catalogPage).not.toContain("app-shell");
  });
});
