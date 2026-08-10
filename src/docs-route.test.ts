import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const docsRoot = join(repositoryRoot, "docs-site", "src");
const contentRoot = join(docsRoot, "content", "docs");
const componentRoot = join(contentRoot, "components");
const englishComponentRoot = join(contentRoot, "en", "components");
const read = (relativePath: string): string =>
  readFileSync(join(docsRoot, relativePath), "utf8");

function collectMarkdownFiles(root: string, relativeDirectory = ""): string[] {
  return readdirSync(join(root, relativeDirectory), {
    withFileTypes: true,
  }).flatMap((entry) => {
    const relativePath = join(relativeDirectory, entry.name);
    if (entry.isDirectory()) return collectMarkdownFiles(root, relativePath);
    return entry.isFile() && /\.(?:md|mdx)$/.test(entry.name)
      ? [relativePath]
      : [];
  });
}

const componentIds = readdirSync(componentRoot)
  .filter((file) => file.endsWith(".mdx") && file !== "index.mdx")
  .map((file) => file.slice(0, -4))
  .sort();

describe("integrated component documentation routes", () => {
  it("does not create standalone catalog content routes", () => {
    expect(existsSync(join(contentRoot, "catalog"))).toBe(false);
    expect(existsSync(join(contentRoot, "en", "catalog"))).toBe(false);
    expect(existsSync(join(docsRoot, "components", "CatalogPage.astro"))).toBe(
      false,
    );
    expect(existsSync(join(docsRoot, "pages", "catalog.astro"))).toBe(false);
    expect(existsSync(join(docsRoot, "pages", "en", "catalog.astro"))).toBe(
      false,
    );
  });

  it("keeps every bilingual component page on the ComponentDoc route", () => {
    expect(componentIds.length).toBeGreaterThan(0);
    expect(componentIds).toEqual(
      readdirSync(englishComponentRoot)
        .filter((file) => file.endsWith(".mdx") && file !== "index.mdx")
        .map((file) => file.slice(0, -4))
        .sort(),
    );

    for (const id of componentIds) {
      const japanese = readFileSync(join(componentRoot, `${id}.mdx`), "utf8");
      const english = readFileSync(
        join(englishComponentRoot, `${id}.mdx`),
        "utf8",
      );
      expect(japanese).toContain("ComponentDoc");
      expect(english).toContain("ComponentDoc");
    }
  });

  it("mounts one public element demo without the catalog renderer", () => {
    const componentDoc = read("components/ComponentDoc.astro");
    const config = readFileSync(
      join(repositoryRoot, "docs-site", "astro.config.mjs"),
      "utf8",
    );

    expect(componentDoc).toContain("data-component-demo");
    expect(componentDoc).toContain("defineIkaSue");
    expect(componentDoc).toContain("document.createElement");
    expect(componentDoc).toContain("ika-data-grid");
    expect(componentDoc).not.toContain("mountCatalog");
    expect(componentDoc).not.toContain("renderDemo");
    expect(componentDoc).not.toContain("renderNativePlane");
    expect(componentDoc).not.toContain("example-renderer");
    expect(componentDoc).not.toContain("catalogPath");
    expect(componentDoc).not.toContain('target="_blank"');
    expect(componentDoc).not.toContain("Open interactive catalog");
    expect(componentDoc).not.toContain("?component=");
    expect(config).toContain(
      'PageFrame: "./src/components/IkasuePageFrame.astro"',
    );
    expect(config).not.toContain('link: "catalog/"');
  });

  it("keeps the old example renderer out of the docs tree", () => {
    const components = [
      read("components/ComponentDoc.astro"),
      read("components/ExamplePage.astro"),
      read("components/ExampleSurface.astro"),
    ].join("\n");
    expect(components).not.toContain("mountExampleSurfaces");
    expect(components).not.toContain("mountCatalog");
    expect(components).toContain("defineIkaSue");
  });

  it("keeps component links base-path safe and does not leave catalog-only docs links", () => {
    const matrix = read("components/ComponentMatrix.astro");
    const sitePath = read("data/site-path.ts");
    const docsSource = [
      readFileSync(join(repositoryRoot, "README.md"), "utf8"),
      readFileSync(join(repositoryRoot, "SPEC.md"), "utf8"),
      ...collectMarkdownFiles(contentRoot).map((relativePath) =>
        readFileSync(join(contentRoot, relativePath), "utf8"),
      ),
    ].join("\n");

    expect(matrix).toContain("components/${component.id}/");
    expect(matrix).not.toContain("catalogPath");
    expect(sitePath).not.toContain("catalogPath");
    expect(docsSource).not.toContain("catalogPath");
    expect(docsSource).not.toContain('target="_blank"');
    expect(docsSource).not.toContain("Open interactive catalog");
    expect(docsSource).not.toContain("catalog/");
  });
});
