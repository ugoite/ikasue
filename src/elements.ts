import "./styles.css";
import {
  IKASUE_ABI_VERSION,
  isIkaDataGridColumn,
  isIkaDataGridRow,
  isIkaDataGridSelection,
  isIkaJsonRecord,
  isIkaJsonValue,
  isIkaSplitViewPane,
  isIkaTabsItem,
  type IkaDataGridColumn,
  type IkaDataGridRow,
  type IkaDataGridSelection,
  type IkaSplitViewPane,
  type IkaTabsItem,
  type IkaJsonRecord,
  type IkaViewKind,
} from "./contract";
import { IkaSueError } from "./errors";
import {
  assertIkaRowPage,
  createDataGridPortModel,
  isIkaDataGridModelEvent,
  type IkaDataGridModel,
} from "./transport";

const runtimeGlobals = globalThis as unknown as {
  readonly HTMLElement?: typeof HTMLElement;
  readonly customElements?: CustomElementRegistry;
};
class FallbackHTMLElement {
  readonly localName = "";
}
const HTMLElementBase =
  runtimeGlobals.HTMLElement ??
  (FallbackHTMLElement as unknown as typeof HTMLElement);

export const IKA_ELEMENT_TAGS = [
  "ika-theme-root",
  "ika-text",
  "ika-rule",
  "ika-status-icon",
  "ika-vertical",
  "ika-horizontal",
  "ika-icon-action",
  "ika-action-strip",
  "ika-boolean-text",
  "ika-choice-group",
  "ika-form-list",
  "ika-data-grid",
  "ika-history-gutter",
  "ika-history-timeline",
  "ika-progress-region",
  "ika-message-region",
  "ika-bottom-dialog",
  "ika-tabs",
  "ika-split-view",
] as const;

export type IkaElementTagName = (typeof IKA_ELEMENT_TAGS)[number];

export const IKA_TAG_BY_KIND: Readonly<Record<IkaViewKind, IkaElementTagName>> =
  {
    "theme-root": "ika-theme-root",
    text: "ika-text",
    rule: "ika-rule",
    "status-icon": "ika-status-icon",
    vertical: "ika-vertical",
    horizontal: "ika-horizontal",
    "icon-action": "ika-icon-action",
    "action-strip": "ika-action-strip",
    "boolean-text": "ika-boolean-text",
    "choice-group": "ika-choice-group",
    "form-list": "ika-form-list",
    "data-grid": "ika-data-grid",
    "data-table": "ika-data-grid",
    "history-gutter": "ika-history-gutter",
    "history-timeline": "ika-history-timeline",
    "progress-region": "ika-progress-region",
    "message-region": "ika-message-region",
    "bottom-dialog": "ika-bottom-dialog",
    tabs: "ika-tabs",
    "split-view": "ika-split-view",
  };

export function tagNameForKind(kind: string): IkaElementTagName {
  const tag = (IKA_TAG_BY_KIND as Partial<Record<string, IkaElementTagName>>)[
    kind
  ];
  if (tag === undefined)
    throw new IkaSueError(
      "unknown-view-kind",
      `Unknown ikasue view kind: ${kind}`,
    );
  return tag;
}

function textValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  return "";
}

const primitiveAttributes = new Set([
  "id",
  "density",
  "editable",
  "editor",
  "state",
  "kind",
  "label",
  "axis",
  "weight",
  "action",
  "active",
  "direction",
  "selected",
  "marker",
  "loading",
  "pattern",
  "target",
  "intent",
  "dismiss",
  "orientation",
  "variant",
  "fit",
  "gap",
  "motion",
  "selection",
  "line",
  "checked",
  "compact",
  "changes",
  "items",
  "basis",
  "available",
  "value",
  "focus",
  "navigation",
]);

function asColumns(value: unknown): readonly IkaDataGridColumn[] {
  if (!Array.isArray(value) || !value.every(isIkaDataGridColumn))
    throw new Error("ikasue DataGrid columns must match the JSON contract");
  return value;
}

function asRows(value: unknown): readonly IkaDataGridRow[] {
  if (!Array.isArray(value) || !value.every(isIkaDataGridRow))
    throw new Error("ikasue DataGrid rows must match the JSON contract");
  return value;
}

function asTabsItems(value: unknown): readonly IkaTabsItem[] {
  if (!Array.isArray(value) || !value.every(isIkaTabsItem))
    throw new Error("ikasue Tabs items must match the JSON contract");
  return value;
}

function asSplitPanes(value: unknown): readonly IkaSplitViewPane[] {
  if (!Array.isArray(value) || !value.every(isIkaSplitViewPane))
    throw new Error("ikasue SplitView panes must match the JSON contract");
  return value;
}

function clearInternalContent(root: HTMLElement | ShadowRoot): void {
  root.querySelectorAll<HTMLElement>("[data-ika-internal]").forEach((node) => {
    node.remove();
  });
}

function cellText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  return JSON.stringify(value);
}

export class IkaElement extends HTMLElementBase {
  static readonly observedAttributes = [
    "aria-label",
    "class",
    "hidden",
    ...primitiveAttributes,
  ];
  #props: IkaJsonRecord = {};

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  get props(): IkaJsonRecord {
    return this.#props;
  }

  set props(value: IkaJsonRecord) {
    if (!isIkaJsonRecord(value)) {
      this.reportInvalidContract();
      return;
    }
    for (const [key, propValue] of Object.entries(value)) {
      if (!primitiveAttributes.has(key)) continue;
      if (typeof propValue === "boolean") {
        if (propValue) this.setAttribute(key, "");
        else this.removeAttribute(key);
      } else if (
        propValue !== null &&
        (typeof propValue === "string" || typeof propValue === "number")
      ) {
        this.setAttribute(key, textValue(propValue));
      }
    }
    this.#props = value;
    this.render();
  }

  protected get renderRoot(): HTMLElement | ShadowRoot {
    return this;
  }

  protected render(): void {
    const root = this.renderRoot;
    const label = root.querySelector<HTMLElement>('[part="label"]');
    if (label) {
      label.textContent = this.getAttribute("label") ?? this.localName;
      return;
    }
    if (root.childNodes.length > 0) return;
    const nextLabel = this.ownerDocument.createElement("span");
    nextLabel.part = "label";
    nextLabel.textContent = this.getAttribute("label") ?? this.localName;
    root.append(nextLabel);
  }

  protected reportInvalidContract(): void {
    this.dispatchEvent(
      new CustomEvent("ika-error", {
        bubbles: true,
        composed: true,
        detail: {
          code: "invalid-contract",
          message: "ikasue element properties must be JSON-safe records",
        },
      }),
    );
  }
}

export class IkaDataGridElement extends IkaElement {
  #columns: readonly IkaDataGridColumn[] = [];
  #rows: readonly IkaDataGridRow[] = [];
  #selection: IkaDataGridSelection | undefined;
  #model: IkaDataGridModel | undefined;
  #requestController: AbortController | undefined;
  #connectedPort: MessagePort | undefined;
  #unsubscribeModel: (() => void) | undefined;

  override get props(): IkaJsonRecord {
    return super.props;
  }

  override set props(value: IkaJsonRecord) {
    if (!isIkaJsonRecord(value)) {
      this.reportInvalidContract();
      return;
    }
    let columns = this.#columns;
    let rows = this.#rows;
    let selection = this.#selection;
    try {
      if (value.columns !== undefined) columns = asColumns(value.columns);
      if (value.rows !== undefined) rows = asRows(value.rows);
      if (value.selection === undefined) selection = undefined;
      else if (isIkaDataGridSelection(value.selection))
        selection = value.selection;
      else throw new Error("invalid selection");
    } catch {
      this.reportInvalidContract();
      return;
    }
    this.#columns = columns;
    this.#rows = rows;
    this.#selection = selection;
    super.props = value;
  }

  get columns(): readonly IkaDataGridColumn[] {
    return this.#columns;
  }

  set columns(value: readonly IkaDataGridColumn[]) {
    try {
      this.#columns = asColumns(value);
    } catch {
      this.reportInvalidContract();
      return;
    }
    this.render();
  }

  get rows(): readonly IkaDataGridRow[] {
    return this.#rows;
  }

  set rows(value: readonly IkaDataGridRow[]) {
    try {
      this.#rows = asRows(value);
    } catch {
      this.reportInvalidContract();
      return;
    }
    this.render();
  }

  get selection(): IkaDataGridSelection | undefined {
    return this.#selection;
  }

  set selection(value: IkaDataGridSelection | undefined) {
    if (value !== undefined && !isIkaDataGridSelection(value)) {
      this.reportInvalidContract();
      return;
    }
    this.#selection = value;
    this.render();
  }

  get model(): IkaDataGridModel | undefined {
    return this.#model;
  }

  set model(value: IkaDataGridModel | undefined) {
    this.#releaseModel();
    this.#model = value;
    if (value?.subscribe)
      this.#unsubscribeModel = value.subscribe((event) => {
        if (!isIkaDataGridModelEvent(event)) {
          this.reportInvalidContract();
          return;
        }
        this.dispatchEvent(
          new CustomEvent("ika-model-event", {
            bubbles: true,
            composed: true,
            detail: event,
          }),
        );
      });
    if (value) void this.loadModelRows();
  }

  connect(port: MessagePort): void {
    this.disconnect();
    this.model = createDataGridPortModel(port);
    this.#connectedPort = port;
  }

  disconnect(): void {
    this.#releaseModel();
  }

  #releaseModel(): void {
    this.#requestController?.abort();
    this.#requestController = undefined;
    this.#unsubscribeModel?.();
    this.#unsubscribeModel = undefined;
    const model = this.#model;
    const port = this.#connectedPort;
    this.#connectedPort = undefined;
    this.#model = undefined;
    model?.dispose?.();
    port?.close();
  }

  disconnectedCallback(): void {
    this.disconnect();
  }

  override focus(options?: FocusOptions): void {
    const target = this.renderRoot.querySelector<HTMLElement>(
      '[role="gridcell"], [role="row"]',
    );
    target?.focus(options);
  }

  scrollToRow(row: string): void {
    const target = Array.from(
      this.renderRoot.querySelectorAll<HTMLElement>("[data-row-id]"),
    ).find((candidate) => candidate.dataset.rowId === row);
    target?.scrollIntoView({ block: "nearest" });
  }

  startEditing(request: IkaDataGridSelection): void {
    if (!isIkaDataGridSelection(request)) {
      this.reportInvalidContract();
      return;
    }
    this.dispatchEvent(
      new CustomEvent("ika-edit-start", {
        bubbles: true,
        composed: true,
        detail: request,
      }),
    );
  }

  protected override get renderRoot(): HTMLElement | ShadowRoot {
    if (!this.shadowRoot && typeof this.attachShadow === "function")
      this.attachShadow({ mode: "open" });
    return this.shadowRoot ?? this;
  }

  protected override render(): void {
    const root = this.renderRoot;
    clearInternalContent(root);
    const table = this.ownerDocument.createElement("table");
    table.dataset.ikaInternal = "true";
    table.part = "table";
    table.setAttribute("role", "grid");
    const head = this.ownerDocument.createElement("thead");
    const headRow = this.ownerDocument.createElement("tr");
    headRow.setAttribute("role", "row");
    for (const column of this.#columns) {
      const cell = this.ownerDocument.createElement("th");
      cell.setAttribute("role", "columnheader");
      cell.textContent = column.label;
      if (column.width !== undefined)
        cell.style.width = `${String(column.width)}px`;
      headRow.append(cell);
    }
    head.append(headRow);
    const body = this.ownerDocument.createElement("tbody");
    for (const row of this.#rows) {
      const rowNode = this.ownerDocument.createElement("tr");
      rowNode.dataset.rowId = row.id;
      rowNode.setAttribute("role", "row");
      rowNode.tabIndex = 0;
      for (const column of this.#columns) {
        const cell = this.ownerDocument.createElement("td");
        cell.setAttribute("role", "gridcell");
        cell.dataset.rowId = row.id;
        cell.dataset.columnId = column.id;
        cell.textContent = cellText(row.cells[column.id]);
        cell.tabIndex = 0;
        cell.addEventListener("click", () => {
          this.selection = { row: row.id, column: column.id };
          this.dispatchEvent(
            new CustomEvent("ika-selection-change", {
              bubbles: true,
              composed: true,
              detail: this.#selection,
            }),
          );
        });
        rowNode.append(cell);
      }
      body.append(rowNode);
    }
    table.append(head, body);
    root.append(table);
    if (this.#model && this.#rows.length === 0 && !this.#requestController)
      void this.loadModelRows();
  }

  async loadModelRows(): Promise<void> {
    if (!this.#model) return;
    this.#requestController?.abort();
    const controller = new AbortController();
    this.#requestController = controller;
    try {
      const page = assertIkaRowPage(
        await this.#model.requestRows(
          { start: 0, limit: 100 },
          { signal: controller.signal },
        ),
      );
      if (controller.signal.aborted) return;
      this.#rows = page.rows;
      this.render();
    } catch (error) {
      if (controller.signal.aborted) return;
      const modelError = error as {
        readonly code?: unknown;
        readonly details?: unknown;
      };
      this.dispatchEvent(
        new CustomEvent("ika-error", {
          bubbles: true,
          composed: true,
          detail: {
            code:
              typeof modelError.code === "string"
                ? modelError.code
                : "model-error",
            message:
              error instanceof Error ? error.message : "model request failed",
            ...(isIkaJsonValue(modelError.details)
              ? { details: modelError.details }
              : {}),
          },
        }),
      );
    } finally {
      if (this.#requestController === controller)
        this.#requestController = undefined;
    }
  }
}

export class IkaTabsElement extends IkaElement {
  #items: readonly IkaTabsItem[] = [];
  #activeId: string | undefined;

  override get props(): IkaJsonRecord {
    return super.props;
  }

  override set props(value: IkaJsonRecord) {
    if (!isIkaJsonRecord(value)) {
      this.reportInvalidContract();
      return;
    }
    let items = this.#items;
    let activeId = this.#activeId;
    try {
      if (value.items !== undefined) items = asTabsItems(value.items);
      if (value.activeId !== undefined) {
        if (typeof value.activeId !== "string")
          throw new Error("invalid activeId");
        activeId = value.activeId;
      }
    } catch {
      this.reportInvalidContract();
      return;
    }
    this.#items = items;
    this.#activeId = activeId;
    super.props = value;
  }

  get items(): readonly IkaTabsItem[] {
    return this.#items;
  }

  set items(value: readonly IkaTabsItem[]) {
    try {
      this.#items = asTabsItems(value);
    } catch {
      this.reportInvalidContract();
      return;
    }
    this.render();
  }

  get activeId(): string | undefined {
    return this.#activeId;
  }

  set activeId(value: string | undefined) {
    this.#activeId = typeof value === "string" ? value : undefined;
    this.render();
  }

  select(id: string): void {
    const item = this.#items.find((candidate) => candidate.id === id);
    if (!item || item.disabled === true) return;
    this.#activeId = id;
    this.render();
    this.dispatchEvent(
      new CustomEvent("ika-active-change", {
        bubbles: true,
        composed: true,
        detail: { id },
      }),
    );
  }

  protected override render(): void {
    const root = this.renderRoot;
    clearInternalContent(root);
    const list = this.ownerDocument.createElement("div");
    list.dataset.ikaInternal = "true";
    list.setAttribute("role", "tablist");
    for (const item of this.#items) {
      const button = this.ownerDocument.createElement("button");
      button.type = "button";
      button.textContent = item.label;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(item.id === this.#activeId));
      button.disabled = item.disabled === true;
      button.addEventListener("click", () => {
        this.select(textValue(item.id));
      });
      list.append(button);
    }
    root.append(list);
  }
}

export class IkaSplitViewElement extends IkaElement {
  #panes: readonly IkaSplitViewPane[] = [];

  override get props(): IkaJsonRecord {
    return super.props;
  }

  override set props(value: IkaJsonRecord) {
    if (!isIkaJsonRecord(value)) {
      this.reportInvalidContract();
      return;
    }
    let panes = this.#panes;
    try {
      if (value.panes !== undefined) panes = asSplitPanes(value.panes);
    } catch {
      this.reportInvalidContract();
      return;
    }
    this.#panes = panes;
    super.props = value;
  }

  get panes(): readonly IkaSplitViewPane[] {
    return this.#panes;
  }

  set panes(value: readonly IkaSplitViewPane[]) {
    try {
      this.#panes = asSplitPanes(value);
    } catch {
      this.reportInvalidContract();
      return;
    }
    this.render();
  }

  protected override render(): void {
    const root = this.renderRoot;
    clearInternalContent(root);
    const container = this.ownerDocument.createElement("div");
    container.dataset.ikaInternal = "true";
    container.part = "panes";
    for (const pane of this.#panes) {
      const section = this.ownerDocument.createElement("section");
      section.dataset.paneId = textValue(pane.id);
      section.textContent = textValue(pane.label ?? pane.content ?? pane.id);
      container.append(section);
    }
    root.append(container);
  }
}

export class IkaHistoryTimelineElement extends IkaElement {
  protected override render(): void {
    const root = this.renderRoot;
    clearInternalContent(root);
    const list = this.ownerDocument.createElement("ol");
    list.dataset.ikaInternal = "true";
    list.part = "timeline";
    const entries = Array.isArray(this.props.entries) ? this.props.entries : [];
    for (const entry of entries) {
      if (!isIkaJsonRecord(entry)) continue;
      const item = this.ownerDocument.createElement("li");
      item.textContent = `${textValue(entry.label)}: ${textValue(entry.content)}`;
      list.append(item);
    }
    root.append(list);
  }
}

export type IkaSueRegistry = Readonly<{
  version: typeof IKASUE_ABI_VERSION;
  registry: CustomElementRegistry;
  tags: readonly IkaElementTagName[];
}>;

const classForTag = (tag: IkaElementTagName): CustomElementConstructor => {
  if (tag === "ika-data-grid") return IkaDataGridElement;
  if (tag === "ika-tabs") return IkaTabsElement;
  if (tag === "ika-split-view") return IkaSplitViewElement;
  if (tag === "ika-history-timeline") return IkaHistoryTimelineElement;
  return class extends IkaElement {};
};

const constructors = new Map<IkaElementTagName, CustomElementConstructor>();
for (const tag of IKA_ELEMENT_TAGS) constructors.set(tag, classForTag(tag));

export function defineIkaSue(
  registry: CustomElementRegistry | undefined = runtimeGlobals.customElements,
): IkaSueRegistry {
  if (!registry)
    throw new IkaSueError(
      "registry-unavailable",
      "CustomElementRegistry is unavailable",
    );
  for (const tag of IKA_ELEMENT_TAGS) {
    const constructor = constructors.get(tag);
    if (!constructor) continue;
    const existing = registry.get(tag);
    if (existing && existing !== constructor)
      throw new IkaSueError(
        "registry-conflict",
        `Custom element ${tag} is already registered`,
      );
    if (!existing) registry.define(tag, constructor);
  }
  return { version: IKASUE_ABI_VERSION, registry, tags: IKA_ELEMENT_TAGS };
}

declare global {
  interface HTMLElementTagNameMap {
    "ika-data-grid": IkaDataGridElement;
    "ika-tabs": IkaTabsElement;
    "ika-split-view": IkaSplitViewElement;
    "ika-history-timeline": IkaHistoryTimelineElement;
  }
}
