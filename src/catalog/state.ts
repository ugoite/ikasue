import { COMPONENT_IDS, isCatalogComponentId } from "./registry";
import { joinBase, normalizeBase } from "./routes";
import type { CatalogComponentId, CatalogLocale } from "./types";

export function parseComponentSelection(
  pathname: string,
  base = "/",
  locale?: CatalogLocale,
): CatalogComponentId | undefined {
  if (typeof pathname !== "string") return undefined;
  const normalized = pathname.replace(/\\+/g, "/");
  const prefix = normalizeBase(base);
  const relative =
    prefix === "/"
      ? normalized
      : normalized.startsWith(prefix.slice(0, -1))
        ? normalized.slice(prefix.length - 1)
        : "";
  const match = relative.match(/^\/(en\/)?components\/([^/]+)\/$/);
  const id = match?.[2];
  if (!match || !id || (locale && Boolean(match[1]) !== (locale === "en")))
    return undefined;
  return isCatalogComponentId(id) ? id : undefined;
}

export function serializeComponentSelection(
  id: CatalogComponentId,
  base = "/",
  locale: CatalogLocale = "ja",
): string {
  if (!COMPONENT_IDS.includes(id))
    return joinBase(normalizeBase(base), locale === "en" ? "/en/" : "/");
  return joinBase(
    normalizeBase(base),
    `${locale === "en" ? "/en" : ""}/components/${id}/`,
  );
}
