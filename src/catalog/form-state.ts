export type FormFieldStatus =
  "clean" | "created" | "modified" | "deleted" | "error";

export interface FormFieldSeed {
  readonly id: string;
  readonly value: string;
  readonly status?: FormFieldStatus;
}

export interface FormFieldState {
  readonly id: string;
  readonly initialValue: string;
  readonly initialStatus: FormFieldStatus;
  readonly value: string;
  readonly status: FormFieldStatus;
}

export interface FormListState {
  readonly fields: Readonly<Record<string, FormFieldState>>;
}

const DEFAULT_STATUS: FormFieldStatus = "clean";

function statusForValue(field: FormFieldState, value: string): FormFieldStatus {
  if (field.initialStatus === "error") return "error";
  if (field.initialStatus === "deleted") return "deleted";
  if (field.initialStatus === "created") return value ? "created" : "clean";
  return value === field.initialValue ? field.initialStatus : "modified";
}

export function createFormListState(
  seeds: readonly FormFieldSeed[],
): FormListState {
  const fields: Record<string, FormFieldState> = {};
  for (const seed of seeds) {
    const initialStatus = seed.status ?? DEFAULT_STATUS;
    fields[seed.id] = {
      id: seed.id,
      initialValue: seed.value,
      initialStatus,
      value: seed.value,
      status: initialStatus,
    };
  }
  return { fields };
}

export function getFormField(
  state: FormListState,
  fieldId: string,
): FormFieldState | undefined {
  return state.fields[fieldId];
}

/**
 * Applies all drafts in one explicit owner-side commit. Draft values held by
 * child editors never reach FormList state until this function is called.
 */
export function commitFormListFields(
  state: FormListState,
  drafts: Readonly<Record<string, string>>,
): FormListState {
  const fields = { ...state.fields };
  let changed = false;

  for (const [fieldId, value] of Object.entries(drafts)) {
    const field = getFormField(state, fieldId);
    if (!field) continue;

    const status = statusForValue(field, value);
    if (field.value === value && field.status === status) continue;

    fields[fieldId] = { ...field, value, status };
    changed = true;
  }

  return changed ? { fields } : state;
}

export function formListStatus(
  state: FormListState,
  fieldId: string,
): FormFieldStatus | undefined {
  return getFormField(state, fieldId)?.status;
}
