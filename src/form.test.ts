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

  it("uses supplied initial values before field defaults and filters errors", () => {
    const state = createFormState(
      [
        { id: "name", label: "Name", initialValue: "field" },
        { id: "team", label: "Team", initialValue: "team" },
      ],
      { name: "supplied" },
    );
    expect(state.initialValues).toEqual({ name: "supplied", team: "team" });
    const errored = setFormErrors(state, {
      name: "Invalid",
      unknown: "ignored",
    });
    expect(errored.errors).toEqual({ name: "Invalid" });
    expect(setFormErrors(errored, {}).status).toBe("clean");
  });

  it("keeps the field editor and identity state in the form model", () => {
    const state = createFormState([
      { id: "email", label: "Email", editor: "email", state: "created" },
      { id: "notes", label: "Notes", editor: "textarea", state: "error" },
    ]);
    expect(state.fields).toMatchObject([
      { id: "email", editor: "email", state: "created" },
      { id: "notes", editor: "textarea", state: "error" },
    ]);
  });

  it("treats reserved object names as ordinary field IDs", () => {
    const state = createFormState([
      { id: "__proto__", label: "Prototype", initialValue: "A" },
    ]);
    const draft = setFormDraft(state, "__proto__", "B");
    const errored = setFormErrors(
      draft,
      Object.fromEntries([["__proto__", "Invalid"]]),
    );

    expect(state.values["__proto__"]).toBe("A");
    expect(draft.drafts["__proto__"]).toBe("B");
    expect(errored.errors["__proto__"]).toBe("Invalid");
  });
});
