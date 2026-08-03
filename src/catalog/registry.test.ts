import { describe, expect, it } from "vitest";

import {
  CATALOG_COMPONENTS,
  COMPONENT_COPY,
  COMPONENT_PAGE_COPY,
  COMPONENT_REGISTRY,
  COMPONENT_SOURCE_RECIPES,
  findRegistryEntry,
} from "./registry";

describe("component registry completeness", () => {
  it("keeps every catalog component and concept page in the registry", () => {
    const registryIds = new Set(COMPONENT_REGISTRY.map((entry) => entry.id));

    expect(COMPONENT_REGISTRY).toHaveLength(CATALOG_COMPONENTS.length);
    expect(
      CATALOG_COMPONENTS.every((component) => registryIds.has(component.id)),
    ).toBe(true);
    expect(
      COMPONENT_REGISTRY.every((entry) =>
        CATALOG_COMPONENTS.some((component) => component.id === entry.id),
      ),
    ).toBe(true);
    expect(findRegistryEntry("developer-model").kind).toBe("concept");
  });

  it("keeps copy, source, page, and property references aligned", () => {
    const catalogIds = new Set(
      CATALOG_COMPONENTS.map((component) => component.id),
    );

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

    for (const entry of COMPONENT_REGISTRY) {
      const propertyKeys = new Set(
        entry.properties.map((property) => property.key),
      );
      for (const locale of ["ja", "en"] as const) {
        for (const key of Object.keys(
          entry.documentation[locale].propertyLabels,
        )) {
          expect(propertyKeys.has(key)).toBe(true);
        }
      }
      for (const property of entry.properties) {
        expect(property.labelJa.length).toBeGreaterThan(0);
        expect(property.labelEn.length).toBeGreaterThan(0);
      }
      expect(entry.source.children.length).toBeGreaterThan(0);
      expect(entry.source.planeOptions.length).toBeGreaterThan(0);
      expect(entry.source.componentProps.length).toBeGreaterThan(0);
      expect(entry.source.ownership.length).toBeGreaterThan(0);
      expect(entry.source.rustState.length).toBeGreaterThan(0);
      expect(entry.page.ja.title.length).toBeGreaterThan(0);
      expect(entry.page.en.description.length).toBeGreaterThan(0);
    }
  });
});
