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

  it("allocates edge and bottom regions inside the plane and restores focus", () => {
    const plane = nestedPlane({
      root: branch("work", "horizontal", [leaf("alpha"), leaf("beta")], {
        edgeRegions: [
          {
            id: "tools",
            edge: "right",
            basis: 1,
            temporary: true,
            restoreFocus: "work/beta",
          },
          { id: "decision", edge: "bottom", basis: 1, temporary: true },
        ],
      }),
      focus: "work/beta",
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
    expect(tools?.rect.x).toBe(5);
    expect(decision?.rect.y).toBe(3);
    expect(contentChild && root).toBeDefined();
    if (contentChild && root) expectRectContained(contentChild, root);
    expect(restoreFocusAfterEdgeDismissal(resolved, "tools")).toBe("work/beta");
    expect(restoreFocusAfterEdgeDismissal(resolved, "decision")).toBe(
      "work/beta",
    );
  });
});
