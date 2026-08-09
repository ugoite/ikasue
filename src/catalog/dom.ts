export type Cleanup = () => void;

export function clear(target: HTMLElement): void {
  while (target.firstChild) target.removeChild(target.firstChild);
}

export function element<K extends keyof HTMLElementTagNameMap>(
  document: Document,
  tag: K,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  return node;
}

export function listen<K extends keyof HTMLElementEventMap>(
  node: HTMLElement,
  type: K,
  handler: (event: HTMLElementEventMap[K]) => void,
): Cleanup {
  node.addEventListener(type, handler as EventListener);
  return () => {
    node.removeEventListener(type, handler as EventListener);
  };
}
