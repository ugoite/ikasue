import {
  COMPONENT_SOURCE_RECIPES,
  componentSource as registryComponentSource,
} from "../../../src/catalog/registry";
import type {
  CatalogComponentId,
  CatalogSourceRecipe,
} from "../../../src/catalog/types";

export type SourceRecipe = CatalogSourceRecipe;

/** Compatibility projection for existing docs-site imports. */
export { COMPONENT_SOURCE_RECIPES };

export function componentSource(id: CatalogComponentId): {
  readonly javascript: string;
  readonly rust: string;
} {
  return registryComponentSource(id);
}
