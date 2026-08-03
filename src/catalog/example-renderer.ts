import { element, svgIcon, type Cleanup } from "./dom";
import { renderDemo, type DemoContext } from "./demos";
import {
  exampleSpec,
  type ExampleKind,
  type ExamplePlaneSpec,
} from "./examples";
import { findRegistryEntry } from "./registry";
import { resolvePlane } from "../plane";
import type { CatalogLocale } from "./types";

interface ExampleSurfaceRoot extends HTMLElement {
  dataset: DOMStringMap & {
    exampleKind?: ExampleKind;
    locale?: CatalogLocale;
  };
}

function localized(
  locale: CatalogLocale,
  values: Readonly<Record<CatalogLocale, string>>,
): string {
  return values[locale];
}

function cleanupListener(
  target: EventTarget,
  type: string,
  handler: (event: Event) => void,
): Cleanup {
  target.addEventListener(type, handler);
  return () => {
    target.removeEventListener(type, handler);
  };
}

function renderArrow(
  document: Document,
  icon: string,
  label: string,
): HTMLButtonElement {
  const button = element(document, "button", "example-plane__arrow");
  button.type = "button";
  button.setAttribute("aria-label", label);
  button.append(svgIcon(document, icon));
  return button;
}

function renderRegion(
  root: ExampleSurfaceRoot,
  plane: ExamplePlaneSpec,
  region: ExamplePlaneSpec["regions"][number],
  cleanup: Cleanup[],
): void {
  const planeRoot = root.querySelector<HTMLElement>(
    `[data-example-plane="${plane.id}"]`,
  );
  const host = planeRoot?.querySelector<HTMLElement>(
    `[data-example-region="${region.id}"]`,
  );
  const demo = host?.querySelector<HTMLElement>("[data-example-native]");
  if (!host || !demo) return;

  const component = findRegistryEntry(region.componentId);
  const document = root.ownerDocument;
  const window = document.defaultView;
  const context: DemoContext = {
    document,
    root,
    window,
    locale: root.dataset.locale === "en" ? "en" : "ja",
    track: (item) => cleanup.push(item),
    listen: (target, type, handler) => {
      cleanup.push(cleanupListener(target, type, handler));
    },
    openDialog: (title, message) => {
      const status = root.querySelector<HTMLElement>("[data-example-dialog]");
      if (status) {
        status.textContent = `${title}: ${message}`;
        status.hidden = false;
      }
    },
  };
  renderDemo(demo, component, region.props, context);
  demo.dataset.componentId = region.componentId;
}

function renderPlane(
  root: ExampleSurfaceRoot,
  plane: ExamplePlaneSpec,
  cleanup: Cleanup[],
  focus: { value: string },
  onFocus: (id: string) => void,
): void {
  const planeRoot = root.querySelector<HTMLElement>(
    `[data-example-plane="${plane.id}"]`,
  );
  const viewport = planeRoot?.querySelector<HTMLElement>(
    "[data-example-viewport]",
  );
  const navigation = planeRoot?.querySelector<HTMLElement>(
    "[data-example-navigation]",
  );
  if (!planeRoot || !viewport || !navigation) return;

  const resolved = resolvePlane({
    axis: plane.axis,
    fit: plane.fit,
    gap: plane.gap,
    available: plane.available,
    focus: focus.value,
    navigation: plane.navigation,
    children: plane.regions.map(({ id, basis, min }) => ({ id, basis, min })),
  });
  planeRoot.dataset.axis = resolved.axis;
  planeRoot.dataset.fit = resolved.fit;
  planeRoot.dataset.focus = resolved.focus ?? "";
  planeRoot.dataset.overflow = String(resolved.overflow);
  planeRoot.style.setProperty("--example-plane-gap", String(resolved.gap));
  planeRoot.style.setProperty("--example-plane-lines", String(resolved.lines));

  for (const child of resolved.children) {
    const region = planeRoot.querySelector<HTMLElement>(
      `[data-example-region="${child.id}"]`,
    );
    if (!region) continue;
    region.dataset.state = child.state;
    region.dataset.focused = String(child.focused);
    region.hidden = child.collapsed;
    region.style.setProperty("--example-region-size", String(child.size));
    region.style.setProperty("--example-region-offset", String(child.offset));
    region.style.setProperty("--example-region-line", String(child.line));
  }

  navigation.replaceChildren();
  const locale = root.dataset.locale === "en" ? "en" : "ja";
  const previous = renderArrow(
    root.ownerDocument,
    plane.axis === "horizontal" ? "left" : "up",
    localized(locale, { ja: "前の領域", en: "Previous region" }),
  );
  previous.disabled = !resolved.canPrevious;
  const previousId = resolved.previous;
  if (previousId) {
    cleanup.push(
      cleanupListener(previous, "click", () => {
        onFocus(previousId);
      }),
    );
  }

  const direct = element(root.ownerDocument, "div", "example-plane__direct");
  direct.setAttribute("role", "group");
  direct.setAttribute(
    "aria-label",
    localized(locale, { ja: "plane領域", en: "Plane regions" }),
  );
  for (const child of plane.regions) {
    const button = element(
      root.ownerDocument,
      "button",
      "example-plane__direct-button",
    );
    button.type = "button";
    button.dataset.focusId = child.id;
    button.setAttribute("aria-pressed", String(child.id === resolved.focus));
    button.textContent = child.label[locale];
    cleanup.push(
      cleanupListener(button, "click", () => {
        onFocus(child.id);
      }),
    );
    direct.append(button);
  }

  const next = renderArrow(
    root.ownerDocument,
    plane.axis === "horizontal" ? "right" : "down",
    localized(locale, { ja: "次の領域", en: "Next region" }),
  );
  next.disabled = !resolved.canNext;
  const nextId = resolved.next;
  if (nextId) {
    cleanup.push(
      cleanupListener(next, "click", () => {
        onFocus(nextId);
      }),
    );
  }
  navigation.append(previous, direct, next);
}

export function mountExampleSurface(root: HTMLElement): Cleanup {
  const surface = root as ExampleSurfaceRoot;
  const kind = surface.dataset.exampleKind;
  if (!kind) return () => undefined;
  const spec = exampleSpec(kind);
  const cleanup: Cleanup[] = [];
  const focusByPlane = new Map(
    spec.planes.map((plane) => [plane.id, { value: plane.focus }]),
  );

  for (const plane of spec.planes) {
    for (const region of plane.regions) {
      renderRegion(surface, plane, region, cleanup);
    }
  }

  const draw = (): void => {
    for (const plane of spec.planes) {
      const focus = focusByPlane.get(plane.id);
      if (!focus) continue;
      renderPlane(surface, plane, cleanup, focus, (id) => {
        focus.value = id;
        draw();
      });
    }
  };
  draw();

  return () => {
    for (const item of cleanup.splice(0)) item();
  };
}

export function mountExampleSurfaces(
  document: Document = globalThis.document,
): Cleanup {
  const cleanups = Array.from(
    document.querySelectorAll<HTMLElement>("[data-ikasue-example-surface]"),
    mountExampleSurface,
  );
  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}
