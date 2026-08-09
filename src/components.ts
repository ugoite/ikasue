import type {
  AlertOptions,
  AlertSpec,
  CheckboxOptions,
  CheckboxSpec,
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
    if (!id || !label || ids.has(id)) return [];
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
export function tabs(options?: TabsOptions): TabsSpec {
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
  if (options?.onActiveChange) result.onActiveChange = options.onActiveChange;
  return Object.freeze(result);
}
export function sidebar(options?: SidebarOptions): SidebarSpec {
  const normalized = items(options?.items);
  const result: Mutable<SidebarSpec> = {
    kind: "sidebar",
    items: normalized,
    collapsed: options?.collapsed === true,
  };
  const active = selected(normalized, options?.activeId);
  if (active) result.activeId = active;
  if (options?.onActiveChange) result.onActiveChange = options.onActiveChange;
  return Object.freeze(result);
}
export function toolbar(options?: ToolbarOptions): ToolbarSpec {
  const used = new Set<string>();
  const normalized = (options?.items ?? []).flatMap((item) => {
    if (
      typeof item.id !== "string" ||
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
    if (item.onSelect) result.onSelect = item.onSelect;
    return [result];
  });
  return Object.freeze({
    kind: "toolbar",
    items: normalized,
    overflow: options?.overflow === "menu" ? "menu" : "none",
  });
}
export function iconButton(options?: IconButtonOptions): IconButtonSpec {
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
  if (options?.onClick) result.onClick = options.onClick;
  return Object.freeze(result);
}
export function textComponent(options?: TextOptions): TextSpec {
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
export function textField(options?: TextFieldOptions): TextFieldSpec {
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
  if (options?.onInput) result.onInput = options.onInput;
  return Object.freeze(result);
}
export function editableText(options?: EditableTextOptions): EditableTextSpec {
  const result: Mutable<EditableTextSpec> = {
    kind: "editable-text",
    value: text(options?.value),
    disabled: options?.disabled === true,
  };
  if (text(options?.id)) result.id = text(options?.id);
  if (options?.onCommit) result.onCommit = options.onCommit;
  if (options?.onCancel) result.onCancel = options.onCancel;
  return Object.freeze(result);
}
export function checkbox(options?: CheckboxOptions): CheckboxSpec {
  const result: Mutable<CheckboxSpec> = {
    kind: "checkbox",
    id: text(options?.id),
    label: text(options?.label),
    checked: options?.checked === true,
    disabled: options?.disabled === true,
  };
  if (options?.onChange) result.onChange = options.onChange;
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
    if (options?.onChange) result.onChange = options.onChange;
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
  if (options?.onChange) result.onChange = options.onChange;
  return Object.freeze(result);
};
export function radioGroup(options?: RadioGroupOptions): RadioGroupSpec {
  return choiceResult("radio-group", options) as RadioGroupSpec;
}
export function segmentedControl(
  options?: SegmentedControlOptions,
): SegmentedControlSpec {
  return choiceResult("segmented-control", options) as SegmentedControlSpec;
}
export function field(options?: FieldOptions): FieldSpec {
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
export function form(options?: FormOptions): FormSpec {
  const ids = new Set<string>();
  const fields = (options?.fields ?? []).filter((field) => {
    const id = field.id.trim();
    if (!id || ids.has(id)) return false;
    ids.add(id);
    return true;
  });
  const values: Record<string, string> = {};
  for (const field of fields)
    values[field.id.trim()] =
      options?.values?.[field.id] ?? text(field.initialValue);
  const result: Mutable<FormSpec> = {
    kind: "form",
    fields,
    values,
    status: options?.status ?? "idle",
  };
  if (options?.onSubmit) result.onSubmit = options.onSubmit;
  return Object.freeze(result);
}
export function dataGrid(options?: DataGridOptions): DataGridSpec {
  const columnsProvided = options?.columns !== undefined;
  const rowsProvided = options?.rows !== undefined;
  const columns = options?.columns ?? [];
  const rows = options?.rows ?? [];
  const cells = options?.cells ?? [];
  const result: Mutable<DataGridSpec> = {
    kind: "data-grid",
    columns,
    rows,
    columnsProvided,
    rowsProvided,
    cells,
  };
  if (options?.selection) result.selection = options.selection;
  if (options?.editing) result.editing = options.editing;
  if (options?.onSelect) result.onSelect = options.onSelect;
  if (options?.onEdit) result.onEdit = options.onEdit;
  if (options?.onCopy) result.onCopy = options.onCopy;
  if (options?.onPaste) result.onPaste = options.onPaste;
  return Object.freeze(result);
}
export function statusIndicator(
  options?: StatusIndicatorOptions,
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
export function alert(options?: AlertOptions): AlertSpec {
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
  if (options?.onDismiss) result.onDismiss = options.onDismiss;
  return Object.freeze(result);
}
export function progress(options?: ProgressOptions): ProgressSpec {
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
  options?: HistoryTimelineOptions,
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
