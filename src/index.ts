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
  CATALOG_PAGE_COPY,
  COMPONENT_PAGE_COPY,
  COMPONENT_MATRIX_PAGE_COPY,
  CATALOG_REGISTRY,
  COMPONENT_REGISTRY,
  COMPONENT_SOURCE_RECIPES,
  CONCEPT_REGISTRY,
  PHILOSOPHY_PAGE_COPY,
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
import {
  normalizeFocusPlane,
  requestFocus,
  resolveFocusPlane,
  restoreFocusAfterEdgeDismissal,
} from "./focus-plane";
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
  ResolvedPlaneChildState,
} from "./plane";
export {
  defineIkaSue,
  IKA_ELEMENT_TAGS,
  IKA_TAG_BY_KIND,
  IkaDataGridElement,
  IkaElement,
  IkaHistoryTimelineElement,
  IkaSplitViewElement,
  IkaTabsElement,
  tagNameForKind,
} from "./elements";
export { renderIkaView } from "./view";
export { IkaSueError } from "./errors";
export { createDataGridPortModel } from "./transport";
export {
  IKASUE_ABI_VERSION,
  IKA_VIEW_KINDS,
  isIkaDataGridSelection,
  isIkaJsonRecord,
  isIkaJsonValue,
  isIkaView,
} from "./contract";
export type {
  IkaDataGridColumn,
  IkaDataGridRow,
  IkaDataGridSelection,
  IkaDataGridSpec,
  IkaSplitViewPane,
  IkaSplitViewSpec,
  IkaTabsItem,
  IkaTabsSpec,
  IkaError,
  IkaJsonPrimitive,
  IkaJsonRecord,
  IkaJsonValue,
  IkaMessage,
  IkaRowPage,
  IkaRowRequest,
  IkaView,
  IkaViewKind,
} from "./contract";
export type { IkaDataGridModel, IkaDataGridModelEvent } from "./transport";
export type { IkaElementTagName, IkaSueRegistry } from "./elements";
import type {
  EdgeRegion,
  FocusBranch,
  FocusCollapse,
  FocusLeaf,
  FocusNavigation,
  FocusNavigationItem,
  FocusNode,
  FocusPlaneInput,
  FocusPlaneSpec,
  FocusRect,
  FocusRequest,
  FocusRegionState,
  FocusViewport,
  ResolvedEdgeRegion,
  ResolvedFocusPlane,
  ResolvedFocusRegion,
} from "./focus-plane";

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
  ResolvedPlaneChildState,
  EdgeRegion,
  FocusBranch,
  FocusCollapse,
  FocusLeaf,
  FocusNavigation,
  FocusNavigationItem,
  FocusNode,
  FocusPlaneInput,
  FocusPlaneSpec,
  FocusRect,
  FocusRequest,
  FocusRegionState,
  FocusViewport,
  ResolvedEdgeRegion,
  ResolvedFocusPlane,
  ResolvedFocusRegion,
};

export {
  CATALOG_COMPONENTS,
  CATALOG_CONCEPTS,
  CATALOG_GROUPS,
  CATALOG_PAGES,
  CATALOG_REGISTRY,
  COMPONENT_PAGE_COPY,
  COMPONENT_MATRIX_PAGE_COPY,
  CATALOG_PAGE_COPY,
  COMPONENT_REGISTRY,
  COMPONENT_SOURCE_RECIPES,
  CONCEPT_REGISTRY,
  PHILOSOPHY_PAGE_COPY,
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
  normalizeFocusPlane,
  normalizePlane,
  parseCatalogQuery,
  parseComponentQuery,
  requestFocus,
  resolveFocusPlane,
  resolvePlane,
  restoreFocusAfterEdgeDismissal,
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
