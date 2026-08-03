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
  CATALOG_PAGES,
  PRINCIPLES,
  componentMeta,
  componentPhilosophy,
  findPage,
} from "./metadata";
import {
  cloneProps,
  defaultProps,
  parseComponentQuery,
  serializeComponentQuery,
} from "./state";
import type { CatalogPageId, CatalogPageMetadata } from "./types";

const DEFAULT_MOUNT_LABEL = "ikasue workspace";

export interface CatalogMountOptions {
  readonly label?: string;
  readonly component?: CatalogPageId;
  readonly search?: string;
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

export function mountCatalog(
  target: HTMLElement,
  options: CatalogMountOptions = {},
): CatalogMount {
  const document = target.ownerDocument;
  const window = document.defaultView;
  const root = element(document, "section", "ikasue-root");
  root.setAttribute("aria-label", getCatalogMountLabel(options.label));
  root.dataset.nav = (window?.innerWidth ?? 1024) < 901 ? "closed" : "open";

  const cleanup: Cleanup[] = [];
  let pageCleanup: Cleanup[] = [];
  let propertyCleanup: Cleanup[] = [];
  let navCleanup: Cleanup[] = [];
  let disposed = false;
  const querySearch = options.search ?? window?.location.search ?? "";
  let currentId = options.component ?? parseComponentQuery(querySearch);
  let currentProps = cloneProps(currentId);
  let navQuery = "";

  const shell = element(document, "div", "app-shell");
  const appPlane = element(document, "div", "app-plane");
  const nav = element(document, "aside", "nav-plane");
  nav.setAttribute("aria-label", "ikasue component navigation");
  const rail = element(document, "div", "nav-rail");
  const navToggle = element(document, "button", "rail-button");
  navToggle.type = "button";
  navToggle.append(svgIcon(document, "navigation"));
  rail.append(navToggle);
  const navCopy = element(document, "div", "nav-copy");
  const navHead = element(document, "div", "nav-head");
  const navBrand = element(document, "strong");
  navBrand.textContent = "ikasue";
  const navSubtitle = element(document, "small");
  navSubtitle.textContent = "planar adaptive components";
  navHead.append(navBrand, navSubtitle);
  const navList = element(document, "nav", "nav-list");
  navList.id = "navList";
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
    "現在のspecをコピー",
    "specをコピー",
  );
  const resetButton = createIconButton(
    document,
    "reset",
    "プロパティを初期値へ戻す",
    "初期値へ戻す",
  );
  const searchButton = createIconButton(
    document,
    "search",
    "コンポーネントを検索",
    "検索",
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
  searchInput.setAttribute("aria-label", "コンポーネントを検索");
  searchInput.placeholder = "componentを検索";
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

  const dialog = element(document, "section", "bottom-dialog");
  dialog.id = "bottomDialog";
  dialog.dataset.open = "false";
  dialog.setAttribute("aria-label", "下端ダイアログ");
  const dialogInner = element(document, "div", "bottom-dialog-inner");
  const dialogHead = element(document, "div", "dialog-head");
  const dialogHeading = element(document, "div");
  const dialogEyebrow = element(document, "div", "eyebrow");
  dialogEyebrow.textContent = "Bottom dialog";
  const dialogTitle = element(document, "h2");
  dialogTitle.id = "dialogTitle";
  dialogTitle.textContent = "処理を確認";
  dialogHeading.append(dialogEyebrow, dialogTitle);
  const closeButton = createIconButton(document, "close", "閉じる", "閉じる");
  closeButton.dataset.closeDialog = "true";
  dialogHead.append(dialogHeading, closeButton);
  const dialogText = element(document, "p");
  dialogText.id = "dialogText";
  dialogText.textContent = "上の情報を残したまま、下端に判断領域を追加します。";
  const dialogActions = element(document, "div", "cluster");
  dialogActions.style.marginTop = "16px";
  dialogActions.style.justifyContent = "flex-end";
  for (const [label, emphasized] of [
    ["取消", false],
    ["確定", true],
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
  shell.append(appPlane, dialog);
  root.append(shell);
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
      open ? "ナビゲーションを収納" : "ナビゲーションを展開",
    );
  };

  const renderNav = (): void => {
    for (const item of navCleanup) item();
    navCleanup = [];
    navList.replaceChildren();
    const query = navQuery.trim().toLocaleLowerCase();
    let matchCount = 0;
    for (const [label, category] of CATALOG_GROUPS) {
      const groupItems = CATALOG_PAGES.filter(
        (component) =>
          component.cat === category && matchesNavQuery(component, query),
      );
      if (!groupItems.length) continue;
      matchCount += groupItems.length;
      const groupLabel = element(document, "div", "nav-group");
      groupLabel.textContent = label;
      navList.append(groupLabel);
      for (const component of groupItems)
        navList.append(createNavItem(component));
    }
    if (query && !matchCount) {
      const empty = element(document, "p", "nav-empty");
      empty.setAttribute("role", "status");
      empty.textContent = `「${navQuery.trim()}」に一致するcomponentはありません。`;
      navList.append(empty);
    } else if (query) {
      const status = element(document, "p", "nav-filter-status");
      status.setAttribute("role", "status");
      status.textContent = `${String(matchCount)}件のcomponentを表示中`;
      navList.prepend(status);
    }
  };

  const createNavItem = (component: CatalogPageMetadata): HTMLButtonElement => {
    const item = element(document, "button", "nav-item");
    item.type = "button";
    item.dataset.id = component.id;
    item.setAttribute(
      "aria-current",
      component.id === currentId ? "page" : "false",
    );
    item.append(svgIcon(document, component.cat));
    const copy = element(document, "span");
    copy.textContent = component.name;
    const japanese = element(document, "small");
    japanese.textContent = component.ja;
    copy.append(japanese);
    item.append(copy);
    navCleanup.push(
      listen(item, "click", () => {
        selectComponent(component.id, true, true);
      }),
    );
    return item;
  };

  const contractText = (component: CatalogPageMetadata): string => {
    const rustName = component.name.replace(/[^A-Za-z0-9]/g, "");
    const rustProps = Object.entries(currentProps)
      .map(
        ([key, value]) =>
          `${key}: ${typeof value === "boolean" ? String(value) : `${JSON.stringify(value)}.into()`}`,
      )
      .join(", ");
    return `// JavaScript / JSON\n${JSON.stringify({ component: component.name, ...currentProps }, null, 2)}\n\n// Rust\nUiNode::${rustName}({ ${rustProps} })`;
  };

  const updateProperty = (
    component: CatalogPageMetadata,
    key: string,
    value: string | boolean,
  ): void => {
    if (currentProps[key] === value) return;
    currentProps[key] = value;
    const stage = content.querySelector<HTMLElement>("#demoStage");
    if (stage) {
      for (const item of pageCleanup) item();
      pageCleanup = [];
      renderDemo(stage, component, currentProps, context());
    }
    const spec = content.querySelector<HTMLElement>("#specCode");
    if (spec) spec.textContent = contractText(component);
  };

  const renderProperties = (component: CatalogPageMetadata): HTMLDivElement => {
    const list = element(document, "div", "property-list");
    for (const property of component.props) {
      const row = element(document, "div", "property-row");
      const label = element(document, "label");
      const title = element(document, "span");
      const inputId = `catalog-${component.id}-${property.key}`;
      title.id = `${inputId}-label`;
      title.textContent = property.label;
      const detail = element(document, "small");
      detail.textContent = `${property.key} / default: ${String(property.default)}`;
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
            label: property.label,
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
            label: property.label,
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

  const renderContract = (component: CatalogPageMetadata): HTMLPreElement => {
    const pre = element(document, "pre", "code-block");
    pre.id = "specCode";
    pre.textContent = contractText(component);
    return pre;
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

  const renderStandardPage = (component: CatalogPageMetadata): void => {
    content.append(
      appendPageHeading("ikasue component", component.name, component.summary),
    );
    const grid = element(document, "div", "doc-grid");
    const main = element(document, "div", "doc-main");
    const side = element(document, "aside", "doc-side");
    const demoSection = element(document, "section", "section");
    const demoLabel = element(document, "div", "demo-label");
    const demoStrong = element(document, "strong");
    demoStrong.textContent = "Live behavior";
    const demoHint = element(document, "span");
    demoHint.textContent = "property変更は即時反映";
    demoLabel.append(demoStrong, demoHint);
    const demoStage = element(document, "div", "demo-stage");
    demoStage.id = "demoStage";
    demoSection.append(demoLabel, demoStage);
    main.append(demoSection);

    const philosophySection = appendSection(main, "設計思想");
    const philosophyText = element(document, "p");
    philosophyText.textContent = componentPhilosophy(component.id);
    philosophySection.append(philosophyText);
    const contractSection = appendSection(main, "Component contract");
    contractSection.append(renderContract(component));

    const propertiesSection = appendSection(side, "Properties");
    if (component.props.length)
      propertiesSection.append(renderProperties(component));
    else {
      const noProperties = element(document, "p", "summary");
      noProperties.textContent = "設定項目はありません。";
      propertiesSection.append(noProperties);
    }
    const criteriaSection = appendSection(side, "判断基準");
    appendMeta(criteriaSection, component.id);
    grid.append(main, side);
    content.append(grid);
    topTitle.textContent = component.name;
    renderDemo(demoStage, component, currentProps, context());
  };

  const appendMeta = (section: HTMLElement, id: CatalogPageId): void => {
    const list = element(document, "dl", "meta-list");
    const values = componentMeta(id);
    for (const [term, value] of [
      ["使う", values[0]],
      ["避ける", values[1]],
      ["keyboard", values[2]],
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
    content.append(
      appendPageHeading(
        "ikasue design system",
        "一枚の平面が、仕事に合わせて場所を譲る。",
        "立体的な階層、浮遊するcard、上に重なるdrawerを使わない。情報と操作は同じ平面に存在し、必要になった領域が、その領域のある辺から現れて既存空間を再配分する。",
      ),
    );
    const grid = element(document, "div", "doc-grid");
    const main = element(document, "div", "doc-main");
    const side = element(document, "aside", "doc-side");
    const principles = appendSection(main, "最上位原則");
    const list = element(document, "div", "principles");
    for (const [index, [title, description]] of PRINCIPLES.entries()) {
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
    const prediction = appendSection(main, "2034年への予測");
    prediction.append(
      richParagraph(
        document,
        "画面は「固定された12 columns」から、task・focus・内容量が空間配分を要求する",
        "平面交渉モデル",
        "へ移る。AIや自動処理により情報が双方向になるほど、read viewとedit viewを別componentにする意味は薄れ、情報そのものへ編集能力・履歴・検証状態が付く。",
      ),
      richParagraph(
        document,
        "Material 3 Expressiveのsize変化、adaptive component、motion physicsを、色彩や装飾ではなく",
        "面積の移譲と方向の一貫性",
        "へ翻訳する。表現力は選択と焦点の瞬間だけに使う。",
      ),
    );
    const demo = appendSection(main, "平面の実演");
    const stage = element(document, "div", "demo-stage");
    stage.id = "philosophyDemo";
    demo.append(stage);
    const forbidden = appendSection(side, "禁止するもの");
    appendDefinitionList(forbidden, [
      ["Z軸", "shadow、floating card、overlay drawer、上に被せるmodal。"],
      [
        "任意方向motion",
        "右の内容が左から現れるなど、出現元とanimation方向が一致しない動き。",
      ],
      [
        "固定column思想",
        "12分割をAPIの中心にすること。必要量はfocusとcontent hintから算出する。",
      ],
      ["入力boxの常設", "情報を読む時間にもeditor chromeを表示し続けること。"],
    ]);
    const emphasis = appendSection(side, "強調の順序");
    emphasis.append(
      paragraph(
        document,
        "1. 面積を少し譲る\n2. 淡い無彩色面\n3. 位置を2px動かす\n4. status時だけ意味色\n5. 強いoutlineはkeyboard focusだけ",
      ),
    );
    grid.append(main, side);
    content.append(grid);
    topTitle.textContent = "Design philosophy";
    renderPhilosophyDemo(stage, context());
  };

  const renderDeveloper = (): void => {
    content.append(
      appendPageHeading(
        "Coding model",
        "componentは見た目ではなく、能力と空間要求を宣言する。",
        "ikasueはDOM、JavaScript、Rustから同じJSON互換contractを使用する。製品固有のlayout queryやeditor実装をcomponentへ埋め込まない。",
      ),
    );
    const grid = element(document, "div", "doc-grid");
    const main = element(document, "div", "doc-main");
    const side = element(document, "aside", "doc-side");
    const model = appendSection(main, "統合された情報model");
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
        "静的textは editable: false、入力可能なtextは editable: true。別componentではない。selectやdateもeditor kindの差であり、通常時は同じ情報表示になる。",
      ),
    );
    const layout = appendSection(main, "平面model");
    const layoutSpec = element(document, "pre", "code-block");
    layoutSpec.textContent = `PlaneSpec {
  axis: Vertical | Horizontal,
  fit: Elastic | Wrap | Scroll,
  children: [PlaneChild],
  gap: Number
}`;
    layout.append(
      layoutSpec,
      paragraph(
        document,
        "開発者は一軸の順序だけを宣言し、runtimeが利用可能な空間に合わせて子要素を縮小、折返し、またはscrollへ適応する。",
      ),
    );
    const output = appendSection(main, "出力例");
    const stage = element(document, "div", "demo-stage");
    stage.id = "developerDemo";
    output.append(stage);
    const published = appendSection(side, "公開package");
    appendDefinitionList(published, [
      ["@ugoite/ikasue", "dependency-free DOM enhancerとCustom Elements。"],
      ["@ugoite/ikasue-solid", "ugoite用の薄いSolid adapter。"],
      ["ikasue-protocol", "RustのUiDocumentとPlaneSpecを同じ契約で扱う。"],
      ["ikasue-html", "semantic HTMLとsingle HTML asset生成。"],
    ]);
    grid.append(main, side);
    content.append(grid);
    topTitle.textContent = "Developer model";
    renderDeveloperDemo(stage, context());
  };

  const renderPage = (focusHeading = false): void => {
    for (const item of pageCleanup) item();
    pageCleanup = [];
    for (const item of propertyCleanup) item();
    propertyCleanup = [];
    content.replaceChildren();
    const component = findPage(currentId);
    if (component.demo === "philosophy") renderPhilosophy();
    else if (component.demo === "developer") renderDeveloper();
    else renderStandardPage(component);
    contentScroll.scrollTop = 0;
    if (focusHeading) focusPageHeading(content);
  };

  const selectComponent = (
    id: CatalogPageId,
    updateUrl = true,
    focusHeading = false,
  ): void => {
    if (disposed || (id === currentId && !updateUrl)) return;
    currentId = id;
    currentProps = defaultProps(id);
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
    currentProps = defaultProps(currentId);
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
  component: CatalogPageMetadata,
  query: string,
): boolean {
  if (!query) return true;
  return [component.id, component.name, component.ja].some((value) =>
    value.toLocaleLowerCase().includes(query),
  );
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
