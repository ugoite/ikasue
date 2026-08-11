import { isIkaView, type IkaView } from "./contract";
import { IkaSueError } from "./errors";
import { appendIkaView } from "./elements";

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
  return appendIkaView(root, view, activeRegistry);
}
