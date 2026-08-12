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

    await page.goto("/components/data-grid/");
    const grid = page.locator("ika-data-grid").first();
    await expect(grid.locator('[data-row-peer="true"]')).toHaveCount(1);
    await expect(grid.locator('[data-state="modified"]')).toHaveCount(1);
    await expect(grid.locator('[data-state="error"]')).toHaveCount(1);
  });
});
