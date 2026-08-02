import { describe, expect, it } from "vitest";

import {
  CATALOG_COMPONENTS,
  CATALOG_CONCEPTS,
  CATALOG_GROUPS,
  CATALOG_PAGES,
  COMPONENT_IDS,
  CONCEPT_IDS,
  COMMIT_EVENT,
  DEFAULT_COMPONENT_ID,
  LAYOUT_REQUEST_EVENT,
  defaultProps,
  dispatchLayoutRequest,
  getDefaultProps,
  getMountLabel,
  isCatalogComponentId,
  isCatalogPageId,
  PACKAGE_NAME,
  parseCatalogQuery,
  parseComponentQuery,
  PAGE_IDS,
  serializeCatalogQuery,
  serializeComponentQuery,
  ROOT_CLASS_NAME,
} from "./index";

describe("ikasue catalog metadata", () => {
  it("keeps the 24-component contract separate from the 25-page catalog", () => {
    expect(CATALOG_COMPONENTS).toHaveLength(24);
    expect(CATALOG_CONCEPTS).toHaveLength(1);
    expect(CATALOG_PAGES).toHaveLength(25);
    expect(CONCEPT_IDS).toEqual(["philosophy"]);
    expect(COMPONENT_IDS).toEqual([
      "developer-model",
      "theme-root",
      "text",
      "rule",
      "status-icon",
      "stack",
      "cluster",
      "focus-plane",
      "focus-region",
      "axis-flow",
      "edge-region",
      "bottom-dock",
      "edge-nav",
      "elastic-tabs",
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
    expect(isCatalogComponentId("developer-model")).toBe(true);
    expect(isCatalogComponentId("philosophy")).toBe(false);
    expect(isCatalogPageId("philosophy")).toBe(true);
    expect(CATALOG_GROUPS).toHaveLength(8);
  });
});

describe("catalog query state", () => {
  it("parses valid, missing, and invalid component parameters", () => {
    expect(parseComponentQuery("?component=data-table")).toBe("data-table");
    expect(parseCatalogQuery("component=bottom-dialog")).toBe("bottom-dialog");
    expect(parseComponentQuery("?other=value")).toBe(DEFAULT_COMPONENT_ID);
    expect(parseComponentQuery("?component=unknown")).toBe(
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
  });
});

describe("package mount identity and planar event contract", () => {
  it("exposes the package identity and root class", () => {
    expect(PACKAGE_NAME).toBe("@ugoite/ikasue");
    expect(ROOT_CLASS_NAME).toBe("ikasue-root");
    expect(COMMIT_EVENT).toBe("ikasue:commit");
  });

  it("normalizes an optional mount label", () => {
    expect(getMountLabel("  workspace  ")).toBe("workspace");
    expect(getMountLabel(" ")).toBe("ikasue workspace");
    expect(getMountLabel()).toBe("ikasue workspace");
  });

  it("bubbles layout requests with typed detail", () => {
    const target = new EventTarget();
    const received: string[] = [];
    target.addEventListener(LAYOUT_REQUEST_EVENT, (event) => {
      received.push((event as CustomEvent<{ target: string }>).detail.target);
    });

    dispatchLayoutRequest(target, { target: "secondary" });
    expect(received).toEqual(["secondary"]);
  });
});
