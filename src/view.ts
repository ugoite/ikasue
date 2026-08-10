import {
  isIkaJsonRecord,
  isIkaView,
  type IkaJsonPrimitive,
  type IkaView,
} from "./contract";
import { IkaSueError } from "./errors";
import { defineIkaSue, tagNameForKind } from "./elements";

function isPrimitive(value: unknown): value is IkaJsonPrimitive {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    typeof value === "number"
  );
}

/** Lower a serializable view to the canonical Custom Elements tree. */
export function renderIkaView(
  root: HTMLElement,
  view: IkaView,
  registry?: CustomElementRegistry,
): HTMLElement {
  if (!isIkaView(view))
    throw new IkaSueError(
      "invalid-contract",
      "IkaView must be a JSON-safe, version-compatible view record",
    );
  const activeRegistry =
    registry ?? root.ownerDocument.defaultView?.customElements;
  if (!activeRegistry)
    throw new IkaSueError(
      "registry-unavailable",
      "CustomElementRegistry is unavailable",
    );
  defineIkaSue(activeRegistry);
  const tag = tagNameForKind(view.kind);
  const node = root.ownerDocument.createElement(tag, {
    customElementRegistry: activeRegistry,
  });
  for (const [key, value] of Object.entries(view.props ?? {})) {
    if (isPrimitive(value)) {
      if (typeof value === "boolean") {
        if (value) node.setAttribute(key, "");
      } else if (value !== null) node.setAttribute(key, String(value));
    }
  }
  if (view.props) {
    if (!isIkaJsonRecord(view.props))
      throw new IkaSueError(
        "invalid-contract",
        "IkaView props must be a JSON-safe record",
      );
    (node as HTMLElement & { props: typeof view.props }).props = view.props;
  }
  if (view.text !== undefined) node.textContent = view.text;
  for (const child of view.children ?? [])
    renderIkaView(node, child, activeRegistry);
  root.append(node);
  return node;
}
