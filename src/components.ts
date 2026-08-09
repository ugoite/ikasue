/* eslint-disable @typescript-eslint/no-unnecessary-condition */

import type {
  AlertOptions,
  AlertSpec,
  CheckboxOptions,
  CheckboxSpec,
  DataGridCell,
  DataGridSelection,
  DataGridOptions,
  DataGridSpec,
  EditableTextOptions,
  EditableTextSpec,
  FieldOptions,
  FieldSpec,
  FormOptions,
  FormSpec,
  HistoryTimelineOptions,
  HistoryTimelineSpec,
  IconButtonOptions,
  IconButtonSpec,
  NormalizedChoiceOption,
  NormalizedItem,
  RadioGroupOptions,
  RadioGroupSpec,
  SegmentedControlOptions,
  SegmentedControlSpec,
  SidebarOptions,
  SidebarSpec,
  StatusIndicatorOptions,
  StatusIndicatorSpec,
  TabsOptions,
  TabsSpec,
  TextFieldOptions,
  TextFieldSpec,
  TextOptions,
  TextSpec,
  ThemeRootOptions,
  ThemeRootSpec,
  ToolbarOptions,
  ToolbarSpec,
  ProgressOptions,
  ProgressSpec,
} from "./types";

type Mutable<T> = { -readonly [K in keyof T]: T[K] };

const text = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";
type UnknownRecord = Record<string, unknown>;
const record = (value: unknown): UnknownRecord | undefined =>
  typeof value === "object" && value !== null
    ? (value as UnknownRecord)
    : undefined;
const list = (value: unknown): readonly unknown[] =>
  Array.isArray(value) ? (value as readonly unknown[]) : [];
const items = (value: unknown): NormalizedItem[] => {
  const ids = new Set<string>();
  return list(value).flatMap((item) => {
    const source = record(item);
    const id = typeof source?.id === "string" ? source.id.trim() : "";
    const label = typeof source?.label === "string" ? source.label.trim() : "";
    if (!id || !label || typeof source?.content !== "string" || ids.has(id))
      return [];
    ids.add(id);
    return [
      {
        id,
        label,
        content: source.content,
        disabled: source.disabled === true,
      },
    ];
  });
};
const selected = (
  values: readonly { id: string; disabled: boolean }[],
  value: unknown,
): string | undefined => {
  const requested =
    typeof value === "string" &&
    values.some((item) => item.id === value && !item.disabled)
      ? value
      : undefined;
  if (requested) return requested;
  return values.find((item) => !item.disabled)?.id;
};
const choices = (value: unknown): NormalizedChoiceOption[] => {
  const ids = new Set<string>();
  return list(value).flatMap((item) => {
    const source = record(item);
    const id = typeof source?.id === "string" ? source.id.trim() : "";
    const label = typeof source?.label === "string" ? source.label.trim() : "";
    if (!id || !label || !label.trim() || ids.has(id)) return [];
    ids.add(id);
    return [{ id, label, disabled: source?.disabled === true }];
  });
};

export function themeRoot(options?: ThemeRootOptions): ThemeRootSpec {
  const tokens: Record<string, string> = {};
  if (options?.tokens && typeof options.tokens === "object")
    for (const [key, value] of Object.entries(options.tokens))
      if (key.trim() && typeof value === "string") tokens[key.trim()] = value;
  return Object.freeze({
    kind: "theme-root",
    tokens: Object.freeze(tokens),
    variant:
      options?.variant === "quiet" || options?.variant === "dense"
        ? options.variant
        : "default",
  });
}
export function tabs(options: TabsOptions): TabsSpec {
  const normalized = items(options?.items);
  const result: Mutable<TabsSpec> = {
    kind: "tabs",
    items: normalized,
    variant: options?.variant === "elastic" ? "elastic" : "default",
    orientation:
      options?.orientation === "vertical" ? "vertical" : "horizontal",
  };
  const active = selected(normalized, options?.activeId);
  if (active) result.activeId = active;
  if (typeof options?.onActiveChange === "function")
    result.onActiveChange = options.onActiveChange;
  return Object.freeze(result);
}
export function sidebar(options: SidebarOptions): SidebarSpec {
  const normalized = items(options?.items);
  const result: Mutable<SidebarSpec> = {
    kind: "sidebar",
    items: normalized,
    collapsed: options?.collapsed === true,
  };
  const active = selected(normalized, options?.activeId);
  if (active) result.activeId = active;
  if (typeof options?.onActiveChange === "function")
    result.onActiveChange = options.onActiveChange;
  return Object.freeze(result);
}
export function toolbar(options: ToolbarOptions): ToolbarSpec {
  const used = new Set<string>();
  const normalized = list(options?.items).flatMap((value) => {
    const item = record(value);
    if (
      typeof item?.id !== "string" ||
      !item.id.trim() ||
      typeof item.label !== "string" ||
      !item.label.trim() ||
      used.has(item.id.trim())
    )
      return [];
    const id = item.id.trim();
    used.add(id);
    const result: Mutable<ToolbarSpec["items"][number]> = {
      id,
      label: item.label.trim(),
      disabled: item.disabled === true,
    };
    if (typeof item.onSelect === "function")
      result.onSelect = item.onSelect as () => void;
    return [result];
  });
  return Object.freeze({
    kind: "toolbar",
    items: normalized,
    overflow: options?.overflow === "menu" ? "menu" : "none",
  });
}
export function iconButton(options: IconButtonOptions): IconButtonSpec {
  const result: Mutable<IconButtonSpec> = {
    kind: "icon-button",
    label: text(options?.label),
    type:
      options?.type === "submit" || options?.type === "reset"
        ? options.type
        : "button",
    disabled: options?.disabled === true,
    pressed: options?.pressed === true,
  };
  if (text(options?.id)) result.id = text(options?.id);
  if (text(options?.icon)) result.icon = text(options?.icon);
  if (typeof options?.onClick === "function") result.onClick = options.onClick;
  return Object.freeze(result);
}
export function textComponent(options: TextOptions): TextSpec {
  return Object.freeze({
    kind: "text",
    content: text(options?.content),
    tone:
      options?.tone === "muted" ||
      options?.tone === "danger" ||
      options?.tone === "success"
        ? options.tone
        : "default",
    selectable: options?.selectable !== false,
  });
}
export function textField(options: TextFieldOptions): TextFieldSpec {
  const result: Mutable<TextFieldSpec> = {
    kind: "text-field",
    id: text(options?.id),
    label: text(options?.label),
    value: text(options?.value),
    placeholder: text(options?.placeholder),
    disabled: options?.disabled === true,
    required: options?.required === true,
  };
  if (text(options?.description))
    result.description = text(options?.description);
  if (text(options?.error)) result.error = text(options?.error);
  if (typeof options?.onInput === "function") result.onInput = options.onInput;
  return Object.freeze(result);
}
export function editableText(options: EditableTextOptions): EditableTextSpec {
  const result: Mutable<EditableTextSpec> = {
    kind: "editable-text",
    value: text(options?.value),
    disabled: options?.disabled === true,
  };
  if (text(options?.id)) result.id = text(options?.id);
  if (typeof options?.onCommit === "function")
    result.onCommit = options.onCommit;
  if (typeof options?.onCancel === "function")
    result.onCancel = options.onCancel;
  return Object.freeze(result);
}
export function checkbox(options: CheckboxOptions): CheckboxSpec {
  const result: Mutable<CheckboxSpec> = {
    kind: "checkbox",
    id: text(options?.id),
    label: text(options?.label),
    checked: options?.checked === true,
    disabled: options?.disabled === true,
  };
  if (typeof options?.onChange === "function")
    result.onChange = options.onChange;
  return Object.freeze(result);
}
const choiceResult = (
  kind: "radio-group" | "segmented-control",
  options?: RadioGroupOptions | SegmentedControlOptions,
): RadioGroupSpec | SegmentedControlSpec => {
  const normalized = choices(options?.options);
  const value = selected(normalized, options?.value);
  const id = text(options?.id);
  if (kind === "radio-group") {
    const result: Mutable<RadioGroupSpec> = {
      kind,
      options: normalized,
      disabled: options?.disabled === true,
    };
    if (value) result.value = value;
    if (id) result.id = id;
    if (typeof options?.onChange === "function")
      result.onChange = options.onChange;
    return Object.freeze(result);
  }
  const result: Mutable<SegmentedControlSpec> = {
    kind,
    options: normalized,
    disabled: options?.disabled === true,
    variant:
      (options as SegmentedControlOptions | undefined)?.variant === "elastic"
        ? "elastic"
        : "default",
  };
  if (value) result.value = value;
  if (id) result.id = id;
  if (typeof options?.onChange === "function")
    result.onChange = options.onChange;
  return Object.freeze(result);
};
export function radioGroup(options: RadioGroupOptions): RadioGroupSpec {
  return choiceResult("radio-group", options) as RadioGroupSpec;
}
export function segmentedControl(
  options: SegmentedControlOptions,
): SegmentedControlSpec {
  return choiceResult("segmented-control", options) as SegmentedControlSpec;
}
export function field(options: FieldOptions): FieldSpec {
  const result: Mutable<FieldSpec> = {
    kind: "field",
    id: text(options?.id),
    label: text(options?.label),
    required: options?.required === true,
    content: text(options?.content),
  };
  if (text(options?.description))
    result.description = text(options?.description);
  if (text(options?.error)) result.error = text(options?.error);
  return Object.freeze(result);
}
export function form(options: FormOptions): FormSpec {
  const ids = new Set<string>();
  const fields = list(options?.fields).flatMap((value) => {
    const source = record(value);
    const id = typeof source?.id === "string" ? source.id.trim() : "";
    const label = typeof source?.label === "string" ? source.label.trim() : "";
    if (!id || !label || !label.trim() || ids.has(id)) return [];
    ids.add(id);
    const field: Mutable<FormSpec["fields"][number]> = { id, label };
    if (typeof source?.initialValue === "string")
      field.initialValue = source.initialValue;
    if (source?.required === true) field.required = true;
    return [field];
  });
  const values: Record<string, string> = {};
  for (const field of fields)
    values[field.id.trim()] =
      options?.values?.[field.id] ?? text(field.initialValue);
  const result: Mutable<FormSpec> = {
    kind: "form",
    fields,
    values,
    status:
      options?.status === "clean" ||
      options?.status === "dirty" ||
      options?.status === "submitting" ||
      options?.status === "success" ||
      options?.status === "error"
        ? options.status
        : "idle",
  };
  if (typeof options?.onSubmit === "function")
    result.onSubmit = options.onSubmit;
  return Object.freeze(result);
}
export function dataGrid(options: DataGridOptions): DataGridSpec {
  const sourceOptions = record(options);
  const columnsProvided = Boolean(sourceOptions && "columns" in sourceOptions);
  const rowsProvided = Boolean(sourceOptions && "rows" in sourceOptions);
  const columnIds = new Set<string>();
  const columns = list(options?.columns).flatMap((value) => {
    const source = record(value);
    const id = typeof source?.id === "string" ? source.id.trim() : "";
    const label = typeof source?.label === "string" ? source.label.trim() : "";
    if (!id || !label || columnIds.has(id)) return [];
    columnIds.add(id);
    return [{ id, label }];
  });
  const rowIds = new Set<string>();
  const rows = list(options?.rows).flatMap((value) => {
    const source = record(value);
    const id = typeof source?.id === "string" ? source.id.trim() : "";
    if (!id || rowIds.has(id)) return [];
    rowIds.add(id);
    return [
      typeof source?.label === "string"
        ? { id, label: source.label.trim() }
        : { id },
    ];
  });
  const coordinates = new Set<string>();
  const normalizedCells = list(options?.cells).flatMap((value) => {
    const source = record(value);
    const row = typeof source?.row === "string" ? source.row.trim() : "";
    const column =
      typeof source?.column === "string" ? source.column.trim() : "";
    const cellValue =
      typeof source?.value === "string" ? source.value : undefined;
    if (
      !row ||
      !column ||
      cellValue === undefined ||
      coordinates.has(`${row}\u0000${column}`)
    )
      return [];
    coordinates.add(`${row}\u0000${column}`);
    const status: DataGridCell["status"] =
      source?.status === "dirty" || source?.status === "error"
        ? source.status
        : "clean";
    return [{ row, column, value: cellValue, status }];
  });
  const materializedColumns = columnsProvided
    ? columns
    : Array.from(new Set(normalizedCells.map((cell) => cell.column))).map(
        (id) => ({ id, label: id }),
      );
  const materializedRows = rowsProvided
    ? rows
    : Array.from(new Set(normalizedCells.map((cell) => cell.row))).map(
        (id) => ({
          id,
          label: id,
        }),
      );
  const validColumnIds = new Set(
    materializedColumns.map((column) => column.id),
  );
  const validRowIds = new Set(materializedRows.map((row) => row.id));
  const cells = normalizedCells.filter(
    (cell) => validColumnIds.has(cell.column) && validRowIds.has(cell.row),
  );
  const normalizeTarget = (value: unknown): DataGridSelection | undefined => {
    const target = record(value);
    const row = typeof target?.row === "string" ? target.row.trim() : "";
    const column =
      typeof target?.column === "string" ? target.column.trim() : "";
    return row && column && validRowIds.has(row) && validColumnIds.has(column)
      ? { row, column }
      : undefined;
  };
  const result: Mutable<DataGridSpec> = {
    kind: "data-grid",
    columns: materializedColumns,
    rows: materializedRows,
    columnsProvided,
    rowsProvided,
    cells,
  };
  const selection = normalizeTarget(options?.selection);
  const editing = normalizeTarget(options?.editing);
  if (selection)
    result.selection = { row: selection.row, column: selection.column };
  if (editing) result.editing = { row: editing.row, column: editing.column };
  if (typeof options?.onSelect === "function")
    result.onSelect = options.onSelect;
  if (typeof options?.onEdit === "function") result.onEdit = options.onEdit;
  if (typeof options?.onCopy === "function") result.onCopy = options.onCopy;
  if (typeof options?.onPaste === "function") result.onPaste = options.onPaste;
  return Object.freeze(result);
}
export function statusIndicator(
  options: StatusIndicatorOptions,
): StatusIndicatorSpec {
  const result: Mutable<StatusIndicatorSpec> = {
    kind: "status-indicator",
    label: text(options?.label),
    status:
      options?.status === "info" ||
      options?.status === "success" ||
      options?.status === "warning" ||
      options?.status === "danger"
        ? options.status
        : "neutral",
  };
  if (text(options?.id)) result.id = text(options?.id);
  if (text(options?.icon)) result.icon = text(options?.icon);
  if (text(options?.targetId)) result.targetId = text(options?.targetId);
  return Object.freeze(result);
}
export function alert(options: AlertOptions): AlertSpec {
  const result: Mutable<AlertSpec> = {
    kind: "alert",
    message: text(options?.message),
    severity:
      options?.severity === "success" ||
      options?.severity === "warning" ||
      options?.severity === "danger"
        ? options.severity
        : "info",
    dismissible: options?.dismissible === true,
  };
  if (text(options?.id)) result.id = text(options?.id);
  if (typeof options?.onDismiss === "function")
    result.onDismiss = options.onDismiss;
  return Object.freeze(result);
}
export function progress(options: ProgressOptions): ProgressSpec {
  const max =
    typeof options?.max === "number" &&
    Number.isFinite(options.max) &&
    options.max > 0
      ? options.max
      : 100;
  const result: Mutable<ProgressSpec> = {
    kind: "progress",
    max,
    label: text(options?.label),
  };
  if (
    typeof options?.value === "number" &&
    Number.isFinite(options.value) &&
    options.value >= 0 &&
    options.value <= max
  )
    result.value = options.value;
  return Object.freeze(result);
}
export function historyTimeline(
  options: HistoryTimelineOptions,
): HistoryTimelineSpec {
  const ids = new Set<string>();
  const entries = list(options?.entries).flatMap((value) => {
    const entry = record(value);
    const id = typeof entry?.id === "string" ? entry.id.trim() : "";
    const label = typeof entry?.label === "string" ? entry.label.trim() : "";
    if (!id || !label || typeof entry?.content !== "string" || ids.has(id))
      return [];
    ids.add(id);
    const tone: HistoryTimelineSpec["entries"][number]["tone"] =
      entry.tone === "muted" ||
      entry.tone === "success" ||
      entry.tone === "danger"
        ? entry.tone
        : "default";
    return [
      {
        id,
        label,
        content: entry.content,
        tone,
      },
    ];
  });
  return Object.freeze({
    kind: "history-timeline",
    entries,
    orientation:
      options?.orientation === "horizontal" ? "horizontal" : "vertical",
  });
}
