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
  | "rule"
  | "status-icon"
  | "vertical"
  | "horizontal"
  | "icon-action"
  | "action-strip"
  | "boolean-text"
  | "choice-group"
  | "form-list"
  | "data-grid"
  | "data-table"
  | "history-gutter"
  | "history-timeline"
  | "progress-region"
  | "message-region"
  | "bottom-dialog"
  | "tabs"
  | "split-view";

export const IKA_VIEW_KINDS: readonly IkaViewKind[] = [
  "theme-root",
  "text",
  "rule",
  "status-icon",
  "vertical",
  "horizontal",
  "icon-action",
  "action-strip",
  "boolean-text",
  "choice-group",
  "form-list",
  "data-grid",
  "data-table",
  "history-gutter",
  "history-timeline",
  "progress-region",
  "message-region",
  "bottom-dialog",
  "tabs",
  "split-view",
] as const;

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

export type IkaMessage =
  | {
      readonly version: typeof IKASUE_ABI_VERSION;
      readonly type: "request";
      readonly id: number;
      readonly operation: "rows" | "update";
      readonly payload: IkaJsonValue;
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
      readonly result: IkaJsonValue;
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
      readonly payload: IkaJsonValue;
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
  if (value.props !== undefined && !isIkaJsonRecord(value.props)) return false;
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
      isIkaJsonValue(value.payload)
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
      isIkaJsonValue(value.result)
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
    isIkaJsonValue(value.payload)
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
