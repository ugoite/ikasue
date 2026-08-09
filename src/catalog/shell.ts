import { CATALOG_REGISTRY, findRegistryEntry } from "./registry";
import { parseComponentSelection } from "./state";
import { clear, element } from "./dom";
import { normalizeBase } from "./routes";
import type {
  CatalogComponentId,
  CatalogMount,
  CatalogMountOptions,
} from "./types";

export function getMountLabel(label?: string): string {
  return typeof label === "string" && label.trim() ? label.trim() : "ikasue";
}

const safe = (value: string, index: number) => {
  const token =
    value
      .normalize("NFKC")
      .replace(/[^A-Za-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || `anonymous-${String(index)}`;
  return token;
};

function renderComponent(
  target: HTMLElement,
  id: CatalogComponentId,
  locale: "ja" | "en",
) {
  const document = target.ownerDocument;
  const entry = findRegistryEntry(id);
  const section = element(document, "section");
  section.className = "ikasue-component-page";
  section.dataset.kind = id;
  const heading = element(document, "h1", entry?.title[locale] ?? id);
  section.append(heading);
  const summary = element(document, "p", entry?.summary[locale] ?? "");
  section.append(summary);
  const demo = element(document, "div");
  demo.className = "ikasue-demo";
  demo.dataset.kind = id;
  const label = element(
    document,
    "span",
    locale === "ja" ? "サンプル" : "Example",
  );
  label.className = "ikasue-demo-label";
  demo.append(label);
  if (id === "text-field") {
    const field = element(document, "div", "");
    const inputId = `ikasue-text-field-${safe(id, 1)}`;
    const labelNode = element(
      document,
      "label",
      locale === "ja" ? "名前" : "Name",
    );
    labelNode.htmlFor = inputId;
    const input = element(document, "input");
    input.id = inputId;
    input.value = "ikasue";
    field.append(labelNode, input);
    demo.append(field);
  } else if (id === "checkbox") {
    const input = element(document, "input");
    input.type = "checkbox";
    input.id = "ikasue-checkbox-1";
    const labelNode = element(
      document,
      "label",
      locale === "ja" ? "有効" : "Enabled",
    );
    labelNode.htmlFor = input.id;
    demo.append(input, labelNode);
  } else if (id === "progress" || id === "loading-region") {
    const progress = element(document, "progress");
    progress.max = 100;
    progress.value = 48;
    demo.append(
      progress,
      element(document, "span", locale === "ja" ? "作業中" : "Working"),
    );
  } else if (id === "alert") {
    const alert = element(
      document,
      "div",
      locale === "ja" ? "確認が必要です" : "Attention required",
    );
    alert.setAttribute("role", "alert");
    demo.append(alert);
  } else if (id === "status-indicator") {
    const status = element(
      document,
      "span",
      locale === "ja" ? "準備完了" : "Ready",
    );
    status.setAttribute("role", "status");
    demo.append(status);
  } else {
    demo.append(
      element(
        document,
        "p",
        locale === "ja"
          ? `${entry?.title.ja ?? id} の標準的な例`
          : `A standard ${entry?.title.en ?? id} example.`,
      ),
    );
  }
  section.append(demo);
  target.append(section);
}

function render(
  target: HTMLElement,
  pathname: string,
  options: Required<Pick<CatalogMountOptions, "locale" | "base">>,
) {
  const document = target.ownerDocument;
  clear(target);
  target.className = "ikasue-catalog";
  target.dataset.locale = options.locale;
  const header = element(document, "header");
  header.className = "ikasue-header";
  header.append(element(document, "a", getMountLabel()));
  const nav = element(document, "nav");
  nav.setAttribute(
    "aria-label",
    options.locale === "ja" ? "ドキュメント" : "Documentation",
  );
  const links = [
    {
      path: options.locale === "en" ? "/en/" : "/",
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
  for (const link of links) {
    const anchor = element(document, "a", link.label);
    anchor.href =
      `${normalizeBase(options.base).replace(/\/$/, "")}${link.path}` || "/";
    nav.append(anchor);
  }
  header.append(nav);
  target.append(header);
  const main = element(document, "main");
  main.className = "ikasue-main";
  const component = parseComponentSelection(
    pathname,
    options.base,
    options.locale,
  );
  if (component) renderComponent(main, component, options.locale);
  else {
    const id = pathname.includes("philosophy") ? "philosophy" : "root";
    const entry = CATALOG_REGISTRY[id as keyof typeof CATALOG_REGISTRY];
    main.append(element(document, "section", entry.title[options.locale]));
  }
  target.append(main);
}

export function mountCatalog(
  target: HTMLElement,
  input: CatalogMountOptions = {},
): CatalogMount {
  const options = {
    locale: input.locale === "en" ? ("en" as const) : ("ja" as const),
    base: normalizeBase(input.base),
  };
  let current = input.initialPath ?? (options.locale === "en" ? "/en/" : "/");
  let disposed = false;
  const normalizedPath = (value: string): string =>
    value.startsWith(options.locale === "en" ? "/en/" : "/")
      ? value
      : options.locale === "en"
        ? "/en/"
        : "/";
  const update = (path?: string) => {
    if (disposed) return;
    const next = normalizedPath(path ?? current);
    const changed = next !== current;
    current = next;
    render(target, current, options);
    if (changed)
      input.onPathChange?.(
        `${options.base === "/" ? "" : options.base.slice(0, -1)}${current}`,
      );
  };
  update(current);
  const onPopState = () => {
    update(target.ownerDocument.defaultView?.location.pathname);
  };
  target.ownerDocument.defaultView?.addEventListener("popstate", onPopState);
  return {
    root: target,
    update,
    dispose: () => {
      if (disposed) return;
      disposed = true;
      target.ownerDocument.defaultView?.removeEventListener(
        "popstate",
        onPopState,
      );
      clear(target);
    },
  };
}
