export type CatalogCategoryId =
  | "philosophy"
  | "foundation"
  | "layout"
  | "action"
  | "input"
  | "data"
  | "feedback";

export type CatalogLocale = "ja" | "en";

export type CatalogConceptId = "philosophy";

export type CatalogComponentId =
  | "developer-model"
  | "theme-root"
  | "text"
  | "rule"
  | "status-icon"
  | "vertical"
  | "horizontal"
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

export interface CatalogLocalizedText {
  readonly ja: string;
  readonly en: string;
}

export interface CatalogDocumentationCopy {
  readonly category: string;
  readonly summary: string;
  readonly philosophy: string;
  readonly useWhen: string;
  readonly avoidWhen: string;
  readonly implementation: string;
  readonly keyboard: string;
  readonly accessibility: string;
  readonly goodFor: string;
  readonly avoidFor: string;
  readonly interaction: string;
  readonly propertyLabels: Readonly<Record<string, string>>;
}

export interface CatalogPageCopy {
  readonly title: string;
  readonly description: string;
}

export type CatalogPrinciple = readonly [title: string, description: string];

export interface CatalogSourceRecipe {
  readonly axis: "vertical" | "horizontal";
  readonly children: string;
  readonly planeOptions: string;
  readonly componentProps: string;
  readonly ownership: string;
  readonly rustState: string;
}

export interface CatalogRegistryEntryBase<TId extends CatalogPageId, TKind> {
  readonly id: TId;
  readonly kind: TKind;
  readonly category: CatalogCategoryId;
  readonly displayName: string;
  readonly displayNameJa: string;
  /** The Japanese summary used by the legacy interactive catalog. */
  readonly catalogSummaryJa: string;
  readonly summary: CatalogLocalizedText;
  readonly properties: readonly CatalogProperty[];
  readonly documentation: Readonly<
    Record<CatalogLocale, CatalogDocumentationCopy>
  >;
  readonly page: Readonly<Record<CatalogLocale, CatalogPageCopy>>;
  readonly demo: string;
}

export interface CatalogComponentRegistryEntry extends CatalogRegistryEntryBase<
  CatalogComponentId,
  "component"
> {
  readonly source: CatalogSourceRecipe;
}

export interface CatalogConceptRegistryEntry extends CatalogRegistryEntryBase<
  CatalogConceptId,
  "concept"
> {
  readonly principles: Readonly<
    Record<CatalogLocale, readonly CatalogPrinciple[]>
  >;
}

export type CatalogRegistryEntry =
  CatalogComponentRegistryEntry | CatalogConceptRegistryEntry;

/** A registry entry narrowed to a runtime component page. */
export type CatalogComponentEntry = CatalogComponentRegistryEntry;

/** A registry entry narrowed to the philosophy concept page. */
export type CatalogConceptEntry = CatalogConceptRegistryEntry;

export interface CatalogProperty {
  readonly key: string;
  readonly label: string;
  readonly labelJa: string;
  readonly labelEn: string;
  readonly type: CatalogPropertyType;
  /** Japanese/runtime compatibility default. */
  readonly default: CatalogPropertyValue;
  readonly defaultJa: CatalogPropertyValue;
  readonly defaultEn: CatalogPropertyValue;
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
