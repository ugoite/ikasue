import { describe, expect, it } from "vitest";
import {
  commitDataGridCell,
  createDataGridState,
  setDataGridClipboard,
  setDataGridSelection,
} from "./data-grid";
import { dataGrid } from "./components";

describe("data grid state", () => {
  it("keeps row/column domains and selection separate from cell status", () => {
    const state = createDataGridState([
      { row: "r1", column: "c1", value: "A", state: "created" },
      { row: "r1", column: "c2", value: "B" },
    ]);
    expect(state.cells[0]).toMatchObject({ state: "created" });
    const selected = setDataGridSelection(state, { row: "r1", column: "c1" });
    expect(selected.selection).toEqual({ row: "r1", column: "c1" });
    const edited = commitDataGridCell(selected, "r1", "c1", "C");
    expect(edited.cells[0]).toMatchObject({
      value: "C",
      status: "dirty",
      state: "modified",
    });
    expect(edited.selection).toEqual(selected.selection);
  });

  it("keeps failed clipboard status from changing selection or cells", () => {
    const state = setDataGridSelection(
      createDataGridState([{ row: "r", column: "c", value: "x" }]),
      { row: "r", column: "c" },
    );
    const failed = setDataGridClipboard(state, "error");
    expect(failed.selection).toEqual(state.selection);
    expect(failed.cells).toEqual(state.cells);
    expect(setDataGridClipboard(failed, "idle").clipboard).toBe("idle");
  });

  it("normalizes the controlled component boundary", () => {
    const derived = dataGrid({
      columns: [{ id: "c", label: "c" }],
      rows: [{ id: "r", cells: { c: "x" } }],
      total: 1,
      loading: true,
      error: "Request failed",
      editable: true,
      density: "compact",
    });
    expect(derived.columns).toEqual([{ id: "c", label: "c" }]);
    expect(derived.rows).toEqual([{ id: "r", cells: { c: "x" } }]);
    expect(derived.total).toBe(1);
    expect(derived.loading).toBe(true);
    expect(derived.error).toBe("Request failed");
    expect(derived.editable).toBe(true);
    expect(derived.density).toBe("compact");
    expect(
      dataGrid({
        columns: [{ id: "c", label: "c" }],
        rows: [{ id: "r", cells: { c: { raw: true } } }],
      }).rows,
    ).toEqual([{ id: "r", cells: {} }]);
  });

  it("creates a dirty cell when a valid domain coordinate was blank", () => {
    const state = createDataGridState([], {
      rowIds: ["r1"],
      columnIds: ["c1"],
    });
    const edited = commitDataGridCell(state, "r1", "c1", "value");
    expect(edited.cells).toEqual([
      {
        row: "r1",
        column: "c1",
        value: "value",
        status: "dirty",
        state: "modified",
      },
    ]);
  });
});
