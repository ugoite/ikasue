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
  isIkaView,
  isIkaViewProps,
  type IkaDataGridColumn,
  type IkaDataGridRow,
  type IkaDataGridSelection,
  type IkaRowRequest,
  type IkaSplitViewPane,
  type IkaTabsItem,
  type IkaJsonRecord,
  type IkaJsonValue,
  type IkaView,
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
  "disabled",
  "required",
  "label",
  "content",
  "title",
  "main",
  "message",
  "editor",
  "state",
  "compact",
  "selectedId",
  "activePane",
  "placeholder",
  "axis",
  "direction",
  "orientation",
  "variant",
  "fit",
  "gap",
  "wrap",
  "align",
  "justify",
  "tone",
  "selectable",
  "overscroll",
  "role",
  "overflow",
  "type",
  "pressed",
  "checked",
  "collapsed",
  "open",
  "modal",
  "collapsible",
  "busy",
  "status",
  "severity",
  "dismissible",
  "side",
  "target",
  "targetId",
  "action",
  "value",
  "max",
]);

const booleanAttributes = new Set([
  "editable",
  "disabled",
  "required",
  "selectable",
  "pressed",
  "checked",
  "collapsed",
  "open",
  "modal",
  "collapsible",
  "busy",
  "dismissible",
  "compact",
]);

const registryForElement = new WeakMap<HTMLElement, CustomElementRegistry>();
const serializedChildrenForElement = new WeakMap<
  HTMLElement,
  readonly IkaView[]
>();
const nextSplitViewInstanceId = (): number => {
  const scope = globalThis as typeof globalThis & {
    __ikasue_split_view_instance_id__?: number;
  };
  const next = (scope.__ikasue_split_view_instance_id__ ?? 0) + 1;
  scope.__ikasue_split_view_instance_id__ = next;
  return next;
};
const nextTabsInstanceId = (): number => {
  const scope = globalThis as typeof globalThis & {
    __ikasue_tabs_instance_id__?: number;
  };
  const next = (scope.__ikasue_tabs_instance_id__ ?? 0) + 1;
  scope.__ikasue_tabs_instance_id__ = next;
  return next;
};

const editableEditing = new WeakSet<HTMLElement>();
const editableDrafts = new WeakMap<HTMLElement, string>();
const editableValues = new WeakMap<HTMLElement, string>();
const editableStates = new WeakMap<HTMLElement, string>();

const propertyKeysByTag: Readonly<
  Record<IkaElementTagName, ReadonlySet<string>>
> = Object.freeze({
  "ika-theme-root": new Set(["tokens", "variant"]),
  "ika-text": new Set(["content", "tone", "selectable"]),
  "ika-editable-text": new Set(["id", "value", "editor", "state", "disabled"]),
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
  "ika-field": new Set([
    "id",
    "label",
    "required",
    "content",
    "editor",
    "state",
  ]),
  "ika-form": new Set(["fields", "values", "status"]),
  "ika-data-grid": new Set([
    "columns",
    "rows",
    "selection",
    "editing",
    "editable",
    "density",
  ]),
  "ika-history-timeline": new Set([
    "entries",
    "orientation",
    "selectedId",
    "compact",
  ]),
  "ika-tabs": new Set(["items", "activeId", "variant", "orientation"]),
  "ika-split-view": new Set([
    "panes",
    "orientation",
    "activePane",
    "sizes",
    "collapsible",
    "motionOrigin",
  ]),
  "ika-side-panel": new Set(["main", "title", "content", "side", "open"]),
  "ika-bottom-panel": new Set(["main", "title", "content", "open"]),
  "ika-loading-region": new Set(["content", "busy", "label"]),
  "ika-dialog": new Set(["title", "content", "open", "modal"]),
  "ika-status-indicator": new Set([
    "id",
    "label",
    "status",
    "icon",
    "targetId",
  ]),
  "ika-alert": new Set([
    "message",
    "severity",
    "dismissible",
    "target",
    "action",
  ]),
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
  const ids = new Set<string>();
  for (const item of value) {
    if (ids.has(item.id))
      throw new Error("ikasue Tabs item IDs must be unique");
    ids.add(item.id);
  }
  return value;
}

function asSplitPanes(value: unknown): readonly IkaSplitViewPane[] {
  if (!Array.isArray(value) || !value.every(isIkaSplitViewPane))
    throw new Error("ikasue SplitView panes must match the JSON contract");
  return value;
}

function isPrimitive(value: IkaJsonValue): boolean {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

/** Lowers a view node to the canonical element tree, including structured children. */
export function appendIkaView(
  parent: HTMLElement,
  view: IkaView,
  registry?: CustomElementRegistry,
): HTMLElement {
  if (!isIkaView(view))
    throw new IkaSueError(
      "invalid-contract",
      "IkaView must match the kind-specific JSON contract",
    );
  const activeRegistry =
    registry ?? parent.ownerDocument.defaultView?.customElements;
  if (!activeRegistry)
    throw new IkaSueError(
      "registry-unavailable",
      "CustomElementRegistry is unavailable",
    );
  defineIkaSue(activeRegistry);
  const node = parent.ownerDocument.createElement(tagNameForKind(view.kind), {
    customElementRegistry: activeRegistry,
  });
  registryForElement.set(node, activeRegistry);
  if (!Array.isArray(view.props?.children) && view.children !== undefined)
    serializedChildrenForElement.set(node, view.children);
  node.setAttribute("data-ika-structured", "");
  for (const [key, value] of Object.entries(view.props ?? {})) {
    if (!isPrimitive(value)) continue;
    if (typeof value === "boolean") {
      if (value) node.setAttribute(key, "");
    } else if (value !== null) node.setAttribute(key, textValue(value));
  }
  if (view.props || view.kind === "form" || view.text !== undefined)
    (node as HTMLElement & { props: IkaJsonRecord }).props =
      view.text === undefined
        ? (view.props ?? {})
        : { ...(view.props ?? {}), content: view.text };
  if (
    !Array.isArray(view.props?.children) &&
    view.children !== undefined &&
    !hasStructuredChild(serializedChildrenParent(node))
  ) {
    const childParent = serializedChildrenParent(node);
    for (const child of view.children)
      appendIkaView(childParent, child, activeRegistry);
  }
  parent.append(node);
  return node;
}

function clearInternalContent(root: HTMLElement | ShadowRoot): void {
  root.querySelectorAll<HTMLElement>("[data-ika-internal]").forEach((node) => {
    if (node.parentNode === root) node.remove();
  });
}

function clearStructuredChildren(root: HTMLElement | ShadowRoot): void {
  root
    .querySelectorAll<HTMLElement>("[data-ika-structured]")
    .forEach((node) => {
      if (node.parentNode === root) node.remove();
    });
}

function hasStructuredChild(root: HTMLElement): boolean {
  const querySelector = (
    root as unknown as {
      readonly querySelector?: (selector: string) => unknown;
    }
  ).querySelector;
  return (
    typeof querySelector === "function" &&
    querySelector.call(root, ":scope > [data-ika-structured]") !== null
  );
}

function hasDirectInternalChild(root: HTMLElement | ShadowRoot): boolean {
  return Array.from(
    root.querySelectorAll<HTMLElement>("[data-ika-internal]"),
  ).some((node) => node.parentNode === root);
}

function serializedChildrenParent(root: HTMLElement): HTMLElement {
  if (root.localName !== "ika-form") return root;
  const querySelector = (
    root as unknown as {
      readonly querySelector?: (selector: string) => unknown;
    }
  ).querySelector;
  if (typeof querySelector !== "function") return root;
  return (
    (querySelector.call(
      root,
      'form[data-ika-internal="true"]',
    ) as HTMLElement | null) ?? root
  );
}

function preserveFormChildren(root: HTMLElement): void {
  const form = Array.from(
    root.querySelectorAll<HTMLElement>('form[data-ika-internal="true"]'),
  ).find((node) => node.parentNode === root);
  if (!form) return;
  for (const child of Array.from(form.children)) {
    if (child.hasAttribute("data-ika-structured")) child.remove();
    else if (!child.hasAttribute("data-ika-internal")) root.append(child);
  }
}

function propertyText(value: IkaJsonRecord, key: string): string {
  return textValue(value[key]);
}

function propertyBoolean(value: IkaJsonRecord, key: string): boolean {
  return value[key] === true;
}

function applySplitSize(
  section: HTMLElement,
  size: string,
  active = false,
): void {
  const value = size.trim();
  const fractional = /^(\d+(?:\.\d+)?)fr$/.exec(value);
  if (fractional) {
    const base = Number(fractional[1] ?? "1");
    section.style.flexGrow = String(active ? base * 1.55 : base);
    section.style.flexShrink = "1";
    section.style.flexBasis = "0";
    return;
  }
  if (value === "auto") {
    section.style.flex = "1 1 auto";
    return;
  }
  section.style.flexGrow = "0";
  section.style.flexShrink = "1";
  section.style.flexBasis = value;
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

function gridCellValue(value: unknown): string {
  if (isIkaJsonRecord(value) && typeof value.value === "string")
    return value.value;
  return cellText(value);
}

function gridCellState(value: unknown): string {
  if (!isIkaJsonRecord(value)) return "clean";
  return typeof value.state === "string" ? value.state : "clean";
}

export class IkaElement extends HTMLElementBase {
  static readonly observedAttributes = [
    "aria-label",
    "class",
    "hidden",
    ...primitiveAttributes,
  ];
  #props: IkaJsonRecord = {};
  #themeTokenKeys = new Set<string>();
  #reflectingAttributes = false;

  connectedCallback(): void {
    if (this.localName === "ika-form" && this.getAttribute("role") !== "form") {
      this.#reflectingAttributes = true;
      try {
        this.setAttribute("role", "form");
      } finally {
        this.#reflectingAttributes = false;
      }
    }
    this.render();
    this.appendSerializedChildren();
  }

  attributeChangedCallback(): void {
    if (this.isConnected && !this.#reflectingAttributes) {
      this.render();
      this.appendSerializedChildren();
    }
  }

  get props(): IkaJsonRecord {
    return this.#props;
  }

  set props(value: IkaJsonRecord) {
    if (!isIkaViewProps(this.localName, value)) {
      this.reportInvalidContract();
      return;
    }
    const allowed = propertyKeysByTag[this.localName as IkaElementTagName];
    if (Object.keys(value).some((key) => !allowed.has(key))) {
      this.reportInvalidContract();
      return;
    }
    if (Array.isArray(value.children))
      serializedChildrenForElement.delete(this);
    this.#props = value;
    this.#reflectingAttributes = true;
    try {
      for (const attribute of primitiveAttributes) {
        if (this.localName === "ika-form" && attribute === "role") continue;
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
    } finally {
      this.#reflectingAttributes = false;
    }
    this.render();
    this.appendSerializedChildren();
  }

  private appendSerializedChildren(): void {
    const children = serializedChildrenForElement.get(this);
    if (!children) return;
    const parent = serializedChildrenParent(this);
    clearStructuredChildren(parent);
    const registry =
      registryForElement.get(this) ??
      this.ownerDocument.defaultView?.customElements;
    for (const child of children) appendIkaView(parent, child, registry);
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
      if (kind === "ika-theme-root") {
        for (const key of this.#themeTokenKeys) this.style.removeProperty(key);
        this.#themeTokenKeys.clear();
        if (isIkaJsonRecord(value.tokens)) {
          for (const [key, token] of Object.entries(value.tokens)) {
            if (typeof token !== "string") continue;
            const cssProperty = key.startsWith("--") ? key : `--${key}`;
            this.style.setProperty(cssProperty, token);
            this.#themeTokenKeys.add(cssProperty);
          }
        }
        this.dataset.variant = propertyText(value, "variant") || "default";
      }
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
      clearStructuredChildren(root);
      if (kind === "ika-scroll-area") {
        const axis = propertyText(value, "axis") || "y";
        this.dataset.axis = axis;
        this.style.overflowX = axis === "y" ? "hidden" : "auto";
        this.style.overflowY = axis === "x" ? "hidden" : "auto";
        this.style.overscrollBehavior =
          propertyText(value, "overscroll") || "auto";
        if (
          !Array.isArray(value.children) &&
          !serializedChildrenForElement.has(this)
        ) {
          clearInternalContent(root);
          if (propertyText(value, "content"))
            appendInternal(root, "div", (element) => {
              element.part = "content";
              element.textContent = propertyText(value, "content");
            });
        }
      }
      if (Array.isArray(value.children)) {
        const registry =
          registryForElement.get(this) ??
          this.ownerDocument.defaultView?.customElements;
        for (const child of value.children) {
          if (isIkaView(child)) appendIkaView(this, child, registry);
        }
      }
      return;
    }
    if (kind !== "ika-form" && serializedChildrenForElement.has(this)) {
      clearInternalContent(root);
      return;
    }
    if (
      kind !== "ika-form" &&
      root.childNodes.length > 0 &&
      !hasDirectInternalChild(root)
    )
      return;
    clearInternalContent(root);
    const label =
      propertyText(value, "label") || this.getAttribute("label") || kind;
    switch (kind) {
      case "ika-text":
        this.dataset.tone = propertyText(value, "tone") || "default";
        this.dataset.selectable = String(value.selectable !== false);
        appendInternal(root, "span", (element) => {
          element.part = "label";
          element.textContent = propertyText(value, "content") || label;
        });
        break;
      case "ika-editable-text":
        this.renderEditableText(root, value);
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
          const description = propertyText(value, "description");
          const error = propertyText(value, "error");
          if (description) input.setAttribute("aria-description", description);
          input.setAttribute("aria-invalid", String(Boolean(error)));
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
        this.dataset.orientation =
          propertyText(value, "orientation") || "horizontal";
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
          button.setAttribute("aria-pressed", String(value.pressed === true));
          button.setAttribute("aria-label", label);
          button.title = label;
          const icon = this.ownerDocument.createElement("span");
          icon.part = "icon";
          icon.setAttribute("aria-hidden", "true");
          icon.textContent = propertyText(value, "icon") || "i";
          button.append(icon);
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
          input.id = propertyText(value, "id");
          input.checked = propertyBoolean(value, "checked");
          input.disabled = propertyBoolean(value, "disabled");
          element.dataset.checked = String(input.checked);
          const check = this.ownerDocument.createElement("span");
          check.part = "check";
          check.setAttribute("aria-hidden", "true");
          check.textContent = input.checked ? "✓" : "";
          const copy = this.ownerDocument.createElement("span");
          copy.part = "label";
          copy.textContent = label;
          input.addEventListener("change", () => {
            element.dataset.checked = String(input.checked);
            check.textContent = input.checked ? "✓" : "";
            this.dispatchEvent(
              new CustomEvent("ika-change", {
                bubbles: true,
                composed: true,
                detail: { checked: input.checked },
              }),
            );
          });
          element.append(input, check, copy);
        });
        break;
      case "ika-status-indicator":
        appendInternal(root, "output", (element) => {
          element.part = "status";
          element.dataset.status = propertyText(value, "status") || "neutral";
          element.setAttribute("role", "status");
          const icon = this.ownerDocument.createElement("span");
          icon.part = "icon";
          icon.setAttribute("aria-hidden", "true");
          icon.textContent = propertyText(value, "icon") || "⋯";
          const copy = this.ownerDocument.createElement("span");
          copy.part = "label";
          copy.textContent = label;
          element.setAttribute("aria-label", label);
          const targetId = propertyText(value, "targetId");
          if (targetId) {
            element.tabIndex = 0;
            element.addEventListener("click", () =>
              this.ownerDocument.getElementById(targetId)?.focus(),
            );
          }
          element.append(icon, copy);
        });
        break;
      case "ika-alert":
        appendInternal(root, "aside", (element) => {
          element.setAttribute("role", "alert");
          element.part = "alert";
          const severity = propertyText(value, "severity") || "info";
          element.dataset.severity = severity;
          const icon = this.ownerDocument.createElement("span");
          icon.part = "icon";
          icon.setAttribute("aria-hidden", "true");
          icon.textContent =
            severity === "danger"
              ? "!"
              : severity === "warning"
                ? "▲"
                : severity === "success"
                  ? "✓"
                  : "i";
          const message = this.ownerDocument.createElement("span");
          message.part = "message";
          message.textContent = propertyText(value, "message") || label;
          element.append(icon, message);
          const target = propertyText(value, "target");
          const action = propertyText(value, "action");
          if (target || action) {
            element.tabIndex = 0;
            element.dataset.target = target;
            const actionButton = this.ownerDocument.createElement("button");
            actionButton.type = "button";
            actionButton.part = "alert-action";
            actionButton.textContent = action || "View";
            actionButton.addEventListener("click", () => {
              if (target) this.ownerDocument.getElementById(target)?.focus();
              this.dispatchEvent(
                new CustomEvent("ika-action", {
                  bubbles: true,
                  composed: true,
                  detail: { target, action: action || "View" },
                }),
              );
            });
            element.append(actionButton);
          }
          if (value.dismissible === true) {
            const dismiss = this.ownerDocument.createElement("button");
            dismiss.type = "button";
            dismiss.part = "dismiss";
            dismiss.textContent = "Dismiss";
            dismiss.setAttribute("aria-label", "Dismiss alert");
            dismiss.addEventListener("click", () =>
              this.dispatchEvent(
                new CustomEvent("ika-dismiss", {
                  bubbles: true,
                  composed: true,
                  detail: {},
                }),
              ),
            );
            element.append(dismiss);
          }
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
        this.dataset.modal = String(value.modal !== false);
        const dialogNode = appendInternal(root, "dialog", (element) => {
          element.part = "dialog";
          element.setAttribute("aria-modal", String(value.modal !== false));
          const title = propertyText(value, "title");
          const content = propertyText(value, "content");
          if (title) {
            const heading = this.ownerDocument.createElement("h2");
            heading.part = "title";
            heading.textContent = title;
            element.append(heading);
          }
          if (content) {
            const paragraph = this.ownerDocument.createElement("p");
            paragraph.part = "content";
            paragraph.textContent = content;
            element.append(paragraph);
          }
          if (!title && !content) element.textContent = label;
        });
        if (propertyBoolean(value, "open")) {
          const dialog = dialogNode as HTMLDialogElement;
          try {
            if (value.modal !== false) dialog.showModal();
            else dialog.show();
          } catch {
            dialog.open = true;
          }
        }
        break;
      case "ika-side-panel":
      case "ika-bottom-panel":
        this.dataset.side = propertyText(value, "side") || "end";
        this.dataset.open = String(propertyBoolean(value, "open"));
        appendInternal(root, "div", (workspace) => {
          workspace.part = "workspace";
          const main = this.ownerDocument.createElement("main");
          main.part = "main";
          main.textContent = propertyText(value, "main");
          const panel = this.ownerDocument.createElement("aside");
          panel.part = "panel";
          panel.setAttribute(
            "aria-hidden",
            String(!propertyBoolean(value, "open")),
          );
          const title = propertyText(value, "title");
          const content = propertyText(value, "content");
          if (title) {
            const heading = this.ownerDocument.createElement("h2");
            heading.part = "title";
            heading.textContent = title;
            panel.append(heading);
          }
          if (content) {
            const paragraph = this.ownerDocument.createElement("p");
            paragraph.part = "content";
            paragraph.textContent = content;
            panel.append(paragraph);
          }
          if (!title && !content) panel.textContent = label;
          workspace.append(main, panel);
        });
        break;
      case "ika-loading-region":
        this.dataset.busy = String(propertyBoolean(value, "busy"));
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
        this.dataset.collapsed = String(value.collapsed === true);
        this.dataset.overflow = propertyText(value, "overflow") || "none";
        this.dataset.activeId = propertyText(value, "activeId");
        appendInternal(
          root,
          kind === "ika-sidebar" ? "nav" : "div",
          (element) => {
            element.part = kind === "ika-sidebar" ? "nav" : "toolbar";
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
              const itemLabel = textValue(item.label) || item.id;
              const itemIcon =
                textValue(item.icon) ||
                (kind === "ika-toolbar"
                  ? item.id === "save"
                    ? "↓"
                    : item.id === "refresh"
                      ? "↻"
                      : "⋯"
                  : item.id === "settings"
                    ? "⚙"
                    : "⌂");
              button.setAttribute("aria-label", itemLabel);
              button.title = itemLabel;
              button.part = kind === "ika-toolbar" ? "item" : "nav-item";
              button.disabled = item.disabled === true;
              button.setAttribute(
                "aria-pressed",
                String(item.pressed === true),
              );
              button.dataset.busy = String(item.busy === true);
              if (item.id === value.activeId)
                button.setAttribute("aria-current", "page");
              const icon = this.ownerDocument.createElement("span");
              icon.part = "icon";
              icon.setAttribute("aria-hidden", "true");
              icon.textContent = itemIcon;
              button.append(icon);
              if (kind === "ika-sidebar") {
                const itemText = this.ownerDocument.createElement("span");
                itemText.part = "label";
                itemText.textContent = itemLabel;
                button.append(itemText);
              }
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
        this.dataset.variant = propertyText(value, "variant") || "default";
        appendInternal(root, "fieldset", (element) => {
          const options = Array.isArray(value.options) ? value.options : [];
          const buttons: HTMLButtonElement[] = [];
          for (const option of options) {
            if (!isIkaJsonRecord(option) || typeof option.id !== "string")
              continue;
            const button = this.ownerDocument.createElement("button");
            button.type = "button";
            button.textContent = textValue(option.label) || option.id;
            button.setAttribute("role", "radio");
            button.disabled =
              propertyBoolean(value, "disabled") || option.disabled === true;
            button.setAttribute(
              "aria-checked",
              String(option.id === value.value),
            );
            button.tabIndex = option.id === value.value ? 0 : -1;
            button.addEventListener("click", () => {
              buttons.forEach((candidate) => {
                const selected = candidate === button;
                candidate.setAttribute("aria-checked", String(selected));
                candidate.tabIndex = selected ? 0 : -1;
              });
              this.dispatchEvent(
                new CustomEvent("ika-change", {
                  bubbles: true,
                  composed: true,
                  detail: { value: option.id },
                }),
              );
            });
            button.addEventListener("keydown", (event) => {
              if (
                ![
                  "ArrowLeft",
                  "ArrowRight",
                  "ArrowUp",
                  "ArrowDown",
                  "Home",
                  "End",
                ].includes(event.key)
              )
                return;
              event.preventDefault();
              const enabled = buttons.filter(
                (candidate) => !candidate.disabled,
              );
              const current = enabled.indexOf(button);
              const next =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? enabled.length - 1
                    : (current +
                        (event.key === "ArrowLeft" || event.key === "ArrowUp"
                          ? -1
                          : 1) +
                        enabled.length) %
                      enabled.length;
              enabled[next]?.click();
              enabled[next]?.focus();
            });
            buttons.push(button);
            element.append(button);
          }
        });
        break;
      case "ika-field":
        appendInternal(root, "fieldset", (element) => {
          element.setAttribute(
            "aria-required",
            String(propertyBoolean(value, "required")),
          );
          const legend = this.ownerDocument.createElement("legend");
          legend.textContent = label;
          const content = this.ownerDocument.createElement(
            "ika-editable-text",
          ) as HTMLElement & { props?: IkaJsonRecord };
          content.setAttribute("part", "content");
          content.props = {
            value: propertyText(value, "content"),
            editor: propertyText(value, "editor") || "text",
            state: propertyText(value, "state") || "clean",
          };
          element.append(legend, content);
        });
        break;
      case "ika-form":
        this.dataset.status = propertyText(value, "status") || "idle";
        this.setAttribute(
          "aria-invalid",
          String(propertyText(value, "status") === "error"),
        );
        preserveFormChildren(this);
        clearInternalContent(root);
        const form = appendInternal(root, "form", (element) => {
          element.setAttribute("novalidate", "");
        });
        for (const field of Array.isArray(value.fields) ? value.fields : []) {
          if (!isIkaJsonRecord(field)) continue;
          const row = this.ownerDocument.createElement("div");
          row.dataset.ikaInternal = "true";
          row.part = "field";
          const fieldLabel = this.ownerDocument.createElement("span");
          fieldLabel.part = "label";
          fieldLabel.textContent = textValue(field.label);
          const explicitValue = isIkaJsonRecord(value.values)
            ? value.values[textValue(field.id)]
            : undefined;
          const currentValue = textValue(
            typeof explicitValue === "string"
              ? explicitValue
              : field.initialValue,
          );
          const editor = this.ownerDocument.createElement(
            "ika-editable-text",
          ) as HTMLElement & { props?: IkaJsonRecord };
          editor.id = textValue(field.id);
          editor.props = {
            id: textValue(field.id),
            value: currentValue,
            editor: propertyText(field, "editor") || "text",
            state: propertyText(field, "state") || "clean",
          };
          row.append(fieldLabel, editor);
          form.append(row);
        }
        for (const child of Array.from(this.children)) {
          if (child !== form && !child.hasAttribute("data-ika-internal"))
            form.append(child);
        }
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

  private renderEditableText(
    root: HTMLElement | ShadowRoot,
    value: IkaJsonRecord,
  ): void {
    const disabled = propertyBoolean(value, "disabled");
    const editor = propertyText(value, "editor") || "text";
    const state =
      editableStates.get(this) || propertyText(value, "state") || "clean";
    const controlledValue = propertyText(value, "value");
    if (!editableValues.has(this)) editableValues.set(this, controlledValue);
    const currentValue = editableValues.get(this) ?? controlledValue;
    this.dataset.editable = String(!disabled);
    this.dataset.editing = String(editableEditing.has(this));
    this.dataset.state = state;
    if (!editableEditing.has(this)) {
      appendInternal(root, "span", (element) => {
        element.part = "read-value";
        element.tabIndex = disabled ? -1 : 0;
        element.textContent = currentValue;
        const start = (): void => {
          this.beginEditableTextEditing();
        };
        element.addEventListener("dblclick", start);
        element.addEventListener("keydown", (event) => {
          if (disabled) return;
          if (event.key === "Enter" || event.key === "F2") {
            event.preventDefault();
            start();
          }
        });
      });
      if (editor !== "text")
        appendInternal(root, "span", (element) => {
          element.part = "editor-icon";
          element.setAttribute("aria-hidden", "true");
          element.textContent =
            editor === "textarea"
              ? "¶"
              : editor === "select"
                ? "⌄"
                : editor.slice(0, 1).toUpperCase();
        });
      return;
    }
    const tag =
      editor === "textarea"
        ? "textarea"
        : editor === "select"
          ? "select"
          : "input";
    const input = appendInternal(root, tag, (element) => {
      element.part = "input";
      element.setAttribute(
        "aria-label",
        propertyText(value, "id") || "Edit value",
      );
      if (tag === "input")
        (element as HTMLInputElement).type =
          editor === "email" || editor === "number" || editor === "date"
            ? editor
            : "text";
      if (tag === "select") {
        const option = this.ownerDocument.createElement("option");
        option.value = currentValue;
        option.textContent = currentValue;
        (element as HTMLSelectElement).append(option);
      }
      (
        element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      ).value = editableDrafts.get(this) ?? currentValue;
      (
        element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      ).disabled = disabled;
      element.addEventListener("input", () => {
        editableDrafts.set(
          this,
          (
            element as
              HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          ).value,
        );
      });
      element.addEventListener("change", () => {
        editableDrafts.set(
          this,
          (
            element as
              HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          ).value,
        );
        if (editor === "select") this.commitEditableText();
      });
      element.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          this.cancelEditableText();
        } else if (event.key === "Enter" || event.key === "Tab") {
          event.preventDefault();
          this.commitEditableText();
        }
      });
    });
    queueMicrotask(() => {
      (
        input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      ).focus();
    });
  }

  private beginEditableTextEditing(): void {
    if (
      this.localName !== "ika-editable-text" ||
      propertyBoolean(this.effectiveProps, "disabled")
    )
      return;
    if (!editableEditing.has(this)) {
      editableEditing.add(this);
      editableDrafts.set(
        this,
        editableValues.get(this) ?? propertyText(this.effectiveProps, "value"),
      );
      this.render();
    }
  }

  private commitEditableText(): void {
    if (!editableEditing.has(this)) return;
    const next = editableDrafts.get(this) ?? editableValues.get(this) ?? "";
    editableEditing.delete(this);
    editableDrafts.delete(this);
    editableValues.set(this, next);
    if ((propertyText(this.effectiveProps, "state") || "clean") === "clean")
      editableStates.set(this, "modified");
    this.render();
    this.dispatchEvent(
      new CustomEvent("ika-commit", {
        bubbles: true,
        composed: true,
        detail: { value: next },
      }),
    );
  }

  private cancelEditableText(): void {
    if (!editableEditing.has(this)) return;
    editableEditing.delete(this);
    editableDrafts.delete(this);
    this.render();
    this.dispatchEvent(
      new CustomEvent("ika-cancel", { bubbles: true, composed: true }),
    );
  }

  protected get effectiveProps(): IkaJsonRecord {
    const value: Record<string, IkaJsonValue> = { ...this.#props };
    for (const attribute of primitiveAttributes) {
      if (!this.hasAttribute(attribute)) continue;
      value[attribute] = booleanAttributes.has(attribute)
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
  #editing: IkaDataGridSelection | undefined;
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
    if (!isIkaViewProps(this.localName, value)) {
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
    if (value.editing === undefined) this.#editing = undefined;
    else if (isIkaDataGridSelection(value.editing))
      this.#editing = value.editing;
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
    this.#editing = request;
    this.#selection = request;
    this.render();
    this.dispatchEvent(
      new CustomEvent("ika-edit-start", {
        bubbles: true,
        composed: true,
        detail: request,
      }),
    );
  }

  protected override get renderRoot(): HTMLElement | ShadowRoot {
    return this;
  }

  protected override render(): void {
    const root = this.renderRoot;
    if (serializedChildrenForElement.has(this)) {
      clearInternalContent(root);
      return;
    }
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
      cell.part = "header-cell";
      cell.setAttribute("role", "columnheader");
      cell.style.padding = "var(--ikasue-grid-cell-padding, 0.5rem)";
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
        cell.part = "cell";
        cell.setAttribute("role", "gridcell");
        cell.style.padding = "var(--ikasue-grid-cell-padding, 0.5rem)";
        cell.dataset.rowId = row.id;
        cell.dataset.columnId = column.id;
        const rawValue = row.cells[column.id];
        const selection = this.#selection;
        const selected =
          selection?.row === row.id && selection.column === column.id;
        cell.dataset.selected = String(selected);
        cell.dataset.rowPeer = String(selection?.row === row.id && !selected);
        cell.dataset.columnPeer = String(
          selection?.column === column.id && !selected,
        );
        cell.dataset.state = gridCellState(rawValue);
        cell.textContent = gridCellValue(rawValue);
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
        cell.addEventListener("dblclick", () => {
          this.startEditing({ row: row.id, column: column.id });
        });
        cell.addEventListener("keydown", (event) => {
          const rowIndex = this.#rows.findIndex(
            (candidate) => candidate.id === row.id,
          );
          const columnIndex = this.#columns.findIndex(
            (candidate) => candidate.id === column.id,
          );
          let nextRow = rowIndex;
          let nextColumn = columnIndex;
          if (event.key === "ArrowUp") nextRow -= 1;
          else if (event.key === "ArrowDown") nextRow += 1;
          else if (event.key === "ArrowLeft") nextColumn -= 1;
          else if (event.key === "ArrowRight") nextColumn += 1;
          else if (event.key === "Home") nextColumn = 0;
          else if (event.key === "End") nextColumn = this.#columns.length - 1;
          if (nextRow !== rowIndex || nextColumn !== columnIndex) {
            const nextRowValue = this.#rows[nextRow];
            const nextColumnValue = this.#columns[nextColumn];
            if (nextRowValue && nextColumnValue) {
              event.preventDefault();
              this.selection = {
                row: nextRowValue.id,
                column: nextColumnValue.id,
              };
              this.render();
              this.querySelector<HTMLElement>(
                `[data-row-id="${CSS.escape(nextRowValue.id)}"][data-column-id="${CSS.escape(nextColumnValue.id)}"]`,
              )?.focus();
            }
            return;
          }
          if (event.key === "F2" || event.key === "Enter") {
            event.preventDefault();
            this.startEditing({ row: row.id, column: column.id });
          }
        });
        cell.addEventListener("copy", (event) => {
          const clipboard = event.clipboardData;
          if (!clipboard) return;
          event.preventDefault();
          clipboard.setData("text/plain", gridCellValue(rawValue));
          this.dataset.clipboard = "copying";
        });
        cell.addEventListener("paste", (event) => {
          const pasted = event.clipboardData?.getData("text/plain");
          if (!pasted || value.editable !== true) return;
          event.preventDefault();
          this.dataset.clipboard = "pasting";
          this.startEditing({ row: row.id, column: column.id });
          this.commitGridCell(row.id, column.id, pasted);
        });
        if (
          this.#editing?.row === row.id &&
          this.#editing.column === column.id &&
          value.editable === true
        ) {
          const input = this.ownerDocument.createElement("input");
          input.part = "input";
          input.value = gridCellValue(rawValue);
          cell.replaceChildren(input);
          input.focus();
          input.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              this.#editing = undefined;
              this.render();
            } else if (event.key === "Enter" || event.key === "Tab") {
              event.preventDefault();
              this.commitGridCell(row.id, column.id, input.value);
            }
          });
        }
        rowNode.append(cell);
      }
      body.append(rowNode);
    }
    table.append(head, body);
    root.append(table);
    if (this.#model && this.#rows.length === 0 && !this.#requestController)
      void this.loadModelRows(this.#rowRequest);
  }

  private commitGridCell(rowId: string, columnId: string, next: string): void {
    this.#rows = this.#rows.map((row) => {
      if (row.id !== rowId) return row;
      return {
        ...row,
        cells: {
          ...row.cells,
          [columnId]: { value: next, state: "modified" },
        },
      };
    });
    this.#editing = undefined;
    this.dataset.clipboard = "idle";
    this.render();
    this.dispatchEvent(
      new CustomEvent("ika-edit-commit", {
        bubbles: true,
        composed: true,
        detail: { row: rowId, column: columnId, value: next },
      }),
    );
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
  #instanceId = nextTabsInstanceId();
  #items: readonly IkaTabsItem[] = [];
  #activeId: string | undefined;
  #motion: "forward" | "backward" = "forward";

  override get props(): IkaJsonRecord {
    return super.props;
  }

  override set props(value: IkaJsonRecord) {
    if (!isIkaViewProps(this.localName, value)) {
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
    const previous = this.#items.findIndex(
      (candidate) => candidate.id === this.#activeId,
    );
    const next = this.#items.findIndex((candidate) => candidate.id === id);
    if (previous >= 0 && next >= 0 && next < previous)
      this.#motion = "backward";
    else if (previous >= 0 && next >= 0 && next > previous)
      this.#motion = "forward";
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
    const orientation = propertyText(value, "orientation") || "horizontal";
    this.dataset.orientation = orientation;
    this.dataset.variant = propertyText(value, "variant") || "default";
    if (serializedChildrenForElement.has(this)) {
      clearInternalContent(root);
      return;
    }
    clearInternalContent(root);
    const active =
      this.#items.find(
        (item) => item.id === this.#activeId && item.disabled !== true,
      ) ?? this.#items.find((item) => item.disabled !== true);
    this.#activeId = active?.id;
    const list = this.ownerDocument.createElement("div");
    list.dataset.ikaInternal = "true";
    list.part = "tablist";
    list.id = `ika-tabs-${String(this.#instanceId)}-list`;
    list.setAttribute("role", "tablist");
    list.setAttribute("aria-orientation", orientation);
    const panels = this.ownerDocument.createElement("div");
    panels.dataset.ikaInternal = "true";
    panels.part = "panels";
    for (const [index, item] of this.#items.entries()) {
      const button = this.ownerDocument.createElement("button");
      const tabId = `ika-tabs-${String(this.#instanceId)}-tab-${String(index + 1)}`;
      const panelId = `ika-tabs-${String(this.#instanceId)}-panel-${String(index + 1)}`;
      button.type = "button";
      button.textContent = item.label;
      button.id = tabId;
      button.part = "tab";
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", panelId);
      button.setAttribute("aria-selected", String(item.id === this.#activeId));
      button.tabIndex = item.id === this.#activeId ? 0 : -1;
      button.disabled = item.disabled === true;
      button.addEventListener("click", () => {
        this.select(textValue(item.id));
      });
      button.dataset.tabId = item.id;
      button.addEventListener("keydown", (event) => {
        const key = event.key;
        const keys =
          orientation === "vertical"
            ? ["ArrowUp", "ArrowDown"]
            : ["ArrowLeft", "ArrowRight"];
        if (![...keys, "Home", "End"].includes(key)) return;
        event.preventDefault();
        const enabled = this.#items.filter(
          (candidate) => candidate.disabled !== true,
        );
        const current = enabled.findIndex(
          (candidate) => candidate.id === item.id,
        );
        const nextIndex =
          key === "Home"
            ? 0
            : key === "End"
              ? enabled.length - 1
              : (current + (key === keys[0] ? -1 : 1) + enabled.length) %
                enabled.length;
        const next = enabled[nextIndex];
        if (!next) return;
        this.select(next.id);
        const renderedList =
          this.renderRoot.querySelector<HTMLElement>('[part="tablist"]');
        const nextButton = Array.from(
          renderedList?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ??
            [],
        ).find((candidate) => candidate.dataset.tabId === next.id);
        nextButton?.focus();
      });
      list.append(button);
      const panel = this.ownerDocument.createElement("section");
      panel.dataset.ikaInternal = "true";
      panel.part = "panel";
      panel.id = panelId;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tabId);
      panel.hidden = item.id !== this.#activeId;
      panel.dataset.active = String(item.id === this.#activeId);
      panel.dataset.motion = this.#motion;
      panel.textContent = item.content ?? "";
      panels.append(panel);
    }
    root.append(list, panels);
  }
}

export class IkaSplitViewElement extends IkaElement {
  #instanceId = nextSplitViewInstanceId();
  #panes: readonly IkaSplitViewPane[] = [];
  #collapsed = new Set<string>();
  #activePane: string | undefined;

  override get props(): IkaJsonRecord {
    return super.props;
  }

  override set props(value: IkaJsonRecord) {
    if (!isIkaViewProps(this.localName, value)) {
      this.reportInvalidContract();
      return;
    }
    let panes = this.#panes;
    let activePane = this.#activePane;
    try {
      if (value.panes !== undefined) panes = asSplitPanes(value.panes);
      if (value.activePane !== undefined) {
        if (typeof value.activePane !== "string")
          throw new Error("invalid activePane");
        activePane = value.activePane;
      }
    } catch {
      this.reportInvalidContract();
      return;
    }
    this.#panes = panes;
    this.#activePane = activePane;
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
    if (serializedChildrenForElement.has(this)) {
      clearInternalContent(root);
      return;
    }
    const value = this.effectiveProps;
    clearInternalContent(root);
    const orientation = propertyText(value, "orientation") || "horizontal";
    this.dataset.orientation = orientation;
    this.dataset.activePane =
      propertyText(value, "activePane") || this.#activePane || "";
    this.dataset.collapsible = String(value.collapsible === true);
    this.dataset.motionOrigin =
      propertyText(value, "motionOrigin") ||
      (orientation === "horizontal" ? "start" : "top");
    if (value.collapsible !== true) this.#collapsed.clear();
    const sizes = Array.isArray(value.sizes)
      ? value.sizes.filter((item): item is string => typeof item === "string")
      : [];
    const container = this.ownerDocument.createElement("div");
    container.dataset.ikaInternal = "true";
    container.dataset.ikaSplitContainer = "true";
    container.style.display = "flex";
    container.style.flex = "1 1 auto";
    container.style.minWidth = "0";
    container.style.gap = "0.75rem";
    container.part = "panes";
    for (const [index, pane] of this.#panes.entries()) {
      const section = this.ownerDocument.createElement("section");
      section.dataset.paneId = textValue(pane.id);
      section.id = `ika-split-view-${String(this.#instanceId)}-pane-${String(index + 1)}`;
      section.dataset.collapsible = String(value.collapsible === true);
      section.dataset.collapsed = String(this.#collapsed.has(pane.id));
      section.dataset.active = String(
        (propertyText(value, "activePane") || this.#activePane) === pane.id,
      );
      section.tabIndex = 0;
      section.addEventListener("click", () => {
        if (propertyText(this.effectiveProps, "activePane")) return;
        this.#activePane = pane.id;
        this.render();
        this.dispatchEvent(
          new CustomEvent("ika-active-pane-change", {
            bubbles: true,
            composed: true,
            detail: { id: pane.id },
          }),
        );
      });
      section.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        section.click();
      });
      section.setAttribute("aria-hidden", String(this.#collapsed.has(pane.id)));
      if (this.#collapsed.has(pane.id)) {
        section.style.flex = "0 0 0";
        section.style.flexBasis = "0";
      } else {
        const size =
          sizes[index] ??
          (pane.basis === undefined ? "1fr" : `${String(pane.basis)}fr`);
        applySplitSize(
          section,
          size,
          (propertyText(value, "activePane") || this.#activePane) === pane.id,
        );
      }
      if (pane.label) {
        const heading = this.ownerDocument.createElement("h3");
        heading.part = "label";
        heading.textContent = pane.label;
        section.append(heading);
      }
      if (pane.content) {
        const content = this.ownerDocument.createElement("p");
        content.part = "content";
        content.textContent = pane.content;
        section.append(content);
      }
      if (!pane.label && !pane.content)
        section.append(this.ownerDocument.createTextNode(pane.id));
      if (value.collapsible === true) {
        const divider = this.ownerDocument.createElement("div");
        divider.dataset.ikaInternal = "true";
        divider.dataset.paneDivider = "true";
        divider.part = "divider";
        divider.setAttribute("role", "separator");
        const control = this.ownerDocument.createElement("button");
        control.type = "button";
        control.part = "collapse-control";
        control.textContent = orientation === "horizontal" ? "↔" : "↕";
        control.title = this.#collapsed.has(pane.id)
          ? "Expand pane"
          : "Collapse pane";
        control.setAttribute(
          "aria-label",
          this.#collapsed.has(pane.id) ? "Expand pane" : "Collapse pane",
        );
        control.setAttribute(
          "aria-expanded",
          String(!this.#collapsed.has(pane.id)),
        );
        control.setAttribute("aria-controls", section.id);
        control.addEventListener("click", () => {
          const collapsed = !this.#collapsed.has(pane.id);
          if (collapsed) this.#collapsed.add(pane.id);
          else this.#collapsed.delete(pane.id);
          this.render();
          this.dispatchEvent(
            new CustomEvent("ika-collapse-change", {
              bubbles: true,
              composed: true,
              detail: { id: pane.id, collapsed },
            }),
          );
        });
        divider.append(control);
        container.append(section, divider);
      } else {
        container.append(section);
      }
    }
    root.append(container);
  }
}

export class IkaHistoryTimelineElement extends IkaElement {
  protected override render(): void {
    const root = this.renderRoot;
    if (serializedChildrenForElement.has(this)) {
      clearInternalContent(root);
      return;
    }
    const value = this.effectiveProps;
    clearInternalContent(root);
    const list = this.ownerDocument.createElement("ol");
    list.dataset.ikaInternal = "true";
    list.part = "timeline";
    const entries = Array.isArray(value.entries) ? value.entries : [];
    this.dataset.orientation = propertyText(value, "orientation") || "vertical";
    this.dataset.compact = String(value.compact === true);
    const selectedId = propertyText(value, "selectedId");
    for (const entry of entries) {
      if (!isIkaJsonRecord(entry)) continue;
      const item = this.ownerDocument.createElement("li");
      item.part = "entry";
      item.setAttribute(
        "aria-current",
        String(
          selectedId
            ? textValue(entry.id) === selectedId
            : entries.indexOf(entry) === entries.length - 1,
        ),
      );
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
