import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const catalogRoot = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = join(catalogRoot, "..", "..");
const read = (path: string): string => readFileSync(path, "utf8");
const catalogCss = read(join(catalogRoot, "catalog.css"));
const demosSource = read(join(catalogRoot, "demos.ts"));
const shellSource = read(join(catalogRoot, "shell.ts"));
const docsCss = read(
  join(repositoryRoot, "docs-site", "src", "styles", "custom.css"),
);
const docsContentRoot = join(
  repositoryRoot,
  "docs-site",
  "src",
  "content",
  "docs",
);
const docsConfig = read(join(repositoryRoot, "docs-site", "astro.config.mjs"));

describe("mobile runtime UI contracts", () => {
  it("keeps action tooltips readable below the action strip", () => {
    expect(demosSource).toContain(
      'element(context.document, "div", "action-strip")',
    );
    expect(demosSource).toContain('hint.setAttribute("role", "tooltip")');
    expect(catalogCss).toMatch(
      /\.ikasue-root \.tooltip \{[\s\S]*?inline-size: max-content;[\s\S]*?max-inline-size: min\(20rem, calc\(100vw - 24px\)\);[\s\S]*?overflow-wrap: break-word;[\s\S]*?word-break: normal;[\s\S]*?writing-mode: horizontal-tb;/,
    );
    expect(catalogCss).toMatch(
      /\.ikasue-root \.action-strip \.tooltip \{[\s\S]*?top: calc\(100% \+ 6px\);[\s\S]*?left: 0;[\s\S]*?transform: translateY\(-4px\);/,
    );
    expect(catalogCss).toContain(
      ":is(.action-strip, .top-actions):has(.icon-button:hover)",
    );
  });

  it("keeps both menu controls to one quiet surface with accessible state", () => {
    expect(shellSource).toContain(
      'navToggle.setAttribute("aria-controls", navCopy.id)',
    );
    expect(shellSource).toContain('navToggle.setAttribute("aria-expanded"');
    expect(shellSource).toMatch(/navToggle\.setAttribute\(\s*"aria-label"/);
    expect(catalogCss).toMatch(
      /\.ikasue-root \.rail-button,\s+\.ikasue-root \.icon-button \{[\s\S]*?border: 0;[\s\S]*?box-shadow: none;/,
    );
    expect(docsCss).toMatch(
      /\[data-ikasue-sidebar\] starlight-menu-button \{[\s\S]*?border: 0;[\s\S]*?box-shadow: none;/,
    );
    expect(docsCss).toMatch(
      /\[data-ikasue-sidebar\] starlight-menu-button button \{[\s\S]*?border: 1px solid var\(--line\);[\s\S]*?box-shadow: none;/,
    );
    expect(docsCss).toContain(
      "starlight-menu-button button :where(svg, svg *)",
    );
  });

  it("contains embedded demos without disabling intentional table/code scrolling", () => {
    expect(catalogCss).toMatch(
      /\.ikasue-root\[data-embedded="true"\] \{[\s\S]*?inline-size: 100%;[\s\S]*?max-inline-size: 100%;[\s\S]*?min-width: 0;[\s\S]*?overflow-x: clip;/,
    );
    expect(catalogCss).toContain(
      '.ikasue-root[data-embedded="true"] .embedded-demo-layout',
    );
    expect(catalogCss).toMatch(
      /@media \(max-width: 900px\) \{[\s\S]*?\.embedded-demo-layout \{[\s\S]*?grid-template-columns: 1fr;/,
    );
    expect(catalogCss).toMatch(
      /\.ikasue-root \.data-table-wrap \{[\s\S]*?overflow-x: auto;/,
    );
    expect(catalogCss).toMatch(
      /:where\(html, body\):has\(\.ikasue-root\[data-embedded="true"\]\)[\s\S]*?overflow-x: clip;/,
    );
    expect(docsCss).toMatch(
      /html:has\(\[data-ikasue-frame\]\),\s+body:has\(\[data-ikasue-frame\]\) \{[\s\S]*?overflow-x: clip;/,
    );
  });

  it("keeps the focus window demo aligned with the recursive semantic contract", () => {
    expect(demosSource).toContain("resolveFocusPlane(spec)");
    expect(demosSource).toContain("restoreFocusAfterEdgeDismissal");
    expect(demosSource).toContain('classList.add("focus-window-branch")');
    expect(demosSource).toContain(
      'layout = element(context.document, "div", "focus-window-layout")',
    );
    expect(demosSource).toContain('nav.setAttribute("role", "tablist")');
    expect(demosSource).toContain('button.setAttribute("role", "tab")');
    expect(demosSource).toContain(
      'button.setAttribute("aria-selected", String(item.active))',
    );
    expect(demosSource).toContain("button.tabIndex = item.active ? 0 : -1");
    expect(demosSource).toContain("edgeSlots[edge.edge]");
    expect(catalogCss).toContain(".focus-window-edge-slot");
    expect(catalogCss).toContain("overflow: hidden");
  });

  it("keeps the public examples entry point simple and bilingual", () => {
    const vertical = read(join(docsContentRoot, "components", "vertical.mdx"));
    const horizontal = read(
      join(docsContentRoot, "components", "horizontal.mdx"),
    );
    const englishVertical = read(
      join(docsContentRoot, "en", "components", "vertical.mdx"),
    );
    const englishHorizontal = read(
      join(docsContentRoot, "en", "components", "horizontal.mdx"),
    );
    const examples = read(join(docsContentRoot, "examples", "index.mdx"));
    const englishExamples = read(
      join(docsContentRoot, "en", "examples", "index.mdx"),
    );

    expect(vertical).toContain('<ComponentDoc id="vertical" simple />');
    expect(horizontal).toContain('<ComponentDoc id="horizontal" simple />');
    expect(englishVertical).toContain('<ComponentDoc id="vertical" simple />');
    expect(englishHorizontal).toContain(
      '<ComponentDoc id="horizontal" simple />',
    );
    for (const page of [examples, englishExamples]) {
      expect(page).toContain("components/vertical/");
      expect(page).toContain("components/horizontal/");
      expect(page).not.toMatch(/five site shapes|5つのsite shape/i);
      expect(page).not.toContain("/catalog/");
    }
    expect(docsConfig).toContain('label: "配置の例"');
    expect(docsConfig).toContain('translations: { en: "Simple arrangements" }');
    expect(docsConfig).not.toContain(
      'translations: { en: "Five site shapes" }',
    );
  });
});
