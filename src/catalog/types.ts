export type CatalogLocale = "ja" | "en";

export type CatalogComponentId =
  | "theme-root"
  | "text"
  | "editable-text"
  | "flex"
  | "stack"
  | "grid"
  | "scroll-area"
  | "separator"
  | "tabs"
  | "sidebar"
  | "toolbar"
  | "icon-button"
  | "text-field"
  | "checkbox"
  | "radio-group"
  | "segmented-control"
  | "field"
  | "form"
  | "data-grid"
  | "status-indicator"
  | "alert"
  | "progress"
  | "dialog"
  | "split-view"
  | "side-panel"
  | "bottom-panel"
  | "loading-region"
  | "history-timeline";

export type CatalogPageId =
  | "root"
  | "philosophy"
  | "components"
  | "examples"
  | "guides/behavioral-contracts"
  | "guides/usage"
  | "guides/integration"
  | "guides/accessibility"
  | "guides/release"
  | CatalogComponentId;

export interface CatalogMountOptions {
  readonly locale?: CatalogLocale;
  readonly base?: string;
  readonly initialPath?: string;
  readonly onPathChange?: (path: string) => void;
}

export interface CatalogMount {
  readonly root: HTMLElement;
  readonly update: (path?: string) => void;
  readonly dispose: () => void;
}

export type CatalogGroup =
  | "layout"
  | "navigation"
  | "workspace"
  | "input"
  | "data"
  | "feedback"
  | "principles";
export type CatalogLocalized = { readonly ja: string; readonly en: string };
export type CatalogEntry =
  | {
      readonly kind: "site";
      readonly id: CatalogPageId;
      readonly group: "principles";
      readonly title: CatalogLocalized;
      readonly summary: CatalogLocalized;
      readonly source: { readonly typescript: ""; readonly rust: "" };
      readonly properties: readonly [];
    }
  | {
      readonly kind: "concept";
      readonly id: "philosophy";
      readonly group: "principles";
      readonly title: CatalogLocalized;
      readonly summary: CatalogLocalized;
      readonly source: { readonly typescript: ""; readonly rust: "" };
      readonly properties: readonly [];
    }
  | {
      readonly kind: "component";
      readonly id: CatalogComponentId;
      readonly group: CatalogGroup;
      readonly title: CatalogLocalized;
      readonly summary: CatalogLocalized;
      readonly source: { readonly typescript: string; readonly rust: string };
      readonly properties: readonly {
        readonly name: string;
        readonly type: string;
        readonly default?: string | boolean;
      }[];
    };
