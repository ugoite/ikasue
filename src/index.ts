import "./styles.css";

import {
  getCatalogMountLabel,
  mountCatalog as mountCatalogRoot,
} from "./catalog/shell";
import {
  CATALOG_COMPONENTS,
  CATALOG_CONCEPTS,
  CATALOG_GROUPS,
  CATALOG_PAGES,
  COMPONENT_IDS,
  CONCEPT_IDS,
  PAGE_IDS,
} from "./catalog/metadata";
import {
  DEFAULT_COMPONENT_ID,
  defaultProps,
  getDefaultProps,
  isCatalogComponentId,
  isCatalogPageId,
  parseCatalogQuery,
  parseComponentQuery,
  serializeCatalogQuery,
  serializeComponentQuery,
} from "./catalog/state";
import {
  COMMIT_EVENT,
  LAYOUT_REQUEST_EVENT,
  dispatchCommit,
  dispatchLayoutRequest,
} from "./catalog/events";
import type { CatalogMount, CatalogMountOptions } from "./catalog/shell";
import type {
  CatalogCategoryId,
  CatalogComponentId,
  CatalogComponentMetadata,
  CatalogConceptId,
  CatalogConceptMetadata,
  CatalogPageId,
  CatalogPageMetadata,
  CatalogProps,
  CatalogProperty,
  CatalogPropertyType,
  CatalogPropertyValue,
  CommitDetail,
  LayoutRequestDetail,
} from "./catalog/types";

export const PACKAGE_NAME = "@ugoite/ikasue";
export const ROOT_CLASS_NAME = "ikasue-root";

export type {
  CatalogCategoryId,
  CatalogComponentId,
  CatalogComponentMetadata,
  CatalogConceptId,
  CatalogConceptMetadata,
  CatalogMount,
  CatalogMountOptions,
  CatalogPageId,
  CatalogPageMetadata,
  CatalogProps,
  CatalogProperty,
  CatalogPropertyType,
  CatalogPropertyValue,
  CommitDetail,
  LayoutRequestDetail,
};

export {
  CATALOG_COMPONENTS,
  CATALOG_CONCEPTS,
  CATALOG_GROUPS,
  CATALOG_PAGES,
  COMPONENT_IDS,
  CONCEPT_IDS,
  DEFAULT_COMPONENT_ID,
  COMMIT_EVENT,
  LAYOUT_REQUEST_EVENT,
  PAGE_IDS,
  defaultProps,
  dispatchCommit,
  dispatchLayoutRequest,
  getDefaultProps,
  isCatalogComponentId,
  isCatalogPageId,
  parseCatalogQuery,
  parseComponentQuery,
  serializeCatalogQuery,
  serializeComponentQuery,
};

export interface MountOptions extends CatalogMountOptions {
  readonly label?: string;
}

export type IkasueMount = CatalogMount;

export function getMountLabel(label?: string): string {
  return getCatalogMountLabel(label);
}

/** Mounts the complete framework-neutral ikasue component catalog. */
export function mountCatalog(
  target: HTMLElement,
  options: CatalogMountOptions = {},
): CatalogMount {
  return mountCatalogRoot(target, options);
}

/** Backwards-compatible package mount helper. */
export function mountIkasue(
  target: HTMLElement,
  options: MountOptions = {},
): IkasueMount {
  return mountCatalogRoot(target, options);
}
