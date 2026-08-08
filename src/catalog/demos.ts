import { appendLabel, element, setText, svgIcon, type Cleanup } from "./dom";
import {
  commitFormListFields,
  createFormListState,
  getFormField,
  type FormFieldStatus,
} from "./form-state";
import {
  commitTableCell,
  createTableState,
  getTableCell,
  type TableState,
} from "./table-state";
import { findRegistryEntry } from "./registry";
import {
  horizontal,
  resolvePlane,
  vertical,
  type PlaneAxis,
  type PlaneFit,
  type ResolvedPlane,
} from "../plane";
import {
  requestFocus,
  resolveFocusPlane,
  restoreFocusAfterEdgeDismissal,
  type FocusBranch,
  type FocusCollapse,
  type FocusLeaf,
  type FocusNode,
  type FocusPlaneSpec,
  type ResolvedFocusRegion,
} from "../focus-plane";
import type {
  CatalogLocale,
  CatalogComponentRegistryEntry,
  CatalogComponentId,
  CatalogLocalizedText,
  CatalogProps,
  CatalogPropertyValue,
} from "./types";

export interface DemoContext {
  readonly document: Document;
  readonly root: HTMLElement;
  readonly window: Window | null;
  readonly locale?: CatalogLocale;
  /** Updates the owning catalog property without taking over demo rendering. */
  readonly updateProperty?: (key: string, value: CatalogPropertyValue) => void;
  readonly track: (cleanup: Cleanup) => void;
  readonly listen: (
    target: EventTarget,
    type: string,
    handler: (event: Event) => void,
  ) => void;
  readonly openDialog: (title: string, message: string) => void;
}

/** A registry-backed child rendered inside a native vertical or horizontal plane. */
export interface NativePlaneChild {
  readonly id: string;
  readonly basis: number;
  readonly min: number;
  readonly label: CatalogLocalizedText;
  readonly componentId: CatalogComponentId;
  readonly props: CatalogProps;
}

/** The shared composition contract used by catalog demos and examples. */
export interface NativePlaneComposition {
  readonly id: string;
  readonly componentId: "vertical" | "horizontal";
  readonly axis: PlaneAxis;
  readonly fit: PlaneFit;
  readonly gap: number;
  readonly available: number;
  readonly focus?: string;
  readonly navigation: boolean;
  readonly children: readonly NativePlaneChild[];
}

export interface NativePlaneRenderOptions {
  readonly onFocusChange?: (id: string) => void;
  readonly onResolved?: (resolved: ResolvedPlane) => void;
}

export interface NativePlaneRenderer {
  readonly stage: HTMLElement;
  readonly resolved: ResolvedPlane;
  update(composition: NativePlaneComposition): void;
  destroy(): void;
}

/** Resolve every native composition through the same vertical/horizontal API. */
export function resolveNativePlane(
  composition: NativePlaneComposition,
): ResolvedPlane {
  const children = composition.children.map(({ id, basis, min }) => ({
    id,
    basis,
    min,
  }));
  const plane =
    composition.axis === "horizontal"
      ? horizontal(children, {
          fit: composition.fit,
          gap: composition.gap,
          available: composition.available,
          ...(composition.focus === undefined
            ? {}
            : { focus: composition.focus }),
          navigation: composition.navigation,
        })
      : vertical(children, {
          fit: composition.fit,
          gap: composition.gap,
          available: composition.available,
          ...(composition.focus === undefined
            ? {}
            : { focus: composition.focus }),
          navigation: composition.navigation,
        });
  return resolvePlane(plane);
}

interface TextOptions {
  readonly value: string;
  readonly editable: boolean;
  readonly editor: string;
  readonly values?: readonly string[];
  readonly state?: FormFieldStatus;
  readonly draft?: boolean;
  readonly label?: string;
  readonly onCommit?: (value: string) => void;
}

function addListener(
  context: DemoContext,
  target: EventTarget,
  type: string,
  handler: (event: Event) => void,
): void {
  context.listen(target, type, handler);
}

function iconButton(
  context: DemoContext,
  icon: string,
  label: string,
  tooltip = label,
): HTMLButtonElement {
  const button = element(context.document, "button", "icon-button");
  button.type = "button";
  button.setAttribute("aria-label", label);
  button.append(svgIcon(context.document, icon));
  const hint = element(context.document, "span", "tooltip");
  hint.setAttribute("role", "tooltip");
  hint.textContent = tooltip;
  button.append(hint);
  return button;
}

function textAction(context: DemoContext, label: string): HTMLButtonElement {
  const button = element(context.document, "button", "text-action");
  button.type = "button";
  button.textContent = label;
  return button;
}

function paragraph(
  context: DemoContext,
  text: string,
  className?: string,
): HTMLParagraphElement {
  const node = element(context.document, "p", className);
  node.textContent = text;
  return node;
}

function heading(
  context: DemoContext,
  level: "h2" | "h3",
  text: string,
): HTMLHeadingElement {
  const node = element(context.document, level);
  node.textContent = text;
  return node;
}

function clear(container: HTMLElement): void {
  container.replaceChildren();
}

function localized<T>(
  context: DemoContext,
  values: Readonly<Record<CatalogLocale, T>>,
): T {
  return values[context.locale ?? "ja"];
}

function listenForNativePlane(
  target: EventTarget,
  type: string,
  handler: (event: Event) => void,
  cleanup: Cleanup[],
): void {
  target.addEventListener(type, handler);
  cleanup.push(() => {
    target.removeEventListener(type, handler);
  });
}

/**
 * Mounts one registry-backed plane. This is the only renderer that creates
 * plane-demo, plane-viewport, plane-item, and plane-navigation elements.
 */
export function renderNativePlane(
  mount: HTMLElement,
  initial: NativePlaneComposition,
  context: DemoContext,
  options: NativePlaneRenderOptions = {},
): NativePlaneRenderer {
  const stage = element(context.document, "div", "plane-demo");
  stage.id = initial.id;
  stage.setAttribute("role", "region");
  stage.dataset.planeId = initial.id;
  stage.dataset.componentId = initial.componentId;
  mount.replaceChildren(stage);

  let composition = initial;
  let currentResolved = resolveNativePlane(composition);
  const drawCleanup: Cleanup[] = [];
  let destroyed = false;

  const renderer: NativePlaneRenderer = {
    stage,
    get resolved() {
      return currentResolved;
    },
    update(next) {
      if (destroyed) return;
      composition = next;
      draw();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      for (const item of drawCleanup.splice(0)) item();
      mount.replaceChildren();
    },
  };

  const setFocus = (id: string): void => {
    composition = { ...composition, focus: id };
    options.onFocusChange?.(id);
    draw();
  };

  const draw = (): void => {
    if (destroyed) return;
    for (const item of drawCleanup.splice(0)) item();
    currentResolved = resolveNativePlane(composition);
    const resolved = currentResolved;
    const locale = context.locale ?? "ja";
    const english = locale === "en";
    const viewport = element(context.document, "div", "plane-viewport");
    viewport.dataset.axis = resolved.axis;
    viewport.dataset.fit = resolved.fit;
    viewport.dataset.overflow = String(resolved.overflow);
    viewport.setAttribute("data-overflow-policy", "hidden");
    const navigation = element(context.document, "nav", "plane-navigation");
    navigation.dataset.axis = resolved.axis;
    navigation.dataset.fit = resolved.fit;
    navigation.dataset.focus = resolved.focus ?? "";
    navigation.dataset.previous = resolved.previous ?? "";
    navigation.dataset.next = resolved.next ?? "";
    navigation.dataset.canPrevious = String(resolved.canPrevious);
    navigation.dataset.canNext = String(resolved.canNext);
    navigation.setAttribute(
      "aria-label",
      english ? "Plane region navigation" : "plane領域navigation",
    );

    stage.dataset.axis = resolved.axis;
    stage.dataset.fit = resolved.fit;
    stage.dataset.focus = resolved.focus ?? "";
    stage.dataset.overflow = String(resolved.overflow);
    stage.dataset.navigation = String(resolved.navigation);
    stage.dataset.available = String(
      resolved.available ?? composition.available,
    );
    stage.dataset.extent = String(resolved.extent);
    stage.dataset.lines = String(resolved.lines);
    stage.dataset.overflowPolicy =
      resolved.navigation &&
      resolved.children.some(({ collapsed }) => collapsed)
        ? "rail"
        : "visible";
    stage.style.setProperty(
      "--plane-available",
      String(resolved.available ?? composition.available),
    );
    stage.style.setProperty("--plane-gap", String(resolved.gap));
    stage.style.setProperty("--plane-lines", String(resolved.lines));

    const lines = Array.from({ length: resolved.lines }, (_, lineIndex) => {
      const line = element(context.document, "div", "plane-line");
      line.dataset.line = String(lineIndex);
      return line;
    });
    const childContext: DemoContext = {
      ...context,
      track: (item) => {
        drawCleanup.push(item);
      },
      listen: (target, type, handler) => {
        listenForNativePlane(target, type, handler, drawCleanup);
      },
    };
    for (const child of resolved.children) {
      const descriptor = composition.children[child.index];
      if (!descriptor) continue;
      const item = element(context.document, "section", "plane-item");
      item.dataset.id = child.id;
      item.dataset.regionId = descriptor.id;
      item.dataset.componentId = descriptor.componentId;
      item.dataset.line = String(child.line);
      item.dataset.offset = String(child.offset);
      item.dataset.size = String(child.size);
      item.dataset.state = child.state;
      item.dataset.focused = String(child.focused);
      item.dataset.visible = String(child.visible);
      item.dataset.collapsed = String(child.collapsed);
      item.hidden = child.collapsed;
      item.style.setProperty("--plane-size", String(child.size));
      item.style.setProperty("--plane-offset", String(child.offset));
      item.style.setProperty("--plane-line", String(child.line));
      item.setAttribute("role", "group");
      item.setAttribute(
        "aria-label",
        `${descriptor.label[locale]} · ${descriptor.componentId}`,
      );

      const header = element(context.document, "header", "plane-item-header");
      const label = element(context.document, "strong");
      label.textContent = descriptor.label[locale];
      const component = element(context.document, "code");
      component.textContent = descriptor.componentId;
      header.append(label, component);

      const native = element(context.document, "div", "plane-item-native");
      native.dataset.componentId = descriptor.componentId;
      native.dataset.regionId = descriptor.id;
      native.hidden = child.collapsed;
      if (child.visible) {
        renderDemo(
          native,
          findRegistryEntry(descriptor.componentId),
          descriptor.props,
          childContext,
        );
      }
      item.append(header, native);
      lines[child.line]?.append(item);
    }
    viewport.append(...lines);

    const previous = iconButton(
      childContext,
      resolved.axis === "horizontal" ? "left" : "up",
      english ? "Previous region" : "前の領域",
    );
    previous.classList.add("plane-navigation-arrow");
    previous.dataset.direction = "previous";
    previous.disabled = !resolved.canPrevious;
    if (resolved.previous) {
      listenForNativePlane(
        previous,
        "click",
        () => {
          setFocus(resolved.previous as string);
        },
        drawCleanup,
      );
    }

    const selections = element(
      context.document,
      "div",
      "plane-navigation-items",
    );
    selections.setAttribute("role", "group");
    selections.setAttribute(
      "aria-label",
      english ? "Plane regions" : "plane領域選択",
    );
    for (const child of resolved.children) {
      const descriptor = composition.children[child.index];
      if (!descriptor) continue;
      const selection = textAction(childContext, descriptor.label[locale]);
      selection.classList.add("plane-navigation-item");
      selection.dataset.focusId = child.id;
      selection.dataset.componentId = descriptor.componentId;
      selection.dataset.state = child.state;
      selection.dataset.collapsed = String(child.collapsed);
      selection.setAttribute("aria-pressed", String(child.focused));
      selection.setAttribute(
        "aria-label",
        english
          ? `${descriptor.label.en}${child.collapsed ? " (collapsed)" : ""}`
          : `${descriptor.label.ja}${child.collapsed ? "（collapsed）" : ""}`,
      );
      listenForNativePlane(
        selection,
        "click",
        () => {
          setFocus(child.id);
        },
        drawCleanup,
      );
      selections.append(selection);
    }

    const next = iconButton(
      childContext,
      resolved.axis === "horizontal" ? "right" : "down",
      english ? "Next region" : "次の領域",
    );
    next.classList.add("plane-navigation-arrow");
    next.dataset.direction = "next";
    next.disabled = !resolved.canNext;
    if (resolved.next) {
      listenForNativePlane(
        next,
        "click",
        () => {
          setFocus(resolved.next as string);
        },
        drawCleanup,
      );
    }
    navigation.append(previous, selections, next);
    stage.replaceChildren(viewport, navigation);
    options.onResolved?.(resolved);
  };

  context.track(() => {
    renderer.destroy();
  });
  draw();
  return renderer;
}

/** Mounts multiple native planes into one host without introducing an example renderer. */
export function renderPlaneComposition(
  mount: HTMLElement,
  compositions: readonly NativePlaneComposition[],
  context: DemoContext,
): readonly NativePlaneRenderer[] {
  mount.replaceChildren();
  return compositions.map((composition) => {
    const planeMount = element(
      context.document,
      "div",
      "plane-composition-mount",
    );
    planeMount.dataset.planeId = composition.id;
    mount.append(planeMount);
    return renderNativePlane(planeMount, composition, context);
  });
}

export function renderDemo(
  container: HTMLElement,
  component: CatalogComponentRegistryEntry,
  props: CatalogProps,
  context: DemoContext,
): void {
  clear(container);
  switch (component.demo) {
    case "theme":
      renderTheme(container, props, context);
      break;
    case "text":
      renderText(container, props, context);
      break;
    case "rule":
      renderRule(container, props, context);
      break;
    case "status":
      renderStatus(container, props, context);
      break;
    case "plane":
      renderPlane(container, component, props, context);
      break;
    case "icon-action":
      renderIconAction(container, props, context);
      break;
    case "action-strip":
      renderActionStrip(container, props, context);
      break;
    case "boolean":
      renderBoolean(container, props, context);
      break;
    case "choice":
      renderChoice(container, props, context);
      break;
    case "form":
      renderForm(container, props, context);
      break;
    case "table":
      renderTable(container, props, context);
      break;
    case "history":
      renderHistory(container, props, context);
      break;
    case "progress":
      renderProgress(container, props, context);
      break;
    case "message":
      renderMessage(container, props, context);
      break;
    case "dialog":
      renderDialog(container, props, context);
      break;
    default:
      paragraph(
        context,
        localized(context, {
          ja: "このcomponentのdemoは準備中です。",
          en: "The demo for this component is not ready yet.",
        }),
        "summary",
      );
      break;
  }
}

function renderTheme(
  container: HTMLElement,
  props: CatalogProps,
  context: DemoContext,
): void {
  const density = String(props.density ?? "normal");
  context.root.style.setProperty(
    "--density",
    density === "compact" ? ".86" : density === "relaxed" ? "1.15" : "1",
  );
  context.root.style.setProperty(
    "--selection",
    props.selection === "strong"
      ? "#e3e4df"
      : props.selection === "clear"
        ? "#ebede8"
        : "#f0f1ed",
  );
  context.root.style.setProperty(
    "--rule",
    props.line === "standard" ? "1.5px" : "1px",
  );
  context.root.style.setProperty(
    "--motion",
    props.motion === "off"
      ? "0ms"
      : props.motion === "quiet"
        ? "180ms"
        : "280ms",
  );

  const stack = element(context.document, "div", "stack");
  stack.append(
    heading(
      context,
      "h2",
      localized(context, {
        ja: "OSの文字資産を使う",
        en: "Use the operating system font",
      }),
    ),
    paragraph(
      context,
      localized(context, {
        ja: "日本語とEnglishが同じbaselineで並びます。選択された行だけが静かに面積を受け取ります。",
        en: "Japanese and English share the same baseline. Only the selected row quietly receives more area.",
      }),
    ),
  );
  const cluster = element(context.document, "div", "cluster");
  for (const [label, active] of [
    [localized(context, { ja: "通常", en: "Normal" }), false],
    [localized(context, { ja: "選択中", en: "Selected" }), true],
    [localized(context, { ja: "補助", en: "Supporting" }), false],
  ] as const) {
    const item = element(context.document, "span", "plain-item");
    item.dataset.active = String(active);
    item.textContent = label;
    cluster.append(item);
  }
  stack.append(cluster);
  container.append(stack);
}

function renderText(
  container: HTMLElement,
  props: CatalogProps,
  context: DemoContext,
): void {
  const stack = element(context.document, "div", "stack");
  const departmentLabel = localized(context, { ja: "部署", en: "Department" });
  stack.append(paragraph(context, departmentLabel));
  const host = element(context.document, "span", "info-text");
  host.id = "demoText";
  let value = String(
    props.value ??
      localized(context, { ja: "東京オフィス", en: "Tokyo office" }),
  );
  const draw = (): void => {
    createInfoText(
      host,
      {
        value,
        editable: props.editable === true,
        editor: String(props.editor ?? "text"),
        state: String(props.state ?? "clean") as FormFieldStatus,
        label: departmentLabel,
        onCommit: (nextValue) => {
          value = nextValue;
          draw();
        },
      },
      context,
    );
  };
  draw();
  stack.append(host);
  stack.append(
    paragraph(
      context,
      localized(context, {
        ja: "ダブルクリック、Enter、F2で編集。編集中は破線が消え、黒線は一本だけ。",
        en: "Double-click, press Enter, or press F2 to edit. The dashed line disappears while editing, leaving one black line.",
      }),
    ),
  );
  container.append(stack);
}

function renderRule(
  container: HTMLElement,
  props: CatalogProps,
  context: DemoContext,
): void {
  const axis = String(props.axis ?? "horizontal");
  const weight = props.weight === "standard" ? "standard" : "hairline";
  if (axis === "horizontal") {
    const wrapper = element(context.document, "div");
    wrapper.append(
      paragraph(
        context,
        localized(context, { ja: "上の情報", en: "Information above" }),
      ),
    );
    const section = element(context.document, "div", "rule-section");
    section.dataset.weight = weight;
    section.append(
      paragraph(
        context,
        localized(context, {
          ja: "境界線の後の情報",
          en: "Information after the boundary",
        }),
      ),
    );
    wrapper.append(section);
    container.append(wrapper);
    return;
  }
  const wrapper = element(context.document, "div", "rule-demo-vertical");
  const left = element(context.document, "div");
  left.textContent = localized(context, {
    ja: "左の情報",
    en: "Information left",
  });
  const right = element(context.document, "div");
  right.textContent = localized(context, {
    ja: "右の情報",
    en: "Information right",
  });
  right.dataset.weight = weight;
  wrapper.append(left, right);
  container.append(wrapper);
}

function renderStatus(
  container: HTMLElement,
  props: CatalogProps,
  context: DemoContext,
): void {
  const kind = String(props.kind ?? "success");
  const icon =
    kind === "success"
      ? "check"
      : kind === "warning"
        ? "warning"
        : kind === "error"
          ? "error"
          : "info";
  const color =
    kind === "success"
      ? "var(--success)"
      : kind === "warning"
        ? "var(--warning)"
        : kind === "error"
          ? "var(--error-ink)"
          : "var(--info)";
  const cluster = element(context.document, "div", "cluster");
  const action = iconButton(
    context,
    icon,
    String(props.label ?? localized(context, { ja: "同期済み", en: "Synced" })),
    String(props.label ?? localized(context, { ja: "同期済み", en: "Synced" })),
  );
  action.style.color = color;
  cluster.append(
    action,
    paragraph(
      context,
      localized(context, {
        ja: "hoverまたはfocusで説明",
        en: "The explanation appears on hover or focus",
      }),
    ),
  );
  container.append(cluster);
}

function renderPlane(
  container: HTMLElement,
  component: CatalogComponentRegistryEntry,
  props: CatalogProps,
  context: DemoContext,
): void {
  const axis: "vertical" | "horizontal" =
    component.id === "horizontal" ? "horizontal" : "vertical";
  const componentId = axis;
  const fitProperty = component.properties.find(
    (property) => property.key === "fit",
  );
  const fitOptions = ["elastic", "wrap"].filter((value) =>
    fitProperty?.values.includes(value),
  ) as Array<"elastic" | "wrap">;
  const fitValue = props.fit;
  let activeFit = isPlaneFit(fitValue) ? fitValue : "elastic";
  if (fitOptions.length && !fitOptions.includes(activeFit))
    activeFit = fitOptions[0] ?? "elastic";
  const gapValues: Record<string, number> = { none: 0, sm: 1, md: 2, lg: 3 };
  const requestedBasisValue = Number(props.basis ?? 2);
  const requestedBasis = Number.isFinite(requestedBasisValue)
    ? Math.max(0.5, requestedBasisValue)
    : 2;
  const availableValue = Number(props.available ?? 6);
  const available = Number.isFinite(availableValue)
    ? Math.max(1, availableValue)
    : 6;
  const countValue = Number(props.items ?? 3);
  const count = Number.isFinite(countValue)
    ? Math.max(0, Math.floor(countValue))
    : 3;
  let focusId: string | undefined = count > 0 ? "item-1" : undefined;
  const stageId = `plane-${componentId}-stage`;
  const stageMount = element(context.document, "div", "plane-demo-mount");

  const fitDescriptions = planeFitDescriptions(context.locale === "en");
  const controls = element(context.document, "div", "plane-controls");
  const result = paragraph(context, "", "plane-result");
  result.setAttribute("role", "status");
  result.setAttribute("aria-live", "polite");
  result.id = `${stageId}-result`;

  const createChildren = (
    fit: "elastic" | "wrap",
  ): readonly NativePlaneChild[] =>
    Array.from({ length: count }, (_, index) => {
      const number = index + 1;
      const label = {
        ja: `要素 ${String(number)}`,
        en: `Item ${String(number)}`,
      };
      return {
        id: `item-${String(number)}`,
        basis: requestedBasis,
        min: fit === "elastic" ? requestedBasis * 0.5 : requestedBasis,
        label,
        componentId: "text",
        props: {
          editable: false,
          editor: "text",
          state: "clean",
          value: context.locale === "en" ? label.en : label.ja,
        },
      };
    });

  const createComposition = (
    fit: "elastic" | "wrap",
    focus: string | undefined,
  ): NativePlaneComposition => ({
    id: stageId,
    componentId,
    axis,
    fit,
    gap: gapValues[String(props.gap ?? "md")] ?? 2,
    available,
    ...(focus === undefined ? {} : { focus }),
    navigation: true,
    children: createChildren(fit),
  });

  const syncResolved = (resolved: ResolvedPlane): void => {
    if (fitOptions.length) {
      const description = controls.querySelector<HTMLElement>(
        ".plane-fit-description",
      );
      if (description) description.textContent = fitDescriptions[resolved.fit];
      syncFitTabs(
        controls.querySelector<HTMLElement>("[role=tablist]"),
        resolved.fit,
        fitOptions,
      );
    }
    result.textContent = planeResultText(
      resolved,
      requestedBasis,
      count,
      context.locale === "en",
    );
  };

  if (fitOptions.length) {
    const tablist = element(context.document, "div", "plane-fit-tabs");
    tablist.setAttribute("role", "tablist");
    tablist.setAttribute(
      "aria-label",
      context.locale === "en" ? "Plane fit policy" : "planeの適応方針",
    );
    const description = paragraph(context, "", "plane-fit-description");
    description.id = `${stageId}-description`;
    const activate = (nextFit: (typeof fitOptions)[number]): void => {
      activeFit = nextFit;
      context.updateProperty?.("fit", nextFit);
      syncFitTabs(tablist, activeFit, fitOptions);
      renderer.stage.setAttribute("data-transition", "fit");
      renderer.update(createComposition(activeFit, focusId));
      if (context.window) {
        const settle = context.window.setTimeout(() => {
          renderer.stage.setAttribute("data-transition", "settled");
        }, 0);
        context.track(() => context.window?.clearTimeout(settle));
      }
    };
    for (const option of fitOptions) {
      const tab = element(context.document, "button", "plane-fit-tab");
      tab.type = "button";
      tab.id = `${stageId}-tab-${option}`;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", stageId);
      tab.textContent = option;
      tab.dataset.fit = option;
      addListener(context, tab, "click", () => {
        activate(option);
      });
      tablist.append(tab);
    }
    addListener(context, tablist, "keydown", (event) => {
      const keyboard = event as KeyboardEvent;
      const target = keyboard.target;
      if (!(target instanceof HTMLButtonElement)) return;
      const index = fitOptions.indexOf(
        target.dataset.fit as (typeof fitOptions)[number],
      );
      if (index < 0) return;
      let next = index;
      if (keyboard.key === "ArrowRight") next = (index + 1) % fitOptions.length;
      if (keyboard.key === "ArrowLeft")
        next = (index - 1 + fitOptions.length) % fitOptions.length;
      if (keyboard.key === "Home") next = 0;
      if (keyboard.key === "End") next = fitOptions.length - 1;
      if (next === index) return;
      keyboard.preventDefault();
      const nextFit = fitOptions[next];
      if (!nextFit) return;
      activate(nextFit);
      tablist
        .querySelector<HTMLButtonElement>(`[data-fit="${nextFit}"]`)
        ?.focus();
    });
    controls.append(tablist, description);
    const fitHelp = element(context.document, "dl", "plane-fit-help");
    for (const option of ["elastic", "wrap"] as const) {
      const term = element(context.document, "dt");
      term.textContent = option;
      const detail = element(context.document, "dd");
      detail.textContent = fitDescriptions[option];
      fitHelp.append(term, detail);
    }
    controls.append(fitHelp);
  }
  controls.append(result);

  container.append(controls, stageMount);
  const renderer = renderNativePlane(
    stageMount,
    createComposition(activeFit, focusId),
    context,
    {
      onFocusChange: (id) => {
        focusId = id;
      },
      onResolved: (resolved) => {
        focusId = resolved.focus;
        syncResolved(resolved);
      },
    },
  );
  const description = controls.querySelector<HTMLElement>(
    ".plane-fit-description",
  );
  if (description)
    renderer.stage.setAttribute("aria-describedby", description.id);
}

function isPlaneFit(
  value: CatalogPropertyValue | undefined,
): value is "elastic" | "wrap" {
  return value === "elastic" || value === "wrap";
}

function planeFitDescriptions(
  english: boolean,
): Record<"elastic" | "wrap", string> {
  return english
    ? {
        elastic:
          "Elastic keeps one plane and gives the focused region priority; constrained siblings collapse for navigation.",
        wrap: "Wrap keeps resolved sizes and adds lines: vertical adds columns; horizontal adds rows.",
      }
    : {
        elastic:
          "elasticは一枚のplaneを保ち、focus中の領域へ面積を譲ります。狭いときは他の領域をnavigation用にcollapseします。",
        wrap: "wrapはresolverのsizeを保ち、verticalは横へ、horizontalは下へlineを増やします。",
      };
}

function syncFitTabs(
  tablist: HTMLElement | null,
  fit: "elastic" | "wrap",
  options: readonly ("elastic" | "wrap")[],
): void {
  if (!tablist) return;
  for (const tab of tablist.querySelectorAll<HTMLButtonElement>("[role=tab]")) {
    const active = tab.dataset.fit === fit;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  }
  if (!options.includes(fit)) return;
}

function formatPlaneNumber(value: number): string {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/0+$/, "");
}

function planeResultText(
  resolved: ReturnType<typeof resolvePlane>,
  requestedBasis: number,
  count: number,
  english: boolean,
): string {
  const states = resolved.children
    .map((child) => `${child.id}:${child.state}`)
    .join(", ");
  return english
    ? `Resolved: axis ${resolved.axis}; fit ${resolved.fit}; focus ${resolved.focus ?? "none"}; navigation ${String(resolved.navigation)}; ${String(count)} items; requested basis ${formatPlaneNumber(requestedBasis)}; available ${formatPlaneNumber(resolved.available ?? 0)}; lines ${String(resolved.lines)}; extent ${formatPlaneNumber(resolved.extent)}; overflow ${String(resolved.overflow)}; states ${states}.`
    : `resolved: axis=${resolved.axis} / fit=${resolved.fit} / focus=${resolved.focus ?? "none"} / navigation=${String(resolved.navigation)} / items=${String(count)} / requested basis=${formatPlaneNumber(requestedBasis)} / available=${formatPlaneNumber(resolved.available ?? 0)} / lines=${String(resolved.lines)} / extent=${formatPlaneNumber(resolved.extent)} / overflow=${String(resolved.overflow)} / states=${states}`;
}
function renderIconAction(
  container: HTMLElement,
  props: CatalogProps,
  context: DemoContext,
): void {
  const map: Record<string, string> = {
    save: "save",
    add: "plus",
    edit: "edit",
    delete: "error",
  };
  const action = String(props.action ?? "save");
  const state = String(props.state ?? "enabled");
  const button = iconButton(context, map[action] ?? "save", action, action);
  button.disabled = state === "disabled";
  const result = element(context.document, "span");
  result.style.marginLeft = "10px";
  result.style.color = "var(--muted)";
  result.textContent = state;
  addListener(context, button, "click", () => {
    setText(
      result,
      state === "busy"
        ? localized(context, { ja: "処理中…", en: "Processing…" })
        : localized(context, {
            ja: `${action} を実行`,
            en: `Run ${action}`,
          }),
    );
  });
  container.append(button, result);
}

function renderActionStrip(
  container: HTMLElement,
  props: CatalogProps,
  context: DemoContext,
): void {
  const strip = element(context.document, "div", "action-strip");
  strip.dataset.density = String(props.density ?? "normal");
  const actions: readonly [string, string][] = [
    ["save", "save"],
    ["history", "philosophy"],
    ["refresh", "developer-model"],
  ];
  for (const [name, icon] of actions) {
    const button = iconButton(context, icon, name, name);
    button.setAttribute("aria-pressed", String(name === props.active));
    addListener(context, button, "click", () => {
      for (const sibling of strip.querySelectorAll("button"))
        sibling.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-pressed", "true");
    });
    strip.append(button);
  }
  container.append(strip);
}

function renderBoolean(
  container: HTMLElement,
  props: CatalogProps,
  context: DemoContext,
): void {
  const button = element(context.document, "button", "boolean-text");
  button.type = "button";
  button.setAttribute("role", "checkbox");
  let checked = props.checked === true;
  const check = element(context.document, "span", "check-slot");
  const label = element(context.document, "span");
  label.textContent = String(
    props.label ??
      localized(context, {
        ja: "自動保存を有効にする",
        en: "Enable automatic save",
      }),
  );
  const update = (): void => {
    button.setAttribute("aria-checked", String(checked));
    check.replaceChildren();
    if (checked) check.append(svgIcon(context.document, "check"));
  };
  button.append(check, label);
  addListener(context, button, "click", () => {
    checked = !checked;
    update();
  });
  update();
  container.append(button);
}

function renderChoice(
  container: HTMLElement,
  props: CatalogProps,
  context: DemoContext,
): void {
  const group = element(context.document, "div", "choice-group");
  group.dataset.direction = String(props.direction ?? "horizontal");
  group.setAttribute("role", "radiogroup");
  const options = ["compact", "standard", "review"];
  let selected = options.indexOf(String(props.selected ?? "standard"));
  if (selected < 0) selected = 0;
  const buttons: HTMLButtonElement[] = [];
  const set = (index: number): void => {
    selected = index;
    for (const [optionIndex, button] of buttons.entries())
      button.setAttribute("aria-checked", String(optionIndex === selected));
  };
  for (const [index, value] of options.entries()) {
    const option = textAction(context, value);
    option.classList.add("choice-option");
    option.setAttribute("role", "radio");
    buttons.push(option);
    addListener(context, option, "click", () => {
      set(index);
    });
    addListener(context, option, "keydown", (event) => {
      const keyboard = event as KeyboardEvent;
      if (["ArrowRight", "ArrowDown"].includes(keyboard.key)) {
        keyboard.preventDefault();
        const next = (index + 1) % buttons.length;
        set(next);
        buttons[next]?.focus();
      } else if (["ArrowLeft", "ArrowUp"].includes(keyboard.key)) {
        keyboard.preventDefault();
        const next = (index - 1 + buttons.length) % buttons.length;
        set(next);
        buttons[next]?.focus();
      }
    });
    group.append(option);
  }
  set(selected);
  container.append(group);
}

function renderForm(
  container: HTMLElement,
  props: CatalogProps,
  context: DemoContext,
): void {
  const statuses: readonly FormFieldStatus[] =
    props.state === "mixed"
      ? ["created", "modified", "clean"]
      : props.state === "error"
        ? ["clean", "error", "clean"]
        : ["clean", "clean", "clean"];
  const form = element(context.document, "div", "form-list");
  form.dataset.marker = String(props.marker ?? "bullet");
  const labels = [
    localized(context, { ja: "名称", en: "Name" }),
    localized(context, { ja: "拠点", en: "Location" }),
    localized(context, { ja: "説明", en: "Description" }),
  ] as const;
  const values: readonly [string, string][] = [
    [localized(context, { ja: "プロジェクト藍", en: "Project Aoi" }), "text"],
    [localized(context, { ja: "東京オフィス", en: "Tokyo office" }), "select"],
    [
      localized(context, {
        ja: "顧客データの整理",
        en: "Organize customer data",
      }),
      "textarea",
    ],
  ];
  const definitions = labels.map((label, index) => {
    const [value, editor] = values[index] ?? ["", "text"];
    return {
      id:
        ["name", "location", "description"][index] ?? `field-${String(index)}`,
      label,
      value,
      editor,
      status: statuses[index] ?? "clean",
    };
  });
  let formState = createFormListState(
    definitions.map(({ id, value, status }) => ({
      id,
      value,
      status,
    })),
  );
  let drafts: Readonly<Record<string, string>> = {};
  const actions = element(context.document, "div", "form-list-actions");
  const send = textAction(
    context,
    localized(context, { ja: "FormListへ送信", en: "Send to FormList" }),
  );
  send.dataset.action = "form-list-send";
  send.setAttribute(
    "aria-label",
    localized(context, {
      ja: "未送信のdraftをFormListへ送信",
      en: "Send unsent drafts to FormList",
    }),
  );
  const sendStatus = paragraph(
    context,
    localized(context, {
      ja: "未送信のdraftはありません。",
      en: "There are no unsent drafts.",
    }),
    "form-list-status",
  );
  sendStatus.setAttribute("role", "status");
  sendStatus.setAttribute("aria-live", "polite");
  actions.append(send, sendStatus);

  const updateSendStatus = (message?: string): void => {
    if (message) {
      sendStatus.textContent = message;
      return;
    }
    const count = Object.keys(drafts).length;
    sendStatus.textContent = count
      ? localized(context, {
          ja: `${String(count)}件のdraftが未送信です。`,
          en: `${String(count)} draft${count === 1 ? " is" : "s are"} unsent.`,
        })
      : localized(context, {
          ja: "未送信のdraftはありません。",
          en: "There are no unsent drafts.",
        });
  };
  const fieldRenderers: Array<() => void> = [];
  for (const definition of definitions) {
    const row = element(context.document, "div", "form-row");
    appendLabel(context.document, row, definition.label);
    const field = element(context.document, "span", "info-text");
    const renderField = (): void => {
      const state = getFormField(formState, definition.id);
      if (!state) return;
      const draft = drafts[definition.id];
      const hasDraft = draft !== undefined;
      createInfoText(
        field,
        {
          editable: true,
          value: draft ?? state.value,
          editor: definition.editor,
          state: hasDraft ? "clean" : state.status,
          draft: hasDraft,
          label: definition.label,
          onCommit: (value) => {
            drafts = { ...drafts, [definition.id]: value };
            renderField();
            updateSendStatus();
          },
        },
        context,
      );
    };
    fieldRenderers.push(renderField);
    renderField();
    row.append(field);
    form.append(row);
  }
  addListener(context, send, "click", () => {
    const count = Object.keys(drafts).length;
    if (!count) {
      updateSendStatus(
        localized(context, {
          ja: "送信するdraftはありません。",
          en: "There are no drafts to send.",
        }),
      );
      return;
    }
    formState = commitFormListFields(formState, drafts);
    drafts = {};
    for (const renderField of fieldRenderers) renderField();
    updateSendStatus(
      localized(context, {
        ja: `${String(count)}件のdraftをFormListへ送信しました。`,
        en: `Sent ${String(count)} draft${count === 1 ? "" : "s"} to FormList.`,
      }),
    );
  });
  container.append(actions, form);
}

export function createInfoText(
  host: HTMLElement,
  options: TextOptions,
  context: DemoContext,
): void {
  host.className = "info-text";
  host.dataset.editable = String(options.editable);
  host.dataset.draft = String(options.draft === true);
  host.dataset.state = options.draft ? "clean" : (options.state ?? "clean");
  host.dataset.editing = "false";
  host.dataset.editor = options.editor;
  const read = element(context.document, "span", "read-value");
  read.tabIndex = options.editable ? 0 : -1;
  if (options.label) read.setAttribute("aria-label", options.label);
  read.textContent = options.value;
  host.replaceChildren(read);
  if (options.editable) {
    const typeIcon = element(context.document, "span", "type-icon");
    typeIcon.append(svgIcon(context.document, options.editor));
    host.append(typeIcon);
    const start = (): void => {
      startInfoEdit(host, options, context);
    };
    addListener(context, read, "dblclick", start);
    addListener(context, read, "keydown", (event) => {
      const keyboard = event as KeyboardEvent;
      if (keyboard.key === "Enter" || keyboard.key === "F2") {
        keyboard.preventDefault();
        start();
      }
    });
  }
}

function startInfoEdit(
  host: HTMLElement,
  options: TextOptions,
  context: DemoContext,
): void {
  if (host.dataset.editing === "true") return;
  host.dataset.editing = "true";
  const read = host.querySelector<HTMLElement>(".read-value");
  const old = read?.textContent ?? "";
  let editor: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  let editorContainer: HTMLElement | null = null;
  if (options.editor === "select") {
    const select = element(context.document, "select");
    const selectControl = element(context.document, "span", "select-control");
    const values = options.values ?? [
      localized(context, { ja: "東京オフィス", en: "Tokyo office" }),
      localized(context, { ja: "大阪オフィス", en: "Osaka office" }),
      localized(context, { ja: "福岡オフィス", en: "Fukuoka office" }),
    ];
    for (const value of values) {
      const option = element(context.document, "option");
      option.value = value;
      option.textContent = value;
      option.selected = value === old;
      select.append(option);
    }
    selectControl.append(select);
    host.append(selectControl);
    editorContainer = selectControl;
    editor = select;
  } else if (options.editor === "textarea") {
    const textarea = element(context.document, "textarea");
    textarea.value = old;
    editor = textarea;
  } else {
    const input = element(context.document, "input");
    input.type = ["email", "number", "date"].includes(options.editor)
      ? options.editor
      : "text";
    input.value = old;
    editor = input;
  }
  if (options.label) editor.setAttribute("aria-label", options.label);
  if (!host.contains(editor)) host.append(editor);
  editor.focus();
  if ("select" in editor) editor.select();
  let finished = false;
  const commit = (): void => {
    if (finished) return;
    finished = true;
    const value = editor.value;
    editor.remove();
    editorContainer?.remove();
    host.dataset.editing = "false";
    if (read) read.textContent = value;
    if (options.onCommit) options.onCommit(value);
  };
  const cancel = (): void => {
    if (finished) return;
    finished = true;
    editor.remove();
    editorContainer?.remove();
    host.dataset.editing = "false";
    read?.focus();
  };
  addListener(context, editor, "keydown", (event) => {
    const keyboard = event as KeyboardEvent;
    if (keyboard.key === "Escape") {
      keyboard.preventDefault();
      cancel();
    } else if (keyboard.key === "Enter" && options.editor !== "textarea") {
      keyboard.preventDefault();
      commit();
    } else if (keyboard.key === "Tab") {
      commit();
    }
  });
  if (options.editor === "select")
    addListener(context, editor, "change", commit);
  addListener(context, editor, "blur", commit);
}

function renderTable(
  container: HTMLElement,
  props: CatalogProps,
  context: DemoContext,
): void {
  const wrap = element(context.document, "div", "data-table-wrap");
  const table = element(context.document, "table", "data-table");
  const headers = [
    localized(context, { ja: "名前", en: "Name" }),
    localized(context, { ja: "部門", en: "Department" }),
    localized(context, { ja: "拠点", en: "Location" }),
  ];
  const head = element(context.document, "thead");
  const headerRow = element(context.document, "tr");
  for (const label of headers) {
    const cell = element(context.document, "th");
    cell.scope = "col";
    cell.textContent = label;
    headerRow.append(cell);
  }
  head.append(headerRow);
  const body = element(context.document, "tbody");
  const rows = [
    [
      "Alpha",
      localized(context, { ja: "営業", en: "Sales" }),
      localized(context, { ja: "東京", en: "Tokyo" }),
    ],
    [
      "Beta",
      localized(context, { ja: "開発", en: "Engineering" }),
      localized(context, { ja: "大阪", en: "Osaka" }),
    ],
    [
      "Gamma",
      localized(context, { ja: "運用", en: "Operations" }),
      localized(context, { ja: "福岡", en: "Fukuoka" }),
    ],
  ] as const;
  const tableState = createTableState(
    rows.flatMap((row, rowIndex) =>
      row.map((value, columnIndex) => ({
        id: `${String(rowIndex)}:${String(columnIndex)}`,
        value,
        status:
          props.changes === true && rowIndex === 0 && columnIndex === 0
            ? "modified"
            : props.changes === true && rowIndex === 1 && columnIndex === 2
              ? "created"
              : "clean",
      })),
    ),
  );
  const cells: HTMLTableCellElement[] = [];
  for (const [rowIndex, row] of rows.entries()) {
    const rowElement = element(context.document, "tr");
    for (const [columnIndex, value] of row.entries()) {
      const cell = element(context.document, "td");
      cell.tabIndex = 0;
      cell.dataset.r = String(rowIndex);
      cell.dataset.c = String(columnIndex);
      cell.dataset.label = headers[columnIndex] ?? "";
      cell.dataset.state =
        getTableCell(tableState, cellKey(cell))?.status ?? "clean";
      cell.textContent = value;
      cells.push(cell);
      rowElement.append(cell);
    }
    body.append(rowElement);
  }
  table.append(head, body);
  wrap.append(table);
  container.append(wrap);
  enhanceTable(table, cells, props, context, tableState);
}

function cellKey(cell: HTMLTableCellElement): string {
  return `${cell.dataset.r ?? ""}:${cell.dataset.c ?? ""}`;
}

function syncTableCell(cell: HTMLTableCellElement, state: TableState): void {
  const current = getTableCell(state, cellKey(cell));
  if (!current) return;
  cell.textContent = current.value;
  cell.dataset.state = current.status;
}

function enhanceTable(
  table: HTMLTableElement,
  cells: readonly HTMLTableCellElement[],
  props: CatalogProps,
  context: DemoContext,
  initialState: TableState,
): void {
  let tableState = initialState;
  let selected: HTMLTableCellElement | undefined;
  const commit = (cell: HTMLTableCellElement, value: string): void => {
    tableState = commitTableCell(tableState, cellKey(cell), value);
    syncTableCell(cell, tableState);
  };
  const select = (cell: HTMLTableCellElement): void => {
    selected = cell;
    for (const candidate of cells) {
      const sameRow = candidate.dataset.r === cell.dataset.r;
      const sameColumn = candidate.dataset.c === cell.dataset.c;
      candidate.dataset.selected = String(candidate === cell);
      candidate.dataset.rowPeer = String(
        props.selection === "row-column" && sameRow && candidate !== cell,
      );
      candidate.dataset.colPeer = String(
        props.selection === "row-column" && sameColumn && candidate !== cell,
      );
      candidate.setAttribute("aria-selected", String(candidate === cell));
    }
  };
  const move = (
    cell: HTMLTableCellElement,
    rowDelta: number,
    columnDelta: number,
  ): void => {
    const row = Number(cell.dataset.r) + rowDelta;
    const column = Number(cell.dataset.c) + columnDelta;
    const next = table.querySelector<HTMLTableCellElement>(
      `td[data-r="${String(row)}"][data-c="${String(column)}"]`,
    );
    if (next) {
      select(next);
      next.focus();
    }
  };
  for (const cell of cells) {
    addListener(context, cell, "click", () => {
      select(cell);
    });
    addListener(context, cell, "dblclick", () => {
      if (props.editable === true) {
        editCell(cell, context, tableState, (nextState) => {
          tableState = nextState;
          syncTableCell(cell, tableState);
        });
      }
    });
    addListener(context, cell, "keydown", (event) => {
      const keyboard = event as KeyboardEvent;
      if (
        (keyboard.ctrlKey || keyboard.metaKey) &&
        keyboard.key.toLowerCase() === "c"
      ) {
        keyboard.preventDefault();
        void copyText(context, cell.textContent);
      } else if (
        (keyboard.ctrlKey || keyboard.metaKey) &&
        keyboard.key.toLowerCase() === "v" &&
        props.editable === true
      ) {
        keyboard.preventDefault();
        void pasteCell(context, (value) => {
          commit(cell, value);
        });
      } else if (
        (keyboard.key === "Enter" || keyboard.key === "F2") &&
        props.editable === true
      ) {
        keyboard.preventDefault();
        editCell(cell, context, tableState, (nextState) => {
          tableState = nextState;
          syncTableCell(cell, tableState);
        });
      } else if (keyboard.key === "ArrowRight") {
        keyboard.preventDefault();
        move(cell, 0, 1);
      } else if (keyboard.key === "ArrowLeft") {
        keyboard.preventDefault();
        move(cell, 0, -1);
      } else if (keyboard.key === "ArrowDown") {
        keyboard.preventDefault();
        move(cell, 1, 0);
      } else if (keyboard.key === "ArrowUp") {
        keyboard.preventDefault();
        move(cell, -1, 0);
      }
    });
    addListener(context, cell, "paste", (event) => {
      if (props.editable !== true) return;
      const clipboard = (event as ClipboardEvent).clipboardData;
      const value = clipboard?.getData("text");
      if (value !== undefined) {
        event.preventDefault();
        commit(cell, value);
      }
    });
  }
  const first = cells[0];
  if (first) {
    selected = first;
    select(first);
  }
  void selected;
}

async function copyText(context: DemoContext, value: string): Promise<void> {
  const clipboard =
    context.window === null ? undefined : context.window.navigator.clipboard;
  if (clipboard?.writeText) {
    try {
      await clipboard.writeText(value);
      return;
    } catch {
      // Browser permissions can reject; use the text selection fallback below.
    }
  }
  const textarea = element(context.document, "textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  context.document.body.append(textarea);
  textarea.select();
  try {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    context.document.execCommand("copy");
  } catch {
    // Clipboard is an enhancement; leave the selected value available.
  }
  textarea.remove();
}

async function pasteCell(
  context: DemoContext,
  commit: (value: string) => void,
): Promise<void> {
  const clipboard =
    context.window === null ? undefined : context.window.navigator.clipboard;
  if (!clipboard?.readText) return;
  try {
    const value = await clipboard.readText();
    commit(value);
  } catch {
    // Clipboard permissions are optional.
  }
}

function editCell(
  cell: HTMLTableCellElement,
  context: DemoContext,
  state: TableState,
  onCommit: (nextState: TableState) => void,
): void {
  if (cell.querySelector("input")) return;
  const old = cell.textContent;
  const input = element(context.document, "input");
  input.value = old;
  cell.replaceChildren(input);
  input.focus();
  input.select();
  let finished = false;
  const commit = (): void => {
    if (finished) return;
    finished = true;
    onCommit(commitTableCell(state, cellKey(cell), input.value));
  };
  const cancel = (): void => {
    if (finished) return;
    finished = true;
    cell.textContent = old;
  };
  addListener(context, input, "keydown", (event) => {
    const keyboard = event as KeyboardEvent;
    if (keyboard.key === "Enter" || keyboard.key === "Tab") {
      keyboard.preventDefault();
      commit();
    } else if (keyboard.key === "Escape") {
      keyboard.preventDefault();
      cancel();
    }
  });
  addListener(context, input, "blur", commit);
}

function renderHistory(
  container: HTMLElement,
  props: CatalogProps,
  context: DemoContext,
): void {
  const gutter = element(context.document, "div", "history-gutter");
  gutter.dataset.compact = String(props.compact === true);
  const values: readonly [string, string][] = [
    [
      "current",
      localized(context, {
        ja: "現在・説明を編集",
        en: "Current · edit description",
      }),
    ],
    [
      "previous",
      localized(context, {
        ja: "1時間前・担当を変更",
        en: "1 hour ago · change owner",
      }),
    ],
    ["initial", localized(context, { ja: "作成時", en: "At creation" })],
  ];
  for (const [value, label] of values) {
    const entry = textAction(context, label);
    entry.classList.add("history-entry");
    entry.setAttribute("aria-current", String(value === props.selected));
    addListener(context, entry, "click", () => {
      for (const sibling of gutter.querySelectorAll(".history-entry"))
        sibling.setAttribute("aria-current", "false");
      entry.setAttribute("aria-current", "true");
    });
    gutter.append(entry);
  }
  container.append(gutter);
}

function renderProgress(
  container: HTMLElement,
  props: CatalogProps,
  context: DemoContext,
): void {
  const progress = element(context.document, "div", "progress-region");
  progress.dataset.loading = String(props.loading === true);
  progress.dataset.pattern = String(props.pattern ?? "wave");
  progress.setAttribute("role", "status");
  progress.setAttribute("aria-busy", String(props.loading === true));
  progress.append(
    heading(
      context,
      "h2",
      localized(context, { ja: "顧客一覧", en: "Customer list" }),
    ),
    paragraph(
      context,
      localized(context, {
        ja: "以前の内容を読みながら、対象領域の更新だけを確認できます。",
        en: "Review only the updated region while keeping previous content visible.",
      }),
    ),
  );
  const item = element(context.document, "div", "plain-item");
  item.textContent = localized(context, {
    ja: "北関東支店 / 更新 14:32",
    en: "North Kanto branch / updated 14:32",
  });
  progress.append(item);
  const status = element(context.document, "span", "progress-status");
  status.textContent =
    props.loading === true
      ? localized(context, { ja: "読み込み中", en: "Loading" })
      : localized(context, { ja: "完了", en: "Complete" });
  status.setAttribute("aria-hidden", "true");
  progress.append(status);
  container.append(progress);
}

function renderMessage(
  container: HTMLElement,
  props: CatalogProps,
  context: DemoContext,
): void {
  const kind = String(props.kind ?? "info");
  const color =
    {
      info: "var(--info)",
      success: "var(--success)",
      warning: "var(--warning)",
      error: "var(--error-ink)",
    }[kind] ?? "var(--info)";
  const messageText =
    {
      info: localized(context, {
        ja: "詳細領域に新しい情報があります。",
        en: "New information is available in the detail region.",
      }),
      success: localized(context, {
        ja: "対象領域の変更を保存しました。",
        en: "Changes to the target region were saved.",
      }),
      warning: localized(context, {
        ja: "対象領域に確認事項があります。",
        en: "The target region needs your attention.",
      }),
      error: localized(context, {
        ja: "対象領域の入力にエラーがあります。",
        en: "The target region contains an input error.",
      }),
    }[kind] ??
    localized(context, {
      ja: "対象領域に情報があります。",
      en: "The target region has information.",
    });
  const link = element(context.document, "button", "linked-message");
  link.type = "button";
  link.style.setProperty("--message-color", color);
  const status = element(context.document, "span", "status-icon");
  status.append(svgIcon(context.document, kind === "success" ? "check" : kind));
  const text = element(context.document, "span");
  text.textContent = messageText;
  link.append(status, text, svgIcon(context.document, "right"));
  const plane = element(context.document, "div", "message-plane");
  const regions = new Map<string, HTMLElement>();
  for (const [regionId, regionLabel] of [
    ["primary", "Primary"],
    ["secondary", "Secondary"],
  ] as const) {
    const region = element(context.document, "section", "message-target");
    region.dataset.target = regionId;
    region.tabIndex = 0;
    region.append(
      heading(context, "h2", regionLabel),
      paragraph(
        context,
        localized(context, {
          ja: "対象領域の内容を残したまま注意を移します。",
          en: "Move attention without removing the target region's content.",
        }),
      ),
    );
    regions.set(regionId, region);
    plane.append(region);
  }
  addListener(context, link, "click", () => {
    const target = props.target === "primary" ? "primary" : "secondary";
    for (const [regionId, region] of regions) {
      region.dataset.active = String(regionId === target);
      for (const name of ["info", "success", "warning", "error"])
        region.classList.remove(`attention-${name}`);
    }
    const region = regions.get(target);
    region?.classList.add(`attention-${kind}`);
    region?.focus({ preventScroll: true });
  });
  container.append(link, plane);
}

function renderDialog(
  container: HTMLElement,
  props: CatalogProps,
  context: DemoContext,
): void {
  const stack = element(context.document, "div", "stack");
  stack.append(
    paragraph(
      context,
      localized(context, {
        ja: "dialogはこの面の上へ重なりません。",
        en: "The dialog does not overlay this plane.",
      }),
    ),
  );
  const open = textAction(
    context,
    localized(context, { ja: "下端から開く", en: "Open from bottom edge" }),
  );
  open.setAttribute("aria-pressed", "true");
  addListener(context, open, "click", () => {
    const intent = String(props.intent ?? "confirm");
    const message =
      intent === "danger"
        ? localized(context, {
            ja: "この操作は取り消せません。上の対象情報を確認してから確定してください。",
            en: "This action cannot be undone. Review the target information before confirming.",
          })
        : localized(context, {
            ja: "上の情報を残したまま判断できます。",
            en: "You can decide while keeping the information above visible.",
          });
    context.openDialog(
      `${intent} ${localized(context, { ja: "dialog", en: "dialog" })}`,
      message,
    );
  });
  stack.append(open);
  container.append(stack);
}

export function renderPhilosophyDemo(
  container: HTMLElement,
  context: DemoContext,
): void {
  clear(container);
  renderPlane(
    container,
    findRegistryEntry("horizontal"),
    { fit: "elastic", gap: "md", items: "4" },
    context,
  );
}

export function renderDeveloperDemo(
  container: HTMLElement,
  context: DemoContext,
): void {
  clear(container);
  renderFocusWindowDemo(container, context);
}

function focusLeaf(id: string, basis: number): FocusLeaf {
  return { kind: "leaf", id, basis, min: 0.5 };
}

function focusBranch(
  id: string,
  axis: FocusBranch["axis"],
  children: readonly FocusNode[],
  basis = 40,
): FocusBranch {
  return {
    kind: "branch",
    id,
    axis,
    fit: "elastic",
    gap: 1,
    basis,
    min: 2,
    navigation: true,
    children,
  };
}

function focusWindowSpec(
  focus: string,
  edgeOpen: boolean,
  collapse: FocusCollapse,
): FocusPlaneSpec {
  const detail = focusBranch("detail", "horizontal", [
    focusLeaf("source", 32),
    focusLeaf("editor", 32),
    focusLeaf("history", 32),
  ]);
  const beta = focusBranch("beta", "vertical", [
    focusLeaf("overview", 20),
    detail,
    focusLeaf("validation", 20),
  ]);
  const root = focusBranch("work", "horizontal", [
    focusLeaf("alpha", 40),
    beta,
    focusLeaf("gamma", 40),
  ]);
  return {
    root: {
      ...root,
      edgeRegions: edgeOpen
        ? [
            {
              id: "tools",
              edge: "right",
              basis: 12,
              min: 6,
              temporary: true,
              restoreFocus: focus,
            },
            {
              id: "decision",
              edge: "bottom",
              basis: 8,
              min: 4,
              temporary: true,
              restoreFocus: focus,
            },
          ]
        : [],
    },
    focus,
    viewport: { inline: 100, block: 48 },
    collapse,
  };
}

function renderFocusWindowDemo(
  container: HTMLElement,
  context: DemoContext,
): void {
  let focus = "work/beta/detail/editor";
  let collapse: FocusCollapse = "sliver";
  let edgeOpen = false;
  const english = context.locale === "en";
  const draw = (): void => {
    const spec = focusWindowSpec(focus, edgeOpen, collapse);
    const resolved = resolveFocusPlane(spec);
    const wrapper = element(context.document, "div", "focus-window-demo");
    const headingRow = element(context.document, "div", "focus-window-heading");
    headingRow.append(
      heading(
        context,
        "h2",
        english ? "Recursive focus window" : "再帰 focus window",
      ),
      paragraph(
        context,
        english
          ? `focus path: ${resolved.focusPath}`
          : `focus path: ${resolved.focusPath}`,
        "focus-window-path",
      ),
    );
    const controls = element(
      context.document,
      "div",
      "cluster focus-window-controls",
    );
    const request = textAction(
      context,
      english ? "FocusRequest" : "FocusRequestを送る",
    );
    addListener(context, request, "click", () => {
      const nextPath =
        focus === "work/alpha"
          ? "work/beta/overview"
          : focus === "work/beta/overview"
            ? "work/beta/detail/editor"
            : focus === "work/beta/detail/editor"
              ? "work/beta/detail/history"
              : "work/alpha";
      focus =
        requestFocus(spec, { path: nextPath, level: "expanded" }).focus ??
        focus;
      draw();
    });
    const edgeToggle = textAction(
      context,
      edgeOpen
        ? english
          ? "Close edge regions"
          : "辺の領域を閉じる"
        : english
          ? "Open edge regions"
          : "辺の領域を開く",
    );
    edgeToggle.setAttribute("aria-pressed", String(edgeOpen));
    addListener(context, edgeToggle, "click", () => {
      if (edgeOpen) {
        const restore = restoreFocusAfterEdgeDismissal(resolved, "decision");
        if (restore) focus = restore;
      }
      edgeOpen = !edgeOpen;
      draw();
    });
    for (const value of ["sliver", "zero"] as const) {
      const button = textAction(context, value);
      button.setAttribute("aria-pressed", String(collapse === value));
      addListener(context, button, "click", () => {
        collapse = value;
        draw();
      });
      controls.append(button);
    }
    controls.prepend(request, edgeToggle);
    headingRow.append(controls);

    const stage = element(context.document, "div", "focus-window-stage");
    stage.setAttribute("role", "region");
    stage.setAttribute(
      "aria-label",
      english ? "Infinite plane focus window" : "無限平面の focus window",
    );
    stage.dataset.focus = resolved.focusPath;
    stage.dataset.collapse = resolved.collapse;
    const regionMap = new Map(
      resolved.regions.map((region) => [region.path, region]),
    );
    const appendNode = (
      node: FocusNode,
      path: string,
      parent: ResolvedFocusRegion | undefined,
    ): HTMLElement => {
      const region = regionMap.get(path);
      const section = element(
        context.document,
        "section",
        "focus-window-region",
      );
      section.dataset.path = path;
      section.dataset.state = region?.state ?? "visible";
      section.dataset.kind = node.kind;
      section.setAttribute("aria-current", String(path === resolved.focusPath));
      if (parent) {
        const mainSize =
          parent.axis === "horizontal"
            ? (region?.rect.width ?? 0)
            : (region?.rect.height ?? 0);
        section.style.setProperty(
          "--focus-size",
          String(Math.max(0, mainSize)),
        );
        section.style.flex = `${Math.max(0, mainSize)} 1 0`;
      }
      if (node.kind === "leaf") {
        const button = element(context.document, "button", "focus-window-leaf");
        button.type = "button";
        button.setAttribute("aria-label", path);
        addListener(context, button, "click", () => {
          focus = path;
          draw();
        });
        button.append(
          heading(context, "h3", node.id),
          paragraph(
            context,
            path === resolved.focusPath
              ? english
                ? "focused leaf; ancestors also receive area"
                : "注視中のleaf。祖先も面積を受け取ります"
              : english
                ? "ordered sibling region"
                : "順序を持つ兄弟region",
          ),
        );
        section.append(button);
        return section;
      }
      section.classList.add("focus-window-branch");
      const label = element(
        context.document,
        "div",
        "focus-window-branch-label",
      );
      label.append(
        element(context.document, "code"),
        paragraph(context, node.id),
      );
      const code = label.querySelector("code");
      if (code) code.textContent = `${node.axis} / ${path}`;
      const children = element(
        context.document,
        "div",
        "focus-window-children",
      );
      children.dataset.axis = node.axis;
      for (const child of node.children)
        children.append(appendNode(child, `${path}/${child.id}`, region));
      section.append(label, children);
      return section;
    };
    const root = appendNode(resolved.root, resolved.root.id, undefined);
    root.classList.add("focus-window-root");
    stage.append(root);

    const edgeList = element(context.document, "div", "focus-window-edges");
    for (const edge of resolved.edges) {
      const item = element(context.document, "span", "focus-window-edge");
      item.dataset.edge = edge.edge;
      item.textContent = `${edge.edge}: ${edge.id}`;
      edgeList.append(item);
    }
    stage.append(edgeList);

    const navigation = element(
      context.document,
      "div",
      "focus-window-navigation",
    );
    for (const rail of resolved.navigation) {
      const nav = element(context.document, "nav", "focus-window-nav");
      nav.dataset.kind = rail.kind;
      nav.setAttribute(
        "aria-label",
        rail.kind === "edge-nav"
          ? english
            ? "Generated EdgeNav"
            : "自動生成 EdgeNav"
          : english
            ? "Generated ElasticTabs"
            : "自動生成 ElasticTabs",
      );
      const title = element(context.document, "span", "focus-window-nav-title");
      title.textContent = `${rail.kind} · ${rail.path}`;
      nav.append(title);
      for (const item of rail.items) {
        const button = textAction(context, item.id);
        button.setAttribute("aria-pressed", String(item.active));
        addListener(context, button, "click", () => {
          focus = requestFocus(spec, item.path).focus ?? focus;
          draw();
        });
        nav.append(button);
      }
      navigation.append(nav);
    }
    const result = paragraph(
      context,
      english
        ? `Resolved ${String(resolved.regions.length)} regions; ${String(resolved.edges.length)} edge regions; no overlay or scroll policy.`
        : `resolved: ${String(resolved.regions.length)} region / edge ${String(resolved.edges.length)} / overlayとscrollなし`,
      "focus-window-result",
    );
    result.setAttribute("role", "status");
    wrapper.append(headingRow, stage, navigation, result);
    container.replaceChildren(wrapper);
  };
  draw();
}
