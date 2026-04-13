/**
 * AssetResolver — pure domain service.
 *
 * Resolves theme-aware asset URLs from an AssetConfig.
 *
 * Resolution strategy:
 *   1. If the asset value is a plain string → return it as-is.
 *   2. If the asset value is a variant map:
 *      a. Return `map[activeVariant]` when that key exists.
 *      b. Fall back to `map['default']` when activeVariant is absent or unknown.
 *      c. Return `undefined` when neither key exists.
 *   3. If the key is absent from AssetConfig → return `undefined`.
 *
 * No throws, no side effects, no imports from /apps/.
 */

import type { AssetConfig } from "../types/app.types";

/**
 * Resolves a single asset URL by logical key and optional theme variant.
 *
 * @param key           - Logical asset name, e.g. "ogImage" or "logo".
 * @param assets        - The AssetConfig from AppConfig.
 * @param activeVariant - Optional theme variant key, e.g. "dark".
 * @returns The resolved URL string, or `undefined` if not resolvable.
 */
export function resolveAsset(
  key: string,
  assets: AssetConfig,
  activeVariant: string | undefined,
): string | undefined {
  const entry = assets[key];

  if (entry === undefined) {
    return undefined;
  }

  if (typeof entry === "string") {
    return entry;
  }

  // entry is a variant map: Record<string, string>
  const variantMap = entry as Record<string, string>;

  if (activeVariant !== undefined && activeVariant in variantMap) {
    return variantMap[activeVariant];
  }

  return variantMap["default"];
}
