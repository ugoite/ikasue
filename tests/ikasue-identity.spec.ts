import { expect, test } from "@playwright/test";

const P0_COMPONENT_ROUTES = [
  "editable-text",
  "theme-root",
  "tabs",
  "sidebar",
  "toolbar",
  "icon-button",
  "text-field",
  "checkbox",
  "segmented-control",
  "form",
  "data-grid",
  "history-timeline",
  "split-view",
  "side-panel",
  "bottom-panel",
  "loading-region",
] as const;

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
    await editor.evaluate((node) => {
      (node as HTMLElement & { props: Record<string, unknown> }).props = {
        id: "controlled",
        value: "host update",
        editor: "text",
        state: "error",
      };
    });
    await expect(editor.locator('[part="read-value"]')).toHaveText(
      "host update",
    );
    await expect(editor).toHaveAttribute("data-state", "error");
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
    const initialSideColumns = await side.evaluate(
      (node) => getComputedStyle(node).gridTemplateColumns,
    );
    await side.evaluate((node) => {
      (node as HTMLElement & { props: Record<string, unknown> }).props = {
        main: "Workspace content",
        title: "Inspector",
        content: "Details",
        side: "end",
        open: false,
      };
    });
    await expect(side.locator('[part="panel"]')).toHaveAttribute("inert", "");
    await expect
      .poll(() =>
        side.evaluate((node) => getComputedStyle(node).gridTemplateColumns),
      )
      .not.toBe(initialSideColumns);
    const closedSideMain = await side.locator('[part="main"]').boundingBox();
    await side.evaluate((node) => {
      (node as HTMLElement & { props: Record<string, unknown> }).props = {
        main: "Workspace content",
        title: "Inspector",
        content: "Details",
        side: "end",
        open: true,
      };
    });
    await expect(side.locator('[part="panel"]')).not.toHaveAttribute("inert");
    await expect
      .poll(() =>
        side.evaluate((node) => getComputedStyle(node).gridTemplateColumns),
      )
      .not.toBe(
        await side.evaluate(
          (node) => getComputedStyle(node).gridTemplateColumns,
        ),
      );
    const openSideMain = await side.locator('[part="main"]').boundingBox();
    expect(openSideMain?.width ?? 0).toBeLessThan(
      closedSideMain?.width ?? Number.POSITIVE_INFINITY,
    );
    await expect(side.locator('[part="main"]')).toBeVisible();
    await expect(side.locator('[part="panel"]')).toBeVisible();
    const columns = await side.evaluate(
      (node) => getComputedStyle(node).gridTemplateColumns,
    );
    expect(columns.split(" ").length).toBeGreaterThanOrEqual(2);
    await expect(side.locator('[part="main"]')).toContainText(
      "Workspace content",
    );
    const sideMainBox = await side.locator('[part="main"]').boundingBox();
    const sidePanelBox = await side.locator('[part="panel"]').boundingBox();
    expect(sideMainBox && sidePanelBox).toBeTruthy();
    const sideHorizontalOverlap =
      sideMainBox && sidePanelBox
        ? Math.max(
            0,
            Math.min(
              sideMainBox.x + sideMainBox.width,
              sidePanelBox.x + sidePanelBox.width,
            ) - Math.max(sideMainBox.x, sidePanelBox.x),
          )
        : -1;
    expect(sideHorizontalOverlap).toBe(0);
    await page.setViewportSize({ width: 320, height: 800 });
    for (const sidePosition of ["end", "start"] as const) {
      await side.evaluate((node, position) => {
        (node as HTMLElement & { props: Record<string, unknown> }).props = {
          main: "Workspace content",
          title: "Inspector",
          content: "Details",
          side: position,
          open: true,
        };
      }, sidePosition);
      const mainBox = await side.locator('[part="main"]').boundingBox();
      const panelBox = await side.locator('[part="panel"]').boundingBox();
      expect(mainBox && panelBox).toBeTruthy();
      const overlap =
        mainBox && panelBox
          ? Math.max(
              0,
              Math.min(mainBox.x + mainBox.width, panelBox.x + panelBox.width) -
                Math.max(mainBox.x, panelBox.x),
            )
          : -1;
      expect(overlap).toBe(0);
      expect(mainBox?.width ?? 0).toBeGreaterThan(0);
      expect(panelBox?.width ?? 0).toBeGreaterThan(0);
    }
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
    await expect
      .poll(() =>
        side.evaluate((node) => getComputedStyle(node).gridTemplateColumns),
      )
      .not.toBe(closedStartColumns);
    await page.setViewportSize({ width: 1280, height: 800 });
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
    expect(selectedWidth).toBeGreaterThanOrEqual(otherWidth * 1.4);

    for (const choiceRoute of ["radio-group", "segmented-control"] as const) {
      await page.goto(`/components/${choiceRoute}/`);
      const choice = page.locator(`ika-${choiceRoute}`).first();
      await choice.evaluate((node) => {
        (node as HTMLElement & { props: Record<string, unknown> }).props = {
          options: [
            { id: "one", label: "One" },
            { id: "two", label: "Two" },
          ],
          value: "missing",
        };
      });
      await expect(choice.locator('[role="radio"][tabindex="0"]')).toHaveCount(
        1,
      );
    }

    await page.goto("/components/bottom-panel/");
    const bottom = page.locator("ika-bottom-panel").first();
    await bottom.evaluate((node) => {
      (node as HTMLElement).style.blockSize = "24rem";
    });
    const initialBottomRows = await bottom.evaluate(
      (node) => getComputedStyle(node).gridTemplateRows,
    );
    await bottom.evaluate((node) => {
      (node as HTMLElement & { props: Record<string, unknown> }).props = {
        main: "Workspace content",
        title: "Output",
        content: "Logs",
        open: false,
      };
    });
    await expect(bottom.locator('[part="panel"]')).toHaveAttribute("inert", "");
    await expect
      .poll(() =>
        bottom.evaluate((node) => getComputedStyle(node).gridTemplateRows),
      )
      .not.toBe(initialBottomRows);
    const closedBottomMain = await bottom
      .locator('[part="main"]')
      .boundingBox();
    await bottom.evaluate((node) => {
      (node as HTMLElement & { props: Record<string, unknown> }).props = {
        main: "Workspace content",
        title: "Output",
        content: "Logs",
        open: true,
      };
    });
    await expect(bottom.locator('[part="panel"]')).not.toHaveAttribute("inert");
    await expect
      .poll(() =>
        bottom.evaluate((node) => getComputedStyle(node).gridTemplateRows),
      )
      .not.toBe(
        await bottom.evaluate(
          (node) => getComputedStyle(node).gridTemplateRows,
        ),
      );
    const openBottomMain = await bottom.locator('[part="main"]').boundingBox();
    expect(openBottomMain?.height ?? 0).toBeLessThan(
      closedBottomMain?.height ?? Number.POSITIVE_INFINITY,
    );
    await expect(bottom.locator('[part="main"]')).toContainText(
      "Workspace content",
    );
    const rows = await bottom.evaluate(
      (node) => getComputedStyle(node).gridTemplateRows,
    );
    expect(rows.split(" ").length).toBeGreaterThanOrEqual(2);
    const bottomMainBox = await bottom.locator('[part="main"]').boundingBox();
    const bottomPanelBox = await bottom.locator('[part="panel"]').boundingBox();
    expect(bottomMainBox && bottomPanelBox).toBeTruthy();
    const bottomVerticalOverlap =
      bottomMainBox && bottomPanelBox
        ? Math.max(
            0,
            Math.min(
              bottomMainBox.y + bottomMainBox.height,
              bottomPanelBox.y + bottomPanelBox.height,
            ) - Math.max(bottomMainBox.y, bottomPanelBox.y),
          )
        : -1;
    expect(bottomVerticalOverlap).toBe(0);
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/components/bottom-panel/");
    const narrowBottom = page.locator("ika-bottom-panel").first();
    const narrowMainBox = await narrowBottom
      .locator('[part="main"]')
      .boundingBox();
    const narrowPanelBox = await narrowBottom
      .locator('[part="panel"]')
      .boundingBox();
    expect(narrowMainBox && narrowPanelBox).toBeTruthy();
    const narrowOverlap =
      narrowMainBox && narrowPanelBox
        ? Math.max(
            0,
            Math.min(
              narrowMainBox.y + narrowMainBox.height,
              narrowPanelBox.y + narrowPanelBox.height,
            ) - Math.max(narrowMainBox.y, narrowPanelBox.y),
          )
        : -1;
    expect(narrowOverlap).toBe(0);
    expect(narrowMainBox?.height ?? 0).toBeGreaterThan(0);
    expect(narrowPanelBox?.height ?? 0).toBeGreaterThan(0);

    await page.goto("/components/form/");
    const formHost = page.locator("ika-form").first();
    await expect(formHost).toHaveAttribute("data-status", "dirty");
    await expect(formHost.locator("ika-editable-text").first()).toContainText(
      "ikasue draft",
    );
    const formEditor = formHost.locator("ika-editable-text").first();
    const formLabelId = await formHost
      .locator('[part="label"]')
      .first()
      .getAttribute("id");
    if (!formLabelId) throw new Error("Form label must have an id");
    await expect(formEditor.locator('[part="read-value"]')).toHaveAttribute(
      "aria-labelledby",
      formLabelId,
    );
    await formEditor.locator('[part="read-value"]').press("Enter");
    await expect(formEditor.locator('[part="input"]')).toHaveAttribute(
      "aria-labelledby",
      formLabelId,
    );
    await expect(formEditor.locator('[part="input"]')).toHaveAccessibleName(
      "Name",
    );
    const submitted = await formHost.evaluate(
      (node) =>
        new Promise<unknown>((resolve) => {
          node.addEventListener(
            "ika-submit",
            (event) => {
              resolve((event as CustomEvent).detail);
            },
            { once: true },
          );
          node.querySelector("form")?.requestSubmit();
        }),
    );
    expect(submitted).toEqual({ values: { name: "ikasue draft" } });

    await formHost.evaluate((node) => {
      (node as HTMLElement & { props: Record<string, unknown> }).props = {
        fields: [
          {
            id: "name",
            label: "Name",
            initialValue: "ikasue",
            required: true,
          },
        ],
        values: { name: "ikasue" },
        drafts: {},
        errors: { name: "Name is required" },
        status: "error",
      };
    });
    const formError = formHost.locator('[part="error"]').first();
    await expect(formError).toHaveText("Name is required");
    const formErrorId = await formError.getAttribute("id");
    if (!formErrorId) throw new Error("Form error must have an id");
    await expect(
      formHost
        .locator("ika-editable-text")
        .first()
        .locator('[part="read-value"]'),
    ).toHaveAttribute("aria-describedby", formErrorId);

    await page.goto("/components/field/");
    const fieldHost = page.locator("ika-field").first();
    await fieldHost.evaluate((node) => {
      (node as HTMLElement & { props: Record<string, unknown> }).props = {
        id: "profile/name",
        label: "Name",
        description: "Used for the workspace title",
        error: "Name is required",
        required: true,
        content: "ikasue",
        editor: "text",
        state: "error",
      };
    });
    const fieldLegend = fieldHost.locator("legend");
    const fieldLegendId = await fieldLegend.getAttribute("id");
    if (!fieldLegendId) throw new Error("Field legend must have an id");
    const fieldEditor = fieldHost.locator("ika-editable-text");
    await expect(fieldEditor.locator('[part="read-value"]')).toHaveAttribute(
      "aria-labelledby",
      fieldLegendId,
    );
    await expect(fieldHost.locator('[part="description"]')).toHaveText(
      "Used for the workspace title",
    );
    const fieldDescriptionId = await fieldHost
      .locator('[part="description"]')
      .getAttribute("id");
    if (!fieldDescriptionId)
      throw new Error("Field description must have an id");
    const fieldError = fieldHost.locator('[part="error"]');
    await expect(fieldError).toHaveText("Name is required");
    const fieldErrorId = await fieldError.getAttribute("id");
    if (!fieldErrorId) throw new Error("Field error must have an id");
    await expect(fieldEditor.locator('[part="read-value"]')).toHaveAttribute(
      "aria-describedby",
      `${fieldDescriptionId} ${fieldErrorId}`,
    );

    await page.goto("/components/text-field/");
    const textField = page.locator("ika-text-field").first();
    await textField.evaluate((node) => {
      (node as HTMLElement & { props: Record<string, unknown> }).props = {
        id: "query",
        label: "Query",
        value: "ikasue",
        description: "Search the current workspace",
        error: "Query is required",
        required: true,
      };
    });
    const textInput = textField.locator('[part="input"]');
    const textDescriptionId = await textField
      .locator('[part="description"]')
      .getAttribute("id");
    const textErrorId = await textField
      .locator('[part="error"]')
      .getAttribute("id");
    if (!textDescriptionId || !textErrorId)
      throw new Error("TextField status nodes must have ids");
    await expect(textField).toHaveAttribute("aria-invalid", "true");
    await expect(textInput).toHaveAccessibleName("Query");
    await expect(textInput).toHaveAttribute(
      "aria-describedby",
      `${textDescriptionId} ${textErrorId}`,
    );

    await page.setViewportSize({ width: 1280, height: 800 });
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
    const paneBoxes = await split
      .locator("[data-pane-id]")
      .evaluateAll((nodes) =>
        nodes.map((node) => {
          const box = node.getBoundingClientRect();
          return { x: box.x, y: box.y, right: box.right, bottom: box.bottom };
        }),
      );
    const controlBoxes = await split
      .locator("[data-pane-divider] button")
      .evaluateAll((nodes) =>
        nodes.map((node) => {
          const box = node.getBoundingClientRect();
          return { x: box.x, y: box.y, right: box.right, bottom: box.bottom };
        }),
      );
    for (const control of controlBoxes)
      for (const pane of paneBoxes) {
        const overlap =
          Math.max(
            0,
            Math.min(control.right, pane.right) - Math.max(control.x, pane.x),
          ) *
          Math.max(
            0,
            Math.min(control.bottom, pane.bottom) - Math.max(control.y, pane.y),
          );
        expect(overlap).toBe(0);
      }
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
    await split.evaluate((node) => {
      (node as HTMLElement & { props: Record<string, unknown> }).props = {
        panes: [
          { id: "list", label: "List", content: "Items", basis: 1 },
          { id: "detail", label: "Detail", content: "Selection", basis: 2 },
        ],
        orientation: "horizontal",
        collapsible: true,
      };
    });
    await page.setViewportSize({ width: 320, height: 800 });
    await expect(split.locator('[part="mobile-nav"]')).toBeVisible();
    await expect(split.locator("[data-pane-id]:visible")).toHaveCount(1);
    await expect(split.locator('[part="mobile-next"]')).toBeEnabled();
    await split.locator('[part="mobile-next"]').click();
    await expect(split).toHaveAttribute("data-active-pane", "detail");
    await expect(split.locator("[data-pane-id]:visible")).toHaveCount(1);

    await page.goto("/components/data-grid/");
    const grid = page.locator("ika-data-grid").first();
    await expect(grid.locator('[data-row-peer="true"]')).toHaveCount(1);
    await expect(grid.locator('[data-state="modified"]')).toHaveCount(1);
    await expect(grid.locator('[data-state="created"]')).toHaveCount(1);
    await expect(grid.locator('[data-state="error"]')).toHaveCount(1);

    const selected = grid.locator('[data-selected="true"]');
    await expect(selected).toHaveAttribute("aria-selected", "true");
    await expect(grid.locator('[role="row"][tabindex]')).toHaveCount(0);
    await expect(grid.locator('[part="cell"][tabindex="0"]')).toHaveCount(1);
    await expect(selected).toHaveCSS(
      "border-block-end-color",
      "rgb(17, 17, 17)",
    );
    await expect(grid.locator('[data-row-peer="true"]')).toHaveCSS(
      "background-color",
      "rgb(250, 250, 248)",
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

  test("Sidebar keeps its open track on a narrow viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/components/sidebar/");
    const sidebar = page.locator("ika-sidebar").first();
    await sidebar.evaluate((node) => {
      (node as HTMLElement & { props: Record<string, unknown> }).props = {
        main: "Workspace content",
        items: [{ id: "home", label: "Home", icon: "⌂" }],
        activeId: "home",
        collapsed: false,
        railWidth: "44px",
        openWidth: "18rem",
      };
    });
    await expect
      .poll(() =>
        sidebar.evaluate((node) => getComputedStyle(node).gridTemplateColumns),
      )
      .toContain("288px");
    await expect(sidebar.locator('[part="label"]')).toBeVisible();
  });

  test("Alert returns attention to its target region", async ({ page }) => {
    await page.goto("/components/alert/");
    const alert = page.locator("ika-alert").first();
    const target = page.locator("#selected-work");
    await alert.locator('[part="alert-action"]').click();
    await expect(target).toBeFocused();
    await expect(target).toHaveAttribute("data-ika-attention", "true");
  });

  test("HistoryTimeline keeps the selected revision keyboard reachable", async ({
    page,
  }) => {
    await page.goto("/components/history-timeline/");
    const timeline = page.locator("ika-history-timeline").first();
    const current = timeline.locator('[part="entry"][aria-current="true"]');
    await expect(current).toHaveAttribute("tabindex", "0");
    await current.focus();
    await page.keyboard.press("ArrowUp");
    await expect(
      timeline.locator('[part="entry"][aria-current="true"]'),
    ).toContainText("Created");
    await expect(
      timeline.locator('[part="entry"][aria-current="true"]'),
    ).toBeFocused();
  });

  test("Dialog opens in the flow and returns focus to its opener", async ({
    page,
  }) => {
    await page.goto("/components/dialog/");
    const host = page.locator("ika-dialog").first();
    await host.evaluate((node) => {
      const opener = node.ownerDocument.createElement("button");
      opener.id = "dialog-opener";
      opener.type = "button";
      opener.textContent = "Open";
      node.parentElement?.prepend(opener);
      (node as HTMLElement & { props: Record<string, unknown> }).props = {
        title: "Confirm",
        content: "Continue?",
        open: false,
        modal: false,
        openerId: "dialog-opener",
      };
    });
    const opener = page.locator("#dialog-opener");
    await opener.focus();
    await host.evaluate((node) => {
      (node as HTMLElement & { props: Record<string, unknown> }).props = {
        title: "Confirm",
        content: "Continue?",
        open: true,
        modal: false,
        openerId: "dialog-opener",
      };
    });
    await expect(host.locator('[part="dialog"]')).toBeVisible();
    await expect(host.locator('[part="close"]')).toBeFocused();
    await host.locator('[part="close"]').click();
    await expect(opener).toBeFocused();
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
      const firstTab = tabs.locator('[part="tab"]').first();
      await firstTab.focus();
      await page.keyboard.press("ArrowRight");
      await expect(tabs.locator('[part="tab"]:focus')).toBeVisible();
      await expect(page).toHaveScreenshot(`tabs-${String(width)}.png`, {
        animations: "disabled",
        maxDiffPixelRatio: 0.05,
      });
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

    const selectionColors = await activeTab.evaluate((node) => {
      const style = getComputedStyle(node);
      const root = getComputedStyle(document.documentElement);
      return {
        actual: style.backgroundColor,
        semantic: [
          "--ikasue-info",
          "--ikasue-success",
          "--ikasue-warning",
          "--ikasue-danger",
        ].map((name) => root.getPropertyValue(name).trim()),
      };
    });
    expect(selectionColors.actual).not.toBe("");
    expect(selectionColors.semantic).not.toContain(selectionColors.actual);
    await expect(page).toHaveScreenshot("tabs-reduced-motion.png", {
      animations: "disabled",
      maxDiffPixelRatio: 0.05,
    });
  });

  test("P0 components keep a responsive visual and keyboard baseline", async ({
    page,
  }) => {
    await page.goto("/components/theme-root/");
    const theme = page.locator("ika-theme-root").first();
    await expect(theme).toHaveAttribute("data-variant", "default");
    await expect(theme.locator("ika-stack")).toHaveCount(1);
    await expect(
      theme.locator('[data-demo-theme-descendant="true"]'),
    ).toHaveCount(4);
    const inheritedSurface = await theme
      .locator('ika-text[data-demo-theme-descendant="true"]')
      .first()
      .evaluate((node) =>
        getComputedStyle(node).getPropertyValue("--ikasue-surface"),
      );
    expect(inheritedSurface.trim()).toBe("#f5f7fb");
    await theme.evaluate((node) => {
      (node as HTMLElement & { props: Record<string, unknown> }).props = {
        tokens: { "ikasue-surface": "#010203" },
        variant: "dense",
      };
    });
    await expect(theme).toHaveAttribute("data-variant", "dense");
    await expect
      .poll(() =>
        theme
          .locator('ika-text[data-demo-theme-descendant="true"]')
          .first()
          .evaluate((node) =>
            getComputedStyle(node).getPropertyValue("--ikasue-surface").trim(),
          ),
      )
      .toBe("#010203");

    for (const width of [320, 600, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      for (const route of P0_COMPONENT_ROUTES) {
        await page.goto(`/components/${route}/`);
        const component = page.locator(`ika-${route}`).first();
        await expect(component).toBeVisible();
        const focusable =
          route === "split-view"
            ? component.locator('[data-pane-id][data-active="true"]').first()
            : component
                .locator(
                  'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex="0"]',
                )
                .first();
        if ((await focusable.count()) > 0) {
          await focusable.focus();
          await expect(focusable).toBeFocused();
        }
        await expect(component).toHaveScreenshot(
          `p0-${route}-${String(width)}.png`,
          {
            animations: "disabled",
            maxDiffPixelRatio: 0.05,
          },
        );
      }
    }

    await page.setViewportSize({ width: 600, height: 800 });
    for (const route of P0_COMPONENT_ROUTES) {
      await page.goto(`/components/${route}/`);
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
      const component = page.locator(`ika-${route}`).first();
      await expect(component).toHaveScreenshot(`p0-${route}-zoom.png`, {
        animations: "disabled",
        maxDiffPixelRatio: 0.05,
      });
    }

    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const route of P0_COMPONENT_ROUTES) {
      await page.goto(`/components/${route}/`);
      const component = page.locator(`ika-${route}`).first();
      await expect(component).toHaveScreenshot(`p0-${route}-reduced.png`, {
        animations: "disabled",
        maxDiffPixelRatio: 0.05,
      });
    }
  });
});
