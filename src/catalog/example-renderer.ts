import { element, type Cleanup } from "./dom";
import {
  renderPlaneComposition,
  type DemoContext,
  type NativePlaneComposition,
} from "./demos";
import {
  exampleSpec,
  type ExampleKind,
  type ExamplePlaneSpec,
} from "./examples";
import type { CatalogLocale } from "./types";

interface ExampleSurfaceRoot extends HTMLElement {
  dataset: DOMStringMap & {
    exampleKind?: ExampleKind;
    locale?: CatalogLocale;
  };
}

function nativePlane(
  kind: ExampleKind,
  plane: ExamplePlaneSpec,
): NativePlaneComposition {
  return {
    id: `example-${kind}-${plane.id}`,
    componentId: plane.componentId,
    axis: plane.axis,
    fit: plane.fit,
    gap: plane.gap,
    available: plane.available,
    focus: plane.focus,
    navigation: plane.navigation,
    children: plane.regions,
  };
}

export function mountExampleSurface(root: HTMLElement): Cleanup {
  const surface = root as ExampleSurfaceRoot;
  const kind = surface.dataset.exampleKind;
  const mount = surface.querySelector<HTMLElement>("[data-native-plane-mount]");
  if (!kind || !mount) return () => undefined;

  const spec = exampleSpec(kind);
  const dialog = element(
    surface.ownerDocument,
    "p",
    "plane-composition-status",
  );
  dialog.hidden = true;
  dialog.setAttribute("role", "status");
  const cleanup: Cleanup[] = [];
  const context: DemoContext = {
    document: surface.ownerDocument,
    root: surface,
    window: surface.ownerDocument.defaultView,
    locale: surface.dataset.locale === "en" ? "en" : "ja",
    track: (item) => cleanup.push(item),
    listen: (target, type, handler) => {
      target.addEventListener(type, handler);
      cleanup.push(() => {
        target.removeEventListener(type, handler);
      });
    },
    openDialog: (title, message) => {
      dialog.textContent = `${title}: ${message}`;
      dialog.hidden = false;
    },
  };

  renderPlaneComposition(
    mount,
    spec.planes.map((plane) => nativePlane(kind, plane)),
    context,
  );
  mount.append(dialog);

  return () => {
    for (const item of cleanup.splice(0)) item();
    mount.replaceChildren();
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
