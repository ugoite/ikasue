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
    const continuation = await editor.evaluate((node) => {
      const button = node.ownerDocument.createElement("button");
      button.type = "button";
      button.id = "editable-continuation";
      button.textContent = "Continue";
      node.parentElement?.append(button);
      return button.id;
    });
    await editor.locator('[part="input"]').press("Tab");
    await expect(editor).toHaveAttribute("data-state", "modified");
    await expect(page.locator(`#${continuation}`)).toBeFocused();
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
    await side.evaluate((node) => {
      (node as HTMLElement & { props: Record<string, unknown> }).props = {
        main: "Workspace content",
        title: "Inspector",
        content: "Details",
        side: "start",
        open: false,
      };
    });
    const closedStartColumns = await side.evaluate(
      (node) => getComputedStyle(node).gridTemplateColumns,
    );
    await side.evaluate((node) => {
      (node as HTMLElement & { props: Record<string, unknown> }).props = {
        main: "Workspace content",
        title: "Inspector",
        content: "Details",
        side: "start",
        open: true,
      };
    });
    const openStartColumns = await side.evaluate(
      (node) => getComputedStyle(node).gridTemplateColumns,
    );
    expect(openStartColumns).not.toBe(closedStartColumns);
    await page.goto("/components/sidebar/");
    const sidebar = page.locator("ika-sidebar").first();
    await expect(sidebar.locator('[part="main"]')).toContainText(
      "Workspace content",
    );
    const sidebarParts = await sidebar.evaluate((node) =>
      Array.from(node.querySelectorAll('[part="nav"], [part="main"]')).map(
        (part) => part.getAttribute("part"),
      ),
    );
    expect(sidebarParts).toEqual(["nav", "main"]);
    await sidebar.evaluate((node) => {
      (node as HTMLElement & { props: Record<string, unknown> }).props = {
        main: "Workspace content",
        items: [
          { id: "home", label: "Home", icon: "⌂" },
          { id: "settings", label: "Settings", icon: "⚙" },
        ],
        collapsed: true,
      };
    });
    const closedMain = await sidebar.locator('[part="main"]').boundingBox();
    await sidebar.evaluate((node) => {
      (node as HTMLElement & { props: Record<string, unknown> }).props = {
        main: "Workspace content",
        items: [
          { id: "home", label: "Home", icon: "⌂" },
          { id: "settings", label: "Settings", icon: "⚙" },
        ],
        collapsed: false,
      };
    });
    const openMain = await sidebar.locator('[part="main"]').boundingBox();
    const openRail = await sidebar.locator('[part="nav"]').boundingBox();
    expect((openMain?.width ?? 0) < (closedMain?.width ?? 0)).toBe(true);
    expect((openRail?.x ?? 0) + (openRail?.width ?? 0)).toBeLessThanOrEqual(
      (openMain?.x ?? 0) + 1,
    );
    await sidebar.locator('[part="nav-item"]').nth(1).click();
    await expect(sidebar.locator('[part="nav-item"]').nth(1)).toHaveAttribute(
      "aria-current",
      "page",
    );
    const sidebarColumns = await sidebar.evaluate(
      (node) => getComputedStyle(node).gridTemplateColumns,
    );
    expect(sidebarColumns.split(" ").length).toBeGreaterThanOrEqual(2);

    await page.goto("/components/segmented-control/");
    const segmented = page.locator("ika-segmented-control").first();
    const selectedOption = segmented.locator('[aria-checked="true"]');
    const otherOption = segmented.locator('[aria-checked="false"]').first();
    const selectedWidth = await selectedOption.evaluate(
      (node) => node.getBoundingClientRect().width,
    );
    const otherWidth = await otherOption.evaluate(
      (node) => node.getBoundingClientRect().width,
    );
    expect(selectedWidth).toBeGreaterThan(otherWidth);

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
    await split.evaluate((node) => {
      (node as HTMLElement & { props: Record<string, unknown> }).props = {
        panes: [
          { id: "list", label: "List", content: "Items", basis: 1 },
          { id: "detail", label: "Detail", content: "Selection", basis: 2 },
        ],
        orientation: "horizontal",
        activePane: "list",
        collapsible: true,
      };
    });
    await expect(split).toHaveAttribute("data-active-pane", "list");

    await page.goto("/components/data-grid/");
    const grid = page.locator("ika-data-grid").first();
    await expect(grid.locator('[data-row-peer="true"]')).toHaveCount(1);
    await expect(grid.locator('[data-state="modified"]')).toHaveCount(1);
    await expect(grid.locator('[data-state="created"]')).toHaveCount(1);
    await expect(grid.locator('[data-state="error"]')).toHaveCount(1);

    const selected = grid.locator('[data-selected="true"]');
    await expect(selected).toHaveCSS(
      "border-block-end-color",
      "rgb(17, 17, 17)",
    );
    await expect(grid.locator('[data-row-peer="true"]')).toHaveCSS(
      "background-color",
      "rgb(240, 241, 237)",
    );
    await expect(grid.locator('[data-column-peer="true"]')).toHaveCount(1);
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

  test("Alert returns attention to its target region", async ({ page }) => {
    await page.goto("/components/alert/");
    const alert = page.locator("ika-alert").first();
    const target = page.locator("#selected-work");
    await alert.locator('[part="alert-action"]').click();
    await expect(target).toBeFocused();
    await expect(target).toHaveAttribute("data-ika-attention", "true");
  });

  test("unchecked Checkbox keeps its semantic text without an empty box", async ({
    page,
  }) => {
    await page.goto("/components/checkbox/");
    const checkbox = page.locator("ika-checkbox").first();
    await checkbox.evaluate((node) => {
      (node as HTMLElement & { props: Record<string, unknown> }).props = {
        id: "enabled",
        label: "Enabled",
        checked: false,
        disabled: false,
      };
    });
    const check = checkbox.locator('[part="check"]');
    await expect(check).toHaveText("");
    await expect(check).toHaveCSS("border-style", "none");
    await expect(check).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  });

  test("identity survives viewport, zoom, keyboard, and reduced motion changes", async ({
    page,
  }) => {
    for (const width of [320, 600, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/components/tabs/");
      const tabs = page.locator("ika-tabs").first();
      await expect(tabs).toBeVisible();
      await page.keyboard.press("Tab");
      await expect(tabs.locator('[part="tab"]:focus')).toBeVisible();
      const screenshot = await page.screenshot({ animations: "disabled" });
      expect(screenshot.byteLength).toBeGreaterThan(1000);
    }

    await page.goto("/components/sidebar/");
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await expect(page.locator("ika-sidebar").first()).toBeVisible();

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/components/tabs/");
    const activeTab = page.locator(
      'ika-tabs [part="tab"][aria-selected="true"]',
    );
    await expect(activeTab).toBeVisible();
    const motion = await activeTab.evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        animationDuration: style.animationDuration,
        transitionDuration: style.transitionDuration,
      };
    });
    expect(motion.animationDuration).toBe("0s");
    expect(motion.transitionDuration).toContain("0s");
  });
});
