import { describe, expect, it } from "vitest";

import {
  createFormListState,
  formListStatus,
  getFormField,
  updateFormListField,
} from "./form-state";

describe("FormList state ownership", () => {
  it("keeps draft and focus local until an explicit update", () => {
    const state = createFormListState([
      { id: "name", value: "プロジェクト藍" },
      { id: "location", value: "東京オフィス", status: "clean" },
    ]);

    // An editor may hold this draft while focused; it is not FormList state.
    const draft = "プロジェクト蒼";
    expect(draft).not.toBe(getFormField(state, "name")?.value);
    expect(formListStatus(state, "name")).toBe("clean");
    expect(formListStatus(state, "location")).toBe("clean");
  });

  it("updates only the field explicitly committed by its owner", () => {
    const state = createFormListState([
      { id: "name", value: "プロジェクト藍" },
      { id: "location", value: "東京オフィス" },
    ]);

    const next = updateFormListField(state, "name", "プロジェクト蒼");

    expect(getFormField(next, "name")).toMatchObject({
      value: "プロジェクト蒼",
      status: "modified",
    });
    expect(getFormField(next, "location")).toBe(
      getFormField(state, "location"),
    );
  });

  it("computes a field status from the FormList values and baseline", () => {
    const state = createFormListState([
      { id: "name", value: "プロジェクト藍" },
      { id: "new-field", value: "", status: "created" },
    ]);

    const modified = updateFormListField(state, "name", "変更済み");
    const clean = updateFormListField(modified, "name", "プロジェクト藍");
    const created = updateFormListField(state, "new-field", "入力済み");

    expect(formListStatus(modified, "name")).toBe("modified");
    expect(formListStatus(clean, "name")).toBe("clean");
    expect(formListStatus(created, "new-field")).toBe("created");
  });
});
