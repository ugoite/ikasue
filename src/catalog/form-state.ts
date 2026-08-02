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
 * Applies an explicit owner-side data update. Draft values held by an editor
 * never reach this function until its owner commits them.
 */
export function updateFormListField(
  state: FormListState,
  fieldId: string,
  value: string,
  status?: FormFieldStatus,
): FormListState {
  const field = getFormField(state, fieldId);
  if (!field) return state;

  const nextField: FormFieldState = {
    ...field,
    value,
    status: status ?? statusForValue(field, value),
  };
  return {
    fields: {
      ...state.fields,
      [fieldId]: nextField,
    },
  };
}

export function formListStatus(
  state: FormListState,
  fieldId: string,
): FormFieldStatus | undefined {
  return getFormField(state, fieldId)?.status;
}
