import { expect, test } from "@playwright/test";

test.describe("ikasue identity contracts", () => {
  test("EditableText stays read-first and commits modified state", async ({
    page,
  }) => {
    await page.goto("/components/editable-text/");
    const editor = page.locator("ika-editable-text").first();
    await expect(editor.locator('[part="read-value"]')).toBeVisible();
    await expect(editor.locator("input, textarea, select")).toHaveCount(0);

    await editor.locator('[part="read-value"]').press("Enter");
    const input = editor.locator('[part="input"]');
    await expect(input).toBeVisible();
    await input.fill("changed");
    await input.press("Escape");
    await expect(editor.locator('[part="read-value"]')).toBeVisible();
    await editor.locator('[part="read-value"]').press("F2");
    await editor.locator('[part="input"]').fill("modified");
    await editor.locator('[part="input"]').press("Enter");
    await expect(editor).toHaveAttribute("data-state", "modified");
  });

  test("elastic Tabs transfer area and loading keeps content", async ({
    page,
  }) => {
    await page.goto("/components/tabs/");
    const tabs = page.locator("ika-tabs").first();
    const active = tabs.locator('[part="tab"][aria-selected="true"]');
    const inactive = tabs
      .locator('[part="tab"][aria-selected="false"]')
      .first();
    await expect(tabs).toHaveAttribute("data-variant", "elastic");
    await expect(active.boundingBox()).resolves.toBeTruthy();
    await expect(inactive.boundingBox()).resolves.toBeTruthy();
    const activeBox = await active.boundingBox();
    const inactiveBox = await inactive.boundingBox();
    expect((activeBox?.width ?? 0) > (inactiveBox?.width ?? 0)).toBe(true);

    await tabs.locator('[part="tab"][data-tab-id="details"]').click();
    await expect(
      tabs.locator('[part="panel"][data-active="true"]'),
    ).toHaveAttribute("data-motion", "forward");
    await tabs.locator('[part="tab"][data-tab-id="overview"]').click();
    await expect(
      tabs.locator('[part="panel"][data-active="true"]'),
    ).toHaveAttribute("data-motion", "backward");

    await page.goto("/components/loading-region/");
    const loading = page.locator("ika-loading-region").first();
    await expect(loading).toHaveAttribute("data-busy", "true");
    await expect(loading).toContainText("Original content remains readable");
  });

  test("workspace panels push their main track", async ({ page }) => {
    await page.goto("/components/side-panel/");
    const side = page.locator("ika-side-panel").first();
    await expect(side.locator('[part="main"]')).toBeVisible();
    await expect(side.locator('[part="panel"]')).toBeVisible();
    const columns = await side.evaluate(
      (node) => getComputedStyle(node).gridTemplateColumns,
    );
    expect(columns.split(" ").length).toBeGreaterThanOrEqual(2);
    await expect(side.locator('[part="main"]')).toContainText(
      "Workspace content",
    );

    await page.goto("/components/bottom-panel/");
    const bottom = page.locator("ika-bottom-panel").first();
    await expect(bottom.locator('[part="main"]')).toContainText(
      "Workspace content",
    );
    const rows = await bottom.evaluate(
      (node) => getComputedStyle(node).gridTemplateRows,
    );
    expect(rows.split(" ").length).toBeGreaterThanOrEqual(2);

    await page.goto("/components/split-view/");
    const split = page.locator("ika-split-view").first();
    await expect(split).toHaveAttribute("data-active-pane", "detail");
    await expect(split.locator("[data-pane-divider] button")).toHaveCount(2);
    const activePane = split.locator('[data-active="true"]');
    const inactivePane = split.locator('[data-active="false"]').first();
    const activeFlex = await activePane.evaluate((node) =>
      Number.parseFloat(getComputedStyle(node).flexGrow),
    );
    const inactiveFlex = await inactivePane.evaluate((node) =>
      Number.parseFloat(getComputedStyle(node).flexGrow),
    );
    expect(activeFlex).toBeGreaterThan(inactiveFlex);

    await page.goto("/components/data-grid/");
    const grid = page.locator("ika-data-grid").first();
    await expect(grid.locator('[data-row-peer="true"]')).toHaveCount(1);
    await expect(grid.locator('[data-state="modified"]')).toHaveCount(1);
    await expect(grid.locator('[data-state="error"]')).toHaveCount(1);

    const selected = grid.locator('[data-selected="true"]');
    await selected.press("Enter");
    const input = grid.locator('[part="input"]');
    await expect(input).toBeVisible();
    await input.fill("changed");
    await input.press("Enter");
    await expect(grid.locator('[data-state="modified"]')).toHaveCount(1);

    const copied = await grid
      .locator('[data-row-id="one"][data-column-id="name"]')
      .evaluate((cell) => {
        const transfer = new DataTransfer();
        cell.dispatchEvent(
          new ClipboardEvent("copy", {
            bubbles: true,
            cancelable: true,
            clipboardData: transfer,
          }),
        );
        return transfer.getData("text/plain");
      });
    expect(copied).toBe("changed");
  });
});
