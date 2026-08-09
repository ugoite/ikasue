import routeData from "../../scripts/catalog-routes.json";

export const COMPONENT_IDS = routeData.componentIds as readonly string[];
export const JA_ROUTES = routeData.jaRoutes as readonly string[];
export const EN_ROUTES = routeData.enRoutes as readonly string[];

export function normalizeBase(value?: string): string {
  if (
    !value ||
    typeof value !== "string" ||
    !value.trim() ||
    !/^\/?[A-Za-z0-9._-]+\/?$/.test(value.trim())
  )
    return "/";
  const normalized = value.trim();
  return normalized === "/" ? "/" : `/${normalized.replace(/^\/+|\/+$/g, "")}/`;
}

export function joinBase(base: string, route: string): string {
  const prefix = normalizeBase(base);
  return prefix === "/" ? route : `${prefix.slice(0, -1)}${route}`;
}

export function routesForBase(base?: string): {
  readonly ja: readonly string[];
  readonly en: readonly string[];
} {
  const normalized = normalizeBase(base);
  return {
    ja: JA_ROUTES.map((route) => joinBase(normalized, route)),
    en: EN_ROUTES.map((route) => joinBase(normalized, route)),
  };
}
