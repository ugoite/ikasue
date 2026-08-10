import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  EXAMPLE_SPECS,
  EXAMPLE_PAGE_COPY,
  EXAMPLE_SURFACE_COPY,
  exampleComponentIds,
  exampleCopy,
  exampleSpec,
  type ExampleKind,
} from "./examples";
import { CATALOG_REGISTRY, findRegistryEntry } from "./registry";
import { resolvePlane } from "../plane";
import { resolveNativePlane, type NativePlaneComposition } from "./demos";

const kinds: readonly ExampleKind[] = [
  "operations",
  "editor",
  "planning",
  "field",
  "observability",
];

describe("shared example catalog", () => {
  function constrainedComposition(
    axis: "horizontal" | "vertical",
  ): NativePlaneComposition {
    const children = ["one", "two", "three", "four", "five"].map((id) => ({
      id,
      basis: 1,
      min: 0.5,
      label: { ja: id, en: id },
      componentId: "text" as const,
      props: { editable: false, value: id },
    }));
    return {
      id: `test-${axis}`,
      componentId: axis,
      axis,
      fit: "wrap",
      gap: 0,
      available: 2,
      focus: "three",
      navigation: true,
      children,
    };
  }

  it("shares the constrained native rail contract on both axes", () => {
    for (const axis of ["horizontal", "vertical"] as const) {
      const resolved = resolveNativePlane(constrainedComposition(axis));
      expect(resolved.axis).toBe(axis);
      expect(resolved.children.map(({ state }) => state)).toEqual([
        "collapsed",
        "collapsed",
        "focused",
        "collapsed",
        "collapsed",
      ]);
      expect(resolved.children[2]).toMatchObject({
        id: "three",
        size: 2,
        visible: true,
        collapsed: false,
      });
      expect(resolved.overflow).toBe(false);
      expect(resolved.canPrevious).toBe(true);
      expect(resolved.canNext).toBe(true);
      expect(resolved.previous).toBe("two");
      expect(resolved.next).toBe("four");
    }
  });

  it("uses the public element ABI for docs examples", () => {
    const surfaceSource = readFileSync(
      new URL(
        "../../docs-site/src/components/ExampleSurface.astro",
        import.meta.url,
      ),
      "utf8",
    );
    expect(existsSync(new URL("./example-renderer.ts", import.meta.url))).toBe(
      false,
    );
    expect(surfaceSource).toContain("defineIkaSue");
    expect(surfaceSource).toContain('"ika-data-grid"');
    expect(surfaceSource).toContain("set:html");
    expect(surfaceSource).not.toContain("mountExampleSurfaces");
    expect(surfaceSource).not.toContain("data-native-plane-mount");
  });

  it("keeps the bilingual example key sets aligned", () => {
    expect(Object.keys(EXAMPLE_SURFACE_COPY.ja).sort()).toEqual(
      Object.keys(EXAMPLE_SURFACE_COPY.en).sort(),
    );
    expect(Object.keys(EXAMPLE_PAGE_COPY.ja).sort()).toEqual(
      Object.keys(EXAMPLE_PAGE_COPY.en).sort(),
    );
    expect(EXAMPLE_SPECS.map(({ kind }) => kind).sort()).toEqual(
      [...kinds].sort(),
    );
  });

  it("references only components from the authoritative registry", () => {
    const registryIds = new Set(
      CATALOG_REGISTRY.filter((entry) => entry.kind === "component").map(
        (entry) => entry.id,
      ),
    );
    for (const kind of kinds) {
      for (const componentId of exampleComponentIds(kind)) {
        expect(registryIds.has(componentId)).toBe(true);
        expect(findRegistryEntry(componentId).kind).toBe("component");
      }
      for (const plane of exampleSpec(kind).planes) {
        for (const region of plane.regions) {
          const entry = findRegistryEntry(region.componentId);
          const propertyKeys = new Set(entry.properties.map(({ key }) => key));
          for (const propertyKey of Object.keys(region.props)) {
            expect(propertyKeys.has(propertyKey)).toBe(true);
          }
        }
      }
      for (const componentId of exampleComponentIds(kind)) {
        expect(exampleSpec(kind).source.javascript).toContain(
          `"${componentId}"`,
        );
      }
    }
  });

  it("retains the component ids and recognizable surface copy from the old examples", () => {
    const expectedIds: Readonly<Record<ExampleKind, readonly string[]>> = {
      operations: [
        "horizontal",
        "vertical",
        "data-table",
        "message-region",
        "status-icon",
      ],
      editor: [
        "horizontal",
        "vertical",
        "form-list",
        "text",
        "rule",
        "action-strip",
        "status-icon",
      ],
      planning: [
        "horizontal",
        "vertical",
        "choice-group",
        "action-strip",
        "status-icon",
      ],
      field: [
        "vertical",
        "horizontal",
        "form-list",
        "boolean-text",
        "bottom-dialog",
        "status-icon",
      ],
      observability: [
        "horizontal",
        "vertical",
        "data-table",
        "message-region",
        "progress-region",
        "status-icon",
      ],
    };
    for (const kind of kinds) {
      expect(new Set(exampleComponentIds(kind))).toEqual(
        new Set(expectedIds[kind]),
      );
    }
    expect(EXAMPLE_SURFACE_COPY.ja.operations.rows[0].title).toBe("請求書同期");
    expect(EXAMPLE_SURFACE_COPY.en.operations.rows[0].title).toBe(
      "Invoice sync",
    );
    expect(EXAMPLE_SURFACE_COPY.ja.field.checks).toContain("フィルターを交換");
    expect(EXAMPLE_SURFACE_COPY.en.observability.alert).toContain(
      "external key",
    );
  });

  it("derives names and source snippets from each shared spec", () => {
    for (const kind of kinds) {
      const spec = exampleSpec(kind);
      for (const locale of ["ja", "en"] as const) {
        const copy = exampleCopy(locale, kind);
        expect(copy.javascript).toBe(spec.source.javascript);
        expect(copy.rust).toBe(spec.source.rust);
        expect(copy.components).toHaveLength(exampleComponentIds(kind).length);
      }
    }
  });

  it("does not use scroll as a plane adaptation policy", () => {
    for (const spec of EXAMPLE_SPECS) {
      for (const plane of spec.planes) {
        expect(["elastic", "wrap"]).toContain(plane.fit);
        expect(plane.navigation).toBe(true);
        const resolved = resolvePlane({
          axis: plane.axis,
          fit: plane.fit,
          gap: plane.gap,
          available: plane.available,
          focus: plane.focus,
          navigation: plane.navigation,
          children: plane.regions,
        });
        expect(resolved.focus).toBe(plane.focus);
        expect(resolved.children.map(({ id }) => id)).toEqual(
          plane.regions.map(({ id }) => id),
        );
      }
      expect(`${spec.source.javascript}\n${spec.source.rust}`).not.toMatch(
        /Fit::Scroll|fit:\s*["']scroll["']/,
      );
    }
  });
});
