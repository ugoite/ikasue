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

  it("keeps disabled panes mounted but rejects their state transitions", () => {
    const state = createSplitViewState([
      { id: "disabled", content: "hidden", disabled: true },
      { id: "active", content: "shown" },
    ]);
    expect(state).not.toHaveProperty("paneIds");
    expect(setActivePane(state, "disabled")).toBe(state);
    expect(setPaneCollapsed(state, "disabled", true)).toBe(state);
  });

  it("updates a state restored without allocator metadata", () => {
    const restored = {
      sizes: ["1fr", "1fr"],
      collapsed: { list: false, detail: false },
    };
    expect(setActivePane(restored, "detail").activePane).toBe("detail");
    expect(setPaneCollapsed(restored, "list", true).collapsed.list).toBe(true);
  });
});
