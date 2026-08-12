/**
 * The stable, language-neutral part of the ikasue Web ABI.
 *
 * Keep this module data-only. Runtime bindings may add methods, promises and
 * DOM objects around these values, but values crossing a host boundary must
 * remain JSON values.
 */

import { isMinSize, isSplitBasis } from "./layout";

export const IKASUE_ABI_VERSION = "ikasue-web/1" as const;

export type IkaJsonPrimitive = null | boolean | number | string;
export type IkaJsonValue =
  | IkaJsonPrimitive
  | readonly IkaJsonValue[]
  | { readonly [key: string]: IkaJsonValue };
export type IkaJsonRecord = { readonly [key: string]: IkaJsonValue };

export type IkaViewKind =
  | "theme-root"
  | "text"
  | "editable-text"
  | "text-field"
  | "flex"
  | "stack"
  | "grid"
  | "scroll-area"
  | "separator"
  | "tabs"
  | "sidebar"
  | "toolbar"
  | "icon-button"
  | "checkbox"
  | "radio-group"
  | "segmented-control"
  | "field"
  | "form"
  | "data-grid"
  | "history-timeline"
  | "split-view"
  | "side-panel"
  | "bottom-panel"
  | "loading-region"
  | "dialog"
  | "status-indicator"
  | "alert"
  | "progress";

export const IKA_VIEW_KINDS: readonly IkaViewKind[] = [
  "theme-root",
  "text",
  "editable-text",
  "text-field",
  "flex",
  "stack",
  "grid",
  "scroll-area",
  "separator",
  "tabs",
  "sidebar",
  "toolbar",
  "icon-button",
  "checkbox",
  "radio-group",
  "segmented-control",
  "field",
  "form",
  "data-grid",
  "history-timeline",
  "split-view",
  "side-panel",
  "bottom-panel",
  "loading-region",
  "dialog",
  "status-indicator",
  "alert",
  "progress",
] as const;

const IKA_VIEW_PROPERTY_KEYS = new Set([
  "tokens",
  "variant",
  "editor",
  "state",
  "compact",
  "selectedId",
  "content",
  "density",
  "tone",
  "selectable",
  "id",
  "value",
  "disabled",
  "label",
  "placeholder",
  "required",
  "description",
  "error",
  "direction",
  "wrap",
  "gap",
  "align",
  "justify",
  "children",
  "columns",
  "rows",
  "axis",
  "overscroll",
  "orientation",
  "weight",
  "role",
  "items",
  "activeId",
  "activePane",
  "collapsed",
  "overflow",
  "icon",
  "type",
  "pressed",
  "checked",
  "options",
  "fields",
  "values",
  "status",
  "selection",
  "editing",
  "selectionMode",
  "editable",
  "entries",
  "panes",
  "sizes",
  "collapsible",
  "motionOrigin",
  "title",
  "main",
  "open",
  "railWidth",
  "openWidth",
  "side",
  "drafts",
  "errors",
  "busy",
  "message",
  "target",
  "action",
  "targetId",
  "showLabel",
  "severity",
  "dismissible",
  "loading",
  "max",
]);

export interface IkaView {
  readonly version: typeof IKASUE_ABI_VERSION;
  readonly kind: IkaViewKind;
  readonly props?: IkaJsonRecord;
  readonly children?: readonly IkaView[];
  readonly text?: string;
}

type IkaPropertyGuard = (value: IkaJsonValue) => boolean;

const isString = (value: IkaJsonValue): boolean => typeof value === "string";
const isBoolean = (value: IkaJsonValue): boolean => typeof value === "boolean";
const isNumber = (value: IkaJsonValue): boolean =>
  typeof value === "number" && Number.isFinite(value);
const isEnum =
  (...values: readonly string[]): IkaPropertyGuard =>
  (value) =>
    typeof value === "string" && values.includes(value);
const isArrayOf =
  (guard: (value: IkaJsonValue) => boolean): IkaPropertyGuard =>
  (value) =>
    Array.isArray(value) && value.every(guard);
const isStringRecord = (value: IkaJsonValue): boolean =>
  isIkaJsonRecord(value) && Object.values(value).every(isString);
const isBooleanRecord = (value: IkaJsonValue): boolean =>
  isIkaJsonRecord(value) && Object.values(value).every(isBoolean);
const isViewArray = (value: IkaJsonValue): boolean =>
  Array.isArray(value) && value.every(isIkaView);
const isFormField = (value: IkaJsonValue): boolean => {
  if (
    !isIkaJsonRecord(value) ||
    !hasOnlyKeys(value, [
      "id",
      "label",
      "initialValue",
      "required",
      "editor",
      "state",
    ])
  )
    return false;
  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.label === "string" &&
    value.label.length > 0 &&
    (value.initialValue === undefined ||
      typeof value.initialValue === "string") &&
    (value.required === undefined || typeof value.required === "boolean") &&
    (value.editor === undefined ||
      ["text", "email", "number", "date", "textarea", "select"].includes(
        value.editor as string,
      )) &&
    (value.state === undefined ||
      ["clean", "created", "modified", "deleted", "error"].includes(
        value.state as string,
      ))
  );
};
const isChoiceOption = (value: IkaJsonValue): boolean =>
  isIkaJsonRecord(value) &&
  hasOnlyKeys(value, ["id", "label", "disabled"]) &&
  typeof value.id === "string" &&
  value.id.length > 0 &&
  typeof value.label === "string" &&
  (value.disabled === undefined || typeof value.disabled === "boolean");
const isItem = (value: IkaJsonValue): boolean =>
  isIkaJsonRecord(value) &&
  hasOnlyKeys(value, [
    "id",
    "label",
    "content",
    "disabled",
    "icon",
    "pressed",
    "busy",
  ]) &&
  typeof value.id === "string" &&
  value.id.length > 0 &&
  typeof value.label === "string" &&
  (value.content === undefined || typeof value.content === "string") &&
  (value.disabled === undefined || typeof value.disabled === "boolean") &&
  (value.icon === undefined || typeof value.icon === "string") &&
  (value.pressed === undefined || typeof value.pressed === "boolean") &&
  (value.busy === undefined || typeof value.busy === "boolean");
const isHistoryEntry = (value: IkaJsonValue): boolean =>
  isIkaJsonRecord(value) &&
  hasOnlyKeys(value, ["id", "label", "content", "tone"]) &&
  typeof value.id === "string" &&
  value.id.length > 0 &&
  typeof value.label === "string" &&
  typeof value.content === "string" &&
  (value.tone === undefined ||
    ["default", "muted", "success", "danger"].includes(value.tone as string));
const isDataGridCellValue = (value: IkaJsonValue): boolean =>
  value === null ||
  typeof value === "string" ||
  typeof value === "number" ||
  typeof value === "boolean" ||
  (isIkaJsonRecord(value) &&
    hasOnlyKeys(value, ["value", "state"]) &&
    typeof value.value === "string" &&
    (value.state === undefined ||
      ["clean", "created", "modified", "deleted", "error"].includes(
        value.state as string,
      )));
const isUniqueTabsItems = (value: IkaJsonValue): boolean => {
  if (!Array.isArray(value)) return false;
  const ids = new Set<string>();
  for (const item of value) {
    if (!isIkaTabsItem(item) || ids.has(item.id)) return false;
    ids.add(item.id);
  }
  return true;
};

const IKA_VIEW_PROPERTY_GUARDS: Readonly<
  Record<IkaViewKind, Readonly<Record<string, IkaPropertyGuard>>>
> = {
  "theme-root": {
    tokens: isStringRecord,
    variant: isEnum("default", "quiet", "dense"),
  },
  text: {
    content: isString,
    tone: isEnum("default", "muted", "danger", "success"),
    selectable: isBoolean,
  },
  "editable-text": {
    id: isString,
    value: isString,
    editor: isEnum("text", "email", "number", "date", "textarea", "select"),
    state: isEnum("clean", "created", "modified", "deleted", "error"),
    disabled: isBoolean,
  },
  "text-field": {
    id: isString,
    label: isString,
    value: isString,
    placeholder: isString,
    disabled: isBoolean,
    required: isBoolean,
    description: isString,
    error: isString,
  },
  flex: {
    direction: isEnum("row", "column"),
    wrap: isEnum("nowrap", "wrap", "wrap-reverse"),
    gap: isString,
    align: isString,
    justify: isString,
    children: isViewArray,
  },
  stack: {
    gap: isString,
    align: isString,
    justify: isString,
    children: isViewArray,
  },
  grid: {
    columns: isString,
    rows: isString,
    gap: isString,
    align: isString,
    justify: isString,
    children: isViewArray,
  },
  "scroll-area": {
    content: isString,
    axis: isEnum("x", "y", "both"),
    overscroll: isEnum("auto", "contain"),
  },
  separator: {
    orientation: isEnum("horizontal", "vertical"),
    weight: isEnum("hairline", "standard"),
    role: isEnum("separator"),
  },
  tabs: {
    items: isUniqueTabsItems,
    activeId: isString,
    variant: isEnum("default", "elastic"),
    orientation: isEnum("horizontal", "vertical"),
  },
  sidebar: {
    main: isString,
    items: isArrayOf(isItem),
    activeId: isString,
    collapsed: isBoolean,
    railWidth: isMinSize,
    openWidth: isMinSize,
  },
  toolbar: {
    items: isArrayOf(isItem),
    activeId: isString,
    collapsed: isBoolean,
    overflow: isEnum("none", "menu"),
  },
  "icon-button": {
    id: isString,
    label: isString,
    icon: isString,
    type: isEnum("button", "submit", "reset"),
    disabled: isBoolean,
    pressed: isBoolean,
    busy: isBoolean,
  },
  checkbox: {
    id: isString,
    label: isString,
    checked: isBoolean,
    disabled: isBoolean,
  },
  "radio-group": {
    id: isString,
    options: isArrayOf(isChoiceOption),
    value: isString,
    disabled: isBoolean,
  },
  "segmented-control": {
    id: isString,
    options: isArrayOf(isChoiceOption),
    value: isString,
    disabled: isBoolean,
    variant: isEnum("default", "elastic"),
  },
  field: {
    id: isString,
    label: isString,
    description: isString,
    error: isString,
    required: isBoolean,
    content: isString,
    editor: isEnum("text", "email", "number", "date", "textarea", "select"),
    state: isEnum("clean", "created", "modified", "deleted", "error"),
  },
  form: {
    fields: isArrayOf(isFormField),
    values: isStringRecord,
    drafts: isStringRecord,
    errors: isStringRecord,
    status: isEnum("idle", "clean", "dirty", "submitting", "success", "error"),
  },
  "data-grid": {
    columns: isArrayOf(isIkaDataGridColumn),
    rows: isArrayOf(isIkaDataGridRow),
    selection: isIkaDataGridSelection,
    editing: isIkaDataGridSelection,
    selectionMode: isEnum("cell", "context"),
    editable: isBoolean,
    density: isEnum("default", "compact"),
  },
  "history-timeline": {
    entries: isArrayOf(isHistoryEntry),
    orientation: isEnum("horizontal", "vertical"),
    selectedId: isString,
    compact: isBoolean,
  },
  "split-view": {
    panes: isArrayOf(isIkaSplitViewPane),
    orientation: isEnum("horizontal", "vertical"),
    activePane: isString,
    sizes: isArrayOf(isSplitBasis),
    collapsible: isBoolean,
    collapsed: isBooleanRecord,
    motionOrigin: isEnum("start", "end", "top", "bottom"),
  },
  "side-panel": {
    main: isString,
    children: isViewArray,
    title: isString,
    content: isString,
    side: isEnum("start", "end"),
    open: isBoolean,
  },
  "bottom-panel": {
    main: isString,
    children: isViewArray,
    title: isString,
    content: isString,
    open: isBoolean,
  },
  "loading-region": { content: isString, busy: isBoolean, label: isString },
  dialog: {
    title: isString,
    content: isString,
    open: isBoolean,
    modal: isBoolean,
  },
  "status-indicator": {
    id: isString,
    label: isString,
    status: isEnum("neutral", "info", "success", "warning", "danger"),
    icon: isString,
    showLabel: isBoolean,
    targetId: isString,
  },
  alert: {
    message: isString,
    severity: isEnum("info", "success", "warning", "danger"),
    dismissible: isBoolean,
    target: isString,
    action: isString,
  },
  progress: { value: isNumber, max: isNumber, label: isString },
};

export function isIkaViewProps(
  kindOrTag: string,
  value: unknown,
): value is IkaJsonRecord {
  const kind = kindOrTag.startsWith("ika-")
    ? kindOrTag.slice("ika-".length)
    : kindOrTag;
  const guards = (
    IKA_VIEW_PROPERTY_GUARDS as Partial<
      Record<string, Readonly<Record<string, IkaPropertyGuard>>>
    >
  )[kind];
  if (!guards || !isIkaJsonRecord(value)) return false;
  return Object.entries(value).every(
    ([key, propertyValue]) =>
      guards[key] !== undefined && guards[key](propertyValue),
  );
}

export interface IkaDataGridColumn {
  readonly id: string;
  readonly label: string;
  readonly width?: number;
}

export interface IkaDataGridRow {
  readonly id: string;
  readonly cells: IkaJsonRecord;
}

export interface IkaDataGridSelection {
  readonly row: string;
  readonly column: string;
}

export interface IkaDataGridSpec {
  readonly columns: readonly IkaDataGridColumn[];
  readonly rows?: readonly IkaDataGridRow[];
  readonly selection?: IkaDataGridSelection;
  readonly editing?: IkaDataGridSelection;
  readonly selectionMode?: "cell" | "context";
  readonly editable?: boolean;
  readonly density?: "default" | "compact";
}

export interface IkaTabsItem {
  readonly id: string;
  readonly label: string;
  readonly content?: string;
  readonly disabled?: boolean;
}

export interface IkaTabsSpec {
  readonly items: readonly IkaTabsItem[];
  readonly activeId?: string;
  readonly variant?: "default" | "elastic";
  readonly orientation?: "horizontal" | "vertical";
}

export interface IkaSplitViewPane {
  readonly id: string;
  readonly label?: string;
  readonly content?: string;
  readonly size?: string;
  readonly minSize?: string;
  readonly basis?: number | string;
  readonly grow?: number;
  readonly shrink?: number;
  readonly collapsible?: boolean;
  readonly disabled?: boolean;
}

export interface IkaSplitViewSpec {
  readonly panes: readonly IkaSplitViewPane[];
  readonly orientation?: "horizontal" | "vertical";
  readonly activePane?: string;
  readonly sizes?: readonly string[];
  readonly collapsible?: boolean;
  readonly collapsed?: Readonly<Record<string, boolean>>;
  readonly motionOrigin?: "start" | "end" | "top" | "bottom";
}

export interface IkaError {
  readonly code: string;
  readonly message: string;
  readonly details?: IkaJsonValue;
}

export interface IkaRowRequest {
  readonly start: number;
  readonly limit: number;
  readonly sort?: readonly {
    readonly column: string;
    readonly direction: "asc" | "desc";
  }[];
  readonly filter?: string;
}

export interface IkaRowPage {
  readonly rows: readonly IkaDataGridRow[];
  readonly total?: number;
}

export function isIkaRowRequest(value: unknown): value is IkaRowRequest {
  if (!isIkaJsonRecord(value)) return false;
  if (!hasOnlyKeys(value, ["start", "limit", "sort", "filter"])) return false;
  if (
    typeof value.start !== "number" ||
    !Number.isInteger(value.start) ||
    value.start < 0 ||
    typeof value.limit !== "number" ||
    !Number.isInteger(value.limit) ||
    value.limit <= 0
  )
    return false;
  if (value.filter !== undefined && typeof value.filter !== "string")
    return false;
  if (value.sort === undefined) return true;
  return (
    Array.isArray(value.sort) &&
    value.sort.every(
      (item) =>
        isIkaJsonRecord(item) &&
        hasOnlyKeys(item, ["column", "direction"]) &&
        typeof item.column === "string" &&
        item.column.length > 0 &&
        (item.direction === "asc" || item.direction === "desc"),
    )
  );
}

export function isIkaRowPage(value: unknown): value is IkaRowPage {
  if (!isIkaJsonRecord(value) || !hasOnlyKeys(value, ["rows", "total"]))
    return false;
  return (
    Array.isArray(value.rows) &&
    value.rows.every(isIkaDataGridRow) &&
    (value.total === undefined ||
      (typeof value.total === "number" &&
        Number.isInteger(value.total) &&
        value.total >= 0))
  );
}

export type IkaMessage =
  | {
      readonly version: typeof IKASUE_ABI_VERSION;
      readonly type: "request";
      readonly id: number;
      readonly operation: "rows";
      readonly payload: IkaRowRequest;
    }
  | {
      readonly version: typeof IKASUE_ABI_VERSION;
      readonly type: "request";
      readonly id: number;
      readonly operation: "update";
      readonly payload: IkaJsonRecord;
    }
  | {
      readonly version: typeof IKASUE_ABI_VERSION;
      readonly type: "cancel";
      readonly id: number;
    }
  | {
      readonly version: typeof IKASUE_ABI_VERSION;
      readonly type: "response";
      readonly id: number;
      readonly result: IkaJsonRecord;
    }
  | {
      readonly version: typeof IKASUE_ABI_VERSION;
      readonly type: "error";
      readonly id: number;
      readonly error: IkaError;
    }
  | {
      readonly version: typeof IKASUE_ABI_VERSION;
      readonly type: "event";
      readonly event: string;
      readonly payload: IkaJsonRecord;
    };

export function isIkaJsonValue(value: unknown): value is IkaJsonValue {
  return isIkaJsonValueWithin(value, new WeakSet());
}

function isIkaJsonValueWithin(
  value: unknown,
  ancestors: WeakSet<object>,
): value is IkaJsonValue {
  if (value === null) return true;
  if (typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) {
    if (ancestors.has(value)) return false;
    ancestors.add(value);
    const valid = value.every((item) => isIkaJsonValueWithin(item, ancestors));
    ancestors.delete(value);
    return valid;
  }
  if (typeof value !== "object") return false;
  const prototype = Reflect.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return false;
  if (ancestors.has(value)) return false;
  ancestors.add(value);
  const valid = Object.values(value).every((item) =>
    isIkaJsonValueWithin(item, ancestors),
  );
  ancestors.delete(value);
  return valid;
}

export function isIkaJsonRecord(value: unknown): value is IkaJsonRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    isIkaJsonValue(value)
  );
}

export function isIkaView(value: unknown): value is IkaView {
  if (
    !isIkaJsonRecord(value) ||
    !hasOnlyKeys(value, ["version", "kind", "props", "children", "text"]) ||
    value.version !== IKASUE_ABI_VERSION ||
    typeof value.kind !== "string"
  )
    return false;
  if (!(IKA_VIEW_KINDS as readonly string[]).includes(value.kind)) return false;
  if (
    value.props !== undefined &&
    (!isIkaViewProps(value.kind, value.props) ||
      Object.keys(value.props).some((key) => !IKA_VIEW_PROPERTY_KEYS.has(key)))
  )
    return false;
  if (value.children !== undefined && Array.isArray(value.props?.children))
    return false;
  if (value.text !== undefined && value.kind !== "text") return false;
  if (
    value.text !== undefined &&
    isIkaJsonRecord(value.props) &&
    value.props.content !== undefined
  )
    return false;
  if (
    (value.text !== undefined && Array.isArray(value.props?.children)) ||
    (value.text !== undefined && value.children !== undefined)
  )
    return false;
  if (
    value.children !== undefined &&
    (!Array.isArray(value.children) || !value.children.every(isIkaView))
  )
    return false;
  return value.text === undefined || typeof value.text === "string";
}

export function isIkaDataGridSelection(
  value: unknown,
): value is IkaDataGridSelection {
  if (!isIkaJsonRecord(value)) return false;
  if (!hasOnlyKeys(value, ["row", "column"])) return false;
  return (
    typeof value.row === "string" &&
    value.row.length > 0 &&
    typeof value.column === "string" &&
    value.column.length > 0
  );
}

function hasOnlyKeys(value: IkaJsonRecord, keys: readonly string[]): boolean {
  const allowed = new Set(keys);
  return Object.keys(value).every((key) => allowed.has(key));
}

export function isIkaError(value: unknown): value is IkaError {
  if (
    !isIkaJsonRecord(value) ||
    !hasOnlyKeys(value, ["code", "message", "details"])
  )
    return false;
  return (
    typeof value.code === "string" &&
    value.code.length > 0 &&
    typeof value.message === "string" &&
    value.message.length > 0 &&
    (value.details === undefined || isIkaJsonValue(value.details))
  );
}

export function isIkaMessage(value: unknown): value is IkaMessage {
  if (!isIkaJsonRecord(value) || value.version !== IKASUE_ABI_VERSION)
    return false;
  if (typeof value.type !== "string") return false;
  if (value.type === "request")
    return (
      hasOnlyKeys(value, ["version", "type", "id", "operation", "payload"]) &&
      typeof value.id === "number" &&
      Number.isInteger(value.id) &&
      value.id > 0 &&
      (value.operation === "rows" || value.operation === "update") &&
      ((value.operation === "rows" && isIkaRowRequest(value.payload)) ||
        (value.operation === "update" && isIkaJsonRecord(value.payload)))
    );
  if (value.type === "cancel")
    return (
      hasOnlyKeys(value, ["version", "type", "id"]) &&
      typeof value.id === "number" &&
      Number.isInteger(value.id) &&
      value.id > 0
    );
  if (value.type === "response")
    return (
      hasOnlyKeys(value, ["version", "type", "id", "result"]) &&
      typeof value.id === "number" &&
      Number.isInteger(value.id) &&
      value.id > 0 &&
      isIkaJsonRecord(value.result)
    );
  if (value.type === "error")
    return (
      hasOnlyKeys(value, ["version", "type", "id", "error"]) &&
      typeof value.id === "number" &&
      Number.isInteger(value.id) &&
      value.id > 0 &&
      isIkaError(value.error)
    );
  return (
    value.type === "event" &&
    hasOnlyKeys(value, ["version", "type", "event", "payload"]) &&
    typeof value.event === "string" &&
    value.event.length > 0 &&
    isIkaJsonRecord(value.payload)
  );
}

export function isIkaDataGridColumn(
  value: unknown,
): value is IkaDataGridColumn {
  if (!isIkaJsonRecord(value) || !hasOnlyKeys(value, ["id", "label", "width"]))
    return false;
  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.label === "string" &&
    (value.width === undefined ||
      (typeof value.width === "number" &&
        Number.isFinite(value.width) &&
        value.width >= 0))
  );
}

export function isIkaDataGridRow(value: unknown): value is IkaDataGridRow {
  if (!isIkaJsonRecord(value) || !hasOnlyKeys(value, ["id", "cells"]))
    return false;
  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    isIkaJsonRecord(value.cells) &&
    Object.values(value.cells).every(isDataGridCellValue)
  );
}

export function isIkaTabsItem(value: unknown): value is IkaTabsItem {
  if (
    !isIkaJsonRecord(value) ||
    !hasOnlyKeys(value, ["id", "label", "content", "disabled"])
  )
    return false;
  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.label === "string" &&
    (value.content === undefined || typeof value.content === "string") &&
    (value.disabled === undefined || typeof value.disabled === "boolean")
  );
}

export function isIkaSplitViewPane(value: unknown): value is IkaSplitViewPane {
  if (
    !isIkaJsonRecord(value) ||
    !hasOnlyKeys(value, [
      "id",
      "label",
      "content",
      "size",
      "minSize",
      "basis",
      "grow",
      "shrink",
      "collapsible",
      "disabled",
    ])
  )
    return false;
  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    (value.label === undefined || typeof value.label === "string") &&
    (value.content === undefined || typeof value.content === "string") &&
    (value.size === undefined || isSplitBasis(value.size)) &&
    (value.minSize === undefined || isMinSize(value.minSize)) &&
    (value.basis === undefined ||
      (typeof value.basis === "string" && isSplitBasis(value.basis)) ||
      (typeof value.basis === "number" &&
        Number.isFinite(value.basis) &&
        value.basis >= 0)) &&
    (value.grow === undefined ||
      (typeof value.grow === "number" &&
        Number.isFinite(value.grow) &&
        value.grow >= 0)) &&
    (value.shrink === undefined ||
      (typeof value.shrink === "number" &&
        Number.isFinite(value.shrink) &&
        value.shrink >= 0)) &&
    (value.collapsible === undefined ||
      typeof value.collapsible === "boolean") &&
    (value.disabled === undefined || typeof value.disabled === "boolean")
  );
}
