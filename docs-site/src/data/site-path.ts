/** Returns a site path with Astro's configured base path prepended. */
export function sitePath(
  path: string,
  baseUrl: string = import.meta.env.BASE_URL,
): string {
  const normalizedBase = `${baseUrl.replace(/\/+$/, "")}/`;
  const normalizedPath = path.replace(/^\/+/, "");
  return normalizedPath ? `${normalizedBase}${normalizedPath}` : normalizedBase;
}

/** Returns the integrated catalog route, optionally selecting a catalog page. */
export function catalogPath(componentId?: string): string {
  const query = componentId
    ? `?component=${encodeURIComponent(componentId)}`
    : "";
  return `${sitePath("catalog/")}${query}`;
}
