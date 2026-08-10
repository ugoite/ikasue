import { describe, expect, it } from "vitest";

import { createDataGridPortModel } from "./transport";

class FakePort extends EventTarget {
  readonly messages: unknown[] = [];
  started = false;
  closed = false;

  postMessage(message: unknown): void {
    this.messages.push(message);
  }

  start(): void {
    this.started = true;
  }

  close(): void {
    this.closed = true;
  }

  receive(message: unknown): void {
    this.dispatchEvent(new MessageEvent("message", { data: message }));
  }
}

describe("MessagePort model transport", () => {
  it("shares row response and event semantics with the direct model", async () => {
    const port = new FakePort();
    const events: unknown[] = [];
    const model = createDataGridPortModel(
      port as unknown as MessagePort,
      (event) => events.push(event),
    );

    const request = model.requestRows(
      { start: 0, limit: 1 },
      { signal: new AbortController().signal },
    );
    expect(port.started).toBe(true);
    expect(port.messages[0]).toMatchObject({
      type: "request",
      id: 1,
      operation: "rows",
      payload: { start: 0, limit: 1 },
    });

    port.receive({
      version: "ikasue-web/1",
      type: "event",
      event: "rows-invalidated",
      payload: { source: "worker" },
    });
    port.receive({
      version: "ikasue-web/1",
      type: "response",
      id: 1,
      result: { rows: [{ id: "42", cells: { name: "ika" } }], total: 1 },
    });

    await expect(request).resolves.toEqual({
      rows: [{ id: "42", cells: { name: "ika" } }],
      total: 1,
    });
    expect(events).toEqual([
      { event: "rows-invalidated", payload: { source: "worker" } },
    ]);
    model.dispose?.();
    expect(port.closed).toBe(false);
  });

  it("maps AbortSignal cancellation to a portable cancel message", async () => {
    const port = new FakePort();
    const model = createDataGridPortModel(port as unknown as MessagePort);
    const controller = new AbortController();
    const request = model.requestRows(
      { start: 0, limit: 20 },
      { signal: controller.signal },
    );

    controller.abort();

    await expect(request).rejects.toMatchObject({ name: "AbortError" });
    expect(port.messages[1]).toEqual({
      version: "ikasue-web/1",
      type: "cancel",
      id: 1,
    });
  });

  it("rejects non-JSON row responses and payloads", async () => {
    const port = new FakePort();
    const model = createDataGridPortModel(port as unknown as MessagePort);
    const request = model.requestRows(
      { start: 0, limit: 1 },
      { signal: new AbortController().signal },
    );
    port.receive({
      version: "ikasue-web/1",
      type: "response",
      id: 1,
      result: { rows: [], total: Number.POSITIVE_INFINITY },
    });
    await expect(request).rejects.toThrow("invalid MessagePort message");

    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    const invalid = model.requestRows(cyclic as never, {
      signal: new AbortController().signal,
    });
    await expect(invalid).rejects.toThrow("JSON-safe record");
    expect(port.messages).toHaveLength(1);
  });
});
