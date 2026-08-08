import { describe, expect, it } from "vitest";

import {
  normalizeFocusPlane,
  requestFocus,
  resolveFocusPlane,
  restoreFocusAfterEdgeDismissal,
  type FocusBranch,
  type FocusLeaf,
  type FocusNode,
  type ResolvedFocusPlane,
} from "./focus-plane";

function leaf(id: string, basis = 3, min = 0.5): FocusLeaf {
  return { kind: "leaf", id, basis, min };
}

function branch(
  id: string,
  axis: FocusBranch["axis"],
  children: readonly FocusNode[],
  options: Partial<FocusBranch> = {},
): FocusBranch {
  return {
    kind: "branch",
    id,
    axis,
    fit: "elastic",
    gap: 0,
    navigation: true,
    children,
    ...options,
  };
}

function nestedPlane(
  overrides: Partial<Parameters<typeof resolveFocusPlane>[0]> = {},
) {
  return {
    root: branch("work", "horizontal", [
      leaf("alpha"),
      branch("beta", "vertical", [
        leaf("overview"),
        branch("detail", "horizontal", [
          leaf("source"),
          leaf("editor"),
          leaf("history"),
        ]),
        leaf("validation"),
      ]),
      leaf("gamma"),
    ]),
    focus: "work/beta/detail/editor",
    viewport: { inline: 6, block: 4 },
    collapse: "sliver" as const,
    ...overrides,
  };
}

function regionsByParent(resolved: ResolvedFocusPlane, parentPath: string) {
  return resolved.regions.filter((region) => region.parentPath === parentPath);
}

function expectRectContained(
  child: ResolvedFocusPlane["regions"][number],
  parent: ResolvedFocusPlane["regions"][number],
): void {
  expect(child.rect.x).toBeGreaterThanOrEqual(parent.rect.x);
  expect(child.rect.y).toBeGreaterThanOrEqual(parent.rect.y);
  expect(child.rect.x + child.rect.width).toBeLessThanOrEqual(
    parent.rect.x + parent.rect.width,
  );
  expect(child.rect.y + child.rect.height).toBeLessThanOrEqual(
    parent.rect.y + parent.rect.height,
  );
}

describe("recursive focus plane", () => {
  it("propagates a leaf focus through every ancestor and generates axis navigation", () => {
    const resolved = resolveFocusPlane(nestedPlane());

    expect(resolved.focusPath).toBe("work/beta/detail/editor");
    expect(resolved.focusLeaf).toBe("editor");
    expect(
      resolved.regions
        .filter((region) => region.focused)
        .map((region) => region.path),
    ).toEqual([
      "work",
      "work/beta",
      "work/beta/detail",
      "work/beta/detail/editor",
    ]);
    expect(
      regionsByParent(resolved, "work").map((region) => region.state),
    ).toEqual(["compressed", "focused", "compressed"]);
    expect(
      regionsByParent(resolved, "work/beta").map((region) => region.state),
    ).toEqual(["compressed", "focused", "compressed"]);
    expect(
      regionsByParent(resolved, "work/beta/detail").map(
        (region) => region.state,
      ),
    ).toEqual(["compressed", "focused", "compressed"]);

    expect(resolved.navigation.map(({ path, kind }) => [path, kind])).toEqual([
      ["work", "edge-nav"],
      ["work/beta", "elastic-tabs"],
      ["work/beta/detail", "edge-nav"],
    ]);
    expect(resolved.navigation[0]).toMatchObject({
      focusIndex: 1,
      previous: "work/alpha",
      next: "work/gamma",
      canPrevious: true,
      canNext: true,
    });
  });

  it("falls back to the first leaf below the deepest existing focus prefix", () => {
    const resolved = resolveFocusPlane(
      nestedPlane({ focus: "work/beta/detail/removed" }),
    );

    expect(resolved.focusPath).toBe("work/beta/detail/source");
    expect(resolved.focusLeaf).toBe("source");
    expect(requestFocus(nestedPlane(), "work/removed").focus).toBe(
      "work/alpha",
    );
    expect(
      normalizeFocusPlane({
        root: branch("root", "horizontal", [
          branch("empty", "vertical", []),
          leaf("available"),
        ]),
        focus: "root/empty",
        viewport: { inline: 4, block: 2 },
      }).focus,
    ).toBe("root/available");
  });

  it("normalizes malformed nodes, duplicate sibling ids, and invalid extents", () => {
    const normalized = normalizeFocusPlane({
      root: {
        kind: "branch",
        id: " root ",
        axis: "diagonal" as "vertical",
        gap: -1,
        viewport: undefined,
        children: [
          { kind: "leaf", id: " first ", basis: -2, min: 4 },
          { kind: "leaf", id: "first", basis: 4 },
          { kind: "unsupported", id: "ignored" },
        ],
        edgeRegions: [
          { id: "tools", edge: "right", basis: -1 },
          { id: "tools", edge: "bottom", basis: 2 },
        ],
      } as never,
      focus: "missing",
      viewport: { inline: -1, block: Number.NaN },
    });

    expect(normalized.root).toMatchObject({
      id: "root",
      axis: "vertical",
      gap: 0,
      children: [{ id: "first", basis: 1, min: 1 }],
      edgeRegions: [{ id: "tools", edge: "right", basis: 1, min: 0 }],
    });
    expect(normalized.viewport).toEqual({ inline: 0, block: 0 });
    expect(normalized.focus).toBe("root/first");
  });

  it("keeps child rectangles within parents without overlap", () => {
    const resolved = resolveFocusPlane(nestedPlane());

    for (const parent of resolved.regions.filter(
      (region) => region.kind === "branch",
    )) {
      const children = regionsByParent(resolved, parent.path);
      for (const child of children) expectRectContained(child, parent);
      for (const [index, left] of children.entries()) {
        for (const right of children.slice(index + 1)) {
          const overlapWidth =
            Math.min(
              left.rect.x + left.rect.width,
              right.rect.x + right.rect.width,
            ) - Math.max(left.rect.x, right.rect.x);
          const overlapHeight =
            Math.min(
              left.rect.y + left.rect.height,
              right.rect.y + right.rect.height,
            ) - Math.max(left.rect.y, right.rect.y);
          expect(overlapWidth > 0 && overlapHeight > 0).toBe(false);
        }
      }
    }
  });

  it("keeps a constrained focused sliver positive when gaps consume the viewport", () => {
    const resolved = resolveFocusPlane({
      root: branch(
        "root",
        "horizontal",
        [leaf("alpha", 10, 0), leaf("beta", 10, 0), leaf("gamma", 10, 0)],
        { gap: 1 },
      ),
      focus: "root/beta",
      viewport: { inline: 1, block: 2 },
      collapse: "sliver",
    });
    const children = regionsByParent(resolved, "root");

    expect(
      children.find((region) => region.path === "root/beta")?.rect.width,
    ).toBeGreaterThan(0);
    expect(
      children.reduce((sum, region) => sum + region.rect.width, 0),
    ).toBeLessThanOrEqual(1);
  });

  it("marks off-path constrained branches collapsed in zero mode", () => {
    const resolved = resolveFocusPlane({
      root: branch("root", "horizontal", [
        branch("other", "vertical", [leaf("away")]),
        branch("current", "vertical", [leaf("here")]),
      ]),
      focus: "root/current/here",
      viewport: { inline: 1, block: 2 },
      collapse: "zero",
    });

    expect(
      resolved.regions.find((region) => region.path === "root/other")?.state,
    ).toBe("collapsed");
    const sliverResolved = resolveFocusPlane({
      root: branch("root", "horizontal", [
        branch("other", "vertical", [leaf("away")]),
        branch("current", "vertical", [leaf("here")]),
      ]),
      focus: "root/current/here",
      viewport: { inline: 1, block: 2 },
      collapse: "sliver",
    });
    expect(
      sliverResolved.regions.find((region) => region.path === "root/other")
        ?.state,
    ).toBe("collapsed");
  });

  it("bounds non-navigable overflow instead of leaking child rectangles", () => {
    const resolved = resolveFocusPlane({
      root: branch(
        "root",
        "horizontal",
        [leaf("alpha", 10, 5), leaf("beta", 10, 5)],
        { navigation: false },
      ),
      viewport: { inline: 4, block: 2 },
    });
    const children = regionsByParent(resolved, "root");

    expect(children.map((region) => region.rect.width)).toEqual([2, 2]);
    expect(
      children.every((region) => region.rect.x + region.rect.width <= 4),
    ).toBe(true);
    expect(resolved.navigation).toEqual([]);
  });

  it("clamps oversized gaps and preserves wrap lines as semantic rectangles", () => {
    const gapResolved = resolveFocusPlane({
      root: branch(
        "root",
        "horizontal",
        [leaf("alpha", 4, 0), leaf("beta", 4, 0)],
        { gap: 10, navigation: false },
      ),
      viewport: { inline: 5, block: 2 },
    });
    const gapChildren = regionsByParent(gapResolved, "root");
    expect(
      gapChildren.every(
        (region) =>
          region.rect.x >= 0 && region.rect.x + region.rect.width <= 5,
      ),
    ).toBe(true);

    const wrapResolved = resolveFocusPlane({
      root: branch(
        "root",
        "horizontal",
        [leaf("alpha", 3, 0), leaf("beta", 3, 0)],
        { fit: "wrap", gap: 1, navigation: false },
      ),
      viewport: { inline: 4, block: 4 },
    });
    const wrapChildren = regionsByParent(wrapResolved, "root");
    expect(new Set(wrapChildren.map((region) => region.rect.y)).size).toBe(2);
    expect(
      wrapChildren.every(
        (region) =>
          region.rect.y >= 0 && region.rect.y + region.rect.height <= 4,
      ),
    ).toBe(true);

    const oversizedWrap = resolveFocusPlane({
      root: branch("root", "horizontal", [leaf("oversized", 6, 0)], {
        fit: "wrap",
        navigation: false,
      }),
      viewport: { inline: 4, block: 2 },
    });
    expect(regionsByParent(oversizedWrap, "root")[0]?.rect.width).toBe(4);
  });

  it("allocates edge and bottom regions inside the plane and restores focus", () => {
    const plane = nestedPlane({
      root: branch("work", "horizontal", [leaf("alpha"), leaf("beta")], {
        edgeRegions: [
          {
            id: "tools",
            edge: "right",
            basis: 1,
            min: 0.5,
            temporary: true,
            restoreFocus: "work/alpha",
          },
          {
            id: "decision",
            edge: "bottom",
            basis: 1,
            min: 0.5,
            temporary: true,
          },
          { id: "top-tools", edge: "top", basis: 0.5, min: 0.25 },
          { id: "left-tools", edge: "left", basis: 4, min: 2 },
        ],
      }),
      focus: "work/beta",
      viewport: { inline: 5, block: 3 },
    });
    const resolved = resolveFocusPlane(plane);
    const root = resolved.regions.find((region) => region.path === "work");
    const contentChild = resolved.regions.find(
      (region) => region.path === "work/beta",
    );
    const tools = resolved.edges.find((edge) => edge.id === "tools");
    const decision = resolved.edges.find((edge) => edge.id === "decision");

    expect(root).toBeDefined();
    expect(contentChild).toBeDefined();
    expect(tools?.edge).toBe("right");
    expect(decision?.edge).toBe("bottom");
    expect(tools?.rect.width).toBeGreaterThanOrEqual(0.5);
    expect(decision?.rect.height).toBeGreaterThanOrEqual(0.5);
    expect(
      resolved.edges.find((edge) => edge.id === "left-tools")?.rect.width,
    ).toBeGreaterThanOrEqual(2);
    expect(
      resolved.edges.every(
        (edge) =>
          edge.rect.x >= 0 &&
          edge.rect.y >= 0 &&
          edge.rect.x + edge.rect.width <= 5 &&
          edge.rect.y + edge.rect.height <= 3,
      ),
    ).toBe(true);
    for (const [index, left] of resolved.edges.entries()) {
      for (const right of resolved.edges.slice(index + 1)) {
        const overlapWidth =
          Math.min(
            left.rect.x + left.rect.width,
            right.rect.x + right.rect.width,
          ) - Math.max(left.rect.x, right.rect.x);
        const overlapHeight =
          Math.min(
            left.rect.y + left.rect.height,
            right.rect.y + right.rect.height,
          ) - Math.max(left.rect.y, right.rect.y);
        expect(overlapWidth > 0 && overlapHeight > 0).toBe(false);
      }
    }
    expect(contentChild && root).toBeDefined();
    if (contentChild && root) expectRectContained(contentChild, root);
    expect(restoreFocusAfterEdgeDismissal(resolved, "tools")).toBe(
      "work/alpha",
    );
    expect(restoreFocusAfterEdgeDismissal(resolved, "decision")).toBe(
      "work/beta",
    );
  });

  it("uses an edge path when duplicate local edge ids exist", () => {
    const resolved = resolveFocusPlane({
      root: branch(
        "root",
        "horizontal",
        [
          branch("left", "vertical", [leaf("item")], {
            edgeRegions: [
              {
                id: "decision",
                edge: "bottom",
                temporary: true,
                restoreFocus: "root/left",
              },
            ],
          }),
          branch("right", "vertical", [leaf("item")], {
            edgeRegions: [
              {
                id: "decision",
                edge: "bottom",
                temporary: true,
                restoreFocus: "root/right/item",
              },
            ],
          }),
        ],
        {
          edgeRegions: [{ id: "decision", edge: "top" }],
        },
      ),
      focus: "root/right/item",
      viewport: { inline: 6, block: 4 },
    });

    expect(
      restoreFocusAfterEdgeDismissal(resolved, "root/left/@edge/decision"),
    ).toBe("root/left/item");
    expect(restoreFocusAfterEdgeDismissal(resolved, "decision")).toBe(
      "root/right/item",
    );
  });
});
