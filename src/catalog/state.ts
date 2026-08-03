import {
  CATALOG_REGISTRY,
  COMPONENT_REGISTRY,
  findRegistryEntry,
} from "./registry";
import type {
  CatalogComponentId,
  CatalogLocale,
  CatalogPageId,
  CatalogProps,
} from "./types";

export const DEFAULT_COMPONENT_ID: CatalogPageId = "philosophy";

export function isCatalogComponentId(
  value: string | null | undefined,
): value is CatalogComponentId {
  return (
    value !== null &&
    value !== undefined &&
    COMPONENT_REGISTRY.some((component) => component.id === value)
  );
}

export function isCatalogPageId(
  value: string | null | undefined,
): value is CatalogPageId {
  return (
    value !== null &&
    value !== undefined &&
    CATALOG_REGISTRY.some((page) => page.id === value)
  );
}

export function parseComponentQuery(
  search: string,
  fallback: CatalogPageId = DEFAULT_COMPONENT_ID,
): CatalogPageId {
  const normalized = search.startsWith("?") ? search.slice(1) : search;
  const requested = new URLSearchParams(normalized).get("component");
  return isCatalogPageId(requested) ? requested : fallback;
}

export const parseCatalogQuery = parseComponentQuery;

export function serializeComponentQuery(
  id: CatalogPageId,
  search = "",
): string {
  const normalized = search.startsWith("?") ? search.slice(1) : search;
  const params = new URLSearchParams(normalized);
  params.set("component", id);
  const next = params.toString();
  return next ? `?${next}` : "";
}

export const serializeCatalogQuery = serializeComponentQuery;

export function defaultProps(
  id: CatalogPageId,
  locale: CatalogLocale = "ja",
): CatalogProps {
  const component = findRegistryEntry(id);
  return Object.fromEntries(
    component.properties.map((property) => [
      property.key,
      locale === "en" ? property.defaultEn : property.defaultJa,
    ]),
  );
}

export const getDefaultProps = defaultProps;

export function cloneProps(
  id: CatalogPageId,
  props?: CatalogProps,
  locale: CatalogLocale = "ja",
): CatalogProps {
  return { ...defaultProps(id, locale), ...props };
}
