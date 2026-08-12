import { historyTimeline, textComponent, themeRoot } from "../components";
import { flex, grid, scrollArea, separator, stack } from "../layout";
import { bottomPanel, loadingRegion, sidePanel } from "../workspace";
import type {
  DataGridSpec,
  DialogSpec,
  FieldSpec,
  FlexSpec,
  GridSpec,
  HistoryTimelineSpec,
  LoadingRegionSpec,
  ScrollAreaSpec,
  SidePanelSpec,
  SplitViewSpec,
  TabsSpec,
  DataGridCell,
} from "../types";
import { defineIkaSue, tagNameForKind } from "../elements";
import type { IkaJsonRecord, IkaViewKind } from "../contract";
import type { CatalogComponentId, CatalogLocale } from "./types";
import { findRegistryEntry } from "./registry";
import { element, type Cleanup } from "./dom";

export interface DomAllocator {
  allocate(role: string, raw: unknown, index: number): string;
}

export function createDomAllocator(): DomAllocator {
  const used = new Set<string>();
  const counts = new Map<string, number>();
  return {
    allocate(role, raw, index) {
      const input = typeof raw === "string" ? raw : "";
      const base =
        input
          .normalize("NFKC")
          .replace(/[^A-Za-z0-9_-]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .toLowerCase() || `anonymous-${String(index)}`;
      const prefix = `ikasue-${role}-`;
      const baseId = `${prefix}${base}`;
      let count = counts.get(baseId) ?? 1;
      let candidate = count === 1 ? base : `${base}-${String(count)}`;
      while (used.has(`${prefix}${candidate}`)) {
        count += 1;
        candidate = `${base}-${String(count)}`;
      }
      counts.set(baseId, count + 1);
      const id = `${prefix}${candidate}`;
      used.add(id);
      return id;
    },
  };
}

const align = (value: string): string =>
  value === "start" ? "flex-start" : value === "end" ? "flex-end" : value;
const justify = (value: string): string =>
  value === "start" ? "flex-start" : value === "end" ? "flex-end" : value;
const setStyle = (node: HTMLElement, name: string, value: string): void => {
  node.style.setProperty(name, value);
};
const section = (document: Document, title: string): HTMLElement => {
  const node = element(document, "section");
  node.className = "ikasue-demo-section";
  node.append(element(document, "h2", title));
  return node;
};

const demoProps = (value: Record<string, unknown>): IkaJsonRecord =>
  value as IkaJsonRecord;

const ikaDemoElement = (
  document: Document,
  kind: IkaViewKind,
  props: Record<string, unknown>,
  fallback: string,
): HTMLElement => {
  const registry = document.defaultView?.customElements;
  if (!registry) return element(document, "span", fallback);
  try {
    defineIkaSue(registry);
    const node = document.createElement(tagNameForKind(kind)) as HTMLElement & {
      props?: IkaJsonRecord;
    };
    node.props = demoProps(props);
    return node;
  } catch {
    return element(document, "span", fallback);
  }
};

function renderFlex(
  document: Document,
  target: HTMLElement,
  spec: FlexSpec,
  className: string,
): void {
  target.className = className;
  target.dataset.kind = spec.kind;
  target.style.display = "flex";
  target.style.flexDirection = spec.direction;
  target.style.flexWrap = spec.wrap;
  target.style.removeProperty("gap");
  target.style.setProperty("--ikasue-layout-gap", spec.gap);
  target.style.alignItems = align(spec.align);
  target.style.justifyContent = justify(spec.justify);
  spec.children.forEach((child, index) => {
    const node = element(
      document,
      "div",
      typeof child === "string" ? child : child.id,
    );
    node.dataset.childId = typeof child === "string" ? child : child.id;
    if (typeof child !== "string") {
      if (child.grow !== undefined) node.style.flexGrow = String(child.grow);
      if (child.shrink !== undefined)
        node.style.flexShrink = String(child.shrink);
      if (child.basis !== undefined) node.style.flexBasis = child.basis;
    }
    node.id = `ikasue-child-${String(index + 1)}`;
    node.tabIndex = 0;
    target.append(node);
  });
}

function renderGrid(
  document: Document,
  target: HTMLElement,
  spec: GridSpec,
): void {
  target.className = "ikasue-grid";
  target.dataset.kind = spec.kind;
  target.style.display = "grid";
  target.style.removeProperty("grid-template-columns");
  target.style.removeProperty("grid-template-rows");
  target.style.removeProperty("gap");
  target.style.setProperty("--ikasue-grid-columns", spec.columns);
  target.style.setProperty("--ikasue-grid-rows", spec.rows);
  target.style.setProperty("--ikasue-layout-gap", spec.gap);
  target.style.alignItems = align(spec.align);
  target.style.justifyContent = justify(spec.justify);
  target.style.justifyItems =
    spec.justify === "start"
      ? "start"
      : spec.justify === "end"
        ? "end"
        : spec.justify === "center"
          ? "center"
          : "stretch";
  spec.children.forEach((child, index) => {
    const node = element(document, "div", child);
    node.id = `ikasue-grid-child-${String(index + 1)}`;
    target.append(node);
  });
}

function renderTabs(
  document: Document,
  target: HTMLElement,
  spec: TabsSpec,
  allocator: DomAllocator,
): void {
  const tabList = element(document, "div");
  tabList.setAttribute("role", "tablist");
  tabList.setAttribute("aria-orientation", spec.orientation);
  const panels = element(document, "div");
  const buttons: HTMLButtonElement[] = [];
  const active = spec.activeId ?? spec.items[0]?.id;
  let currentId = active;
  const update = (id: string, notify = true): void => {
    const item = spec.items.find((candidate) => candidate.id === id);
    if (!item || item.disabled) return;
    const changed = currentId !== id;
    currentId = id;
    spec.items.forEach((item, index) => {
      const button = buttons[index];
      const panel = panels.children[index];
      if (!button || !panel) return;
      const selected = item.id === id;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
      panel.toggleAttribute("hidden", !selected);
      panel.setAttribute("aria-hidden", String(!selected));
    });
    if (notify && changed && typeof spec.onActiveChange === "function") {
      try {
        spec.onActiveChange(id);
      } catch {
        // A controlled callback cannot invalidate the DOM state.
      }
    }
  };
  spec.items.forEach((item, index) => {
    const tabId = allocator.allocate("tab", item.id, index + 1);
    const panelId = allocator.allocate("panel", item.id, index + 1);
    const button = element(document, "button", item.label);
    button.type = "button";
    button.id = tabId;
    button.disabled = item.disabled;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", panelId);
    button.addEventListener("click", () => {
      update(item.id);
    });
    button.addEventListener("keydown", (event) => {
      const key = event.key;
      const arrowKeys =
        spec.orientation === "horizontal"
          ? ["ArrowLeft", "ArrowRight"]
          : ["ArrowUp", "ArrowDown"];
      if (![...arrowKeys, "Home", "End"].includes(key)) return;
      event.preventDefault();
      const enabled = buttons.filter((candidate) => !candidate.disabled);
      const current = enabled.indexOf(button);
      const next =
        key === "Home"
          ? 0
          : key === "End"
            ? enabled.length - 1
            : (current + (key === arrowKeys[0] ? -1 : 1) + enabled.length) %
              enabled.length;
      enabled[next]?.focus();
      if (enabled[next])
        update(spec.items[buttons.indexOf(enabled[next])]?.id ?? item.id);
    });
    buttons.push(button);
    tabList.append(button);
    const panel = element(document, "div", item.content);
    panel.id = panelId;
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", tabId);
    panels.append(panel);
  });
  target.append(tabList, panels);
  if (active) update(active);
}

function renderDataGrid(
  document: Document,
  target: HTMLElement,
  spec: DataGridSpec,
  allocator: DomAllocator,
): void {
  target.setAttribute("role", "grid");
  target.setAttribute("aria-label", "DataGrid");
  const header = element(document, "div");
  header.setAttribute("role", "row");
  const columnIds = new Map<string, string>();
  const cellNodes = new Map<string, HTMLElement>();
  const cells = new Map(
    spec.cells.map((cell) => [`${cell.row}\u0000${cell.column}`, cell]),
  );
  const rowIndex = new Map(spec.rows.map((row, index) => [row.id, index]));
  const columnIndex = new Map(
    spec.columns.map((column, index) => [column.id, index]),
  );
  let selected = spec.selection;
  let editing:
    | {
        readonly key: string;
        readonly original: string;
        readonly originalCell: DataGridCell;
      }
    | undefined;
  let operation = 0;
  const keyFor = (row: string, column: string): string =>
    `${row}\u0000${column}`;
  const cancelEdit = (): void => {
    const current = editing;
    if (!current) return;
    const node = cellNodes.get(current.key);
    if (node) {
      node.textContent = current.original;
      node.contentEditable = "false";
    }
    cells.set(current.key, current.originalCell);
    editing = undefined;
    operation += 1;
  };
  const validSelection = (
    value: { readonly row: string; readonly column: string } | undefined,
  ): value is { readonly row: string; readonly column: string } =>
    value !== undefined &&
    rowIndex.has(value.row) &&
    columnIndex.has(value.column);
  const updateSelection = (value: {
    readonly row: string;
    readonly column: string;
  }): void => {
    if (!validSelection(value)) return;
    const changed =
      selected === undefined ||
      selected.row !== value.row ||
      selected.column !== value.column;
    selected = value;
    cancelEdit();
    operation += 1;
    cellNodes.forEach((node, key) => {
      const isSelected = key === keyFor(value.row, value.column);
      node.dataset.selected = String(isSelected);
      node.setAttribute("aria-selected", String(isSelected));
    });
    if (changed && typeof spec.onSelect === "function") {
      try {
        spec.onSelect(value);
      } catch {
        // Selection remains recorded even if application code throws.
      }
    }
  };
  const beginEdit = (node: HTMLElement, row: string, column: string): void => {
    const key = keyFor(row, column);
    if (editing?.key !== key) cancelEdit();
    const cell =
      cells.get(key) ?? ({ row, column, value: "", status: "clean" } as const);
    cells.set(key, cell);
    editing = {
      key: keyFor(row, column),
      original: cell.value,
      originalCell: cell,
    };
    node.contentEditable = "true";
    node.focus();
  };
  const finishEdit = (node: HTMLElement, row: string, column: string): void => {
    const current = editing;
    if (!current || current.key !== keyFor(row, column)) return;
    const next = node.textContent || "";
    node.contentEditable = "false";
    editing = undefined;
    operation += 1;
    const cell = cells.get(current.key);
    if (!cell || cell.value === next) return;
    cells.set(current.key, { ...cell, value: next, status: "dirty" });
    if (typeof spec.onEdit === "function") {
      try {
        spec.onEdit(row, column, next);
      } catch {
        // A completed edit is not rolled back by a callback error.
      }
    }
  };
  spec.columns.forEach((column, index) => {
    const id = allocator.allocate("column", column.id, index + 1);
    columnIds.set(column.id, id);
    const node = element(document, "span", column.label);
    node.id = id;
    node.setAttribute("role", "columnheader");
    node.setAttribute("aria-colindex", String(index + 1));
    header.append(node);
  });
  target.append(header);
  spec.rows.forEach((row, rowNumber) => {
    const rowId = allocator.allocate("row", row.id, rowNumber + 1);
    const rowNode = element(document, "div");
    rowNode.id = rowId;
    rowNode.setAttribute("role", "row");
    rowNode.setAttribute("aria-rowindex", String(rowNumber + 2));
    const rowHeader = element(document, "span", row.label ?? row.id);
    const rowHeaderId = allocator.allocate("row-header", row.id, rowNumber + 1);
    rowHeader.id = rowHeaderId;
    rowHeader.setAttribute("role", "rowheader");
    rowHeader.setAttribute("aria-rowindex", String(rowNumber + 2));
    rowNode.append(rowHeader);
    spec.columns.forEach((column, columnNumber) => {
      const cell = cells.get(keyFor(row.id, column.id));
      const cellId = allocator.allocate(
        "cell",
        `${row.id}-${column.id}`,
        rowNumber * Math.max(spec.columns.length, 1) + columnNumber + 1,
      );
      const cellNode = element(document, "span", cell?.value ?? "");
      cellNode.id = cellId;
      cellNode.tabIndex = 0;
      cellNode.setAttribute("role", "gridcell");
      cellNode.setAttribute("aria-rowindex", String(rowNumber + 2));
      cellNode.setAttribute("aria-colindex", String(columnNumber + 1));
      cellNode.setAttribute(
        "aria-selected",
        String(selected?.row === row.id && selected.column === column.id),
      );
      const headerId = columnIds.get(column.id);
      cellNode.setAttribute(
        "aria-labelledby",
        [rowHeaderId, headerId]
          .filter((value): value is string => Boolean(value))
          .join(" "),
      );
      const key = keyFor(row.id, column.id);
      cellNodes.set(key, cellNode);
      cellNode.addEventListener("focus", () => {
        updateSelection({ row: row.id, column: column.id });
      });
      cellNode.addEventListener("click", () => {
        updateSelection({ row: row.id, column: column.id });
        cellNode.focus();
      });
      cellNode.addEventListener("dblclick", () => {
        updateSelection({ row: row.id, column: column.id });
        beginEdit(cellNode, row.id, column.id);
      });
      cellNode.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && editing?.key === key) {
          event.preventDefault();
          finishEdit(cellNode, row.id, column.id);
          return;
        }
        if (event.key === "Escape" && editing?.key === key) {
          event.preventDefault();
          cancelEdit();
          return;
        }
        if (
          event.key === "Enter" &&
          selected?.row === row.id &&
          selected.column === column.id
        ) {
          event.preventDefault();
          beginEdit(cellNode, row.id, column.id);
          return;
        }
        if (editing?.key === key) return;
        if (
          ![
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "Home",
            "End",
          ].includes(event.key) ||
          !selected
        )
          return;
        event.preventDefault();
        const currentRow = rowIndex.get(selected.row);
        const currentColumn = columnIndex.get(selected.column);
        if (currentRow === undefined || currentColumn === undefined) return;
        const nextRow =
          event.key === "Home" || event.key === "End"
            ? currentRow
            : Math.max(
                0,
                Math.min(
                  spec.rows.length - 1,
                  currentRow +
                    (event.key === "ArrowUp"
                      ? -1
                      : event.key === "ArrowDown"
                        ? 1
                        : 0),
                ),
              );
        const nextColumn =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? spec.columns.length - 1
              : Math.max(
                  0,
                  Math.min(
                    spec.columns.length - 1,
                    currentColumn +
                      (event.key === "ArrowLeft"
                        ? -1
                        : event.key === "ArrowRight"
                          ? 1
                          : 0),
                  ),
                );
        const next =
          spec.rows[nextRow]?.id && spec.columns[nextColumn]?.id
            ? {
                row: spec.rows[nextRow].id,
                column: spec.columns[nextColumn].id,
              }
            : undefined;
        if (next) {
          updateSelection(next);
          cellNodes.get(keyFor(next.row, next.column))?.focus();
        }
      });
      rowNode.append(cellNode);
    });
    target.append(rowNode);
  });
  const clipboardValue = (): string | undefined => {
    if (!validSelection(selected)) return undefined;
    const key = keyFor(selected.row, selected.column);
    return cellNodes.get(key)?.textContent ?? cells.get(key)?.value ?? "";
  };
  target.addEventListener("copy", (event) => {
    const value = clipboardValue();
    const selection = validSelection(selected) ? selected : undefined;
    if (value === undefined || !selection || !event.clipboardData) return;
    let result: unknown = true;
    try {
      if (spec.onCopy) result = spec.onCopy(selection);
    } catch {
      return;
    }
    if (result !== true) return;
    event.preventDefault();
    try {
      event.clipboardData.setData("text/plain", value);
    } catch {
      return;
    }
  });
  target.addEventListener("paste", (event) => {
    const selection = validSelection(selected) ? selected : undefined;
    if (!selection || !event.clipboardData) return;
    event.preventDefault();
    const value = event.clipboardData.getData("text/plain");
    const token = ++operation;
    let result: boolean | Promise<boolean> = true;
    try {
      if (spec.onPaste) result = spec.onPaste(selection, value);
    } catch {
      result = false;
    }
    void Promise.resolve(result)
      .then((accepted) => {
        if (token !== operation || !accepted) return;
        const key = keyFor(selection.row, selection.column);
        const cell =
          cells.get(key) ??
          ({
            row: selection.row,
            column: selection.column,
            value: "",
            status: "clean",
          } as const);
        if (cell.value === value && cells.has(key)) return;
        cells.set(key, { ...cell, value, status: "dirty" });
        const node = cellNodes.get(key);
        if (node) node.textContent = value;
        try {
          spec.onEdit?.(selection.row, selection.column, value);
        } catch {
          // A completed paste is not rolled back by a callback error.
        }
      })
      .catch(() => undefined);
  });
  if (selected) {
    cellNodes
      .get(keyFor(selected.row, selected.column))
      ?.setAttribute("data-selected", "true");
  }
}

function renderSplitView(
  document: Document,
  target: HTMLElement,
  spec: SplitViewSpec,
  allocator: DomAllocator,
): Cleanup {
  target.className = "ikasue-split-view";
  target.dataset.orientation = spec.orientation;
  target.dataset.motionOrigin = spec.motionOrigin;
  const controls = element(document, "div");
  controls.className = "ikasue-split-controls";
  let activePane = spec.activePane;
  let sizes = [...spec.sizes];
  let responsiveColumn = false;
  const layoutOrientation = (): "horizontal" | "vertical" =>
    responsiveColumn ? "vertical" : spec.orientation;
  const collapsed = Object.assign(
    Object.create(null) as Record<string, boolean>,
    spec.collapsed,
  );
  const paneNodes = new Map<string, HTMLElement>();
  const collapseButtons = new Map<string, HTMLButtonElement>();
  const applyTrack = (node: HTMLElement, track: string): void => {
    const fr = /^(\d+(?:\.\d+)?)fr$/.exec(track);
    if (fr) {
      node.style.flexGrow = fr[1] ?? "1";
      node.style.flexShrink = "1";
      node.style.flexBasis = "0";
    } else if (track === "auto") {
      node.style.flex = "1 1 auto";
    } else {
      node.style.flexGrow = "0";
      node.style.flexShrink = "1";
      node.style.flexBasis = track;
    }
  };
  const applyPaneStyle = (
    pane: (typeof spec.panes)[number],
    index: number,
    node: HTMLElement,
  ): void => {
    applyTrack(node, sizes[index] ?? pane.basis ?? "1fr");
    if (pane.grow !== undefined) node.style.flexGrow = String(pane.grow);
    if (pane.shrink !== undefined) node.style.flexShrink = String(pane.shrink);
    node.style.minWidth = "";
    node.style.minHeight = "";
    if (pane.minSize) {
      setStyle(
        node,
        layoutOrientation() === "horizontal" ? "min-width" : "min-height",
        pane.minSize,
      );
      node.style.setProperty("--ikasue-pane-min-size", pane.minSize);
    }
  };
  target.dataset.responsiveOrientation = layoutOrientation();
  const updateResponsive = (): void => {
    const container = target.parentElement ?? target;
    const width = container.getBoundingClientRect().width;
    if (!Number.isFinite(width) || width <= 0) return;
    const next = spec.orientation === "horizontal" && width <= 600;
    if (next === responsiveColumn) return;
    responsiveColumn = next;
    target.dataset.responsiveOrientation = layoutOrientation();
    spec.panes.forEach((pane, index) => {
      const node = paneNodes.get(pane.id);
      if (node && collapsed[pane.id] !== true)
        applyPaneStyle(pane, index, node);
    });
    target
      .querySelectorAll<HTMLElement>("[data-pane-divider]")
      .forEach((divider) => {
        divider.setAttribute("aria-orientation", layoutOrientation());
      });
  };
  const setCollapsed = (pane: HTMLElement, value: boolean): void => {
    const paneId = pane.dataset.paneId;
    const collapse = paneId ? collapseButtons.get(paneId) : undefined;
    if (collapse) {
      collapse.textContent = value ? "Expand" : "Collapse";
      collapse.setAttribute("aria-expanded", String(!value));
    }
    pane.dataset.collapsed = String(value);
    pane.toggleAttribute("aria-hidden", value);
    pane.setAttribute("aria-hidden", String(value));
    if (value) {
      pane.style.flex = "0 0 0";
      pane.style.minWidth = "0";
      pane.style.minHeight = "0";
      pane.style.overflow = "hidden";
    } else {
      const index = spec.panes.findIndex(
        (candidate) => candidate.id === pane.dataset.paneId,
      );
      const source = spec.panes[index];
      if (source) applyPaneStyle(source, index, pane);
      pane.style.overflow = "";
    }
  };
  const notifyActive = (id: string): void => {
    if (activePane === id) return;
    activePane = id;
    controls
      .querySelectorAll<HTMLButtonElement>("[data-pane-target]")
      .forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.paneTarget === id),
        );
      });
    try {
      spec.onActivePaneChange?.(id);
    } catch {
      // A controlled callback cannot invalidate the rendered state.
    }
  };
  const minPixels = (
    value: string | undefined,
    total: number,
    node: HTMLElement,
  ): number => {
    if (!value || value === "0") return 0;
    if (value.endsWith("%")) {
      const percent = Number.parseFloat(value);
      return Number.isFinite(percent) ? (total * percent) / 100 : 0;
    }
    const pixels = Number.parseFloat(value);
    if (value.endsWith("px"))
      return Number.isFinite(pixels) && pixels >= 0 ? pixels : 0;
    const property =
      layoutOrientation() === "horizontal" ? "min-width" : "min-height";
    const computed = document.defaultView?.getComputedStyle(node);
    const computedValue = computed?.getPropertyValue(property) ?? "";
    const resolved = Number.parseFloat(computedValue);
    if (
      (computedValue.endsWith("px") || computedValue === "0") &&
      Number.isFinite(resolved) &&
      resolved >= 0
    )
      return resolved;
    const rootSize = Number.parseFloat(
      document.defaultView?.getComputedStyle(document.documentElement)
        .fontSize ?? "",
    );
    const fontSize = Number.parseFloat(computed?.fontSize ?? "");
    if (value.endsWith("rem") && Number.isFinite(rootSize))
      return Math.max(0, pixels * rootSize);
    if (value.endsWith("em") && Number.isFinite(fontSize))
      return Math.max(0, pixels * fontSize);
    if (value.endsWith("ch") && Number.isFinite(fontSize))
      return Math.max(0, pixels * fontSize * 0.5);
    const viewport = document.defaultView;
    if (value.endsWith("vw") && viewport)
      return Math.max(0, (pixels * viewport.innerWidth) / 100);
    if (value.endsWith("vh") && viewport)
      return Math.max(0, (pixels * viewport.innerHeight) / 100);
    return 0;
  };
  const mainPixels = (rect: DOMRect): number =>
    layoutOrientation() === "horizontal" ? rect.width : rect.height;
  const resizePair = (
    firstIndex: number,
    secondIndex: number,
    firstRect: DOMRect,
    secondRect: DOMRect,
    delta: number,
  ): void => {
    const first = spec.panes[firstIndex];
    const second = spec.panes[secondIndex];
    if (
      !first ||
      !second ||
      first.disabled ||
      second.disabled ||
      collapsed[first.id] === true ||
      collapsed[second.id] === true
    )
      return;
    const firstNode = paneNodes.get(first.id);
    const secondNode = paneNodes.get(second.id);
    if (!firstNode || !secondNode) return;
    const firstPixels = mainPixels(firstRect);
    const secondPixels = mainPixels(secondRect);
    const pairPixels = firstPixels + secondPixels;
    if (
      !Number.isFinite(pairPixels) ||
      pairPixels <= 0 ||
      !Number.isFinite(delta)
    )
      return;
    const firstMin = minPixels(first.minSize, pairPixels, firstNode);
    const secondMin = minPixels(second.minSize, pairPixels, secondNode);
    if (firstMin + secondMin > pairPixels) return;
    const nextFirst = Math.max(
      firstMin,
      Math.min(pairPixels - secondMin, firstPixels + delta),
    );
    const nextSecond = pairPixels - nextFirst;
    if (nextFirst === firstPixels || nextSecond === secondPixels) return;
    const nextSizes = [...sizes];
    nextSizes[firstIndex] = `${String(Math.round(nextFirst * 100) / 100)}px`;
    nextSizes[secondIndex] = `${String(Math.round(nextSecond * 100) / 100)}px`;
    sizes = nextSizes;
    applyPaneStyle(first, firstIndex, firstNode);
    applyPaneStyle(second, secondIndex, secondNode);
    try {
      spec.onSizesChange?.(nextSizes);
    } catch {
      // A resize callback cannot invalidate the current DOM geometry.
    }
  };
  spec.panes.forEach((pane) => {
    if (pane.disabled) return;
    const targetButton = element(document, "button", pane.label ?? pane.id);
    targetButton.type = "button";
    targetButton.dataset.paneTarget = pane.id;
    targetButton.setAttribute("aria-pressed", String(activePane === pane.id));
    targetButton.addEventListener("click", () => {
      notifyActive(pane.id);
    });
    controls.append(targetButton);
  });
  spec.panes.forEach((pane, index) => {
    const paneNode = element(document, "section");
    const paneId = allocator.allocate("pane", pane.id, index + 1);
    const labelId = allocator.allocate("pane-label", pane.id, index + 1);
    paneNode.dataset.paneId = pane.id;
    paneNode.id = paneId;
    paneNode.setAttribute("role", "group");
    paneNode.setAttribute("aria-labelledby", labelId);
    applyPaneStyle(pane, index, paneNode);
    paneNodes.set(pane.id, paneNode);
    const label = element(document, "h3", pane.label ?? pane.id);
    label.id = labelId;
    paneNode.append(label, element(document, "p", pane.content));
    if (spec.collapsible && pane.collapsible && !pane.disabled) {
      const collapse = element(document, "button", "Collapse");
      collapse.type = "button";
      collapse.dataset.paneCollapse = pane.id;
      collapse.setAttribute("aria-controls", paneId);
      collapse.addEventListener("click", () => {
        const next = collapsed[pane.id] !== true;
        collapsed[pane.id] = next;
        setCollapsed(paneNode, next);
        try {
          spec.onCollapsedChange?.(pane.id, next);
        } catch {
          // A controlled callback cannot invalidate the collapsed state.
        }
      });
      collapseButtons.set(pane.id, collapse);
      controls.append(collapse);
    }
    if (pane.disabled) paneNode.setAttribute("aria-disabled", "true");
    setCollapsed(paneNode, collapsed[pane.id] === true);
    target.append(paneNode);
    if (index < spec.panes.length - 1) {
      const nextPane = spec.panes[index + 1];
      if (!nextPane) return;
      const divider = element(document, "div");
      divider.dataset.paneDivider = `${pane.id}:${nextPane.id}`;
      divider.setAttribute("role", "separator");
      divider.setAttribute("aria-orientation", layoutOrientation());
      divider.tabIndex = 0;
      const canResize = (): boolean =>
        !pane.disabled &&
        collapsed[pane.id] !== true &&
        !nextPane.disabled &&
        collapsed[nextPane.id] !== true;
      let pointer:
        | {
            readonly id: number;
            readonly start: number;
            readonly firstRect: DOMRect;
            readonly secondRect: DOMRect;
            readonly token: number;
          }
        | undefined;
      let token = 0;
      const coordinate = (event: PointerEvent): number =>
        layoutOrientation() === "horizontal" ? event.clientX : event.clientY;
      divider.addEventListener("pointerdown", (event) => {
        if (!canResize()) return;
        const firstRect = paneNode.getBoundingClientRect();
        const secondNode = paneNodes.get(nextPane.id);
        const secondRect = secondNode?.getBoundingClientRect();
        if (
          !secondRect ||
          !Number.isFinite(mainPixels(firstRect)) ||
          !Number.isFinite(mainPixels(secondRect))
        )
          return;
        token += 1;
        pointer = {
          id: event.pointerId,
          start: coordinate(event),
          firstRect,
          secondRect,
          token,
        };
        try {
          divider.setPointerCapture(event.pointerId);
        } catch {
          // Pointer capture is optional in non-browser test environments.
        }
      });
      divider.addEventListener("pointermove", (event) => {
        if (
          !pointer ||
          pointer.id !== event.pointerId ||
          pointer.token !== token
        )
          return;
        divider.style.setProperty(
          "--ikasue-resize-delta",
          `${String(coordinate(event) - pointer.start)}px`,
        );
      });
      const finishPointer = (event: PointerEvent, cancelled: boolean): void => {
        if (
          !pointer ||
          pointer.id !== event.pointerId ||
          pointer.token !== token
        )
          return;
        const current = pointer;
        pointer = undefined;
        token += 1;
        divider.style.removeProperty("--ikasue-resize-delta");
        try {
          divider.releasePointerCapture(event.pointerId);
        } catch {
          // Pointer capture is optional in non-browser test environments.
        }
        if (!cancelled)
          resizePair(
            index,
            index + 1,
            current.firstRect,
            current.secondRect,
            coordinate(event) - current.start,
          );
      };
      divider.addEventListener("pointerup", (event) => {
        finishPointer(event, false);
      });
      divider.addEventListener("pointercancel", (event) => {
        finishPointer(event, true);
      });
      divider.addEventListener("keydown", (event) => {
        const negative =
          layoutOrientation() === "horizontal" ? "ArrowLeft" : "ArrowUp";
        const positive =
          layoutOrientation() === "horizontal" ? "ArrowRight" : "ArrowDown";
        if (!canResize() || (event.key !== negative && event.key !== positive))
          return;
        const secondNode = paneNodes.get(nextPane.id);
        if (!secondNode) return;
        event.preventDefault();
        resizePair(
          index,
          index + 1,
          paneNode.getBoundingClientRect(),
          secondNode.getBoundingClientRect(),
          event.key === negative ? -4 : 4,
        );
      });
      target.append(divider);
    }
  });
  target.prepend(controls);
  updateResponsive();
  const observed = target.parentElement ?? target;
  let observer: ResizeObserver | undefined;
  if (typeof ResizeObserver !== "undefined") {
    observer = new ResizeObserver(updateResponsive);
    observer.observe(observed);
  }
  return () => observer?.disconnect();
}

function renderField(
  document: Document,
  target: HTMLElement,
  spec: FieldSpec,
  allocator: DomAllocator,
): void {
  const wrapper = element(document, "div");
  const safeId = allocator.allocate("field", spec.id, 1);
  const labelId = allocator.allocate("label", spec.id, 1);
  const label = element(document, "label", spec.label);
  label.id = labelId;
  label.htmlFor = safeId;
  const content = element(document, "input");
  content.id = safeId;
  content.value = spec.content;
  content.setAttribute("aria-labelledby", labelId);
  wrapper.append(label, content);
  target.append(wrapper);
}

function renderDialog(
  document: Document,
  target: HTMLElement,
  spec: DialogSpec,
  allocator: DomAllocator,
): void {
  const opener = element(document, "button", "Open dialog");
  opener.type = "button";
  const dialogNode = element(document, "dialog");
  const titleId = allocator.allocate("title", spec.title, 1);
  const title = element(document, "h2", spec.title);
  title.id = titleId;
  dialogNode.setAttribute("aria-labelledby", titleId);
  dialogNode.append(title, element(document, "p", spec.content));
  const close = element(document, "button", "Close");
  close.type = "button";
  close.addEventListener("click", () => {
    dialogNode.close();
  });
  dialogNode.append(close);
  const restore = (): void => {
    spec.onClose?.();
    opener.focus();
  };
  dialogNode.addEventListener("close", restore);
  opener.addEventListener("click", () => {
    if (spec.modal) dialogNode.showModal();
    else dialogNode.show();
  });
  if (spec.open) dialogNode.setAttribute("open", "");
  target.append(opener, dialogNode);
}

// Kept for the catalog's direct-DOM fallback; the primary demo path uses the
// same custom elements and semantic states as the public runtime.
void renderTabs;
void renderSplitView;
void renderField;
void renderDataGrid;
void renderDialog;

function renderComponentDemo(
  document: Document,
  target: HTMLElement,
  id: CatalogComponentId,
): Cleanup | undefined {
  switch (id) {
    case "theme-root": {
      const spec = themeRoot({});
      Object.entries(spec.tokens).forEach(([key, value]) => {
        target.style.setProperty(`--${key}`, value);
      });
      target.dataset.kind = spec.kind;
      target.append(
        element(document, "p", "Theme tokens are applied at the root."),
      );
      return;
    }
    case "flex":
      renderFlex(
        document,
        target,
        flex(["Header", { id: "Content", grow: 1, basis: "0" }], {
          gap: "1rem",
        }),
        "ikasue-flex",
      );
      return;
    case "stack":
      renderFlex(
        document,
        target,
        stack(["Header", "Content"], { gap: "1rem" }),
        "ikasue-stack",
      );
      return;
    case "grid":
      renderGrid(
        document,
        target,
        grid(["A", "B", "C"], { columns: "repeat(3,1fr)", gap: "1rem" }),
      );
      return;
    case "scroll-area": {
      const spec: ScrollAreaSpec = scrollArea("Scrollable work", { axis: "y" });
      target.className = "ikasue-scroll-area";
      target.style.overflowY = spec.axis === "x" ? "hidden" : "auto";
      target.style.overflowX = spec.axis === "y" ? "hidden" : "auto";
      target.style.overscrollBehavior = spec.overscroll;
      target.append(element(document, "p", spec.content));
      return;
    }
    case "separator": {
      const spec = separator({ orientation: "horizontal", role: "separator" });
      const node = element(document, "div");
      node.className = "ikasue-separator";
      node.setAttribute("role", spec.role ?? "separator");
      node.dataset.orientation = spec.orientation;
      target.append(node);
      return;
    }
    case "tabs":
      target.append(
        ikaDemoElement(
          document,
          "tabs",
          {
            main: "Workspace content remains visible beside the navigation rail.",
            items: [
              { id: "overview", label: "Overview", content: "Overview" },
              { id: "details", label: "Details", content: "Details" },
            ],
            activeId: "overview",
            variant: "elastic",
            orientation: "horizontal",
          },
          "Tabs",
        ),
      );
      return;
    case "sidebar": {
      target.append(
        ikaDemoElement(
          document,
          "sidebar",
          {
            main: "Workspace content remains visible beside the navigation rail.",
            items: [
              { id: "home", label: "Home", content: "Home", icon: "⌂" },
              {
                id: "settings",
                label: "Settings",
                content: "Settings",
                icon: "⚙",
              },
            ],
            activeId: "home",
          },
          "Sidebar",
        ),
      );
      return;
    }
    case "toolbar": {
      target.append(
        ikaDemoElement(
          document,
          "toolbar",
          {
            items: [
              { id: "save", label: "Save", content: "Save", icon: "↓" },
              {
                id: "refresh",
                label: "Refresh",
                content: "Refresh",
                icon: "↻",
              },
            ],
          },
          "Toolbar",
        ),
      );
      return;
    }
    case "icon-button": {
      target.append(
        ikaDemoElement(
          document,
          "icon-button",
          { id: "more", label: "More", icon: "⋯", type: "button" },
          "More",
        ),
      );
      return;
    }
    case "text":
      target.append(
        element(
          document,
          "p",
          textComponent({ content: "Readable text" }).content,
        ),
      );
      return;
    case "text-field": {
      target.append(
        ikaDemoElement(
          document,
          "text-field",
          { id: "name", label: "Name", value: "ikasue" },
          "Name",
        ),
      );
      return;
    }
    case "editable-text": {
      target.append(
        ikaDemoElement(
          document,
          "editable-text",
          {
            id: "title",
            value: "Editable title",
            editor: "text",
            state: "clean",
          },
          "Editable title",
        ),
      );
      return;
    }
    case "checkbox": {
      target.append(
        ikaDemoElement(
          document,
          "checkbox",
          { id: "enabled", label: "Enabled", checked: true },
          "Enabled",
        ),
      );
      return;
    }
    case "radio-group":
    case "segmented-control": {
      target.append(
        ikaDemoElement(
          document,
          id,
          {
            options: [
              { id: "one", label: "One" },
              { id: "two", label: "Two" },
            ],
            value: "one",
            ...(id === "segmented-control" ? { variant: "elastic" } : {}),
          },
          id,
        ),
      );
      return;
    }
    case "field":
      target.append(
        ikaDemoElement(
          document,
          "field",
          {
            id: "name",
            label: "Name",
            content: "ikasue",
            editor: "text",
            state: "clean",
          },
          "Name",
        ),
      );
      return;
    case "form":
      target.append(
        ikaDemoElement(
          document,
          "form",
          {
            fields: [
              {
                id: "name",
                label: "Name",
                initialValue: "ikasue",
                editor: "text",
                state: "clean",
              },
            ],
            values: { name: "ikasue" },
            status: "clean",
          },
          "Form",
        ),
      );
      return;
    case "data-grid":
      target.append(
        ikaDemoElement(
          document,
          "data-grid",
          {
            columns: [
              { id: "name", label: "Name" },
              { id: "status", label: "Status" },
            ],
            rows: [
              {
                id: "one",
                label: "One",
                cells: {
                  name: { value: "ikasue", state: "modified" },
                  status: { value: "Ready", state: "clean" },
                },
              },
              {
                id: "two",
                label: "Two",
                cells: {
                  name: { value: "Catalog", state: "created" },
                  status: { value: "Review", state: "error" },
                },
              },
            ],
            selection: { row: "one", column: "name" },
            editable: true,
            density: "default",
          },
          "DataGrid",
        ),
      );
      return;
    case "status-indicator": {
      target.append(
        ikaDemoElement(
          document,
          "status-indicator",
          { id: "status", label: "Ready", status: "success", icon: "✓" },
          "Ready",
        ),
      );
      return;
    }
    case "alert": {
      target.append(
        ikaDemoElement(
          document,
          "alert",
          {
            message: "Attention required",
            severity: "warning",
            target: "name",
            action: "Review",
          },
          "Attention required",
        ),
      );
      return;
    }
    case "progress": {
      target.append(
        ikaDemoElement(
          document,
          "progress",
          { value: 48, max: 100, label: "Working" },
          "Working",
        ),
      );
      return;
    }
    case "dialog":
      target.append(
        ikaDemoElement(
          document,
          "dialog",
          {
            title: "Confirm",
            content: "Continue?",
            open: true,
            modal: false,
          },
          "Confirm",
        ),
      );
      return;
    case "split-view":
      target.append(
        ikaDemoElement(
          document,
          "split-view",
          {
            panes: [
              { id: "list", label: "List", content: "Items", basis: 1 },
              {
                id: "detail",
                label: "Detail",
                content: "Selection",
                basis: 2,
              },
            ],
            orientation: "horizontal",
            activePane: "detail",
            collapsible: true,
          },
          "Split view",
        ),
      );
      return;
    case "side-panel": {
      const spec: SidePanelSpec = sidePanel({
        main: "Workspace content",
        title: "Inspector",
        content: "Details",
        open: true,
      });
      target.className = "ikasue-workspace-demo";
      target.append(
        ikaDemoElement(
          document,
          "side-panel",
          {
            main: spec.main,
            title: spec.title,
            content: spec.content,
            side: spec.side,
            open: spec.open,
          },
          spec.content,
        ),
      );
      return;
    }
    case "bottom-panel": {
      const spec = bottomPanel({
        main: "Workspace content",
        title: "Output",
        content: "Logs",
        open: true,
      });
      target.className = "ikasue-workspace-demo";
      target.append(
        ikaDemoElement(
          document,
          "bottom-panel",
          {
            main: spec.main,
            title: spec.title,
            content: spec.content,
            open: spec.open,
          },
          spec.content,
        ),
      );
      return;
    }
    case "loading-region": {
      const spec: LoadingRegionSpec = loadingRegion({
        content: "Original content remains readable while work continues.",
        busy: true,
        progress: 48,
      });
      target.append(
        ikaDemoElement(
          document,
          "loading-region",
          { content: spec.content, busy: spec.busy, label: spec.label },
          spec.content,
        ),
      );
      return;
    }
    case "history-timeline": {
      const spec: HistoryTimelineSpec = historyTimeline({
        entries: [{ id: "one", label: "Created", content: "Initial state" }],
      });
      target.append(
        ikaDemoElement(
          document,
          "history-timeline",
          {
            entries: spec.entries,
            orientation: spec.orientation,
            selectedId: "one",
            compact: true,
          },
          "History",
        ),
      );
      return;
    }
  }
}

export function renderCatalogComponent(
  document: Document,
  target: HTMLElement,
  id: CatalogComponentId,
  locale: CatalogLocale,
): Cleanup | undefined {
  const entry = findRegistryEntry(id);
  const page = element(document, "article");
  page.className = "ikasue-component-page";
  page.dataset.kind = id;
  page.append(
    element(document, "h1", entry?.title[locale] ?? id),
    element(document, "p", entry?.summary[locale] ?? ""),
  );
  const demo = section(document, locale === "ja" ? "サンプル" : "Example");
  const surface = element(document, "div");
  surface.className = "ikasue-demo";
  const content = element(document, "div");
  content.className = "ikasue-layout-container";
  surface.append(content);
  const cleanup = renderComponentDemo(document, content, id);
  demo.append(surface);
  page.append(demo);
  target.append(page);
  return cleanup;
}
