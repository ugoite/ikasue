/**
 * The stable, language-neutral part of the ikasue Web ABI.
 *
 * Keep this module data-only. Runtime bindings may add methods, promises and
 * DOM objects around these values, but values crossing a host boundary must
 * remain JSON values.
 */

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
  "role",
  "items",
  "activeId",
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
  "editable",
  "entries",
  "panes",
  "sizes",
  "collapsible",
  "motionOrigin",
  "title",
  "open",
  "side",
  "busy",
  "message",
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
  readonly editable?: boolean;
}

export interface IkaTabsItem {
  readonly id: string;
  readonly label: string;
  readonly disabled?: boolean;
}

export interface IkaTabsSpec {
  readonly items: readonly IkaTabsItem[];
  readonly activeId?: string;
}

export interface IkaSplitViewPane {
  readonly id: string;
  readonly label?: string;
  readonly content?: string;
  readonly basis?: number;
}

export interface IkaSplitViewSpec {
  readonly panes: readonly IkaSplitViewPane[];
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
    (!isIkaJsonRecord(value.props) ||
      Object.keys(value.props).some((key) => !IKA_VIEW_PROPERTY_KEYS.has(key)))
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
    isIkaJsonRecord(value.cells)
  );
}

export function isIkaTabsItem(value: unknown): value is IkaTabsItem {
  if (
    !isIkaJsonRecord(value) ||
    !hasOnlyKeys(value, ["id", "label", "disabled"])
  )
    return false;
  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.label === "string" &&
    (value.disabled === undefined || typeof value.disabled === "boolean")
  );
}

export function isIkaSplitViewPane(value: unknown): value is IkaSplitViewPane {
  if (
    !isIkaJsonRecord(value) ||
    !hasOnlyKeys(value, ["id", "label", "content", "basis"])
  )
    return false;
  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    (value.label === undefined || typeof value.label === "string") &&
    (value.content === undefined || typeof value.content === "string") &&
    (value.basis === undefined ||
      (typeof value.basis === "number" &&
        Number.isFinite(value.basis) &&
        value.basis >= 0))
  );
}
