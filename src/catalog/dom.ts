export type Cleanup = () => void;

export function element<K extends keyof HTMLElementTagNameMap>(
  document: Document,
  tag: K,
  className?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

export function svgIcon(document: Document, name: string): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  const paths: Record<string, readonly string[]> = {
    philosophy: ["M5 19h14M7 16V5h10v11M10 8h4M10 11h4"],
    foundation: ["M4 19h16M6 15h12M8 11h8M10 7h4"],
    layout: ["M3 4h7v16H3zM14 4h7v7h-7zM14 15h7v5h-7z"],
    navigation: ["M5 4v16M10 7h9M10 12h9M10 17h9"],
    action: ["M12 3v18M3 12h18"],
    input: ["M4 17h16M7 14l8-8 3 3-8 8H7z"],
    data: ["M3 4h18v16H3zM3 9h18M9 9v11M15 9v11"],
    feedback: ["M4 5h16v11H8l-4 4z"],
    text: ["M5 6h14M12 6v12M8 18h8"],
    select: ["M7 9l5 5 5-5"],
    edit: ["M4 17.5V20h2.5L18 8.5 15.5 6zM14.5 7l2.5 2.5"],
    save: ["M5 4h12l2 2v14H5zM8 4v6h8V4M8 20v-6h8v6"],
    plus: ["M12 5v14M5 12h14"],
    left: ["M15 5l-7 7 7 7"],
    right: ["M9 5l7 7-7 7"],
    up: ["M5 15l7-7 7 7"],
    down: ["M5 9l7 7 7-7"],
    check: ["M5 12l4 4 10-10"],
    info: ["M12 11v6M12 7h.01", "circle 12 12 9"],
    warning: ["M12 3L2.5 20h19zM12 9v4M12 17h.01"],
    error: ["M9 9l6 6M15 9l-6 6", "circle 12 12 9"],
    number: ["M9 3L7 21M17 3l-2 18M4 9h16M3 15h16"],
    date: ["M3 5h18v16H3zM7 3v4M17 3v4M3 10h18"],
    email: ["M3 5h18v14H3zM3 7l9 7 9-7"],
    textarea: ["M5 6h14M5 10h14M5 14h9M17 18l3-3"],
    copy: ["M8 8h11v11H8zM5 16H4V5h11v1"],
    reset: ["M4 4v6h6M5.5 14a7 7 0 1 0 .6-7.8L4 10"],
    close: ["M6 6l12 12M18 6L6 18"],
  };
  const commands = paths[name] ?? paths.text ?? [];
  for (const command of commands) {
    const parts = command.split(" ");
    if (parts[0] === "circle") {
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      circle.setAttribute("cx", parts[1] ?? "12");
      circle.setAttribute("cy", parts[2] ?? "12");
      circle.setAttribute("r", parts[3] ?? "9");
      svg.append(circle);
    } else {
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      path.setAttribute("d", command);
      svg.append(path);
    }
  }
  return svg;
}

export function setText(node: Element, value: string | number | boolean): void {
  node.textContent = String(value);
}

export function listen<K extends keyof HTMLElementEventMap>(
  target: EventTarget,
  type: K | string,
  handler: (event: HTMLElementEventMap[K] | Event) => void,
): Cleanup {
  target.addEventListener(type, handler);
  return () => {
    target.removeEventListener(type, handler);
  };
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>\"]/g, (character) => {
    const replacements: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
    };
    return replacements[character] ?? character;
  });
}

export function appendLabel(
  document: Document,
  parent: Element,
  text: string,
  className = "form-row-label",
): HTMLDivElement {
  const label = element(document, "div", className);
  label.textContent = text;
  parent.append(label);
  return label;
}
