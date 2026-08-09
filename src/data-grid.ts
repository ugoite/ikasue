import type { DataGridCell, DataGridSelection, DataGridState } from "./types";

const record = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;
const validCell = (value: unknown): DataGridCell | undefined => {
  const cell = record(value);
  if (
    typeof cell?.row !== "string" ||
    !cell.row.trim() ||
    typeof cell.column !== "string" ||
    !cell.column.trim() ||
    typeof cell.value !== "string"
  )
    return undefined;
  return {
    row: cell.row.trim(),
    column: cell.column.trim(),
    value: cell.value,
    status:
      cell.status === "dirty" || cell.status === "error"
        ? cell.status
        : "clean",
  };
};
const unique = (values: readonly unknown[]) => [
  ...new Set(
    values
      .filter((value) => typeof value === "string" && value.trim())
      .map((value) => (value as string).trim()),
  ),
];
const normalizeSelection = (value: unknown): DataGridSelection | undefined => {
  const source = record(value);
  return typeof source?.row === "string" &&
    typeof source.column === "string" &&
    source.row.trim() &&
    source.column.trim()
    ? { row: source.row.trim(), column: source.column.trim() }
    : undefined;
};
const sameSelection = (
  a: DataGridSelection | undefined,
  b: DataGridSelection | undefined,
) => a?.row === b?.row && a?.column === b?.column;

export function createDataGridState(
  cells: readonly DataGridCell[],
  initial?: Partial<DataGridState>,
): DataGridState {
  const source: DataGridCell[] = [];
  const coordinates = new Set<string>();
  for (const input of Array.isArray(cells) ? cells : []) {
    const cell = validCell(input);
    if (!cell || coordinates.has(`${cell.row}\u0000${cell.column}`)) continue;
    coordinates.add(`${cell.row}\u0000${cell.column}`);
    source.push(cell);
  }
  const rowIds = Array.isArray(initial?.rowIds)
    ? unique(initial.rowIds)
    : unique(source.map((cell) => cell.row));
  const columnIds = Array.isArray(initial?.columnIds)
    ? unique(initial.columnIds)
    : unique(source.map((cell) => cell.column));
  const allowed = source.filter(
    (cell) => rowIds.includes(cell.row) && columnIds.includes(cell.column),
  );
  const initialSelection = normalizeSelection(initial?.selection);
  const selected =
    initialSelection &&
    rowIds.includes(initialSelection.row) &&
    columnIds.includes(initialSelection.column)
      ? initialSelection
      : undefined;
  const initialEditing = normalizeSelection(initial?.editing);
  const editing =
    initialEditing &&
    rowIds.includes(initialEditing.row) &&
    columnIds.includes(initialEditing.column)
      ? initialEditing
      : undefined;
  return Object.freeze({
    rowIds: Object.freeze(rowIds),
    columnIds: Object.freeze(columnIds),
    cells: Object.freeze(allowed),
    ...(selected ? { selection: selected } : {}),
    ...(editing ? { editing } : {}),
    clipboard:
      initial?.clipboard === "copying" ||
      initial?.clipboard === "pasting" ||
      initial?.clipboard === "error"
        ? initial.clipboard
        : "idle",
  });
}
export function getDataGridCell(
  state: DataGridState,
  row: string,
  column: string,
): DataGridCell | undefined {
  return state.cells.find((cell) => cell.row === row && cell.column === column);
}
export function setDataGridSelection(
  state: DataGridState,
  selection?: DataGridSelection,
): DataGridState {
  const nextSelection = normalizeSelection(selection);
  if (
    selection !== undefined &&
    (!nextSelection ||
      !state.rowIds.includes(nextSelection.row) ||
      !state.columnIds.includes(nextSelection.column))
  )
    return state;
  const nextClipboard = state.clipboard === "error" ? "idle" : state.clipboard;
  if (
    sameSelection(state.selection, nextSelection) &&
    nextClipboard === state.clipboard
  )
    return state;
  const { selection: _selection, ...withoutSelection } = state;
  void _selection;
  return Object.freeze({
    ...withoutSelection,
    ...(nextSelection ? { selection: nextSelection } : {}),
    clipboard: nextClipboard,
  });
}
export function setDataGridClipboard(
  state: DataGridState,
  clipboard: DataGridState["clipboard"],
): DataGridState {
  const requested: unknown = clipboard;
  if (
    requested !== "idle" &&
    requested !== "copying" &&
    requested !== "pasting" &&
    requested !== "error"
  )
    return state;
  return state.clipboard === clipboard
    ? state
    : Object.freeze({ ...state, clipboard });
}
export function commitDataGridCell(
  state: DataGridState,
  row: string,
  column: string,
  value: string,
): DataGridState {
  if (
    !state.rowIds.includes(row) ||
    !state.columnIds.includes(column) ||
    typeof value !== "string"
  )
    return state;
  const index = state.cells.findIndex(
    (cell) => cell.row === row && cell.column === column,
  );
  const current = index >= 0 ? state.cells[index] : undefined;
  if (!current) {
    const cells = state.cells.concat({ row, column, value, status: "dirty" });
    return Object.freeze({ ...state, cells: Object.freeze(cells) });
  }
  if (current.value === value) return state;
  const cells = state.cells.slice();
  cells[index] = { ...current, value, status: "dirty" };
  return Object.freeze({ ...state, cells: Object.freeze(cells) });
}
