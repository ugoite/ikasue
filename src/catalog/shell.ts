import { CATALOG_REGISTRY, isCatalogPageId } from "./registry";
import { parseComponentSelection } from "./state";
import { clear, element, type Cleanup } from "./dom";
import { normalizeBase, routesForBase } from "./routes";
import { createDomAllocator, renderCatalogComponent } from "./renderer";
import type { CatalogLocale, CatalogMount, CatalogMountOptions } from "./types";

export function getMountLabel(label?: string): string {
  return typeof label === "string" && label.trim() ? label.trim() : "ikasue";
}

const rootPath = (locale: CatalogLocale): string =>
  locale === "en" ? "/en/" : "/";
const localeRoutes = (base: string, locale: CatalogLocale): readonly string[] =>
  routesForBase(base)[locale].map((route) => route);
const stripBase = (path: string, base: string): string => {
  const normalizedBase = normalizeBase(base);
  if (normalizedBase === "/") return path;
  const prefix = normalizedBase.slice(0, -1);
  return path === prefix || path.startsWith(`${prefix}/`)
    ? path.slice(prefix.length) || "/"
    : path;
};

const pageIdForPath = (pathname: string, locale: CatalogLocale): string => {
  const path =
    locale === "en" && pathname.startsWith("/en/")
      ? pathname.slice(3)
      : pathname;
  if (path === "/") return "root";
  return path.replace(/^\/+|\/+$/g, "");
};

function normalizePath(
  path: string | undefined,
  base: string,
  locale: CatalogLocale,
  current: string,
): { relative: string; valid: boolean } {
  if (path === undefined) return { relative: current, valid: true };
  const pathname = path.split(/[?#]/, 1)[0] || rootPath(locale);
  const relative = stripBase(pathname, base);
  const valid = localeRoutes("/", locale).includes(relative);
  return { relative: valid ? relative : rootPath(locale), valid };
}

function render(
  target: HTMLElement,
  pathname: string,
  options: Required<Pick<CatalogMountOptions, "locale" | "base">>,
): Cleanup | undefined {
  const document = target.ownerDocument;
  const allocator = createDomAllocator();
  clear(target);
  target.className = "ikasue-catalog";
  target.dataset.locale = options.locale;
  const header = element(document, "header");
  header.className = "ikasue-header";
  const home = element(document, "a", getMountLabel());
  home.href =
    options.locale === "en"
      ? `${options.base.replace(/\/$/, "")}/en/`
      : options.base;
  header.append(home);
  const nav = element(document, "nav");
  nav.setAttribute(
    "aria-label",
    options.locale === "ja" ? "ドキュメント" : "Documentation",
  );
  const links = [
    {
      path: rootPath(options.locale),
      label: options.locale === "ja" ? "開始" : "Start",
    },
    {
      path: `${options.locale === "en" ? "/en" : ""}/components/`,
      label: options.locale === "ja" ? "コンポーネント" : "Components",
    },
    {
      path: `${options.locale === "en" ? "/en" : ""}/philosophy/`,
      label: options.locale === "ja" ? "原則" : "Principles",
    },
  ];
  links.forEach((link) => {
    const anchor = element(document, "a", link.label);
    anchor.href =
      `${options.base === "/" ? "" : options.base.slice(0, -1)}${link.path}` ||
      "/";
    nav.append(anchor);
  });
  header.append(nav);
  target.append(header);
  const main = element(document, "main");
  main.className = "ikasue-main";
  const component = parseComponentSelection(pathname, "/", options.locale);
  let cleanup: Cleanup | undefined;
  if (component) {
    cleanup = renderCatalogComponent(
      document,
      main,
      component,
      options.locale,
      allocator,
    );
  } else {
    const pageId = pageIdForPath(pathname, options.locale);
    const entry = isCatalogPageId(pageId)
      ? CATALOG_REGISTRY[pageId]
      : CATALOG_REGISTRY.root;
    const page = element(document, "article");
    page.className = "ikasue-site-page";
    page.append(
      element(document, "h1", entry.title[options.locale]),
      element(document, "p", entry.summary[options.locale]),
    );
    page.dataset.page = entry.id;
    main.append(page);
  }
  target.append(main);
  return cleanup;
}

export function mountCatalog(
  target: HTMLElement,
  input: CatalogMountOptions = {},
): CatalogMount {
  const options = {
    locale: input.locale === "en" ? ("en" as const) : ("ja" as const),
    base: normalizeBase(input.base),
  };
  let current = rootPath(options.locale);
  let disposed = false;
  let pageCleanup: Cleanup | undefined;
  const update = (path?: string): void => {
    if (disposed) return;
    const normalized = normalizePath(
      path ?? input.initialPath,
      options.base,
      options.locale,
      current,
    );
    const changed = normalized.relative !== current;
    current = normalized.relative;
    pageCleanup?.();
    pageCleanup = render(target, current, options);
    if (changed && normalized.valid)
      input.onPathChange?.(
        `${options.base === "/" ? "" : options.base.slice(0, -1)}${current}`,
      );
  };
  update(
    input.initialPath ?? target.ownerDocument.defaultView?.location.pathname,
  );
  const onPopState = (): void => {
    update(target.ownerDocument.defaultView?.location.pathname);
  };
  target.ownerDocument.defaultView?.addEventListener("popstate", onPopState);
  return {
    root: target,
    update,
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
      target.ownerDocument.defaultView?.removeEventListener(
        "popstate",
        onPopState,
      );
      pageCleanup?.();
      pageCleanup = undefined;
      clear(target);
    },
  };
}
