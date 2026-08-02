import { appendLabel, element, setText, svgIcon, type Cleanup } from "./dom";
import {
  createFormListState,
  getFormField,
  updateFormListField,
  type FormFieldStatus,
} from "./form-state";
import { horizontal, resolvePlane, vertical } from "../plane";
import type { CatalogPageMetadata, CatalogProps } from "./types";

export interface DemoContext {
  readonly document: Document;
  readonly root: HTMLElement;
  readonly window: Window | null;
  readonly track: (cleanup: Cleanup) => void;
  readonly listen: (
    target: EventTarget,
    type: string,
    handler: (event: Event) => void,
  ) => void;
  readonly openDialog: (title: string, message: string) => void;
}

interface TextOptions {
  readonly value: string;
  readonly editable: boolean;
  readonly editor: string;
  readonly state?: FormFieldStatus;
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

export function renderDemo(
  container: HTMLElement,
  component: CatalogPageMetadata,
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
      renderPlane(container, component.id, props, context);
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
      paragraph(context, "このcomponentのdemoは準備中です。", "summary");
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
    heading(context, "h2", "OSの文字資産を使う"),
    paragraph(
      context,
      "日本語とEnglishが同じbaselineで並びます。選択された行だけが静かに面積を受け取ります。",
    ),
  );
  const cluster = element(context.document, "div", "cluster");
  for (const [label, active] of [
    ["通常", false],
    ["選択中", true],
    ["補助", false],
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
  stack.append(paragraph(context, "部署"));
  const host = element(context.document, "span", "info-text");
  host.id = "demoText";
  let value = String(props.value ?? "東京オフィス");
  const draw = (): void => {
    createInfoText(
      host,
      {
        value,
        editable: props.editable === true,
        editor: String(props.editor ?? "text"),
        state: String(props.state ?? "clean") as FormFieldStatus,
        label: "部署",
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
      "ダブルクリック、Enter、F2で編集。編集中は破線が消え、黒線は一本だけ。",
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
    wrapper.append(paragraph(context, "上の情報"));
    const section = element(context.document, "div", "rule-section");
    section.dataset.weight = weight;
    section.append(paragraph(context, "境界線の後の情報"));
    wrapper.append(section);
    container.append(wrapper);
    return;
  }
  const wrapper = element(context.document, "div", "rule-demo-vertical");
  const left = element(context.document, "div");
  left.textContent = "左の情報";
  const right = element(context.document, "div");
  right.textContent = "右の情報";
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
    String(props.label ?? "同期済み"),
    String(props.label ?? "同期済み"),
  );
  action.style.color = color;
  cluster.append(action, paragraph(context, "hoverまたはfocusで説明"));
  container.append(cluster);
}

function renderPlane(
  container: HTMLElement,
  componentId: string,
  props: CatalogProps,
  context: DemoContext,
): void {
  const axis = componentId === "horizontal" ? "horizontal" : "vertical";
  const fit = String(props.fit ?? "elastic");
  const gapValues: Record<string, number> = { none: 0, sm: 1, md: 2, lg: 3 };
  const count = Number(props.items ?? 4);
  const children = Array.from(
    { length: Number.isFinite(count) ? Math.max(0, count) : 4 },
    (_, index) => ({
      id: `item-${String(index + 1)}`,
      basis: 2,
      min: fit === "elastic" ? 0.75 : 2,
    }),
  );
  const plane =
    axis === "horizontal"
      ? horizontal(children, {
          fit: fit as "elastic" | "wrap" | "scroll",
          gap: gapValues[String(props.gap ?? "md")] ?? 2,
          available: 10,
        })
      : vertical(children, {
          fit: fit as "elastic" | "wrap" | "scroll",
          gap: gapValues[String(props.gap ?? "md")] ?? 2,
          available: 10,
        });
  const resolved = resolvePlane(plane);
  const stage = element(context.document, "div", "plane-demo");
  stage.dataset.axis = resolved.axis;
  stage.dataset.fit = resolved.fit;
  stage.style.setProperty("--plane-lines", String(resolved.lines));
  for (const child of resolved.children) {
    const item = element(context.document, "div", "plane-item");
    item.dataset.line = String(child.line);
    item.style.setProperty("--plane-size", String(child.size));
    item.style.setProperty("--plane-offset", String(child.offset));
    item.textContent = child.id.replace("item-", "要素 ");
    stage.append(item);
  }
  const note = paragraph(
    context,
    resolved.overflow
      ? "領域が足りないため、選択した適応方針が追加対応を示します。"
      : `${String(resolved.lines)} line / ${resolved.extent.toFixed(2)} units`,
    "plane-note",
  );
  container.append(stage, note);
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
    setText(result, state === "busy" ? "処理中…" : `${action} を実行`);
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
  label.textContent = String(props.label ?? "自動保存を有効にする");
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
  const labels = ["名称", "拠点", "説明"] as const;
  const values: readonly [string, string][] = [
    ["プロジェクト藍", "text"],
    ["東京オフィス", "select"],
    ["顧客データの整理", "textarea"],
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
  for (const definition of definitions) {
    const row = element(context.document, "div", "form-row");
    appendLabel(context.document, row, definition.label);
    const field = element(context.document, "span", "info-text");
    const renderField = (): void => {
      const state = getFormField(formState, definition.id);
      if (!state) return;
      createInfoText(
        field,
        {
          editable: true,
          value: state.value,
          editor: definition.editor,
          state: state.status,
          label: definition.label,
          onCommit: (value) => {
            formState = updateFormListField(formState, definition.id, value);
            renderField();
          },
        },
        context,
      );
    };
    renderField();
    row.append(field);
    form.append(row);
  }
  container.append(form);
}

export function createInfoText(
  host: HTMLElement,
  options: TextOptions,
  context: DemoContext,
): void {
  host.className = "info-text";
  host.dataset.editable = String(options.editable);
  host.dataset.state = options.state ?? "clean";
  host.dataset.editing = "false";
  host.dataset.editor = options.editor;
  const read = element(context.document, "span", "read-value");
  read.tabIndex = options.editable ? 0 : -1;
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
  if (options.editor === "select") {
    const select = element(context.document, "select");
    const selectControl = element(context.document, "span", "select-control");
    for (const value of ["東京オフィス", "大阪オフィス", "福岡オフィス"]) {
      const option = element(context.document, "option");
      option.value = value;
      option.textContent = value;
      option.selected = value === old;
      select.append(option);
    }
    selectControl.append(select);
    host.append(selectControl);
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
    host.dataset.editing = "false";
    if (options.onCommit) options.onCommit(value);
    else if (read) read.textContent = value;
  };
  const cancel = (): void => {
    if (finished) return;
    finished = true;
    editor.remove();
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
  addListener(context, editor, "blur", commit);
}

function renderTable(
  container: HTMLElement,
  props: CatalogProps,
  context: DemoContext,
): void {
  const wrap = element(context.document, "div", "data-table-wrap");
  const table = element(context.document, "table", "data-table");
  const headers = ["名前", "部門", "拠点"];
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
    ["Alpha", "営業", "東京"],
    ["Beta", "開発", "大阪"],
    ["Gamma", "運用", "福岡"],
  ] as const;
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
        props.changes === true && rowIndex === 0 && columnIndex === 0
          ? "modified"
          : props.changes === true && rowIndex === 1 && columnIndex === 2
            ? "created"
            : "clean";
      cell.textContent = value;
      cells.push(cell);
      rowElement.append(cell);
    }
    body.append(rowElement);
  }
  table.append(head, body);
  wrap.append(table);
  container.append(wrap);
  enhanceTable(table, cells, props, context);
}

function enhanceTable(
  table: HTMLTableElement,
  cells: readonly HTMLTableCellElement[],
  props: CatalogProps,
  context: DemoContext,
): void {
  let selected: HTMLTableCellElement | undefined;
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
      if (props.editable === true) editCell(cell, context);
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
        void pasteCell(cell, context);
      } else if (
        (keyboard.key === "Enter" || keyboard.key === "F2") &&
        props.editable === true
      ) {
        keyboard.preventDefault();
        editCell(cell, context);
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
        cell.textContent = value;
        cell.dataset.state = "modified";
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
  cell: HTMLTableCellElement,
  context: DemoContext,
): Promise<void> {
  const clipboard =
    context.window === null ? undefined : context.window.navigator.clipboard;
  if (!clipboard?.readText) return;
  try {
    const value = await clipboard.readText();
    cell.textContent = value;
    cell.dataset.state = "modified";
  } catch {
    // Clipboard permissions are optional.
  }
}

function editCell(cell: HTMLTableCellElement, context: DemoContext): void {
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
    cell.textContent = input.value;
    cell.dataset.state = "modified";
  };
  const cancel = (): void => {
    if (finished) return;
    finished = true;
    cell.textContent = old;
  };
  addListener(context, input, "keydown", (event) => {
    const keyboard = event as KeyboardEvent;
    if (keyboard.key === "Enter" || keyboard.key === "Tab") commit();
    if (keyboard.key === "Escape") cancel();
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
    ["current", "現在・説明を編集"],
    ["previous", "1時間前・担当を変更"],
    ["initial", "作成時"],
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
    heading(context, "h2", "顧客一覧"),
    paragraph(
      context,
      "以前の内容を読みながら、対象領域の更新だけを確認できます。",
    ),
  );
  const item = element(context.document, "div", "plain-item");
  item.textContent = "北関東支店 / 更新 14:32";
  progress.append(item);
  const status = element(context.document, "span", "progress-status");
  status.textContent = props.loading === true ? "読み込み中" : "完了";
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
      info: "詳細領域に新しい情報があります。",
      success: "対象領域の変更を保存しました。",
      warning: "対象領域に確認事項があります。",
      error: "対象領域の入力にエラーがあります。",
    }[kind] ?? "対象領域に情報があります。";
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
      paragraph(context, "対象領域の内容を残したまま注意を移します。"),
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
  stack.append(paragraph(context, "dialogはこの面の上へ重なりません。"));
  const open = textAction(context, "下端から開く");
  open.setAttribute("aria-pressed", "true");
  addListener(context, open, "click", () => {
    const intent = String(props.intent ?? "confirm");
    const message =
      intent === "danger"
        ? "この操作は取り消せません。上の対象情報を確認してから確定してください。"
        : "上の情報を残したまま判断できます。";
    context.openDialog(`${intent} dialog`, message);
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
    "horizontal",
    { fit: "elastic", gap: "md", items: "4" },
    context,
  );
}

export function renderDeveloperDemo(
  container: HTMLElement,
  context: DemoContext,
): void {
  clear(container);
  const stack = element(context.document, "div", "stack");
  const host = element(context.document, "span", "info-text");
  let editable = false;
  const draw = (): void => {
    createInfoText(
      host,
      { value: "同じText component", editable, editor: "text", state: "clean" },
      context,
    );
  };
  const controls = element(context.document, "div", "cluster");
  for (const [mode, label] of [
    ["read", "editable: false"],
    ["edit", "editable: true"],
  ] as const) {
    const button = textAction(context, label);
    button.dataset.mode = mode;
    button.setAttribute("aria-pressed", String(mode === "read"));
    addListener(context, button, "click", () => {
      editable = mode === "edit";
      for (const sibling of controls.querySelectorAll("button"))
        sibling.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-pressed", "true");
      draw();
    });
    controls.append(button);
  }
  draw();
  stack.append(host, controls);
  container.append(stack);
}
