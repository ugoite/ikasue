/** Returns a site path with Astro's configured base path prepended. */
export function sitePath(
  path: string,
  baseUrl: string = import.meta.env.BASE_URL,
): string {
  const normalizedBase = `${baseUrl.replace(/\/+$/, "")}/`;
  const normalizedPath = path.replace(/^\/+/, "");
  return normalizedPath ? `${normalizedBase}${normalizedPath}` : normalizedBase;
}
