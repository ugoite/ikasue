import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  IKA_ELEMENT_TAGS,
  IkaDataGridElement,
  dataGridQueryForViewport,
  defineIkaSue,
  tagNameForKind,
} from "./elements";
import { IKA_ELEMENT_CONTRACTS, IKA_PRIMITIVE_ATTRIBUTE_NAMES } from "./abi";
import {
  IKASUE_ABI_VERSION,
  isIkaView,
  isIkaJsonRecord,
  isIkaJsonValue,
  isIkaDataGridEdit,
  isIkaDataGridQuery,
  isIkaMessage,
  isIkaRowRequest,
  isIkaSplitViewPane,
  isIkaTabsItem,
  isIkaViewProps,
  type IkaView,
} from "./contract";
import { renderIkaView } from "./view";

class RegistryStub {
  readonly definitions = new Map<string, CustomElementConstructor>();

  define(name: string, constructor: CustomElementConstructor): void {
    this.definitions.set(name, constructor);
  }

  get(name: string): CustomElementConstructor | undefined {
    return this.definitions.get(name);
  }
}

interface FakeNode {
  readonly localName: string;
  readonly ownerDocument: FakeDocument;
  readonly creationRegistry?: CustomElementRegistry;
  readonly attributes: Record<string, string>;
  readonly children: FakeNode[];
  props?: unknown;
  setAttribute(name: string, value: string): void;
  append(...children: FakeNode[]): void;
}

interface FakeDocument {
  readonly defaultView: { readonly customElements: CustomElementRegistry };
  createElement(name: string, options?: ElementCreationOptions): FakeNode;
}

function fakeDocument(registry: CustomElementRegistry): FakeDocument {
  const document: FakeDocument = {
    defaultView: { customElements: registry },
    createElement(name, options) {
      const node: FakeNode = {
        localName: name,
        ownerDocument: document,
        ...(options?.customElementRegistry
          ? { creationRegistry: options.customElementRegistry }
          : {}),
        attributes: {},
        children: [],
        setAttribute(attribute, value) {
          this.attributes[attribute] = value;
        },
        append(...children) {
          this.children.push(...children);
        },
      };
      return node;
    },
  };
  return document;
}

describe("ikasue Web ABI", () => {
  it("registers the canonical elements idempotently and rejects conflicts", () => {
    const stub = new RegistryStub();
    const registry = stub as unknown as CustomElementRegistry;
    const first = defineIkaSue(registry);
    const second = defineIkaSue(registry);

    expect(first.version).toBe(IKASUE_ABI_VERSION);
    expect(second.tags).toEqual(IKA_ELEMENT_TAGS);
    expect(stub.definitions.get("ika-data-grid")).toBe(IkaDataGridElement);

    class ConflictConstructor {
      readonly conflict = true;
    }
    stub.definitions.set(
      "ika-text",
      ConflictConstructor as unknown as CustomElementConstructor,
    );
    expect(() => defineIkaSue(registry)).toThrow("already registered");
  });

  it("keeps contract values JSON-safe", () => {
    expect(isIkaJsonValue({ ok: [true, 1, "text", null] })).toBe(true);
    expect(isIkaJsonRecord({ ok: "yes" })).toBe(true);
    expect(isIkaJsonValue(Number.NaN)).toBe(false);
    expect(isIkaJsonValue(new Date())).toBe(false);
    expect(isIkaJsonValue(() => undefined)).toBe(false);
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(isIkaJsonValue(cyclic)).toBe(false);
    expect(
      isIkaView({
        version: IKASUE_ABI_VERSION,
        kind: "data-grid",
        props: { editable: true },
      }),
    ).toBe(true);
    expect(
      isIkaView({
        version: IKASUE_ABI_VERSION,
        kind: "data-grid",
        props: new Date(),
      }),
    ).toBe(false);
    expect(
      isIkaView({
        version: IKASUE_ABI_VERSION,
        kind: "text",
        props: { selectable: "false" },
      }),
    ).toBe(false);
    expect(
      isIkaView({
        version: IKASUE_ABI_VERSION,
        kind: "data-grid",
        props: { columns: "not-an-array" },
      }),
    ).toBe(false);
    expect(
      isIkaView({
        version: IKASUE_ABI_VERSION,
        kind: "flex",
        props: {
          children: [
            {
              version: IKASUE_ABI_VERSION,
              kind: "text",
              props: { content: "A" },
            },
          ],
        },
      }),
    ).toBe(true);
    expect(
      isIkaView({
        version: IKASUE_ABI_VERSION,
        kind: "data-grid",
        text: "not a grid prop",
      }),
    ).toBe(false);
    expect(
      isIkaView({
        version: IKASUE_ABI_VERSION,
        kind: "text",
        text: "ambiguous",
        props: { content: "other" },
      }),
    ).toBe(false);
    expect(
      isIkaTabsItem({
        id: "overview",
        label: "Overview",
        content: "The selected panel is visible.",
      }),
    ).toBe(true);
    expect(
      isIkaView({
        version: IKASUE_ABI_VERSION,
        kind: "tabs",
        props: {
          items: [
            { id: "overview", label: "Overview" },
            { id: "overview", label: "Another label" },
          ],
        },
      }),
    ).toBe(false);
  });

  it("lowers a serializable view to canonical element names", () => {
    const registry = new RegistryStub() as unknown as CustomElementRegistry;
    const document = fakeDocument(registry);
    const root = document.createElement("main");
    const view: IkaView = {
      version: IKASUE_ABI_VERSION,
      kind: "data-grid",
      props: { editable: true, columns: [] },
      children: [{ version: IKASUE_ABI_VERSION, kind: "text", text: "A row" }],
    };

    const node = renderIkaView(
      root as unknown as HTMLElement,
      view,
      registry,
    ) as unknown as FakeNode;

    expect(node.localName).toBe("ika-data-grid");
    expect(node.attributes.editable).toBe("");
    expect(node.children[0]?.localName).toBe("ika-text");
    expect(node.children[0]?.creationRegistry).toBe(registry);
    expect(tagNameForKind("split-view")).toBe("ika-split-view");
  });

  it("keeps the schemas parseable and versioned", () => {
    for (const name of [
      "common",
      "data-grid",
      "tabs",
      "split-view",
      "protocol",
      "view",
    ]) {
      const source = readFileSync(
        new URL(`../contract/${name}.schema.json`, import.meta.url),
        "utf8",
      );
      const schema = JSON.parse(source) as { $schema?: string; $id?: string };
      expect(schema.$schema).toBe(
        "https://json-schema.org/draft/2020-12/schema",
      );
      expect(schema.$id).toContain("ikasue");
    }
  });

  it("keeps editable cancellation in the public ABI", () => {
    expect(IKA_ELEMENT_CONTRACTS["editable-text"].events).toContain(
      "ika-cancel",
    );
  });

  it("keeps DataGrid editing available as an imperative property", () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      IkaDataGridElement.prototype,
      "editing",
    );
    expect(typeof descriptor?.get).toBe("function");
    expect(typeof descriptor?.set).toBe("function");
  });

  it("publishes the controlled DataGrid boundary without host adapters", () => {
    expect(IKASUE_ABI_VERSION).toBe("ikasue-web/2");
    const contract = IKA_ELEMENT_CONTRACTS["data-grid"];
    expect(contract.properties.map(({ name }) => name)).toEqual(
      expect.arrayContaining([
        "columns",
        "rows",
        "total",
        "loading",
        "error",
        "editable",
      ]),
    );
    expect(contract.properties.map(({ name }) => name)).not.toContain("model");
    expect(contract.events).toEqual(["ika-query", "ika-select", "ika-edit"]);
    expect(contract.events).not.toContain("ika-model-event");
    expect(contract.methods).not.toEqual(
      expect.arrayContaining([
        "connect(port)",
        "disconnect()",
        "loadRows(request)",
      ]),
    );
    expect(
      isIkaView({
        version: IKASUE_ABI_VERSION,
        kind: "data-grid",
        props: {
          columns: [],
          rows: [],
          total: 0,
          loading: true,
          error: "Request failed",
        },
      }),
    ).toBe(true);
    expect(
      isIkaView({
        version: IKASUE_ABI_VERSION,
        kind: "data-grid",
        props: { columns: [], rows: [], total: 1.5 },
      }),
    ).toBe(false);
  });

  it("derives a bounded query from viewport geometry", () => {
    expect(
      dataGridQueryForViewport({
        scrollTop: 80,
        clientHeight: 120,
        total: 100,
      }),
    ).toEqual({ offset: 2, limit: 2 });
    expect(
      dataGridQueryForViewport({
        scrollTop: 999,
        clientHeight: 0,
        total: 2,
      }),
    ).toEqual({ offset: 2, limit: 1 });
  });

  it("keeps primitive attributes and split geometry aligned", () => {
    const attributes = new Set<string>(IKA_PRIMITIVE_ATTRIBUTE_NAMES);
    expect(attributes.has("activeId")).toBe(true);
    expect(attributes.has("icon")).toBe(true);
    expect(attributes.has("selectionMode")).toBe(true);
    expect(attributes.has("motionOrigin")).toBe(true);
    expect(attributes.has("description")).toBe(true);
    expect(attributes.has("error")).toBe(true);
    expect(attributes.has("fit")).toBe(false);
    expect(
      IKA_ELEMENT_CONTRACTS.field.properties.map(({ name }) => name),
    ).toEqual(expect.arrayContaining(["description", "error"]));
    expect(
      IKA_ELEMENT_CONTRACTS["split-view"].properties.map(({ name }) => name),
    ).toEqual(expect.arrayContaining(["collapsed"]));
    expect(
      isIkaSplitViewPane({ id: "list", size: "1fr", minSize: "12rem" }),
    ).toBe(true);
    expect(isIkaSplitViewPane({ id: "list", size: "calc(1fr)" })).toBe(false);
    expect(isIkaSplitViewPane({ id: "list", minSize: "1fr" })).toBe(false);
    expect(
      isIkaViewProps("split-view", {
        panes: [{ id: "list", basis: 1 }],
        sizes: ["1fr"],
        collapsed: { list: true },
      }),
    ).toBe(true);
    expect(
      isIkaViewProps("split-view", {
        panes: [{ id: "list", basis: 1 }],
        sizes: ["not-a-track"],
      }),
    ).toBe(false);
  });

  it("keeps the MessagePort envelope aligned with the row contract", () => {
    expect(isIkaRowRequest({ offset: 0, limit: 25 })).toBe(true);
    expect(isIkaRowRequest({ offset: -1, limit: 25 })).toBe(false);
    expect(isIkaDataGridQuery({ offset: 20, limit: 10 })).toBe(true);
    expect(isIkaDataGridQuery({ offset: 20, limit: 0 })).toBe(false);
    expect(isIkaDataGridEdit({ row: "r1", column: "name", value: "new" })).toBe(
      true,
    );
    expect(
      isIkaMessage({
        version: IKASUE_ABI_VERSION,
        type: "response",
        id: 1,
        result: "not-a-record",
      }),
    ).toBe(false);
    expect(
      isIkaMessage({
        version: IKASUE_ABI_VERSION,
        type: "event",
        event: "rows-invalidated",
        payload: "not-a-record",
      }),
    ).toBe(false);
  });
});
