import { describe, expect, it } from "vitest";
import {
  commitDataGridCell,
  createDataGridState,
  setDataGridClipboard,
  setDataGridSelection,
} from "./data-grid";

describe("data grid state", () => {
  it("keeps row/column domains and selection separate from cell status", () => {
    const state = createDataGridState([
      { row: "r1", column: "c1", value: "A" },
      { row: "r1", column: "c2", value: "B" },
    ]);
    const selected = setDataGridSelection(state, { row: "r1", column: "c1" });
    expect(selected.selection).toEqual({ row: "r1", column: "c1" });
    const edited = commitDataGridCell(selected, "r1", "c1", "C");
    expect(edited.cells[0]).toMatchObject({ value: "C", status: "dirty" });
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
});
