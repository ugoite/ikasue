import { CATALOG_COMPONENTS, CATALOG_PAGES, findPage } from "./metadata";
import type { CatalogComponentId, CatalogPageId, CatalogProps } from "./types";

export const DEFAULT_COMPONENT_ID: CatalogPageId = "philosophy";

export function isCatalogComponentId(
  value: string | null | undefined,
): value is CatalogComponentId {
  return (
    value !== null &&
    value !== undefined &&
    CATALOG_COMPONENTS.some((component) => component.id === value)
  );
}

export function isCatalogPageId(
  value: string | null | undefined,
): value is CatalogPageId {
  return (
    value !== null &&
    value !== undefined &&
    CATALOG_PAGES.some((page) => page.id === value)
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

export function defaultProps(id: CatalogPageId): CatalogProps {
  const component = findPage(id);
  return Object.fromEntries(
    component.props.map((property) => [property.key, property.default]),
  );
}

export const getDefaultProps = defaultProps;

export function cloneProps(
  id: CatalogPageId,
  props?: CatalogProps,
): CatalogProps {
  return { ...defaultProps(id), ...props };
}
