import { describe, expect, it } from "vitest";

import { componentSource as docsComponentSource } from "../../docs-site/src/data/component-source";

import {
  CATALOG_REGISTRY,
  CATALOG_PAGE_COPY,
  CATALOG_CONCEPTS,
  CATALOG_PAGES,
  COMPONENT_IDS,
  COMPONENT_COPY,
  COMPONENT_PAGE_COPY,
  COMPONENT_REGISTRY,
  COMPONENT_SOURCE_RECIPES,
  CONCEPT_REGISTRY,
  PHILOSOPHY_PAGE_COPY,
  PAGE_IDS,
  componentSource,
  findRegistryEntry,
} from "./registry";

describe("component registry completeness", () => {
  it("keeps the complete 18-page registry and the 17-entry component projection", () => {
    const expectedComponentIds = [
      "developer-model",
      "theme-root",
      "text",
      "rule",
      "status-icon",
      "vertical",
      "horizontal",
      "icon-action",
      "action-strip",
      "boolean-text",
      "choice-group",
      "form-list",
      "data-table",
      "history-gutter",
      "progress-region",
      "message-region",
      "bottom-dialog",
    ];
    expect(CATALOG_REGISTRY).toHaveLength(18);
    expect(CATALOG_PAGES).toHaveLength(18);
    expect(CATALOG_REGISTRY.map((entry) => entry.id)).toEqual([
      "philosophy",
      ...expectedComponentIds,
    ]);
    expect(PAGE_IDS).toEqual(CATALOG_REGISTRY.map((entry) => entry.id));
    expect(new Set(PAGE_IDS).size).toBe(PAGE_IDS.length);

    expect(COMPONENT_REGISTRY).toHaveLength(17);
    expect(COMPONENT_REGISTRY.map((entry) => entry.kind)).toEqual(
      Array.from({ length: 17 }, () => "component"),
    );
    expect(COMPONENT_REGISTRY.map((entry) => entry.id)).toEqual(COMPONENT_IDS);
    expect(CONCEPT_REGISTRY).toHaveLength(1);
    expect(CONCEPT_REGISTRY[0].id).toBe("philosophy");
    expect(findRegistryEntry("philosophy").kind).toBe("concept");
    expect(findRegistryEntry("developer-model").kind).toBe("component");
    expect(CATALOG_CONCEPTS.map((concept) => concept.id)).toEqual([
      "philosophy",
    ]);
  });

  it("keeps all component copy, source, page, and property references aligned", () => {
    const catalogIds = COMPONENT_IDS;

    for (const locale of ["ja", "en"] as const) {
      expect(Object.keys(COMPONENT_COPY[locale]).sort()).toEqual(
        [...catalogIds].sort(),
      );
    }
    expect(Object.keys(COMPONENT_SOURCE_RECIPES).sort()).toEqual(
      [...catalogIds].sort(),
    );
    expect(Object.keys(COMPONENT_PAGE_COPY).sort()).toEqual(
      [...catalogIds].sort(),
    );
    expect(Object.keys(CATALOG_PAGE_COPY).sort()).toEqual([...PAGE_IDS].sort());
    expect(CATALOG_PAGE_COPY.philosophy).toEqual(PHILOSOPHY_PAGE_COPY);

    for (const entry of COMPONENT_REGISTRY) {
      const source = componentSource(entry.id);
      const copyJa = COMPONENT_COPY.ja[entry.id] as {
        propertyLabels: Readonly<Record<string, string>>;
      };
      const copyEn = COMPONENT_COPY.en[entry.id] as {
        propertyLabels: Readonly<Record<string, string>>;
      };
      const propertyKeys = new Set(
        entry.properties.map((property) => property.key),
      );
      for (const locale of ["ja", "en"] as const) {
        expect(
          Object.keys(entry.documentation[locale].propertyLabels).sort(),
        ).toEqual([...propertyKeys].sort());
        for (const key of Object.keys(
          entry.documentation[locale].propertyLabels,
        )) {
          expect(propertyKeys.has(key)).toBe(true);
        }
      }
      for (const property of entry.properties) {
        expect(property.labelJa.length).toBeGreaterThan(0);
        expect(property.labelEn.length).toBeGreaterThan(0);
        expect(property.label).toBe(property.labelJa);
        expect(property.defaultJa).toBeDefined();
        expect(property.defaultEn).toBeDefined();
        expect(property.default).toBe(property.defaultJa);
        expect(property.labelJa).toBe(copyJa.propertyLabels[property.key]);
        expect(property.labelEn).toBe(copyEn.propertyLabels[property.key]);
      }
      expect(entry.source.children.length).toBeGreaterThan(0);
      expect(entry.source.planeOptions.length).toBeGreaterThan(0);
      expect(entry.source.componentProps.length).toBeGreaterThan(0);
      expect(entry.source.ownership.length).toBeGreaterThan(0);
      expect(entry.source.rustState.length).toBeGreaterThan(0);
      expect(source.javascript).toContain(entry.id);
      expect(source.rust).toContain(entry.id);
      expect(source.javascript).toContain("resolvePlane");
      expect(source.rust).toContain("resolve_plane");
      expect(docsComponentSource(entry.id)).toEqual(source);
      expect(CATALOG_PAGE_COPY[entry.id]).toEqual(entry.page);
      expect(entry.page.ja.title.length).toBeGreaterThan(0);
      expect(entry.page.en.description.length).toBeGreaterThan(0);
    }

    const philosophy = findRegistryEntry("philosophy");
    expect(CATALOG_PAGE_COPY.philosophy).toEqual(philosophy.page);
    expect(philosophy.page.ja.title).toBe(
      "Design philosophy / 平面適応UIの思想",
    );
    expect(philosophy.principles.ja).toHaveLength(8);
    expect(philosophy.principles.en).toHaveLength(8);
  });
});
