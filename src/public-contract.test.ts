import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import * as api from "./index";

describe("public contract", () => {
  it("exposes the component, state, catalog, and Web ABI surfaces", () => {
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
      "dataGridQueryForViewport",
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
      "IKASUE_ABI_VERSION",
      "IKA_ELEMENT_CONTRACTS",
      "IKA_ELEMENT_TAGS",
      "IKA_TAG_BY_KIND",
      "IKA_VIEW_KINDS",
      "IkaDataGridElement",
      "IkaElement",
      "IkaHistoryTimelineElement",
      "IkaSplitViewElement",
      "IkaSueError",
      "IkaTabsElement",
      "COMPONENT_SOURCE_RECIPES",
      "CATALOG_PAGE_COPY",
      "COMPONENT_PAGE_COPY",
      "COMPONENT_MATRIX_PAGE_COPY",
      "PHILOSOPHY_PAGE_COPY",
      "RUNTIME_COMPONENT_REGISTRY",
      "componentDocumentationCopy",
      "componentSource",
      "defineIkaSue",
      "findRegistryEntry",
      "defaultProps",
      "isCatalogComponentId",
      "isCatalogPageId",
      "isIkaDataGridColumn",
      "isIkaDataGridEdit",
      "isIkaDataGridQuery",
      "isIkaDataGridRow",
      "isIkaDataGridSelection",
      "isIkaError",
      "isIkaJsonRecord",
      "isIkaJsonValue",
      "isIkaMessage",
      "isIkaRowPage",
      "isIkaRowRequest",
      "isIkaSplitViewPane",
      "isIkaTabsItem",
      "isIkaView",
      "parseComponentSelection",
      "renderIkaView",
      "serializeComponentSelection",
      "tagNameForKind",
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
    expect(
      api.sidebar({
        items: [{ id: "home", label: "Home", icon: "home" }],
      }).items,
    ).toMatchObject([{ id: "home", label: "Home", icon: "home" }]);
    expect(api.dialog({ modal: true, openerId: "open" })).toMatchObject({
      modal: true,
      openerId: "open",
    });
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
    expect(css).toContain("--ikasue-selection: #f0f1ed");
    expect(css).toContain('[part="read-value"]');
    expect(css).toContain('[data-row-peer="true"]');
    expect(css).toContain("ikasue-loading-wave");
    expect(css).toContain('ika-theme-root[data-variant="dense"]');
    expect(css).toContain('ika-data-grid[data-density="compact"]');
    expect(css).toContain("[data-ika-kind] button");
    expect(css).toContain('[data-ika-kind] [data-selected="true"]');
    expect(css).toContain("[data-ika-kind] *::selection");
    expect(css).not.toContain('data-busy="false"]::before');
    expect(css).not.toMatch(/\nbody\s*\{/);
    expect(css).not.toMatch(/\nbutton\s*\{/);
    expect(css).not.toContain("#dfeeff");
    expect(css).not.toContain("box-shadow");
  });

  it("keeps the identity contracts read-first and stateful", () => {
    expect(
      api.editableText({
        value: "Title",
        editor: "textarea",
        state: "modified",
      }),
    ).toMatchObject({ editor: "textarea", state: "modified" });
    expect(
      api.field({
        id: "name",
        label: "Name",
        content: "ikasue",
        editor: "text",
        state: "created",
      }),
    ).toMatchObject({ editor: "text", state: "created" });
    expect(
      api.historyTimeline({
        entries: [{ id: "r1", label: "Current", content: "Ready" }],
        selectedId: "r1",
        compact: true,
      }),
    ).toMatchObject({ selectedId: "r1", compact: true });
    expect(
      api.alert({
        message: "Review",
        target: "work",
        action: "Focus work",
      }),
    ).toMatchObject({ target: "work", action: "Focus work" });
  });
});
