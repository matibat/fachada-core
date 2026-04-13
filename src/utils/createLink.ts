/**
 * Creates a properly prefixed internal link that accounts for the site's BASE_URL.
 *
 * Usage in Astro components:
 *   href={getBaseUrl() + '/resources'}
 *   or
 *   href={getBaseUrl('resources')}
 *
 * When BASE_URL (from build env) is '/', returns '/path'
 * When BASE_URL is '/fachada/', returns '/fachada/path'
 */
export function getBaseUrl(path?: string): string {
  const base = import.meta.env.BASE_URL || "/";

  if (!path) return base;

  // Ensure path doesn't have duplicate slashes
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // Remove trailing slash from base for concatenation
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;

  return `${normalizedBase}${normalizedPath}`;
}
