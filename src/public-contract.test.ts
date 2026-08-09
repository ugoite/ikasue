import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import * as api from "./index";

describe("public contract", () => {
  it("exposes only the current component, state, and catalog surface", () => {
    const expected = [
      "themeRoot",
      "flex",
      "stack",
      "grid",
      "scrollArea",
      "separator",
      "tabs",
      "sidebar",
      "toolbar",
      "iconButton",
      "text",
      "textField",
      "editableText",
      "checkbox",
      "radioGroup",
      "segmentedControl",
      "field",
      "form",
      "dataGrid",
      "statusIndicator",
      "alert",
      "progress",
      "dialog",
      "splitView",
      "sidePanel",
      "bottomPanel",
      "loadingRegion",
      "historyTimeline",
      "createSplitViewState",
      "setActivePane",
      "setPaneSizes",
      "setPaneCollapsed",
      "createFormState",
      "getFormField",
      "setFormDraft",
      "setFormErrors",
      "setFormStatus",
      "commitFormFields",
      "formStateStatus",
      "createDataGridState",
      "getDataGridCell",
      "setDataGridSelection",
      "setDataGridClipboard",
      "commitDataGridCell",
      "mountCatalog",
      "getMountLabel",
      "CATALOG_COMPONENTS",
      "CATALOG_CONCEPTS",
      "CATALOG_GROUPS",
      "CATALOG_PAGES",
      "COMPONENT_IDS",
      "CONCEPT_IDS",
      "PAGE_IDS",
      "CATALOG_REGISTRY",
      "COMPONENT_REGISTRY",
      "CONCEPT_REGISTRY",
      "COMPONENT_SOURCE_RECIPES",
      "CATALOG_PAGE_COPY",
      "COMPONENT_PAGE_COPY",
      "COMPONENT_MATRIX_PAGE_COPY",
      "PHILOSOPHY_PAGE_COPY",
      "RUNTIME_COMPONENT_REGISTRY",
      "componentDocumentationCopy",
      "componentSource",
      "findRegistryEntry",
      "defaultProps",
      "isCatalogComponentId",
      "isCatalogPageId",
      "parseComponentSelection",
      "serializeComponentSelection",
    ].sort();
    expect(Object.keys(api).sort()).toEqual(expected);
    expect(api).not.toHaveProperty("safeId");
    const removedApi = ["resolve", "P", "lane"].join("");
    expect(api).not.toHaveProperty(removedApi);
  });

  it("exports the standard factories and focused state utilities", () => {
    expect(api.flex(["a"]).kind).toBe("flex");
    expect(api.stack(["a"]).direction).toBe("column");
    expect(api.tabs().items).toEqual([]);
    expect(api.separator().orientation).toBe("horizontal");
    expect(api.loadingRegion({ busy: true }).busy).toBe(true);
    expect(api.dialog({ modal: true }).modal).toBe(true);
    expect(
      api.setDataGridClipboard(api.createDataGridState([]), "error").clipboard,
    ).toBe("error");
  });

  it("preserves whitespace in controlled and displayed values", () => {
    expect(
      api.textField({ id: "name", label: "Name", value: "  Ada  " }).value,
    ).toBe("  Ada  ");
    expect(api.editableText({ value: "  note  " }).value).toBe("  note  ");
    expect(
      api.form({
        fields: [{ id: "name", label: "Name", initialValue: "  Ada  " }],
      }).values.name,
    ).toBe("  Ada  ");
    expect(
      api.form({ fields: [{ id: "toString", label: "Name" }] }).values,
    ).toEqual({ toString: "" });
    expect(api.defaultProps("text")).not.toBe(api.defaultProps("text"));
  });

  it("keeps the visual contract in CSS", () => {
    const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
    for (const token of [
      "--ikasue-surface",
      "--ikasue-ink",
      "--ikasue-line",
      "--ikasue-selection",
      "--ikasue-motion-duration",
    ])
      expect(css).toContain(token);
    expect(css).toContain("@container (max-width: 600px)");
    expect(css).toContain("--ikasue-motion-duration: 0ms");
    expect(css).not.toContain("box-shadow");
  });
});
