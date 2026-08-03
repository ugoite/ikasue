import { describe, expect, it } from "vitest";

import { commitTableCell, createTableState, getTableCell } from "./table-state";

describe("DataTable cell state ownership", () => {
  it("changes status only for a committed value different from the initial value", () => {
    const state = createTableState([{ id: "0:0", value: "Alpha" }]);

    expect(getTableCell(state, "0:0")).toMatchObject({
      value: "Alpha",
      initialValue: "Alpha",
      status: "clean",
    });

    const unchanged = commitTableCell(state, "0:0", "Alpha");
    const modified = commitTableCell(state, "0:0", "Alpine");
    const reverted = commitTableCell(modified, "0:0", "Alpha");

    expect(unchanged).toBe(state);
    expect(getTableCell(modified, "0:0")).toMatchObject({
      value: "Alpine",
      status: "modified",
    });
    expect(getTableCell(reverted, "0:0")).toMatchObject({
      value: "Alpha",
      status: "clean",
    });
  });

  it("preserves a seeded initial status until a commit changes the value", () => {
    const state = createTableState([
      { id: "0:0", value: "Alpha", status: "modified" },
      { id: "0:1", value: "Beta", status: "created" },
    ]);

    expect(getTableCell(state, "0:0")?.status).toBe("modified");
    expect(getTableCell(state, "0:1")?.status).toBe("created");

    const changed = commitTableCell(state, "0:1", "Beta 2");
    const reverted = commitTableCell(changed, "0:1", "Beta");

    expect(getTableCell(changed, "0:1")?.status).toBe("modified");
    expect(getTableCell(reverted, "0:1")?.status).toBe("created");
  });

  it("ignores commits for cells the table does not own", () => {
    const state = createTableState([{ id: "0:0", value: "Alpha" }]);

    expect(commitTableCell(state, "missing", "value")).toBe(state);
  });
});
