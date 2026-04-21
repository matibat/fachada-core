/**
 * Skin Registry
 *
 * Manages built-in skins and skin registration.
 * Built-in skins are pre-defined design token sets (minimalist, modern-tech, professional, vaporwave)
 * that are auto-generated from YAML files.
 */

import type { ThemeTokens } from "../utils/theme.config";
import { DEFAULT_SKINS } from "../skin/defaults";
import type { ThemeDefinition } from "../utils/theme.config";
import type { Skin } from "./Skin";
import { setGetParentTokensHook } from "./Skin";

let _tokenCacheInitialized = false;
const _tokenCache = new Map<
  string,
  { light: ThemeTokens; dark: ThemeTokens }
>();

/**
 * Initialize token cache (used by Skin for extends)
 */
function ensureTokenCacheInitialized(): void {
  if (_tokenCacheInitialized) {
    return;
  }

  for (const [skinId, themeDef] of Object.entries(DEFAULT_SKINS)) {
    _tokenCache.set(skinId, {
      light: themeDef.light,
      dark: themeDef.dark,
    });
  }

  // Set up the hook for Skin to use
  setGetParentTokensHook((skinId: string) => {
    const tokens = _tokenCache.get(skinId);
    if (!tokens) {
      throw new Error(
        `Built-in skin "${skinId}" not found. Available: ${Array.from(_tokenCache.keys()).join(", ")}`,
      );
    }
    return tokens;
  });

  _tokenCacheInitialized = true;
}

/**
 * Get parent skin tokens for extends mechanism (internal use)
 * This is deprecated - use the hook mechanism instead
 */
export function getBuiltInTokens(skinId: string): {
  light: ThemeTokens;
  dark: ThemeTokens;
} {
  ensureTokenCacheInitialized();

  const tokens = _tokenCache.get(skinId);
  if (!tokens) {
    throw new Error(
      `Built-in skin "${skinId}" not found. Available: ${Array.from(_tokenCache.keys()).join(", ")}`,
    );
  }

  return tokens;
}

let _skinInstanceCacheInitialized = false;
const _skinInstanceCache = new Map<string, Skin>();
let _SkinClass: typeof Skin | null = null;

/**
 * Registry for managing skins
 * Provides built-in skins from DEFAULT_SKINS (auto-generated from YAML)
 */
export class SkinRegistry {
  /**
   * Set the Skin class (called by index.ts after modules are loaded)
   */
  static setSkinClass(SkinClz: typeof Skin): void {
    _SkinClass = SkinClz;
  }

  /**
   * Initialize built-in skins from DEFAULT_SKINS (auto-generated from YAML)
   */
  private static initializeBuiltInSkins(): void {
    if (_skinInstanceCacheInitialized) {
      return; // Already initialized
    }

    // Ensure token cache is initialized first
    ensureTokenCacheInitialized();

    if (!_SkinClass) {
      throw new Error("Skin class not registered with SkinRegistry");
    }

    const SkinClass = _SkinClass;

    for (const [skinId, themeDef] of Object.entries(DEFAULT_SKINS)) {
      const skin = SkinClass.create({
        id: skinId,
        name: themeDef.name,
        description: themeDef.description,
        scope: "site",
        light: themeDef.light,
        dark: themeDef.dark,
      });
      _skinInstanceCache.set(skinId, skin);
    }

    _skinInstanceCacheInitialized = true;
  }

  /**
   * Get a built-in skin by id
   * @param id - Skin id (e.g., "minimalist", "modern-tech", "professional", "vaporwave")
   * @throws Error if skin not found
   */
  static getBuiltInSkin(id: string): Skin {
    this.initializeBuiltInSkins();

    const skin = _skinInstanceCache.get(id);
    if (!skin) {
      throw new Error(
        `Built-in skin "${id}" not found. Available: ${Array.from(_skinInstanceCache.keys()).join(", ")}`,
      );
    }

    return skin;
  }

  /**
   * List all available built-in skin ids
   */
  static listBuiltInSkins(): string[] {
    ensureTokenCacheInitialized();
    return Array.from(_tokenCache.keys()).sort();
  }

  /**
   * Check if a skin id is a built-in skin
   */
  static isBuiltInSkin(id: string): boolean {
    ensureTokenCacheInitialized();
    return _tokenCache.has(id);
  }
}
