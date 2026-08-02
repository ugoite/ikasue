import { describe, expect, it } from "vitest";

import {
  commitFormListFields,
  createFormListState,
  formListStatus,
  getFormField,
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

  it("applies all local drafts only when the owner explicitly commits them", () => {
    const state = createFormListState([
      { id: "name", value: "プロジェクト藍" },
      { id: "location", value: "東京オフィス" },
    ]);

    const drafts = {
      name: "プロジェクト蒼",
      location: "大阪オフィス",
    };
    expect(formListStatus(state, "name")).toBe("clean");
    expect(getFormField(state, "name")?.value).toBe("プロジェクト藍");

    const next = commitFormListFields(state, drafts);

    expect(getFormField(next, "name")).toMatchObject({
      value: "プロジェクト蒼",
      status: "modified",
    });
    expect(getFormField(next, "location")).toMatchObject({
      value: "大阪オフィス",
      status: "modified",
    });
  });

  it("returns a clean source status when a draft returns to its original value", () => {
    const state = createFormListState([
      { id: "name", value: "プロジェクト藍" },
    ]);

    const modified = commitFormListFields(state, { name: "変更済み" });
    const clean = commitFormListFields(modified, {
      name: "プロジェクト藍",
    });

    expect(formListStatus(modified, "name")).toBe("modified");
    expect(formListStatus(clean, "name")).toBe("clean");
  });

  it("keeps initial server statuses until a draft is sent", () => {
    const state = createFormListState([
      { id: "new-field", value: "入力済み", status: "created" },
      { id: "review", value: "要確認", status: "error" },
      { id: "removed", value: "旧情報", status: "deleted" },
    ]);

    expect(formListStatus(state, "new-field")).toBe("created");
    expect(formListStatus(state, "review")).toBe("error");
    expect(formListStatus(state, "removed")).toBe("deleted");

    const next = commitFormListFields(state, { "new-field": "" });

    expect(formListStatus(next, "new-field")).toBe("clean");
    expect(formListStatus(next, "review")).toBe("error");
    expect(formListStatus(next, "removed")).toBe("deleted");
  });

  it("ignores drafts for fields that FormList does not own", () => {
    const state = createFormListState([{ id: "name", value: "藍" }]);

    const next = commitFormListFields(state, { missing: "蒼" });

    expect(next).toBe(state);
  });
});
