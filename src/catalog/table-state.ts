import type { FormFieldStatus } from "./form-state";

export interface TableCellSeed {
  readonly id: string;
  readonly value: string;
  readonly status?: FormFieldStatus;
}

export interface TableCellState {
  readonly id: string;
  readonly initialValue: string;
  readonly initialStatus: FormFieldStatus;
  readonly value: string;
  readonly status: FormFieldStatus;
}

export interface TableState {
  readonly cells: Readonly<Record<string, TableCellState>>;
}

const DEFAULT_STATUS: FormFieldStatus = "clean";

function statusForValue(cell: TableCellState, value: string): FormFieldStatus {
  return value === cell.initialValue ? cell.initialStatus : "modified";
}

export function createTableState(seeds: readonly TableCellSeed[]): TableState {
  const cells: Record<string, TableCellState> = {};
  for (const seed of seeds) {
    const initialStatus = seed.status ?? DEFAULT_STATUS;
    cells[seed.id] = {
      id: seed.id,
      initialValue: seed.value,
      initialStatus,
      value: seed.value,
      status: initialStatus,
    };
  }
  return { cells };
}

export function getTableCell(
  state: TableState,
  cellId: string,
): TableCellState | undefined {
  return state.cells[cellId];
}

/**
 * Applies an explicit cell commit. Focus and selection never call this
 * function, so they cannot change the table's data status.
 */
export function commitTableCell(
  state: TableState,
  cellId: string,
  value: string,
): TableState {
  const cell = getTableCell(state, cellId);
  if (!cell) return state;

  const status = statusForValue(cell, value);
  if (cell.value === value && cell.status === status) return state;

  return {
    cells: {
      ...state.cells,
      [cellId]: { ...cell, value, status },
    },
  };
}
