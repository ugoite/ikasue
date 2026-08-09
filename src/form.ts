import type { FormField, FormState, FormStateStatus } from "./types";

const record = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;
const validFields = (fields: unknown): FormField[] => {
  const ids = new Set<string>();
  return (Array.isArray(fields) ? fields : []).flatMap((value) => {
    const field = record(value);
    if (
      typeof field?.id !== "string" ||
      !field.id.trim() ||
      typeof field.label !== "string" ||
      ids.has(field.id.trim())
    )
      return [];
    const id = field.id.trim();
    ids.add(id);
    const result: { -readonly [K in keyof FormField]: FormField[K] } = {
      id,
      label: field.label.trim(),
    };
    if (typeof field.initialValue === "string")
      result.initialValue = field.initialValue;
    if (field.required === true) result.required = true;
    return [result];
  });
};
const mapEqual = (
  a: Readonly<Record<string, string>>,
  b: Readonly<Record<string, string>>,
) => {
  const keys = Object.keys(a);
  const other = Object.keys(b);
  return keys.length === other.length && keys.every((key) => a[key] === b[key]);
};
const statusFor = (state: FormState): FormStateStatus =>
  Object.keys(state.drafts).some(
    (id) => state.drafts[id] !== state.values[id],
  ) ||
  Object.keys(state.values).some(
    (id) => state.values[id] !== state.initialValues[id],
  )
    ? "dirty"
    : "clean";
const clone = (value: Readonly<Record<string, string>>) =>
  Object.freeze({ ...value });
const without = (
  value: Readonly<Record<string, string>>,
  id: string,
): Record<string, string> =>
  Object.fromEntries(Object.entries(value).filter(([key]) => key !== id));

export function createFormState(
  fields: readonly FormField[],
  initial?: Readonly<Record<string, string>>,
): FormState {
  const normalized = validFields(fields);
  const initialValues: Record<string, string> = {};
  const values: Record<string, string> = {};
  for (const field of normalized) {
    const provided = initial?.[field.id];
    const value =
      typeof provided === "string" ? provided : (field.initialValue ?? "");
    initialValues[field.id] = value;
    values[field.id] = value;
  }
  return Object.freeze({
    fields: Object.freeze(normalized),
    initialValues: clone(initialValues),
    values: clone(values),
    drafts: Object.freeze({}),
    status: "idle" as const,
    errors: Object.freeze({}),
  });
}
export function getFormField(
  state: FormState,
  id: string,
): FormField | undefined {
  return state.fields.find((field) => field.id === id);
}
export function setFormDraft(
  state: FormState,
  id: string,
  value: string,
): FormState {
  if (!getFormField(state, id) || typeof value !== "string") return state;
  let drafts = { ...state.drafts };
  if (value === state.values[id]) drafts = without(drafts, id);
  else drafts[id] = value;
  if (mapEqual(drafts, state.drafts)) return state;
  const status =
    state.status === "submitting" || state.status === "error"
      ? state.status
      : state.status === "success" && value !== state.values[id]
        ? "dirty"
        : statusFor({ ...state, drafts });
  return Object.freeze({ ...state, drafts: clone(drafts), status });
}
export function setFormErrors(
  state: FormState,
  errors: Readonly<Record<string, string>>,
): FormState {
  const ids = new Set(state.fields.map((field) => field.id));
  const filtered: Record<string, string> = {};
  for (const [id, value] of Object.entries(record(errors) ?? {}))
    if ((id === "form" || ids.has(id)) && typeof value === "string" && value)
      filtered[id] = value;
  if (mapEqual(filtered, state.errors)) return state;
  const status = Object.keys(filtered).length
    ? "error"
    : state.status === "submitting"
      ? "submitting"
      : statusFor(state);
  return Object.freeze({ ...state, errors: clone(filtered), status });
}
export function setFormStatus(
  state: FormState,
  status: FormStateStatus,
): FormState {
  const requested: unknown = status;
  if (
    requested !== "idle" &&
    requested !== "clean" &&
    requested !== "dirty" &&
    requested !== "submitting" &&
    requested !== "success" &&
    requested !== "error"
  )
    return state;
  return state.status === status ? state : Object.freeze({ ...state, status });
}
export function commitFormFields(
  state: FormState,
  values: Readonly<Record<string, string>>,
): FormState {
  const ids = new Set(state.fields.map((field) => field.id));
  const nextValues = { ...state.values };
  let drafts = { ...state.drafts };
  let changed = false;
  for (const [id, value] of Object.entries(record(values) ?? {})) {
    if (!ids.has(id) || typeof value !== "string") continue;
    if (nextValues[id] !== value) {
      nextValues[id] = value;
      changed = true;
    }
    if (drafts[id] === undefined || drafts[id] === value) {
      if (drafts[id] !== undefined) {
        changed = true;
        drafts = without(drafts, id);
      }
    }
  }
  if (!changed) return state;
  const next = { ...state, values: clone(nextValues), drafts: clone(drafts) };
  const status =
    state.status === "submitting" || state.status === "error"
      ? state.status
      : state.status === "success" && !mapEqual(drafts, {})
        ? "dirty"
        : statusFor(next);
  return Object.freeze({ ...next, status });
}
export function formStateStatus(state: FormState): FormStateStatus {
  return state.status;
}
