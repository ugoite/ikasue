import { describe, expect, it } from "vitest";
import {
  createSplitViewState,
  setActivePane,
  setPaneCollapsed,
  setPaneSizes,
  splitView,
} from "./workspace";

const panes = [
  {
    id: "list",
    label: "List",
    content: "items",
    size: "1fr",
    collapsible: true,
  },
  { id: "detail", label: "Detail", content: "detail", size: "2fr" },
];

describe("workspace state", () => {
  it("keeps pane order and uses explicit size precedence", () => {
    const spec = splitView(panes, {
      orientation: "horizontal",
      sizes: ["2fr", "1fr"],
      activePane: "detail",
    });
    expect(spec.sizes).toEqual(["2fr", "1fr"]);
    expect(spec.activePane).toBe("detail");
    expect(spec.panes.map((pane) => pane.id)).toEqual(["list", "detail"]);
  });

  it("rejects invalid updates by identity and accepts valid transitions", () => {
    const state = createSplitViewState(panes);
    expect(setPaneSizes(state, ["bad", "1fr"])).toBe(state);
    const active = setActivePane(state, "detail");
    expect(active.activePane).toBe("detail");
    const collapsed = setPaneCollapsed(active, "list", true);
    expect(collapsed.collapsed.list).toBe(true);
    expect(setActivePane(state, "missing")).toBe(state);
  });

  it("keeps fractional tracks in SplitView without accepting them as flex bases", () => {
    expect(splitView(panes, { orientation: "horizontal" }).sizes).toEqual([
      "1fr",
      "2fr",
    ]);
    const updated = setPaneSizes(createSplitViewState(panes), ["1fr", "2fr"]);
    expect(updated.sizes).toEqual(["1fr", "2fr"]);
  });

  it("normalizes numeric pane bases and allows content-free geometry panes", () => {
    const spec = splitView(
      [
        { id: "list", basis: 1, minSize: "12rem", grow: 1, shrink: 0 },
        { id: "detail", basis: 2, size: "3fr" },
      ],
      { orientation: "horizontal" },
    );
    expect(spec.panes[0]).toMatchObject({
      id: "list",
      basis: 1,
      minSize: "12rem",
      grow: 1,
      shrink: 0,
    });
    expect(spec.sizes).toEqual(["1fr", "3fr"]);
  });

  it("keeps disabled panes mounted but rejects their state transitions", () => {
    const state = createSplitViewState([
      { id: "disabled", content: "hidden", disabled: true },
      { id: "active", content: "shown" },
    ]);
    expect(state).not.toHaveProperty("paneIds");
    expect(setActivePane(state, "disabled")).toBe(state);
    expect(setPaneCollapsed(state, "disabled", true)).toBe(state);
  });

  it("only collapses panes that explicitly opt in", () => {
    const state = createSplitViewState([
      { id: "fixed", content: "fixed" },
      { id: "collapsible", content: "collapsible", collapsible: true },
    ]);
    expect(setPaneCollapsed(state, "fixed", true)).toBe(state);
    expect(setPaneCollapsed(state, "collapsible", true).collapsed).toEqual({
      fixed: false,
      collapsible: true,
    });
  });

  it("does not hide panes when the SplitView is not collapsible", () => {
    const spec = splitView(
      [{ id: "detail", content: "detail", collapsible: true }],
      { orientation: "horizontal", collapsed: { detail: true } },
    );

    expect(spec.collapsible).toBe(false);
    expect(spec.collapsed.detail).toBe(false);
  });

  it("updates a state restored without allocator metadata", () => {
    const restored = {
      sizes: ["1fr", "1fr"],
      collapsed: { list: false, detail: false },
    };
    expect(setActivePane(restored, "detail").activePane).toBe("detail");
    expect(setPaneCollapsed(restored, "list", true).collapsed.list).toBe(true);
  });

  it("treats reserved object names as ordinary pane IDs", () => {
    const panes = [{ id: "__proto__", content: "content", collapsible: true }];
    const state = createSplitViewState(panes, { collapsed: {} });

    expect(state.collapsed["__proto__"]).toBe(false);
    expect(
      splitView(panes, { orientation: "horizontal", collapsed: {} }).collapsed[
        "__proto__"
      ],
    ).toBe(false);
    expect(
      setPaneCollapsed(state, "__proto__", true).collapsed["__proto__"],
    ).toBe(true);
  });
});
