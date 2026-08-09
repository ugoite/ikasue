import { describe, expect, it } from "vitest";
import {
  commitFormFields,
  createFormState,
  setFormDraft,
  setFormErrors,
  setFormStatus,
} from "./form";

describe("form state", () => {
  it("keeps drafts separate and commits atomically", () => {
    const initial = createFormState([
      { id: "name", label: "Name", initialValue: "A" },
      { id: "team", label: "Team", initialValue: "X" },
    ]);
    const draft = setFormDraft(initial, "name", "B");
    expect(draft.values.name).toBe("A");
    expect(draft.drafts.name).toBe("B");
    const committed = commitFormFields(draft, {
      name: "B",
      team: "Y",
      unknown: "ignored",
    });
    expect(committed.values).toEqual({ name: "B", team: "Y" });
    expect(committed.drafts).toEqual({});
    expect(committed.status).toBe("dirty");
  });

  it("retains a newer draft and exposes errors independently", () => {
    const initial = createFormState([
      { id: "name", label: "Name", initialValue: "A" },
    ]);
    const submitted = setFormDraft(initial, "name", "B");
    const newer = setFormDraft(submitted, "name", "C");
    const committed = commitFormFields(newer, { name: "B" });
    expect(committed.drafts.name).toBe("C");
    const errored = setFormErrors(committed, { name: "Invalid" });
    expect(errored.status).toBe("error");
    expect(setFormStatus(errored, "success").status).toBe("success");
  });
});
