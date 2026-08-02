export type CatalogCategoryId =
  | "philosophy"
  | "foundation"
  | "layout"
  | "navigation"
  | "action"
  | "input"
  | "data"
  | "feedback";

export type CatalogConceptId = "philosophy";

export type CatalogComponentId =
  | "developer-model"
  | "theme-root"
  | "text"
  | "rule"
  | "status-icon"
  | "stack"
  | "cluster"
  | "focus-plane"
  | "focus-region"
  | "axis-flow"
  | "edge-region"
  | "bottom-dock"
  | "edge-nav"
  | "elastic-tabs"
  | "icon-action"
  | "action-strip"
  | "boolean-text"
  | "choice-group"
  | "form-list"
  | "data-table"
  | "history-gutter"
  | "progress-region"
  | "message-region"
  | "bottom-dialog";

export type CatalogPageId = CatalogConceptId | CatalogComponentId;

export type CatalogPropertyType = "select" | "boolean" | "text";
export type CatalogPropertyValue = string | boolean;

export interface CatalogProperty {
  readonly key: string;
  readonly label: string;
  readonly type: CatalogPropertyType;
  readonly default: CatalogPropertyValue;
  readonly values: readonly string[];
}

export interface CatalogComponentMetadata {
  readonly id: CatalogComponentId;
  readonly cat: CatalogCategoryId;
  readonly name: string;
  readonly ja: string;
  readonly summary: string;
  readonly demo: string;
  readonly props: readonly CatalogProperty[];
}

export interface CatalogConceptMetadata {
  readonly id: CatalogConceptId;
  readonly cat: CatalogCategoryId;
  readonly name: string;
  readonly ja: string;
  readonly summary: string;
  readonly demo: string;
  readonly props: readonly CatalogProperty[];
}

export type CatalogPageMetadata =
  CatalogComponentMetadata | CatalogConceptMetadata;

export type CatalogProps = Record<string, CatalogPropertyValue>;

export interface LayoutRequestDetail {
  readonly target:
    "primary" | "balanced" | "secondary" | "primary-only" | "secondary-only";
}

export interface CommitDetail {
  readonly value: string;
}
