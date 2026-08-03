import {
  createInfoText,
  renderDemo,
  renderDeveloperDemo,
  renderPhilosophyDemo,
  type DemoContext,
} from "./demos";
import { element, listen, svgIcon, type Cleanup } from "./dom";
import {
  CATALOG_GROUPS,
  CATALOG_REGISTRY,
  componentSource,
  findRegistryEntry,
} from "./registry";
import {
  defaultProps,
  parseComponentQuery,
  serializeComponentQuery,
} from "./state";
import type {
  CatalogCategoryId,
  CatalogComponentRegistryEntry,
  CatalogLocale,
  CatalogPageId,
  CatalogRegistryEntry,
  CatalogPropertyValue,
} from "./types";

const DEFAULT_MOUNT_LABEL = "ikasue workspace";

function localized<T>(
  locale: CatalogLocale,
  values: Readonly<Record<CatalogLocale, T>>,
): T {
  return values[locale];
}

export interface CatalogSiteNavItem {
  readonly key: "philosophy" | "contracts" | "components" | "examples";
  readonly label: string;
  readonly description: string;
  readonly href: string;
}

export interface CatalogMountOptions {
  readonly label?: string;
  readonly component?: CatalogPageId;
  readonly search?: string;
  readonly locale?: CatalogLocale;
  /** Astro's BASE_URL, including the trailing slash when provided. */
  readonly basePath?: string;
  /** Render only the catalog surface when a host site owns the page frame. */
  readonly embedded?: boolean;
}

export interface CatalogMount {
  readonly element: HTMLElement;
  readonly select: (id: CatalogPageId) => void;
  dispose(): void;
}

export function getCatalogMountLabel(label?: string): string {
  const normalized = label?.trim();
  return normalized || DEFAULT_MOUNT_LABEL;
}

function normalizeBasePath(basePath?: string): string {
  const value = basePath?.trim() || "/";
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return `${withLeadingSlash.replace(/\/+$/, "")}/`;
}

function sitePath(
  path: string,
  locale: CatalogLocale,
  basePath: string,
): string {
  const localePrefix = locale === "en" ? "en/" : "";
  const normalizedPath = path.replace(/^\/+/, "");
  return `${basePath}${localePrefix}${normalizedPath}`;
}

function localizedGroupLabel(
  category: CatalogCategoryId,
  locale: CatalogLocale,
): string {
  const labels: Record<CatalogCategoryId, string> =
    locale === "en"
      ? {
          philosophy: "Philosophy & contracts",
          foundation: "Foundation",
          layout: "Layout",
          action: "Actions",
          input: "Information & input",
          data: "Data",
          feedback: "Feedback",
        }
      : {
          philosophy: "思想と契約",
          foundation: "基盤",
          layout: "配置",
          action: "アクション",
          input: "情報と入力",
          data: "データ",
          feedback: "フィードバック",
        };
  return labels[category];
}

export function getCatalogSiteNavItems(
  locale: CatalogLocale = "ja",
  basePath?: string,
): readonly CatalogSiteNavItem[] {
  const normalizedBase = normalizeBasePath(basePath);
  const labels: Record<
    "philosophy" | "contracts" | "components" | "examples",
    readonly [string, string]
  > =
    locale === "en"
      ? {
          philosophy: ["Philosophy", "Overview and design principles"],
          contracts: ["Contracts", "Behavioral and integration rules"],
          components: ["Components", "Catalog and component matrix"],
          examples: ["Examples", "Plane-based site shapes"],
        }
      : {
          philosophy: ["思想", "概要と設計思想"],
          contracts: ["契約", "振る舞いと統合のルール"],
          components: ["コンポーネント", "カタログと一覧"],
          examples: ["例", "平面モデルを使った構成例"],
        };
  return [
    {
      key: "philosophy",
      label: labels.philosophy[0],
      description: labels.philosophy[1],
      href: sitePath("philosophy/", locale, normalizedBase),
    },
    {
      key: "contracts",
      label: labels.contracts[0],
      description: labels.contracts[1],
      href: sitePath("guides/behavioral-contracts/", locale, normalizedBase),
    },
    {
      key: "components",
      label: labels.components[0],
      description: labels.components[1],
      href: sitePath("catalog/", locale, normalizedBase),
    },
    {
      key: "examples",
      label: labels.examples[0],
      description: labels.examples[1],
      href: sitePath("examples/", locale, normalizedBase),
    },
  ];
}

export function mountCatalog(
  target: HTMLElement,
  options: CatalogMountOptions = {},
): CatalogMount {
  const document = target.ownerDocument;
  const window = document.defaultView;
  const locale = options.locale ?? "ja";
  const basePath = normalizeBasePath(options.basePath);
  const embedded = options.embedded ?? false;
  const root = element(document, "section", "ikasue-root");
  root.setAttribute("aria-label", getCatalogMountLabel(options.label));
  root.dataset.embedded = String(embedded);
  root.dataset.nav = (window?.innerWidth ?? 1024) < 901 ? "closed" : "open";

  const cleanup: Cleanup[] = [];
  let pageCleanup: Cleanup[] = [];
  let propertyCleanup: Cleanup[] = [];
  let navCleanup: Cleanup[] = [];
  let disposed = false;
  const querySearch = options.search ?? window?.location.search ?? "";
  let currentId = options.component ?? parseComponentQuery(querySearch);
  let currentProps = defaultProps(currentId, locale);
  let navQuery = "";

  const shell = element(document, "div", "app-shell");
  const appPlane = element(document, "div", "app-plane");
  const nav = element(document, "aside", "nav-plane");
  nav.setAttribute(
    "aria-label",
    locale === "en" ? "ikasue navigation" : "ikasueナビゲーション",
  );
  const rail = element(document, "div", "nav-rail");
  const navToggle = element(document, "button", "rail-button");
  navToggle.type = "button";
  navToggle.append(svgIcon(document, "navigation"));
  rail.append(navToggle);
  const navCopy = element(document, "div", "nav-copy");
  navCopy.id = "catalogNavigationPanel";
  const navHead = element(document, "div", "nav-head");
  const navBrand = element(document, "strong");
  navBrand.textContent = "ikasue";
  const navSubtitle = element(document, "small");
  navSubtitle.textContent = "planar adaptive components";
  navHead.append(navBrand, navSubtitle);
  const navList = element(document, "nav", "nav-list");
  navList.id = "navList";
  navList.setAttribute(
    "aria-label",
    embedded
      ? locale === "en"
        ? "Component selection"
        : "component選択"
      : locale === "en"
        ? "ikasue site and component navigation"
        : "ikasueサイトとcomponentのナビゲーション",
  );
  navCopy.append(navHead, navList);
  nav.append(rail, navCopy);

  const main = element(document, "main", "main-plane");
  const topline = element(document, "header", "topline");
  const brand = element(document, "div", "brand");
  const brandName = element(document, "strong");
  brandName.textContent = "ikasue";
  const topTitle = element(document, "span");
  topTitle.id = "topTitle";
  brand.append(brandName, topTitle);
  const topActions = element(document, "div", "top-actions");
  const copyButton = createIconButton(
    document,
    "copy",
    locale === "en" ? "Copy current spec" : "現在のspecをコピー",
    locale === "en" ? "Copy spec" : "specをコピー",
  );
  const resetButton = createIconButton(
    document,
    "reset",
    locale === "en" ? "Reset properties" : "プロパティを初期値へ戻す",
    locale === "en" ? "Reset" : "初期値へ戻す",
  );
  const searchButton = createIconButton(
    document,
    "search",
    locale === "en" ? "Search components" : "コンポーネントを検索",
    locale === "en" ? "Search" : "検索",
  );
  searchButton.dataset.searchToggle = "true";
  searchButton.setAttribute("aria-expanded", "false");
  const searchPanel = element(document, "div", "search-panel");
  searchPanel.id = "catalogSearchPanel";
  searchPanel.setAttribute("role", "search");
  searchPanel.hidden = true;
  const searchInput = element(document, "input");
  searchInput.id = "catalogSearch";
  searchInput.type = "search";
  searchInput.setAttribute(
    "aria-label",
    locale === "en" ? "Search components" : "コンポーネントを検索",
  );
  searchInput.placeholder =
    locale === "en" ? "Search components" : "componentを検索";
  searchPanel.append(searchInput);
  searchButton.setAttribute("aria-controls", searchPanel.id);
  topActions.append(copyButton, resetButton, searchButton, searchPanel);
  topline.append(brand, topActions);
  const contentScroll = element(document, "div", "content-scroll");
  contentScroll.id = "contentScroll";
  const content = element(document, "div", "content");
  content.id = "content";
  contentScroll.append(content);
  main.append(topline, contentScroll);
  appPlane.append(nav, main);

  const embeddedControls = element(document, "section", "catalog-controls");
  embeddedControls.dataset.catalogControls = "page-local";
  embeddedControls.setAttribute("aria-labelledby", "catalogControlsHeading");
  const controlsHeading = element(document, "h2", "catalog-controls-heading");
  controlsHeading.id = "catalogControlsHeading";
  controlsHeading.textContent =
    locale === "en" ? "Component controls" : "component操作";
  const controlsNote = element(document, "p", "catalog-controls-note");
  controlsNote.textContent =
    locale === "en"
      ? "Select a page-local component demo; site navigation stays in Starlight."
      : "ページ内のcomponent demoを選択します。サイト移動はStarlightのnavigationを使います。";
  if (embedded)
    embeddedControls.append(controlsHeading, controlsNote, topActions, navList);

  const dialog = element(document, "section", "bottom-dialog");
  dialog.id = "bottomDialog";
  dialog.dataset.open = "false";
  dialog.setAttribute(
    "aria-label",
    localized(locale, { ja: "下端ダイアログ", en: "Bottom dialog" }),
  );
  const dialogInner = element(document, "div", "bottom-dialog-inner");
  const dialogHead = element(document, "div", "dialog-head");
  const dialogHeading = element(document, "div");
  const dialogEyebrow = element(document, "div", "eyebrow");
  dialogEyebrow.textContent = "Bottom dialog";
  const dialogTitle = element(document, "h2");
  dialogTitle.id = "dialogTitle";
  dialogTitle.textContent = localized(locale, {
    ja: "処理を確認",
    en: "Review action",
  });
  dialogHeading.append(dialogEyebrow, dialogTitle);
  const closeButton = createIconButton(
    document,
    "close",
    localized(locale, { ja: "閉じる", en: "Close" }),
    localized(locale, { ja: "閉じる", en: "Close" }),
  );
  closeButton.dataset.closeDialog = "true";
  dialogHead.append(dialogHeading, closeButton);
  const dialogText = element(document, "p");
  dialogText.id = "dialogText";
  dialogText.textContent = localized(locale, {
    ja: "上の情報を残したまま、下端に判断領域を追加します。",
    en: "Add a decision area at the bottom while keeping the information above.",
  });
  const dialogActions = element(document, "div", "cluster");
  dialogActions.style.marginTop = "16px";
  dialogActions.style.justifyContent = "flex-end";
  for (const [label, emphasized] of [
    [localized(locale, { ja: "取消", en: "Cancel" }), false],
    [localized(locale, { ja: "確定", en: "Confirm" }), true],
  ] as const) {
    const action = element(document, "button", "text-action");
    action.type = "button";
    action.textContent = label;
    action.dataset.closeDialog = "true";
    action.setAttribute("aria-pressed", String(emphasized));
    dialogActions.append(action);
  }
  dialogInner.append(dialogHead, dialogText, dialogActions);
  dialog.append(dialogInner);
  if (embedded) {
    root.append(embeddedControls, content, dialog);
  } else {
    shell.append(appPlane, dialog);
    root.append(shell);
  }
  target.append(root);

  const listenAndTrack = (
    targetElement: EventTarget,
    type: string,
    handler: (event: Event) => void,
  ): void => {
    cleanup.push(listen(targetElement, type, handler));
  };
  const context = (): DemoContext => ({
    document,
    root,
    window,
    locale,
    updateProperty: (key, value) => {
      if (currentProps[key] === value) return;
      currentProps[key] = value;
      syncPropertyControl(key, value);
      const spec = content.querySelector<HTMLElement>("#specCode");
      const entry = findRegistryEntry(currentId);
      if (spec && entry.kind === "component")
        spec.textContent = contractText(entry);
    },
    track: (item) => pageCleanup.push(item),
    listen: (targetElement, type, handler) =>
      pageCleanup.push(listen(targetElement, type, handler)),
    openDialog: (title, message) => {
      dialogTitle.textContent = title;
      dialogText.textContent = message;
      dialog.dataset.open = "true";
    },
  });

  const propertyContext = (): DemoContext => ({
    document,
    root,
    window,
    locale,
    track: (item) => propertyCleanup.push(item),
    listen: (targetElement, type, handler) =>
      propertyCleanup.push(listen(targetElement, type, handler)),
    openDialog: (title, message) => {
      dialogTitle.textContent = title;
      dialogText.textContent = message;
      dialog.dataset.open = "true";
    },
  });

  const syncNavButton = (): void => {
    const open = root.dataset.nav === "open";
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute(
      "aria-label",
      open
        ? locale === "en"
          ? "Collapse navigation"
          : "ナビゲーションを収納"
        : locale === "en"
          ? "Expand navigation"
          : "ナビゲーションを展開",
    );
    navToggle.setAttribute("aria-controls", navCopy.id);
  };

  const createSiteNav = (): HTMLElement => {
    const section = element(document, "section", "site-nav-section");
    section.setAttribute("aria-labelledby", "catalogSiteNavHeading");
    const heading = element(document, "h2", "nav-section-heading");
    heading.id = "catalogSiteNavHeading";
    heading.textContent =
      locale === "en" ? "Site navigation" : "サイトナビゲーション";
    section.append(heading);
    const list = element(document, "ul", "site-nav-list");
    for (const item of getCatalogSiteNavItems(locale, basePath)) {
      const listItem = element(document, "li");
      const link = element(document, "a", "site-nav-item");
      link.href = item.href;
      link.dataset.siteNav = item.key;
      link.setAttribute(
        "aria-current",
        item.key === "components" ? "page" : "false",
      );
      const label = element(document, "span");
      label.textContent = item.label;
      const description = element(document, "small");
      description.textContent = item.description;
      link.append(label, description);
      listItem.append(link);
      list.append(listItem);
    }
    section.append(list);
    return section;
  };

  const renderNav = (): void => {
    for (const item of navCleanup) item();
    navCleanup = [];
    navList.replaceChildren();
    if (!embedded) navList.append(createSiteNav());
    const componentsSection = element(
      document,
      "section",
      "component-nav-section",
    );
    componentsSection.setAttribute(
      "aria-labelledby",
      "catalogComponentNavHeading",
    );
    const componentsHeading = element(document, "h2", "nav-section-heading");
    componentsHeading.id = "catalogComponentNavHeading";
    componentsHeading.textContent =
      locale === "en" ? "Components" : "コンポーネント";
    componentsSection.append(componentsHeading);
    const componentList = element(document, "div", "component-nav-list");
    const query = navQuery.trim().toLocaleLowerCase();
    let matchCount = 0;
    for (const [, category] of CATALOG_GROUPS) {
      const groupItems = CATALOG_REGISTRY.filter(
        (entry) => entry.category === category && matchesNavQuery(entry, query),
      );
      if (!groupItems.length) continue;
      matchCount += groupItems.length;
      const groupLabel = element(document, "div", "nav-group");
      groupLabel.textContent = localizedGroupLabel(category, locale);
      componentList.append(groupLabel);
      for (const entry of groupItems)
        componentList.append(createNavItem(entry));
    }
    if (query && !matchCount) {
      const empty = element(document, "p", "nav-empty");
      empty.setAttribute("role", "status");
      empty.textContent =
        locale === "en"
          ? `No components match “${navQuery.trim()}”.`
          : `「${navQuery.trim()}」に一致するcomponentはありません。`;
      componentList.append(empty);
    } else if (query) {
      const status = element(document, "p", "nav-filter-status");
      status.setAttribute("role", "status");
      status.textContent =
        locale === "en"
          ? `${String(matchCount)} components shown`
          : `${String(matchCount)}件のcomponentを表示中`;
      componentList.prepend(status);
    }
    componentsSection.append(componentList);
    navList.append(componentsSection);
  };

  const createNavItem = (entry: CatalogRegistryEntry): HTMLButtonElement => {
    const item = element(document, "button", "nav-item");
    item.type = "button";
    item.dataset.id = entry.id;
    item.setAttribute(
      "aria-current",
      entry.id === currentId ? "page" : "false",
    );
    item.append(svgIcon(document, entry.category));
    const copy = element(document, "span");
    copy.textContent = entry.page[locale].title;
    const japanese = element(document, "small");
    japanese.textContent = locale === "en" ? "" : entry.displayNameJa;
    copy.append(japanese);
    item.append(copy);
    navCleanup.push(
      listen(item, "click", () => {
        selectComponent(entry.id, true, true);
      }),
    );
    return item;
  };

  const contractText = (component: CatalogComponentRegistryEntry): string => {
    return JSON.stringify(
      {
        contract: "current properties",
        component: component.displayName,
        id: component.id,
        props: currentProps,
      },
      null,
      2,
    );
  };

  const updateProperty = (
    component: CatalogComponentRegistryEntry,
    key: string,
    value: string | boolean,
  ): void => {
    if (currentProps[key] === value) return;
    currentProps[key] = value;
    syncPropertyControl(key, value);
    const stage = content.querySelector<HTMLElement>("#demoStage");
    if (stage) {
      for (const item of pageCleanup) item();
      pageCleanup = [];
      renderDemo(stage, component, currentProps, context());
    }
    const spec = content.querySelector<HTMLElement>("#specCode");
    if (spec) spec.textContent = contractText(component);
  };

  function syncPropertyControl(key: string, value: CatalogPropertyValue): void {
    const control = Array.from(
      content.querySelectorAll<HTMLElement>(".info-text[data-prop]"),
    ).find((item) => item.dataset.prop === key);
    const read = control?.querySelector<HTMLElement>(".read-value");
    if (read) read.textContent = String(value);
  }

  const renderProperties = (
    component: CatalogComponentRegistryEntry,
  ): HTMLDivElement => {
    const list = element(document, "div", "property-list");
    for (const property of component.properties) {
      const row = element(document, "div", "property-row");
      const label = element(document, "label");
      const title = element(document, "span");
      const inputId = `catalog-${component.id}-${property.key}`;
      title.id = `${inputId}-label`;
      title.textContent = locale === "en" ? property.labelEn : property.labelJa;
      const detail = element(document, "small");
      const localeDefault =
        locale === "en" ? property.defaultEn : property.defaultJa;
      detail.textContent = `${property.key} / default: ${String(localeDefault)}`;
      label.append(title, detail);
      const control = element(document, "div", "property-control");
      if (property.type === "select") {
        const infoText = element(document, "span", "info-text");
        infoText.id = inputId;
        infoText.dataset.prop = property.key;
        infoText.setAttribute("aria-labelledby", title.id);
        createInfoText(
          infoText,
          {
            value: String(currentProps[property.key] ?? ""),
            editable: true,
            editor: "select",
            values: property.values,
            label: locale === "en" ? property.labelEn : property.labelJa,
            onCommit: (value) => {
              updateProperty(component, property.key, value);
            },
          },
          propertyContext(),
        );
        control.append(infoText);
      } else if (property.type === "boolean") {
        const boolean = element(document, "button", "boolean-text");
        boolean.type = "button";
        boolean.id = inputId;
        boolean.dataset.prop = property.key;
        boolean.setAttribute("role", "checkbox");
        boolean.setAttribute("aria-labelledby", title.id);
        let checked = currentProps[property.key] === true;
        const check = element(document, "span", "check-slot");
        const state = element(document, "span");
        const syncBoolean = (): void => {
          boolean.setAttribute("aria-checked", String(checked));
          state.textContent = checked ? "on" : "off";
          check.replaceChildren();
          if (checked) check.append(svgIcon(document, "check"));
        };
        boolean.append(check, state);
        syncBoolean();
        propertyCleanup.push(
          listen(boolean, "click", () => {
            checked = !checked;
            syncBoolean();
            updateProperty(component, property.key, checked);
          }),
        );
        control.append(boolean);
      } else {
        const infoText = element(document, "span", "info-text");
        infoText.id = inputId;
        infoText.dataset.prop = property.key;
        infoText.setAttribute("aria-labelledby", title.id);
        createInfoText(
          infoText,
          {
            value: String(currentProps[property.key] ?? ""),
            editable: true,
            editor: "text",
            label: locale === "en" ? property.labelEn : property.labelJa,
            onCommit: (value) => {
              updateProperty(component, property.key, value);
            },
          },
          propertyContext(),
        );
        control.append(infoText);
      }
      row.append(label, control);
      list.append(row);
    }
    return list;
  };

  const renderContract = (
    component: CatalogComponentRegistryEntry,
  ): HTMLPreElement => {
    const pre = element(document, "pre", "code-block");
    pre.id = "specCode";
    pre.textContent = contractText(component);
    return pre;
  };

  const renderSharedSources = (
    component: CatalogComponentRegistryEntry,
  ): HTMLElement => {
    const section = element(document, "section", "section");
    const heading = element(document, "h2");
    heading.textContent =
      locale === "en" ? "Shared source recipe" : "共有source recipe";
    const note = element(document, "p", "source-note");
    note.textContent =
      locale === "en"
        ? "These JavaScript and Rust source strings come from the registry and are rendered identically by ComponentDoc."
        : "このJavaScriptとRustのsource stringはregistryから取得し、ComponentDocと同じ内容を描画します。";
    const source = componentSource(component.id);
    const javascript = element(document, "pre", "code-block");
    javascript.dataset.source = "javascript";
    javascript.textContent = source.javascript;
    const rust = element(document, "pre", "code-block");
    rust.dataset.source = "rust";
    rust.textContent = source.rust;
    const javascriptLabel = element(document, "h3");
    javascriptLabel.textContent = "JavaScript";
    const rustLabel = element(document, "h3");
    rustLabel.textContent = "Rust";
    section.append(heading, note, javascriptLabel, javascript, rustLabel, rust);
    return section;
  };

  const appendPageHeading = (
    eyebrow: string,
    title: string,
    summary: string,
  ): HTMLElement => {
    const pageHead = element(document, "header", "page-head");
    const eyebrowNode = element(document, "div", "eyebrow");
    eyebrowNode.textContent = eyebrow;
    const titleNode = element(document, "h1");
    titleNode.tabIndex = -1;
    titleNode.textContent = title;
    const summaryNode = element(document, "p", "summary");
    summaryNode.textContent = summary;
    pageHead.append(eyebrowNode, titleNode, summaryNode);
    return pageHead;
  };

  const appendSection = (parent: HTMLElement, title: string): HTMLElement => {
    const section = element(document, "section", "section");
    const headingNode = element(document, "h2");
    headingNode.textContent = title;
    section.append(headingNode);
    parent.append(section);
    return section;
  };

  const renderStandardPage = (
    component: CatalogComponentRegistryEntry,
  ): void => {
    const copy = component.documentation[locale];
    content.append(
      appendPageHeading(
        copy.category,
        component.page[locale].title,
        copy.summary,
      ),
    );
    const grid = element(document, "div", "doc-grid");
    const main = element(document, "div", "doc-main");
    const side = element(document, "aside", "doc-side");
    const demoSection = element(document, "section", "section");
    const demoLabel = element(document, "div", "demo-label");
    const demoStrong = element(document, "strong");
    demoStrong.textContent = "Live behavior";
    const demoHint = element(document, "span");
    demoHint.textContent = localized(locale, {
      ja: "property変更は即時反映",
      en: "Property changes apply immediately",
    });
    demoLabel.append(demoStrong, demoHint);
    const demoStage = element(document, "div", "demo-stage");
    demoStage.id = "demoStage";
    demoSection.append(demoLabel, demoStage);
    main.append(demoSection);

    const philosophySection = appendSection(
      main,
      locale === "en" ? "Design philosophy" : "設計思想",
    );
    const philosophyText = element(document, "p");
    philosophyText.textContent = copy.philosophy;
    philosophySection.append(philosophyText);
    const contractSection = appendSection(
      main,
      locale === "en"
        ? "Current properties contract"
        : "現在のproperties contract",
    );
    contractSection.append(renderContract(component));
    main.append(renderSharedSources(component));

    const propertiesSection = appendSection(
      side,
      locale === "en" ? "Properties" : "プロパティ",
    );
    if (component.properties.length)
      propertiesSection.append(renderProperties(component));
    else {
      const noProperties = element(document, "p", "summary");
      noProperties.textContent =
        locale === "en"
          ? "This component has no configurable properties."
          : "設定項目はありません。";
      propertiesSection.append(noProperties);
    }
    const criteriaSection = appendSection(
      side,
      locale === "en"
        ? "Behavior and accessibility"
        : "振る舞いとアクセシビリティ",
    );
    appendMeta(criteriaSection, copy);
    grid.append(main, side);
    content.append(grid);
    topTitle.textContent = component.page[locale].title;
    renderDemo(demoStage, component, currentProps, context());
  };

  const appendMeta = (
    section: HTMLElement,
    copy: CatalogComponentRegistryEntry["documentation"][CatalogLocale],
  ): void => {
    const list = element(document, "dl", "meta-list");
    for (const [term, value] of [
      [locale === "en" ? "Use it when" : "使う", copy.useWhen],
      [locale === "en" ? "Avoid it when" : "避ける", copy.avoidWhen],
      [locale === "en" ? "Keyboard" : "keyboard", copy.keyboard],
      [
        locale === "en" ? "Accessibility" : "アクセシビリティ",
        copy.accessibility,
      ],
    ] as const) {
      const item = element(document, "div", "meta-item");
      const dt = element(document, "dt");
      dt.textContent = term;
      const dd = element(document, "dd");
      dd.textContent = value;
      item.append(dt, dd);
      list.append(item);
    }
    section.append(list);
  };

  const renderPhilosophy = (): void => {
    const concept = findRegistryEntry("philosophy");
    const copy = concept.documentation[locale];
    content.append(
      appendPageHeading(
        copy.category,
        concept.page[locale].title,
        copy.summary,
      ),
    );
    const grid = element(document, "div", "doc-grid");
    const main = element(document, "div", "doc-main");
    const side = element(document, "aside", "doc-side");
    const principles = appendSection(
      main,
      locale === "en" ? "Top-level principles" : "最上位原則",
    );
    const list = element(document, "div", "principles");
    for (const [index, [title, description]] of concept.principles[
      locale
    ].entries()) {
      const item = element(document, "div", "principle");
      const number = element(document, "div", "principle-num");
      number.textContent = String(index + 1).padStart(2, "0");
      const copy = element(document, "div");
      const strong = element(document, "strong");
      strong.textContent = title;
      copy.append(strong, paragraph(document, description));
      item.append(number, copy);
      list.append(item);
    }
    principles.append(list);
    const prediction = appendSection(
      main,
      locale === "en" ? "A prediction for 2034" : "2034年への予測",
    );
    prediction.append(
      richParagraph(
        document,
        locale === "en"
          ? "Interfaces will move from fixed columns toward a "
          : "画面は「固定された12 columns」から、task・focus・内容量が空間配分を要求する",
        locale === "en" ? "negotiated plane model" : "平面交渉モデル",
        locale === "en"
          ? "where task, focus, and content ask for area. As information becomes more interactive, editing capability, history, and validation belong to the information itself."
          : "へ移る。AIや自動処理により情報が双方向になるほど、read viewとedit viewを別componentにする意味は薄れ、情報そのものへ編集能力・履歴・検証状態が付く。",
      ),
      richParagraph(
        document,
        locale === "en"
          ? "Translate expressive sizing, adaptive components, and motion physics into "
          : "Material 3 Expressiveのsize変化、adaptive component、motion physicsを、色彩や装飾ではなく",
        locale === "en"
          ? "area transfer and directional consistency"
          : "面積の移譲と方向の一貫性",
        locale === "en"
          ? ". Expression belongs to moments of selection and focus."
          : "へ翻訳する。表現力は選択と焦点の瞬間だけに使う。",
      ),
    );
    const demo = appendSection(
      main,
      localized(locale, { ja: "平面の実演", en: "Plane demonstration" }),
    );
    const stage = element(document, "div", "demo-stage");
    stage.id = "philosophyDemo";
    demo.append(stage);
    const forbidden = appendSection(
      side,
      locale === "en" ? "What to avoid" : "禁止するもの",
    );
    appendDefinitionList(forbidden, [
      [
        localized(locale, { ja: "Z軸", en: "Z-axis" }),
        localized(locale, {
          ja: "shadow、floating card、overlay drawer、上に被せるmodal。",
          en: "Shadows, floating cards, overlay drawers, and modals placed over the page.",
        }),
      ],
      [
        localized(locale, { ja: "任意方向motion", en: "Arbitrary motion" }),
        localized(locale, {
          ja: "右の内容が左から現れるなど、出現元とanimation方向が一致しない動き。",
          en: "Motion whose direction does not match the edge where content enters.",
        }),
      ],
      [
        localized(locale, {
          ja: "固定column思想",
          en: "Fixed-column thinking",
        }),
        localized(locale, {
          ja: "12分割をAPIの中心にすること。必要量はfocusとcontent hintから算出する。",
          en: "Making a twelve-column grid the center of the API instead of deriving area from focus and content hints.",
        }),
      ],
      [
        localized(locale, { ja: "入力boxの常設", en: "Permanent input boxes" }),
        localized(locale, {
          ja: "情報を読む時間にもeditor chromeを表示し続けること。",
          en: "Keeping editor chrome visible while people are simply reading information.",
        }),
      ],
    ]);
    const emphasis = appendSection(
      side,
      locale === "en" ? "Emphasis order" : "強調の順序",
    );
    emphasis.append(
      paragraph(
        document,
        locale === "en"
          ? "1. Give up a little area\n2. Quiet achromatic surface\n3. Move by 2px\n4. Semantic color only for status\n5. Strong outline only for keyboard focus"
          : "1. 面積を少し譲る\n2. 淡い無彩色面\n3. 位置を2px動かす\n4. status時だけ意味色\n5. 強いoutlineはkeyboard focusだけ",
      ),
    );
    grid.append(main, side);
    content.append(grid);
    topTitle.textContent = concept.page[locale].title;
    renderPhilosophyDemo(stage, context());
  };

  const renderDeveloper = (component: CatalogComponentRegistryEntry): void => {
    const copy = component.documentation[locale];
    content.append(
      appendPageHeading(
        copy.category,
        component.page[locale].title,
        copy.summary,
      ),
    );
    const grid = element(document, "div", "doc-grid");
    const main = element(document, "div", "doc-main");
    const side = element(document, "aside", "doc-side");
    const philosophySection = appendSection(
      main,
      locale === "en" ? "Design philosophy" : "設計思想",
    );
    philosophySection.append(paragraph(document, copy.philosophy));
    const contractSection = appendSection(
      main,
      locale === "en"
        ? "Current properties contract"
        : "現在のproperties contract",
    );
    contractSection.append(renderContract(component));
    const model = appendSection(
      main,
      localized(locale, {
        ja: "統合された情報model",
        en: "Unified information model",
      }),
    );
    const textSpec = element(document, "pre", "code-block");
    textSpec.textContent = `TextSpec {
  value: JsonValue,
  editable: bool,
  editor: Option<EditorSpec>,
  change_state: ChangeState,
  validation: Option<ValidationState>
}`;
    model.append(
      textSpec,
      paragraph(
        document,
        localized(locale, {
          ja: "静的textは editable: false、入力可能なtextは editable: true。別componentではない。selectやdateもeditor kindの差であり、通常時は同じ情報表示になる。",
          en: "Static text uses editable: false and input-capable text uses editable: true; they are not separate components. Select and date are editor-kind differences, while their read view remains the same.",
        }),
      ),
    );
    const layout = appendSection(
      main,
      localized(locale, { ja: "平面model", en: "Plane model" }),
    );
    const layoutSpec = element(document, "pre", "code-block");
    layoutSpec.textContent = `PlaneSpec {
  axis: Vertical | Horizontal,
  fit: Elastic | Wrap,
  focus: Option<ChildId>,
  navigation: bool,
  children: [PlaneChild],
  gap: Number
}`;
    layout.append(
      layoutSpec,
      paragraph(
        document,
        localized(locale, {
          ja: "開発者は一軸の順序、focus、navigationを宣言し、runtimeが利用可能な空間に合わせて子要素をelastic、wrap、またはcollapseへ適応する。",
          en: "The developer declares order on one axis plus focus and navigation; the runtime adapts children to available space with elastic allocation, wrapping, or collapsed siblings.",
        }),
      ),
    );
    const output = appendSection(
      main,
      localized(locale, { ja: "出力例", en: "Output example" }),
    );
    const stage = element(document, "div", "demo-stage");
    stage.id = "developerDemo";
    output.append(stage);
    main.append(renderSharedSources(component));
    const propertiesSection = appendSection(
      side,
      locale === "en" ? "Properties" : "プロパティ",
    );
    const noProperties = element(document, "p", "summary");
    noProperties.textContent =
      locale === "en"
        ? "This component has no configurable properties."
        : "設定項目はありません。";
    propertiesSection.append(noProperties);
    const criteriaSection = appendSection(
      side,
      locale === "en"
        ? "Behavior and accessibility"
        : "振る舞いとアクセシビリティ",
    );
    appendMeta(criteriaSection, copy);
    const published = appendSection(
      side,
      locale === "en" ? "Published packages" : "公開package",
    );
    appendDefinitionList(published, [
      [
        "@ugoite/ikasue",
        localized(locale, {
          ja: "dependency-free DOM enhancerとCustom Elements。",
          en: "Dependency-free DOM enhancement and Custom Elements.",
        }),
      ],
      [
        "@ugoite/ikasue-solid",
        localized(locale, {
          ja: "ugoite用の薄いSolid adapter。",
          en: "A thin Solid adapter for ugoite.",
        }),
      ],
      [
        "ikasue-protocol",
        localized(locale, {
          ja: "RustのUiDocumentとPlaneSpecを同じ契約で扱う。",
          en: "Uses the same contract for Rust UiDocument and PlaneSpec.",
        }),
      ],
      [
        "ikasue-html",
        localized(locale, {
          ja: "semantic HTMLとsingle HTML asset生成。",
          en: "Generates semantic HTML and a single HTML asset.",
        }),
      ],
    ]);
    grid.append(main, side);
    content.append(grid);
    topTitle.textContent = component.page[locale].title;
    renderDeveloperDemo(stage, context());
  };

  const renderPage = (focusHeading = false): void => {
    for (const item of pageCleanup) item();
    pageCleanup = [];
    for (const item of propertyCleanup) item();
    propertyCleanup = [];
    content.replaceChildren();
    const page = findRegistryEntry(currentId);
    if (page.kind === "concept") renderPhilosophy();
    else if (page.demo === "developer") renderDeveloper(page);
    else renderStandardPage(page);
    (embedded ? root : contentScroll).scrollTop = 0;
    if (focusHeading) focusPageHeading(content);
  };

  const selectComponent = (
    id: CatalogPageId,
    updateUrl = true,
    focusHeading = false,
  ): void => {
    if (disposed || (id === currentId && !updateUrl)) return;
    currentId = id;
    currentProps = defaultProps(id, locale);
    if (updateUrl && window) {
      const nextSearch = serializeComponentQuery(id, window.location.search);
      const nextUrl = `${window.location.pathname}${nextSearch}${window.location.hash}`;
      if (
        `${window.location.pathname}${window.location.search}${window.location.hash}` !==
        nextUrl
      )
        window.history.pushState({}, "", nextUrl);
    }
    renderNav();
    renderPage(focusHeading);
    if ((window?.innerWidth ?? 1024) < 901) root.dataset.nav = "closed";
    syncNavButton();
  };

  listenAndTrack(navToggle, "click", () => {
    root.dataset.nav = root.dataset.nav === "open" ? "closed" : "open";
    syncNavButton();
  });
  listenAndTrack(dialog, "click", (event) => {
    const targetElement = event.target;
    if (
      targetElement instanceof Element &&
      targetElement.closest("[data-close-dialog]")
    )
      dialog.dataset.open = "false";
  });
  listenAndTrack(navList, "keydown", (event) => {
    const keyboard = event as KeyboardEvent;
    const targetElement = keyboard.target;
    if (!(targetElement instanceof HTMLButtonElement)) return;
    const buttons = Array.from(
      navList.querySelectorAll<HTMLButtonElement>(".nav-item"),
    );
    const index = buttons.indexOf(targetElement);
    if (index < 0) return;
    let next = index;
    if (keyboard.key === "ArrowDown")
      next = Math.min(buttons.length - 1, index + 1);
    if (keyboard.key === "ArrowUp") next = Math.max(0, index - 1);
    if (keyboard.key === "Home") next = 0;
    if (keyboard.key === "End") next = buttons.length - 1;
    if (next !== index) {
      keyboard.preventDefault();
      buttons[next]?.focus();
    }
  });
  const setSearchOpen = (open: boolean): void => {
    searchPanel.hidden = !open;
    searchButton.setAttribute("aria-expanded", String(open));
    if (open) {
      searchInput.focus();
      return;
    }
    navQuery = "";
    searchInput.value = "";
    renderNav();
    searchButton.focus();
  };
  listenAndTrack(searchButton, "click", () => {
    setSearchOpen(searchPanel.hidden);
  });
  listenAndTrack(searchInput, "input", () => {
    navQuery = searchInput.value;
    renderNav();
  });
  listenAndTrack(searchInput, "keydown", (event) => {
    if ((event as KeyboardEvent).key === "Escape") {
      event.preventDefault();
      setSearchOpen(false);
    }
  });
  if (window) {
    listenAndTrack(window, "popstate", () => {
      const next = parseComponentQuery(window.location.search);
      if (next !== currentId) selectComponent(next, false);
    });
    listenAndTrack(window, "resize", () => {
      if (window.innerWidth < 901 && root.dataset.nav === "open") {
        root.dataset.nav = "closed";
        syncNavButton();
      }
    });
  }

  renderNav();
  syncNavButton();
  renderPage();
  listenAndTrack(copyButton, "click", () => {
    const spec =
      content.querySelector<HTMLElement>("#specCode")?.textContent ??
      JSON.stringify({ page: currentId, ...currentProps }, null, 2);
    void copyToClipboard(document, window, spec);
  });
  listenAndTrack(resetButton, "click", () => {
    currentProps = defaultProps(currentId, locale);
    renderPage();
  });

  return {
    element: root,
    select: (id) => {
      selectComponent(id);
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      for (const item of pageCleanup) item();
      for (const item of propertyCleanup) item();
      for (const item of navCleanup) item();
      for (const item of cleanup) item();
      root.remove();
    },
  };
}

function focusPageHeading(content: HTMLElement): void {
  content
    .querySelector<HTMLElement>(".page-head h1")
    ?.focus({ preventScroll: true });
}

function createIconButton(
  document: Document,
  kind: "copy" | "reset" | "search" | "close",
  label: string,
  tooltip: string,
): HTMLButtonElement {
  const icon =
    kind === "copy"
      ? "copy"
      : kind === "reset"
        ? "reset"
        : kind === "search"
          ? "search"
          : "close";
  const button = element(document, "button", "icon-button");
  button.type = "button";
  button.setAttribute("aria-label", label);
  button.append(svgIcon(document, icon));
  const hint = element(document, "span", "tooltip");
  hint.setAttribute("role", "tooltip");
  hint.textContent = tooltip;
  button.append(hint);
  return button;
}

function matchesNavQuery(
  component: CatalogRegistryEntry,
  query: string,
): boolean {
  if (!query) return true;
  return [
    component.id,
    component.displayName,
    component.displayNameJa,
    component.page.ja.title,
    component.page.en.title,
  ].some((value) => value.toLocaleLowerCase().includes(query));
}

function richParagraph(
  document: Document,
  before: string,
  strongText: string,
  after: string,
): HTMLParagraphElement {
  const paragraph = element(document, "p");
  paragraph.append(document.createTextNode(before));
  const strong = element(document, "strong");
  strong.textContent = strongText;
  paragraph.append(strong, document.createTextNode(after));
  return paragraph;
}

function paragraph(document: Document, text: string): HTMLParagraphElement {
  const node = element(document, "p");
  node.textContent = text;
  return node;
}

function appendDefinitionList(
  section: HTMLElement,
  entries: readonly (readonly [string, string])[],
): void {
  const document = section.ownerDocument;
  const list = element(document, "dl", "meta-list");
  for (const [term, description] of entries) {
    const item = element(document, "div", "meta-item");
    const dt = element(document, "dt");
    dt.textContent = term;
    const dd = element(document, "dd");
    dd.textContent = description;
    item.append(dt, dd);
    list.append(item);
  }
  section.append(list);
}

async function copyToClipboard(
  document: Document,
  window: Window | null,
  value: string,
): Promise<void> {
  const clipboard = window?.navigator.clipboard;
  if (clipboard?.writeText) {
    try {
      await clipboard.writeText(value);
      return;
    } catch {
      // Use the selection fallback when permissions are unavailable.
    }
  }
  const textarea = element(document, "textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  try {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    document.execCommand("copy");
  } catch {
    // The selected text remains available in browsers without clipboard access.
  }
  textarea.remove();
}
