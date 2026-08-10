import "./styles.css";
import {
  IKASUE_ABI_VERSION,
  isIkaDataGridColumn,
  isIkaDataGridRow,
  isIkaDataGridSelection,
  isIkaJsonRecord,
  isIkaJsonValue,
  isIkaRowRequest,
  isIkaSplitViewPane,
  isIkaTabsItem,
  type IkaDataGridColumn,
  type IkaDataGridRow,
  type IkaDataGridSelection,
  type IkaRowRequest,
  type IkaSplitViewPane,
  type IkaTabsItem,
  type IkaJsonRecord,
  type IkaJsonValue,
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
  "ika-editable-text",
  "ika-text-field",
  "ika-flex",
  "ika-stack",
  "ika-grid",
  "ika-scroll-area",
  "ika-separator",
  "ika-sidebar",
  "ika-toolbar",
  "ika-icon-button",
  "ika-checkbox",
  "ika-radio-group",
  "ika-segmented-control",
  "ika-field",
  "ika-form",
  "ika-data-grid",
  "ika-history-timeline",
  "ika-tabs",
  "ika-split-view",
  "ika-side-panel",
  "ika-bottom-panel",
  "ika-loading-region",
  "ika-dialog",
  "ika-status-indicator",
  "ika-alert",
  "ika-progress",
] as const;

export type IkaElementTagName = (typeof IKA_ELEMENT_TAGS)[number];

export const IKA_TAG_BY_KIND: Readonly<Record<IkaViewKind, IkaElementTagName>> =
  {
    "theme-root": "ika-theme-root",
    text: "ika-text",
    "editable-text": "ika-editable-text",
    "text-field": "ika-text-field",
    flex: "ika-flex",
    stack: "ika-stack",
    grid: "ika-grid",
    "scroll-area": "ika-scroll-area",
    separator: "ika-separator",
    sidebar: "ika-sidebar",
    toolbar: "ika-toolbar",
    "icon-button": "ika-icon-button",
    checkbox: "ika-checkbox",
    "radio-group": "ika-radio-group",
    "segmented-control": "ika-segmented-control",
    field: "ika-field",
    form: "ika-form",
    "data-grid": "ika-data-grid",
    "history-timeline": "ika-history-timeline",
    tabs: "ika-tabs",
    "split-view": "ika-split-view",
    "side-panel": "ika-side-panel",
    "bottom-panel": "ika-bottom-panel",
    "loading-region": "ika-loading-region",
    dialog: "ika-dialog",
    "status-indicator": "ika-status-indicator",
    alert: "ika-alert",
    progress: "ika-progress",
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

const propertyKeysByTag: Readonly<
  Record<IkaElementTagName, ReadonlySet<string>>
> = Object.freeze({
  "ika-theme-root": new Set(["tokens", "variant"]),
  "ika-text": new Set(["content", "tone", "selectable"]),
  "ika-editable-text": new Set(["id", "value", "disabled"]),
  "ika-text-field": new Set([
    "id",
    "label",
    "value",
    "placeholder",
    "disabled",
    "required",
    "description",
    "error",
  ]),
  "ika-flex": new Set([
    "direction",
    "wrap",
    "gap",
    "align",
    "justify",
    "children",
  ]),
  "ika-stack": new Set(["gap", "align", "justify", "children"]),
  "ika-grid": new Set([
    "columns",
    "rows",
    "gap",
    "align",
    "justify",
    "children",
  ]),
  "ika-scroll-area": new Set(["content", "axis", "overscroll"]),
  "ika-separator": new Set(["orientation", "role"]),
  "ika-sidebar": new Set(["items", "activeId", "collapsed"]),
  "ika-toolbar": new Set(["items", "overflow"]),
  "ika-icon-button": new Set([
    "id",
    "label",
    "icon",
    "type",
    "disabled",
    "pressed",
  ]),
  "ika-checkbox": new Set(["id", "label", "checked", "disabled"]),
  "ika-radio-group": new Set(["id", "options", "value", "disabled"]),
  "ika-segmented-control": new Set([
    "id",
    "options",
    "value",
    "disabled",
    "variant",
  ]),
  "ika-field": new Set(["id", "label", "required", "content"]),
  "ika-form": new Set(["fields", "values", "status"]),
  "ika-data-grid": new Set([
    "columns",
    "rows",
    "selection",
    "editable",
    "density",
  ]),
  "ika-history-timeline": new Set(["entries", "orientation"]),
  "ika-tabs": new Set(["items", "activeId", "variant", "orientation"]),
  "ika-split-view": new Set([
    "panes",
    "orientation",
    "sizes",
    "collapsible",
    "motionOrigin",
  ]),
  "ika-side-panel": new Set(["title", "content", "side", "open"]),
  "ika-bottom-panel": new Set(["title", "content", "open"]),
  "ika-loading-region": new Set(["content", "busy", "label"]),
  "ika-dialog": new Set(["title", "content", "open", "modal"]),
  "ika-status-indicator": new Set(["label", "status"]),
  "ika-alert": new Set(["message", "severity", "dismissible"]),
  "ika-progress": new Set(["value", "max", "label"]),
});

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

function propertyText(value: IkaJsonRecord, key: string): string {
  return textValue(value[key]);
}

function propertyBoolean(value: IkaJsonRecord, key: string): boolean {
  return value[key] === true;
}

function appendInternal(
  root: HTMLElement | ShadowRoot,
  tag: string,
  configure?: (element: HTMLElement) => void,
): HTMLElement {
  const element = root.ownerDocument.createElement(tag);
  element.dataset.ikaInternal = "true";
  configure?.(element);
  root.append(element);
  return element;
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
    const allowed = propertyKeysByTag[this.localName as IkaElementTagName];
    if (Object.keys(value).some((key) => !allowed.has(key))) {
      this.reportInvalidContract();
      return;
    }
    for (const attribute of primitiveAttributes) {
      const propValue = value[attribute];
      if (typeof propValue === "boolean") {
        if (propValue) this.setAttribute(attribute, "");
        else this.removeAttribute(attribute);
      } else if (
        propValue !== null &&
        (typeof propValue === "string" || typeof propValue === "number")
      ) {
        this.setAttribute(attribute, textValue(propValue));
      } else if (this.hasAttribute(attribute)) {
        this.removeAttribute(attribute);
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
    this.dataset.ikaKind = this.localName.replace(/^ika-/, "");
    const kind = this.localName;
    const value = this.effectiveProps;
    if (
      kind === "ika-theme-root" ||
      kind === "ika-flex" ||
      kind === "ika-stack" ||
      kind === "ika-grid" ||
      kind === "ika-scroll-area"
    ) {
      this.setAttribute("data-ika-layout", "");
      if (kind === "ika-stack") this.style.flexDirection = "column";
      else if (kind === "ika-flex")
        this.style.flexDirection = propertyText(value, "direction") || "row";
      if (kind === "ika-flex" || kind === "ika-stack") {
        this.style.gap = propertyText(value, "gap") || "0";
        this.style.alignItems = propertyText(value, "align") || "stretch";
        this.style.justifyContent = propertyText(value, "justify") || "start";
        this.style.flexWrap = propertyText(value, "wrap") || "nowrap";
      }
      if (kind === "ika-grid") {
        this.style.gridTemplateColumns =
          propertyText(value, "columns") || "none";
        this.style.gridTemplateRows = propertyText(value, "rows") || "none";
        this.style.gap = propertyText(value, "gap") || "0";
        this.style.alignItems = propertyText(value, "align") || "stretch";
        this.style.justifyItems = propertyText(value, "justify") || "start";
      }
      return;
    }
    if (
      root.childNodes.length > 0 &&
      !root.querySelector("[data-ika-internal]")
    )
      return;
    clearInternalContent(root);
    const label =
      propertyText(value, "label") || this.getAttribute("label") || kind;
    switch (kind) {
      case "ika-text":
        appendInternal(root, "span", (element) => {
          element.part = "label";
          element.textContent = propertyText(value, "content") || label;
        });
        break;
      case "ika-editable-text":
        appendInternal(root, "textarea", (element) => {
          const input = element as HTMLTextAreaElement;
          input.part = "input";
          input.value = propertyText(value, "value");
          input.disabled = propertyBoolean(value, "disabled");
          input.addEventListener("change", () =>
            this.dispatchEvent(
              new CustomEvent("ika-commit", {
                bubbles: true,
                composed: true,
                detail: { value: input.value },
              }),
            ),
          );
        });
        break;
      case "ika-text-field":
        appendInternal(root, "label", (element) => {
          element.textContent = label;
          const input = this.ownerDocument.createElement("input");
          input.part = "input";
          input.id = propertyText(value, "id");
          input.value = propertyText(value, "value");
          input.placeholder = propertyText(value, "placeholder");
          input.disabled = propertyBoolean(value, "disabled");
          input.required = propertyBoolean(value, "required");
          input.addEventListener("input", () =>
            this.dispatchEvent(
              new CustomEvent("ika-input", {
                bubbles: true,
                composed: true,
                detail: { value: input.value },
              }),
            ),
          );
          element.append(input);
        });
        break;
      case "ika-separator":
        appendInternal(root, "hr", (element) => {
          element.part = "separator";
          element.setAttribute("role", "separator");
          element.setAttribute(
            "aria-orientation",
            propertyText(value, "orientation") || "horizontal",
          );
        });
        break;
      case "ika-icon-button":
        appendInternal(root, "button", (element) => {
          const button = element as HTMLButtonElement;
          button.type = (propertyText(value, "type") || "button") as
            "button" | "submit" | "reset";
          button.part = "button";
          button.disabled = propertyBoolean(value, "disabled");
          button.textContent = propertyText(value, "icon") || label;
          button.addEventListener("click", () =>
            this.dispatchEvent(
              new CustomEvent("ika-action", {
                bubbles: true,
                composed: true,
                detail: { id: propertyText(value, "id") },
              }),
            ),
          );
        });
        break;
      case "ika-checkbox":
        appendInternal(root, "label", (element) => {
          const input = this.ownerDocument.createElement("input");
          input.type = "checkbox";
          input.checked = propertyBoolean(value, "checked");
          input.disabled = propertyBoolean(value, "disabled");
          input.addEventListener("change", () =>
            this.dispatchEvent(
              new CustomEvent("ika-change", {
                bubbles: true,
                composed: true,
                detail: { checked: input.checked },
              }),
            ),
          );
          element.append(input, this.ownerDocument.createTextNode(` ${label}`));
        });
        break;
      case "ika-status-indicator":
        appendInternal(root, "output", (element) => {
          element.part = "status";
          element.dataset.status = propertyText(value, "status") || "neutral";
          element.textContent = label;
        });
        break;
      case "ika-alert":
        appendInternal(root, "aside", (element) => {
          element.setAttribute("role", "alert");
          element.part = "alert";
          element.textContent = propertyText(value, "message") || label;
        });
        break;
      case "ika-progress":
        appendInternal(root, "progress", (element) => {
          const progress = element as HTMLProgressElement;
          progress.part = "progress";
          const max = Number(value.max);
          const current = Number(value.value);
          progress.max = Number.isFinite(max) && max > 0 ? max : 100;
          progress.value = Number.isFinite(current) ? Math.max(0, current) : 0;
          progress.setAttribute("aria-label", label);
        });
        break;
      case "ika-dialog":
        appendInternal(root, "dialog", (element) => {
          const dialog = element as HTMLDialogElement;
          dialog.part = "dialog";
          dialog.open = propertyBoolean(value, "open");
          dialog.textContent =
            propertyText(value, "title") ||
            propertyText(value, "content") ||
            label;
        });
        break;
      case "ika-side-panel":
      case "ika-bottom-panel":
        appendInternal(root, "aside", (element) => {
          element.hidden = !propertyBoolean(value, "open");
          element.part = "panel";
          element.textContent =
            propertyText(value, "title") ||
            propertyText(value, "content") ||
            label;
        });
        break;
      case "ika-loading-region":
        appendInternal(root, "div", (element) => {
          element.setAttribute(
            "aria-busy",
            String(propertyBoolean(value, "busy")),
          );
          element.part = "loading";
          element.textContent = propertyText(value, "content") || label;
        });
        break;
      case "ika-sidebar":
      case "ika-toolbar":
        appendInternal(
          root,
          kind === "ika-sidebar" ? "nav" : "div",
          (element) => {
            element.setAttribute(
              "role",
              kind === "ika-sidebar" ? "navigation" : "toolbar",
            );
            const items = Array.isArray(value.items) ? value.items : [];
            for (const item of items) {
              if (!isIkaJsonRecord(item) || typeof item.id !== "string")
                continue;
              const button = this.ownerDocument.createElement("button");
              button.type = "button";
              button.textContent = textValue(item.label) || item.id;
              button.disabled = item.disabled === true;
              button.addEventListener("click", () =>
                this.dispatchEvent(
                  new CustomEvent("ika-select", {
                    bubbles: true,
                    composed: true,
                    detail: { id: item.id },
                  }),
                ),
              );
              element.append(button);
            }
          },
        );
        break;
      case "ika-radio-group":
      case "ika-segmented-control":
        appendInternal(root, "fieldset", (element) => {
          const options = Array.isArray(value.options) ? value.options : [];
          for (const option of options) {
            if (!isIkaJsonRecord(option) || typeof option.id !== "string")
              continue;
            const button = this.ownerDocument.createElement("button");
            button.type = "button";
            button.textContent = textValue(option.label) || option.id;
            button.disabled =
              propertyBoolean(value, "disabled") || option.disabled === true;
            button.setAttribute(
              "aria-pressed",
              String(option.id === value.value),
            );
            button.addEventListener("click", () =>
              this.dispatchEvent(
                new CustomEvent("ika-change", {
                  bubbles: true,
                  composed: true,
                  detail: { value: option.id },
                }),
              ),
            );
            element.append(button);
          }
        });
        break;
      case "ika-field":
        appendInternal(root, "fieldset", (element) => {
          const legend = this.ownerDocument.createElement("legend");
          legend.textContent = label;
          const content = this.ownerDocument.createElement("div");
          content.textContent = propertyText(value, "content");
          element.append(legend, content);
        });
        break;
      case "ika-form":
        appendInternal(root, "form", (element) => {
          element.setAttribute("novalidate", "");
          element.append(...Array.from(this.childNodes));
        });
        break;
      default:
        appendInternal(root, "div", (element) => {
          element.part = "surface";
          element.setAttribute("role", kind === "ika-form" ? "form" : "group");
          element.textContent =
            propertyText(value, "content") ||
            propertyText(value, "message") ||
            label;
        });
    }
  }

  protected propertyValue(key: string): IkaJsonValue | undefined {
    return this.#props[key];
  }

  protected get effectiveProps(): IkaJsonRecord {
    const value: Record<string, IkaJsonValue> = { ...this.#props };
    for (const attribute of primitiveAttributes) {
      if (!this.hasAttribute(attribute)) continue;
      const booleanAttribute = new Set([
        "editable",
        "disabled",
        "required",
        "checked",
        "open",
        "busy",
        "pressed",
        "selectable",
        "collapsible",
        "dismissible",
      ]).has(attribute);
      value[attribute] = booleanAttribute
        ? true
        : (this.getAttribute(attribute) ?? "");
    }
    return value;
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
  #rowRequest: IkaRowRequest = { start: 0, limit: 100 };
  #total: number | undefined;

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

  get rowRequest(): IkaRowRequest {
    return this.#rowRequest;
  }

  get total(): number | undefined {
    return this.#total;
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

  /** Requests a specific data window from the configured model. */
  async loadRows(request: IkaRowRequest): Promise<void> {
    if (!isIkaRowRequest(request)) {
      this.reportInvalidContract();
      return;
    }
    this.#rowRequest = request;
    await this.loadModelRows(request);
  }

  /** Sends a portable update command through a model when one is connected. */
  async update(mutation: IkaJsonRecord): Promise<IkaJsonRecord | undefined> {
    if (!this.#model?.update) return undefined;
    if (!isIkaJsonRecord(mutation)) {
      this.reportInvalidContract();
      return undefined;
    }
    try {
      const result = await this.#model.update(mutation, {
        signal: new AbortController().signal,
      });
      if (!isIkaJsonRecord(result)) {
        this.dispatchModelError(
          new Error("ikasue model returned an invalid update"),
        );
        return undefined;
      }
      this.dispatchEvent(
        new CustomEvent("ika-update", {
          bubbles: true,
          composed: true,
          detail: result,
        }),
      );
      return result;
    } catch (error) {
      this.dispatchModelError(error);
      return undefined;
    }
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
    const value = this.effectiveProps;
    clearInternalContent(root);
    this.dataset.editable = String(value.editable === true);
    this.dataset.density = propertyText(value, "density") || "default";
    const table = this.ownerDocument.createElement("table");
    table.dataset.ikaInternal = "true";
    table.part = "table";
    table.setAttribute("role", "grid");
    table.setAttribute("aria-readonly", String(value.editable !== true));
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
      void this.loadModelRows(this.#rowRequest);
  }

  async loadModelRows(
    request: IkaRowRequest = this.#rowRequest,
  ): Promise<void> {
    if (!this.#model) return;
    this.#requestController?.abort();
    const controller = new AbortController();
    this.#requestController = controller;
    try {
      const page = assertIkaRowPage(
        await this.#model.requestRows(request, { signal: controller.signal }),
      );
      if (controller.signal.aborted) return;
      this.#rows = page.rows;
      this.#total = page.total;
      this.render();
    } catch (error) {
      if (controller.signal.aborted) return;
      this.dispatchModelError(error);
    } finally {
      if (this.#requestController === controller)
        this.#requestController = undefined;
    }
  }

  private dispatchModelError(error: unknown): void {
    const modelError =
      typeof error === "object" && error !== null
        ? (error as { readonly code?: unknown; readonly details?: unknown })
        : {};
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
    const value = this.effectiveProps;
    clearInternalContent(root);
    this.dataset.orientation =
      propertyText(value, "orientation") || "horizontal";
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
    const value = this.effectiveProps;
    clearInternalContent(root);
    const orientation = propertyText(value, "orientation") || "horizontal";
    this.dataset.orientation = orientation;
    const sizes = Array.isArray(value.sizes)
      ? value.sizes.filter((item): item is string => typeof item === "string")
      : [];
    const container = this.ownerDocument.createElement("div");
    container.dataset.ikaInternal = "true";
    container.part = "panes";
    for (const [index, pane] of this.#panes.entries()) {
      const section = this.ownerDocument.createElement("section");
      section.dataset.paneId = textValue(pane.id);
      if (sizes[index] !== undefined) section.style.flexBasis = sizes[index];
      section.textContent = textValue(pane.label ?? pane.content ?? pane.id);
      container.append(section);
    }
    root.append(container);
  }
}

export class IkaHistoryTimelineElement extends IkaElement {
  protected override render(): void {
    const root = this.renderRoot;
    const value = this.effectiveProps;
    clearInternalContent(root);
    const list = this.ownerDocument.createElement("ol");
    list.dataset.ikaInternal = "true";
    list.part = "timeline";
    const entries = Array.isArray(value.entries) ? value.entries : [];
    this.dataset.orientation = propertyText(value, "orientation") || "vertical";
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
