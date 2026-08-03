import { describe, expect, it } from "vitest";

import {
  CATALOG_COMPONENTS,
  CATALOG_CONCEPTS,
  CATALOG_GROUPS,
  CATALOG_PAGES,
  COMPONENT_IDS,
  CONCEPT_IDS,
  DEFAULT_COMPONENT_ID,
  defaultProps,
  getDefaultProps,
  getMountLabel,
  horizontal,
  isCatalogComponentId,
  isCatalogPageId,
  normalizePlane,
  PACKAGE_NAME,
  PAGE_IDS,
  parseCatalogQuery,
  parseComponentQuery,
  ROOT_CLASS_NAME,
  resolvePlane,
  serializeCatalogQuery,
  serializeComponentQuery,
  vertical,
} from "./index";

describe("ikasue catalog metadata", () => {
  it("keeps the concept page separate from the reduced component catalog", () => {
    expect(CATALOG_COMPONENTS).toHaveLength(17);
    expect(CATALOG_CONCEPTS).toHaveLength(1);
    expect(CATALOG_PAGES).toHaveLength(18);
    expect(CONCEPT_IDS).toEqual(["philosophy"]);
    expect(COMPONENT_IDS).toEqual([
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
    ]);
    expect(PAGE_IDS).toEqual(["philosophy", ...COMPONENT_IDS]);
    expect(isCatalogComponentId("vertical")).toBe(true);
    expect(isCatalogComponentId("focus-plane")).toBe(false);
    expect(isCatalogPageId("philosophy")).toBe(true);
    expect(CATALOG_GROUPS).toHaveLength(7);
    expect(CATALOG_GROUPS.map(([label]) => label)).not.toContain(
      "ナビゲーション",
    );
  });

  it("describes both public layout pages with the shared plane demo", () => {
    const layoutPages = CATALOG_COMPONENTS.filter(
      (component) => component.cat === "layout",
    );
    expect(layoutPages.map((page) => page.id)).toEqual([
      "vertical",
      "horizontal",
    ]);
    expect(layoutPages.map((page) => page.demo)).toEqual(["plane", "plane"]);
    expect(layoutPages.flatMap((page) => page.props[0].values)).toEqual([
      "elastic",
      "wrap",
      "scroll",
      "elastic",
      "wrap",
      "scroll",
    ]);
    expect(
      layoutPages.map((page) => page.props.map((prop) => prop.key)),
    ).toEqual([
      ["fit", "gap", "items", "basis", "available"],
      ["fit", "gap", "items", "basis", "available"],
    ]);
  });
});

describe("catalog query state", () => {
  it("parses valid, missing, and invalid component parameters", () => {
    expect(parseComponentQuery("?component=data-table")).toBe("data-table");
    expect(parseCatalogQuery("component=bottom-dialog")).toBe("bottom-dialog");
    expect(parseComponentQuery("?other=value")).toBe(DEFAULT_COMPONENT_ID);
    expect(parseComponentQuery("?component=focus-plane")).toBe(
      DEFAULT_COMPONENT_ID,
    );
  });

  it("serializes the selection while preserving other query parameters", () => {
    expect(serializeComponentQuery("text")).toBe("?component=text");
    expect(serializeCatalogQuery("text", "?mode=compact&component=old")).toBe(
      "?mode=compact&component=text",
    );
  });
});

describe("catalog defaults", () => {
  it("returns fresh default props and restores a changed copy", () => {
    const initial = defaultProps("text");
    const english = defaultProps("text", "en");
    const changed = { ...initial, editable: false, value: "変更済み" };
    const reset = getDefaultProps("text");

    expect(initial).toEqual({
      editable: true,
      editor: "text",
      state: "clean",
      value: "東京オフィス",
    });
    expect(changed).not.toEqual(reset);
    expect(reset).toEqual(initial);
    expect(reset).not.toBe(initial);
    expect(english).toEqual({
      editable: true,
      editor: "text",
      state: "clean",
      value: "Tokyo office",
    });
  });
});

describe("package identity and plane exports", () => {
  it("keeps package identity and exposes only the public plane primitives", () => {
    expect(PACKAGE_NAME).toBe("@ugoite/ikasue");
    expect(ROOT_CLASS_NAME).toBe("ikasue-root");
    expect(vertical(["a"]).axis).toBe("vertical");
    expect(horizontal(["a"]).axis).toBe("horizontal");
  });

  it("normalizes and resolves an ordered plane from the root package", () => {
    const plane = normalizePlane({
      axis: "horizontal",
      children: [" first ", "second"],
      gap: 1,
    });
    const resolved = resolvePlane(plane);

    expect(plane.children.map((child) => child.id)).toEqual([
      "first",
      "second",
    ]);
    expect(resolved.children.map((child) => child.id)).toEqual([
      "first",
      "second",
    ]);
    expect(resolved.children.map((child) => child.offset)).toEqual([0, 2]);
  });

  it("normalizes invalid runtime values to safe defaults", () => {
    const plane = normalizePlane({
      axis: "diagonal" as "vertical",
      fit: "focus" as "elastic",
      gap: -2,
      available: -1,
      children: [" ", null as never, { id: "item", basis: -3, min: 4 }],
    });

    expect(plane).toEqual({
      axis: "vertical",
      fit: "elastic",
      gap: 0,
      children: [{ id: "item", basis: 1, min: 1 }],
    });
  });

  it("normalizes and resolves shrinking, wrapping, and scrolling policies", () => {
    const elastic = resolvePlane(
      horizontal(
        [
          { id: "a", basis: 2, min: 0 },
          { id: "b", basis: 2, min: 0 },
        ],
        { fit: "elastic", available: 2 },
      ),
    );
    expect(elastic.children.map((child) => child.size)).toEqual([1, 1]);
    expect(elastic.overflow).toBe(false);

    const wrapped = resolvePlane(
      vertical(
        [
          { id: "a", basis: 2 },
          { id: "b", basis: 2 },
          { id: "c", basis: 2 },
        ],
        { fit: "wrap", available: 3 },
      ),
    );
    expect(wrapped.children.map((child) => child.line)).toEqual([0, 1, 2]);
    expect(wrapped.lines).toBe(3);

    const scrolling = resolvePlane(
      horizontal(["a", "b"], { fit: "scroll", available: 1 }),
    );
    expect(scrolling.overflow).toBe(true);
    expect(scrolling.children.map((child) => child.size)).toEqual([1, 1]);
  });

  it("normalizes an omitted plane to an empty vertical plane", () => {
    expect(normalizePlane()).toEqual({
      axis: "vertical",
      fit: "elastic",
      gap: 0,
      children: [],
    });
  });

  it("normalizes an optional mount label", () => {
    expect(getMountLabel("  workspace  ")).toBe("workspace");
    expect(getMountLabel(" ")).toBe("ikasue workspace");
    expect(getMountLabel()).toBe("ikasue workspace");
  });
});
