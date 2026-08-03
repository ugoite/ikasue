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
  COMPONENT_PAGE_COPY,
  COMPONENT_MATRIX_PAGE_COPY,
  CATALOG_REGISTRY,
  COMPONENT_REGISTRY,
  COMPONENT_SOURCE_RECIPES,
  CONCEPT_REGISTRY,
  RUNTIME_COMPONENT_REGISTRY,
  componentDocumentationCopy,
  componentSource,
  findRegistryEntry,
} from "./catalog/registry";
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
import { horizontal, normalizePlane, resolvePlane, vertical } from "./plane";
import type { CatalogMount, CatalogMountOptions } from "./catalog/shell";
import type {
  CatalogCategoryId,
  CatalogComponentEntry,
  CatalogComponentId,
  CatalogComponentMetadata,
  CatalogComponentRegistryEntry,
  CatalogConceptEntry,
  CatalogConceptId,
  CatalogConceptMetadata,
  CatalogConceptRegistryEntry,
  CatalogDocumentationCopy,
  CatalogLocalizedText,
  CatalogPageId,
  CatalogPageCopy,
  CatalogPageMetadata,
  CatalogPrinciple,
  CatalogProps,
  CatalogProperty,
  CatalogPropertyType,
  CatalogPropertyValue,
  CatalogRegistryEntry,
  CatalogSourceRecipe,
  CatalogLocale,
} from "./catalog/types";
import type {
  PlaneAxis,
  PlaneChild,
  PlaneChildInput,
  PlaneFit,
  PlaneInput,
  PlaneOptions,
  PlaneSpec,
  ResolvedPlane,
  ResolvedPlaneChild,
} from "./plane";

export const PACKAGE_NAME = "@ugoite/ikasue";
export const ROOT_CLASS_NAME = "ikasue-root";

export type {
  CatalogCategoryId,
  CatalogComponentId,
  CatalogComponentEntry,
  CatalogComponentMetadata,
  CatalogComponentRegistryEntry,
  CatalogConceptEntry,
  CatalogConceptId,
  CatalogConceptMetadata,
  CatalogConceptRegistryEntry,
  CatalogDocumentationCopy,
  CatalogLocalizedText,
  CatalogMount,
  CatalogMountOptions,
  CatalogPageCopy,
  CatalogPageId,
  CatalogPageMetadata,
  CatalogPrinciple,
  CatalogProps,
  CatalogProperty,
  CatalogPropertyType,
  CatalogPropertyValue,
  CatalogLocale,
  CatalogRegistryEntry,
  CatalogSourceRecipe,
  PlaneAxis,
  PlaneChild,
  PlaneChildInput,
  PlaneFit,
  PlaneInput,
  PlaneOptions,
  PlaneSpec,
  ResolvedPlane,
  ResolvedPlaneChild,
};

export {
  CATALOG_COMPONENTS,
  CATALOG_CONCEPTS,
  CATALOG_GROUPS,
  CATALOG_PAGES,
  CATALOG_REGISTRY,
  COMPONENT_PAGE_COPY,
  COMPONENT_MATRIX_PAGE_COPY,
  COMPONENT_REGISTRY,
  COMPONENT_SOURCE_RECIPES,
  CONCEPT_REGISTRY,
  RUNTIME_COMPONENT_REGISTRY,
  COMPONENT_IDS,
  CONCEPT_IDS,
  DEFAULT_COMPONENT_ID,
  PAGE_IDS,
  defaultProps,
  getDefaultProps,
  horizontal,
  isCatalogComponentId,
  isCatalogPageId,
  normalizePlane,
  parseCatalogQuery,
  parseComponentQuery,
  resolvePlane,
  serializeCatalogQuery,
  serializeComponentQuery,
  vertical,
  componentDocumentationCopy,
  componentSource,
  findRegistryEntry,
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
