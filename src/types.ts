/* eslint-disable @typescript-eslint/no-invalid-void-type */

export type LayoutChild =
  | string
  | {
      readonly id: string;
      readonly grow?: number;
      readonly shrink?: number;
      readonly basis?: string;
    };

export type FlexDirection = "row" | "column";
export type FlexWrap = "nowrap" | "wrap" | "wrap-reverse";
export type FlexAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type FlexJustify =
  | "start"
  | "center"
  | "end"
  | "space-between"
  | "space-around"
  | "space-evenly";

export interface FlexOptions {
  readonly direction?: FlexDirection;
  readonly wrap?: FlexWrap;
  readonly gap?: string;
  readonly align?: FlexAlign;
  readonly justify?: FlexJustify;
}

export interface FlexSpec {
  readonly kind: "flex";
  readonly direction: FlexDirection;
  readonly wrap: FlexWrap;
  readonly gap: string;
  readonly align: FlexAlign;
  readonly justify: FlexJustify;
  readonly children: readonly LayoutChild[];
}

export interface GridOptions {
  readonly columns?: string;
  readonly rows?: string;
  readonly gap?: string;
  readonly align?: FlexAlign;
  readonly justify?: FlexJustify;
}

export interface GridSpec {
  readonly kind: "grid";
  readonly columns: string;
  readonly rows: string;
  readonly gap: string;
  readonly align: FlexAlign;
  readonly justify: FlexJustify;
  readonly children: readonly string[];
}

export interface ScrollAreaOptions {
  readonly axis?: "x" | "y" | "both";
  readonly overscroll?: "auto" | "contain";
}

export interface ScrollAreaSpec {
  readonly kind: "scroll-area";
  readonly content: string;
  readonly axis: "x" | "y" | "both";
  readonly overscroll: "auto" | "contain";
}

export interface SeparatorOptions {
  readonly orientation?: "horizontal" | "vertical";
  readonly role?: "separator";
}

export interface SeparatorSpec {
  readonly kind: "separator";
  readonly orientation: "horizontal" | "vertical";
  readonly role?: "separator";
}

export interface SplitPane {
  readonly id: string;
  readonly content: string;
  readonly label?: string;
  readonly size?: string;
  readonly minSize?: string;
  readonly basis?: string;
  readonly grow?: number;
  readonly shrink?: number;
  readonly collapsible?: boolean;
  readonly disabled?: boolean;
}

export interface SplitViewOptions {
  readonly orientation: "horizontal" | "vertical";
  readonly activePane?: string;
  readonly sizes?: readonly string[];
  readonly collapsible?: boolean;
  readonly collapsed?: Readonly<Record<string, boolean>>;
  readonly motionOrigin?: "start" | "end" | "top" | "bottom";
  readonly onActivePaneChange?: (id: string) => void;
  readonly onSizesChange?: (sizes: readonly string[]) => void;
  readonly onCollapsedChange?: (id: string, collapsed: boolean) => void;
}

export interface SplitViewSpec {
  readonly kind: "split-view";
  readonly orientation: "horizontal" | "vertical";
  readonly panes: readonly SplitPane[];
  readonly activePane?: string;
  readonly sizes: readonly string[];
  readonly collapsible: boolean;
  readonly collapsed: Readonly<Record<string, boolean>>;
  readonly motionOrigin: "start" | "end" | "top" | "bottom";
  readonly onActivePaneChange?: (id: string) => void;
  readonly onSizesChange?: (sizes: readonly string[]) => void;
  readonly onCollapsedChange?: (id: string, collapsed: boolean) => void;
}

export interface SplitViewState {
  readonly activePane?: string;
  readonly sizes: readonly string[];
  readonly collapsed: Readonly<Record<string, boolean>>;
}

export interface SidePanelOptions {
  readonly id?: string;
  readonly main?: string;
  readonly title?: string;
  readonly content?: string;
  readonly side?: "start" | "end";
  readonly open?: boolean;
  readonly onClose?: () => void;
}

export interface SidePanelSpec {
  readonly kind: "side-panel";
  readonly id?: string;
  readonly main: string;
  readonly title: string;
  readonly content: string;
  readonly side: "start" | "end";
  readonly open: boolean;
  readonly onClose?: () => void;
}

export interface BottomPanelOptions {
  readonly id?: string;
  readonly main?: string;
  readonly title?: string;
  readonly content?: string;
  readonly open?: boolean;
  readonly onClose?: () => void;
}

export interface BottomPanelSpec {
  readonly kind: "bottom-panel";
  readonly id?: string;
  readonly main: string;
  readonly title: string;
  readonly content: string;
  readonly open: boolean;
  readonly onClose?: () => void;
}

export interface LoadingRegionOptions {
  readonly id?: string;
  readonly content?: string;
  readonly busy?: boolean;
  readonly progress?: number;
  readonly label?: string;
}

export interface LoadingRegionSpec {
  readonly kind: "loading-region";
  readonly id?: string;
  readonly content: string;
  readonly busy: boolean;
  readonly progress?: number;
  readonly label: string;
}

export interface DialogOptions {
  readonly id?: string;
  readonly title?: string;
  readonly content?: string;
  readonly open?: boolean;
  readonly modal?: boolean;
  readonly openerId?: string;
  readonly onClose?: () => void;
}

export interface DialogSpec {
  readonly kind: "dialog";
  readonly id?: string;
  readonly title: string;
  readonly content: string;
  readonly open: boolean;
  readonly modal: boolean;
  readonly openerId?: string;
  readonly onClose?: () => void;
}

export interface ThemeRootOptions {
  readonly tokens?: Readonly<Record<string, string>>;
  readonly variant?: "default" | "quiet" | "dense";
}

export interface ThemeRootSpec {
  readonly kind: "theme-root";
  readonly tokens: Readonly<Record<string, string>>;
  readonly variant: "default" | "quiet" | "dense";
}

type Item = {
  readonly id: string;
  readonly label: string;
  readonly content: string;
  readonly icon?: string;
  readonly disabled?: boolean;
};

export type NormalizedItem = Omit<Item, "disabled"> & {
  readonly disabled: boolean;
};

export interface TabsOptions {
  readonly items?: readonly Item[];
  readonly activeId?: string;
  readonly variant?: "default" | "elastic";
  readonly orientation?: "horizontal" | "vertical";
  readonly onActiveChange?: (id: string) => void;
}

export interface TabsSpec {
  readonly kind: "tabs";
  readonly items: readonly NormalizedItem[];
  readonly activeId?: string;
  readonly variant: "default" | "elastic";
  readonly orientation: "horizontal" | "vertical";
  readonly onActiveChange?: (id: string) => void;
}

export interface SidebarOptions {
  readonly items?: readonly Item[];
  readonly activeId?: string;
  readonly collapsed?: boolean;
  readonly onActiveChange?: (id: string) => void;
}

export interface SidebarSpec {
  readonly kind: "sidebar";
  readonly items: readonly NormalizedItem[];
  readonly activeId?: string;
  readonly collapsed: boolean;
  readonly onActiveChange?: (id: string) => void;
}

export interface ToolbarOptions {
  readonly items?: readonly {
    readonly id: string;
    readonly label: string;
    readonly icon?: string;
    readonly disabled?: boolean;
    readonly pressed?: boolean;
    readonly busy?: boolean;
    readonly onSelect?: () => void;
  }[];
  readonly overflow?: "none" | "menu";
}

export interface ToolbarSpec {
  readonly kind: "toolbar";
  readonly items: readonly {
    readonly id: string;
    readonly label: string;
    readonly icon?: string;
    readonly disabled: boolean;
    readonly pressed: boolean;
    readonly busy: boolean;
    readonly onSelect?: () => void;
  }[];
  readonly overflow: "none" | "menu";
}

export interface IconButtonOptions {
  readonly id?: string;
  readonly label: string;
  readonly icon?: string;
  readonly type?: "button" | "submit" | "reset";
  readonly disabled?: boolean;
  readonly pressed?: boolean;
  readonly onClick?: () => void;
}

export interface IconButtonSpec {
  readonly kind: "icon-button";
  readonly id?: string;
  readonly label: string;
  readonly icon?: string;
  readonly type: "button" | "submit" | "reset";
  readonly disabled: boolean;
  readonly pressed: boolean;
  readonly onClick?: () => void;
}

export interface TextOptions {
  readonly content: string;
  readonly tone?: "default" | "muted" | "danger" | "success";
  readonly selectable?: boolean;
}

export interface TextSpec {
  readonly kind: "text";
  readonly content: string;
  readonly tone: "default" | "muted" | "danger" | "success";
  readonly selectable: boolean;
}

export interface TextFieldOptions {
  readonly id: string;
  readonly label: string;
  readonly value?: string;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly description?: string;
  readonly error?: string;
  readonly onInput?: (value: string) => void;
}

export interface TextFieldSpec {
  readonly kind: "text-field";
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly placeholder: string;
  readonly disabled: boolean;
  readonly required: boolean;
  readonly description?: string;
  readonly error?: string;
  readonly onInput?: (value: string) => void;
}

export interface EditableTextOptions {
  readonly id?: string;
  readonly value?: string;
  readonly editor?: EditableTextEditor;
  readonly state?: EditableTextState;
  readonly disabled?: boolean;
  readonly onCommit?: (value: string) => void;
  readonly onCancel?: () => void;
}

export interface EditableTextSpec {
  readonly kind: "editable-text";
  readonly id?: string;
  readonly value: string;
  readonly editor: EditableTextEditor;
  readonly state: EditableTextState;
  readonly disabled: boolean;
  readonly onCommit?: (value: string) => void;
  readonly onCancel?: () => void;
}

export type EditableTextEditor =
  "text" | "email" | "number" | "date" | "textarea" | "select";
export type EditableTextState =
  "clean" | "created" | "modified" | "deleted" | "error";

export interface CheckboxOptions {
  readonly id: string;
  readonly label: string;
  readonly checked?: boolean;
  readonly disabled?: boolean;
  readonly onChange?: (checked: boolean) => void;
}

export interface CheckboxSpec {
  readonly kind: "checkbox";
  readonly id: string;
  readonly label: string;
  readonly checked: boolean;
  readonly disabled: boolean;
  readonly onChange?: (checked: boolean) => void;
}

type ChoiceOption = {
  readonly id: string;
  readonly label: string;
  readonly disabled?: boolean;
};
export type NormalizedChoiceOption = Omit<ChoiceOption, "disabled"> & {
  readonly disabled: boolean;
};

export interface RadioGroupOptions {
  readonly id?: string;
  readonly options?: readonly ChoiceOption[];
  readonly value?: string;
  readonly disabled?: boolean;
  readonly onChange?: (id: string) => void;
}

export interface RadioGroupSpec {
  readonly kind: "radio-group";
  readonly id?: string;
  readonly options: readonly NormalizedChoiceOption[];
  readonly value?: string;
  readonly disabled: boolean;
  readonly onChange?: (id: string) => void;
}

export interface SegmentedControlOptions extends RadioGroupOptions {
  readonly variant?: "default" | "elastic";
}

export interface SegmentedControlSpec {
  readonly kind: "segmented-control";
  readonly id?: string;
  readonly options: readonly NormalizedChoiceOption[];
  readonly value?: string;
  readonly disabled: boolean;
  readonly variant: "default" | "elastic";
  readonly onChange?: (id: string) => void;
}

export interface FieldOptions {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly error?: string;
  readonly required?: boolean;
  readonly content?: string;
  readonly editor?: EditableTextEditor;
  readonly state?: EditableTextState;
}

export interface FieldSpec {
  readonly kind: "field";
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly error?: string;
  readonly required: boolean;
  readonly content: string;
  readonly editor: EditableTextEditor;
  readonly state: EditableTextState;
}

export interface FormField {
  readonly id: string;
  readonly label: string;
  readonly initialValue?: string;
  readonly required?: boolean;
  readonly editor?: EditableTextEditor;
  readonly state?: EditableTextState;
}

export type FormStateStatus =
  "idle" | "clean" | "dirty" | "submitting" | "success" | "error";

export interface FormState {
  readonly fields: readonly FormField[];
  readonly initialValues: Readonly<Record<string, string>>;
  readonly values: Readonly<Record<string, string>>;
  readonly drafts: Readonly<Record<string, string>>;
  readonly status: FormStateStatus;
  readonly errors: Readonly<Record<string, string>>;
}

export interface FormOptions {
  readonly fields?: readonly FormField[];
  readonly values?: Readonly<Record<string, string>>;
  readonly status?: FormStateStatus;
  readonly onSubmit?: (
    values: Readonly<Record<string, string>>,
  ) => void | Promise<"success" | "error" | void>;
}

export interface FormSpec {
  readonly kind: "form";
  readonly fields: readonly FormField[];
  readonly values: Readonly<Record<string, string>>;
  readonly status: FormStateStatus;
  readonly onSubmit?: (
    values: Readonly<Record<string, string>>,
  ) => void | Promise<"success" | "error" | void>;
}

export interface DataGridCell {
  readonly row: string;
  readonly column: string;
  readonly value: string;
  readonly status?: "clean" | "dirty" | "error";
  readonly state?: EditableTextState;
}

export interface DataGridSelection {
  readonly row: string;
  readonly column: string;
}

export interface DataGridState {
  readonly rowIds: readonly string[];
  readonly columnIds: readonly string[];
  readonly cells: readonly DataGridCell[];
  readonly selection?: DataGridSelection;
  readonly editing?: DataGridSelection;
  readonly clipboard: "idle" | "copying" | "pasting" | "error";
}

type GridColumn = { readonly id: string; readonly label: string };
type GridRow = { readonly id: string; readonly label?: string };
type ClipboardHandler = (selection: DataGridSelection) => boolean;
type PasteHandler = (
  selection: DataGridSelection,
  value: string,
) => boolean | Promise<boolean>;

export interface DataGridOptions {
  readonly columns?: readonly GridColumn[];
  readonly rows?: readonly GridRow[];
  readonly cells?: readonly DataGridCell[];
  readonly selection?: DataGridSelection;
  readonly editing?: DataGridSelection;
  readonly onSelect?: (selection: DataGridSelection | undefined) => void;
  readonly onEdit?: (row: string, column: string, value: string) => void;
  readonly onCopy?: ClipboardHandler;
  readonly onPaste?: PasteHandler;
}

export interface DataGridSpec {
  readonly kind: "data-grid";
  readonly columns: readonly GridColumn[];
  readonly rows: readonly GridRow[];
  readonly columnsProvided: boolean;
  readonly rowsProvided: boolean;
  readonly cells: readonly DataGridCell[];
  readonly selection?: DataGridSelection;
  readonly editing?: DataGridSelection;
  readonly onSelect?: (selection: DataGridSelection | undefined) => void;
  readonly onEdit?: (row: string, column: string, value: string) => void;
  readonly onCopy?: ClipboardHandler;
  readonly onPaste?: PasteHandler;
}

export interface StatusIndicatorOptions {
  readonly id?: string;
  readonly label: string;
  readonly status?: "neutral" | "info" | "success" | "warning" | "danger";
  readonly icon?: string;
  readonly targetId?: string;
}

export interface StatusIndicatorSpec {
  readonly kind: "status-indicator";
  readonly id?: string;
  readonly label: string;
  readonly status: "neutral" | "info" | "success" | "warning" | "danger";
  readonly icon?: string;
  readonly targetId?: string;
}

export interface AlertOptions {
  readonly id?: string;
  readonly message: string;
  readonly severity?: "info" | "success" | "warning" | "danger";
  readonly dismissible?: boolean;
  readonly target?: string;
  readonly action?: string;
  readonly onDismiss?: () => void;
}

export interface AlertSpec {
  readonly kind: "alert";
  readonly id?: string;
  readonly message: string;
  readonly severity: "info" | "success" | "warning" | "danger";
  readonly dismissible: boolean;
  readonly target?: string;
  readonly action?: string;
  readonly onDismiss?: () => void;
}

export interface ProgressOptions {
  readonly value?: number;
  readonly max?: number;
  readonly label?: string;
}

export interface ProgressSpec {
  readonly kind: "progress";
  readonly value?: number;
  readonly max: number;
  readonly label: string;
}

export interface HistoryTimelineOptions {
  readonly entries?: readonly {
    readonly id: string;
    readonly label: string;
    readonly content: string;
    readonly tone?: "default" | "muted" | "success" | "danger";
  }[];
  readonly orientation?: "horizontal" | "vertical";
  readonly selectedId?: string;
  readonly compact?: boolean;
}

export interface HistoryTimelineSpec {
  readonly kind: "history-timeline";
  readonly entries: readonly {
    readonly id: string;
    readonly label: string;
    readonly content: string;
    readonly tone: "default" | "muted" | "success" | "danger";
  }[];
  readonly orientation: "horizontal" | "vertical";
  readonly selectedId?: string;
  readonly compact: boolean;
}
