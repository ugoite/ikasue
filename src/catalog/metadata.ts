/**
 * Backwards-compatible catalog metadata projection.
 *
 * The authoritative values live in ./registry. Keep this module so existing
 * package and catalog imports continue to work during the registry migration.
 */
export {
  CATALOG_COMPONENTS,
  CATALOG_CONCEPTS,
  CATALOG_GROUPS,
  CATALOG_PAGES,
  COMPONENT_IDS,
  CONCEPT_IDS,
  PAGE_IDS,
  PRINCIPLES,
  PRINCIPLES_EN,
  componentMeta,
  componentPhilosophy,
  findComponent,
  findPage,
} from "./registry";
