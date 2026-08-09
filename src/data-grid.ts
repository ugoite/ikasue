import type { DataGridCell, DataGridSelection, DataGridState } from "./types";

const validCell = (cell: DataGridCell): DataGridCell => ({
  row: cell.row.trim(),
  column: cell.column.trim(),
  value: cell.value,
  status:
    cell.status === "dirty" || cell.status === "error" ? cell.status : "clean",
});
const unique = (values: readonly string[]) => [
  ...new Set(
    values
      .filter((value) => typeof value === "string" && value.trim())
      .map((value) => value.trim()),
  ),
];
const sameSelection = (
  a: DataGridSelection | undefined,
  b: DataGridSelection | undefined,
) => a?.row === b?.row && a?.column === b?.column;

export function createDataGridState(
  cells: readonly DataGridCell[] = [],
  initial?: Partial<DataGridState>,
): DataGridState {
  const source: DataGridCell[] = [];
  const coordinates = new Set<string>();
  for (const input of cells) {
    const cell = validCell(input);
    if (coordinates.has(`${cell.row}\u0000${cell.column}`)) continue;
    coordinates.add(`${cell.row}\u0000${cell.column}`);
    source.push(cell);
  }
  const rowIds = initial?.rowIds
    ? unique(initial.rowIds)
    : unique(source.map((cell) => cell.row));
  const columnIds = initial?.columnIds
    ? unique(initial.columnIds)
    : unique(source.map((cell) => cell.column));
  const allowed = source.filter(
    (cell) => rowIds.includes(cell.row) && columnIds.includes(cell.column),
  );
  const selection =
    initial?.selection &&
    rowIds.includes(initial.selection.row) &&
    columnIds.includes(initial.selection.column)
      ? initial.selection
      : undefined;
  const editing =
    initial?.editing &&
    rowIds.includes(initial.editing.row) &&
    columnIds.includes(initial.editing.column)
      ? initial.editing
      : undefined;
  return Object.freeze({
    rowIds: Object.freeze(rowIds),
    columnIds: Object.freeze(columnIds),
    cells: Object.freeze(allowed),
    ...(selection ? { selection } : {}),
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
  if (
    selection &&
    (!state.rowIds.includes(selection.row) ||
      !state.columnIds.includes(selection.column))
  )
    return state;
  const nextClipboard = state.clipboard === "error" ? "idle" : state.clipboard;
  if (
    sameSelection(state.selection, selection) &&
    nextClipboard === state.clipboard
  )
    return state;
  return Object.freeze({
    ...state,
    ...(selection ? { selection } : {}),
    clipboard: nextClipboard,
  });
}
export function setDataGridClipboard(
  state: DataGridState,
  clipboard: DataGridState["clipboard"],
): DataGridState {
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
  if (!current || current.value === value) return state;
  const cells = state.cells.slice();
  cells[index] = { ...current, value, status: "dirty" };
  return Object.freeze({ ...state, cells: Object.freeze(cells) });
}
