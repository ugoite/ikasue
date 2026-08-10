import {
  IKASUE_ABI_VERSION,
  isIkaError,
  isIkaJsonRecord,
  isIkaMessage,
  isIkaRowPage,
  isIkaRowRequest,
  isIkaJsonValue,
} from "./contract";
import type {
  IkaMessage,
  IkaRowPage,
  IkaRowRequest,
  IkaJsonRecord,
} from "./contract";

export interface IkaDataGridModel {
  requestRows(
    request: IkaRowRequest,
    options: { readonly signal: AbortSignal },
  ): Promise<IkaRowPage>;
  update?(
    mutation: IkaJsonRecord,
    options: { readonly signal: AbortSignal },
  ): Promise<IkaJsonRecord>;
  subscribe?(listener: (event: IkaDataGridModelEvent) => void): () => void;
  dispose?(): void;
}

export interface IkaDataGridModelEvent {
  readonly event: string;
  readonly payload: IkaJsonRecord;
}

function asError(value: unknown): Error {
  let code = "transport-error";
  let message = "ikasue model request failed";
  const details = isIkaError(value) ? value.details : undefined;
  if (isIkaError(value)) {
    code = value.code;
    message = value.message;
  } else if (value instanceof Error) {
    message = value.message;
    const error = value as Error & { code?: unknown; details?: unknown };
    if (typeof error.code === "string") code = error.code;
    if (isIkaJsonValue(error.details))
      return Object.assign(error, { code, details: error.details });
  }
  return Object.assign(new Error(message), {
    code,
    ...(details === undefined ? {} : { details }),
  });
}

export function isIkaDataGridModelEvent(
  value: unknown,
): value is IkaDataGridModelEvent {
  return (
    isIkaJsonRecord(value) &&
    Object.keys(value).every((key) => key === "event" || key === "payload") &&
    typeof value.event === "string" &&
    value.event.length > 0 &&
    isIkaJsonRecord(value.payload)
  );
}

export function assertIkaRowPage(value: unknown): IkaRowPage {
  if (!isIkaRowPage(value))
    throw new Error("ikasue model returned an invalid row page");
  return value;
}

/** Adapts the portable data-only MessagePort protocol to the direct model API. */
export function createDataGridPortModel(
  port: MessagePort,
  onEvent?: (event: IkaDataGridModelEvent) => void,
): IkaDataGridModel {
  let nextId = 1;
  const listeners = new Set<(event: IkaDataGridModelEvent) => void>();
  if (onEvent) listeners.add(onEvent);
  const pending = new Map<
    number,
    {
      readonly resolve: (value: unknown) => void;
      readonly reject: (reason: Error) => void;
    }
  >();

  const receive = (message: MessageEvent<unknown>): void => {
    const value = message.data;
    if (typeof value !== "object" || value === null) return;
    if (!isIkaMessage(value)) {
      const candidate = value as Record<string, unknown>;
      if (
        candidate.version === IKASUE_ABI_VERSION &&
        (candidate.type === "response" || candidate.type === "error") &&
        typeof candidate.id === "number" &&
        Number.isInteger(candidate.id)
      ) {
        const request = pending.get(candidate.id);
        if (request) {
          pending.delete(candidate.id);
          request.reject(
            new Error("ikasue model returned an invalid MessagePort message"),
          );
        }
      }
      return;
    }
    const data = value;
    if (
      data.type === "event" &&
      isIkaDataGridModelEvent({ event: data.event, payload: data.payload })
    ) {
      const event = {
        event: data.event,
        payload: data.payload,
      } satisfies IkaDataGridModelEvent;
      for (const listener of listeners) listener(event);
      return;
    }
    if (
      (data.type !== "response" && data.type !== "error") ||
      typeof data.id !== "number"
    )
      return;
    const request = pending.get(data.id);
    if (!request) return;
    pending.delete(data.id);
    if (data.type === "error") request.reject(asError(data.error));
    else request.resolve(data.result);
  };

  port.addEventListener("message", receive);
  port.start();
  let disposed = false;

  const request = (
    operation: "rows" | "update",
    payload: unknown,
    signal: AbortSignal,
  ): Promise<unknown> => {
    const id = nextId++;
    return new Promise((resolve, reject) => {
      if (!isIkaJsonRecord(payload)) {
        reject(new Error("ikasue model payload must be a JSON-safe record"));
        return;
      }
      if (operation === "rows" && !isIkaRowRequest(payload)) {
        reject(
          new Error("ikasue row request does not match the JSON contract"),
        );
        return;
      }
      if (disposed) {
        reject(new Error("ikasue model transport is disposed"));
        return;
      }
      const abort = (): void => {
        pending.delete(id);
        port.postMessage({
          version: IKASUE_ABI_VERSION,
          type: "cancel",
          id,
        } satisfies IkaMessage);
        reject(new DOMException("The model request was aborted", "AbortError"));
      };
      if (signal.aborted) {
        abort();
        return;
      }
      signal.addEventListener("abort", abort, { once: true });
      pending.set(id, {
        resolve: (value) => {
          signal.removeEventListener("abort", abort);
          resolve(value);
        },
        reject: (reason) => {
          signal.removeEventListener("abort", abort);
          reject(reason);
        },
      });
      if (operation === "rows") {
        port.postMessage({
          version: IKASUE_ABI_VERSION,
          type: "request",
          id,
          operation,
          payload: payload as unknown as IkaRowRequest,
        } satisfies IkaMessage);
      } else {
        port.postMessage({
          version: IKASUE_ABI_VERSION,
          type: "request",
          id,
          operation,
          payload,
        } satisfies IkaMessage);
      }
    });
  };

  return {
    requestRows: (requestValue, options) =>
      request("rows", requestValue, options.signal).then(assertIkaRowPage),
    update: (mutation, options) =>
      request("update", mutation, options.signal).then((value) =>
        isIkaJsonRecord(value)
          ? value
          : (() => {
              throw new Error("ikasue model returned an invalid update");
            })(),
      ),
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      port.removeEventListener("message", receive);
      for (const { reject } of pending.values())
        reject(new Error("ikasue model transport is disposed"));
      pending.clear();
      listeners.clear();
    },
  };
}
