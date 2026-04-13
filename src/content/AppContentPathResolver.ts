/**
 * Resolves the filesystem path for an app's content directory.
 * Returns a path relative to the workspace root usable by Astro's glob() loader.
 */
export function resolveAppContentPath(
  appName: string,
  contentType: "pages" | "blog",
): string {
  return `./apps/${appName}/${contentType}`;
}
