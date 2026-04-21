/**
 * Skin domain value object
 *
 * Represents a reusable design token set (light/dark variants) with optional inheritance.
 * Supports CASCADE hierarchy: Site > Page > Widget
 *
 * Immutable after creation. All instances are frozen.
 */

import type { ThemeTokens } from "../utils/theme.config";

/**
 * 27 standard CSS custom properties for design tokens
 */
const VALID_TOKEN_KEYS = new Set<keyof ThemeTokens>([
  "bgPrimary",
  "bgSecondary",
  "textPrimary",
  "textSecondary",
  "accent",
  "accentHover",
  "accentSecondary",
  "accentTertiary",
  "border",
  "shadow",
  "borderRadius",
  "transition",
  "glow",
  "gradient",
  "spacingSection",
  "spacingCard",
  "spacingElement",
  "fontBody",
  "fontHeading",
  "fontMono",
  "headingWeight",
  "bodyLineHeight",
  "contentMaxWidth",
  "headingLetterSpacing",
  "buttonTextColor",
  "buttonTextShadow",
  "scanlineOpacity",
]);

/**
 * Tokens that can be null (optional)
 */
const NULLABLE_TOKENS = new Set<keyof ThemeTokens>([
  "accentSecondary",
  "accentTertiary",
]);

/**
 * Hook to look up parent skin tokens (set by SkinRegistry to avoid circular dependency)
 */
let _getParentTokensHook:
  | ((skinId: string) => { light: ThemeTokens; dark: ThemeTokens })
  | null = null;

/**
 * Internal: Set the parent tokens lookup function (called by SkinRegistry)
 */
export function setGetParentTokensHook(
  fn: (skinId: string) => { light: ThemeTokens; dark: ThemeTokens },
): void {
  _getParentTokensHook = fn;
}

/**
 * Allowed scope values for CASCADE hierarchy
 */
export type SkinScope = "site" | "page" | "widget";

/**
 * Configuration for creating a Skin
 */
export interface SkinCreateConfig {
  id: string;
  name: string;
  description: string;
  scope: SkinScope;
  light: Partial<ThemeTokens>;
  dark: Partial<ThemeTokens>;
  extends?: string;
}

/**
 * Skin domain value object — represents a reusable design token set
 * Immutable after creation (frozen)
 */
export class Skin {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _description: string;
  private readonly _scope: SkinScope;
  private readonly _lightTokens: ThemeTokens;
  private readonly _darkTokens: ThemeTokens;
  private readonly _extends?: string;

  private constructor(
    id: string,
    name: string,
    description: string,
    scope: SkinScope,
    lightTokens: ThemeTokens,
    darkTokens: ThemeTokens,
    extends_?: string,
  ) {
    this._id = id;
    this._name = name;
    this._description = description;
    this._scope = scope;
    this._lightTokens = Object.freeze({ ...lightTokens });
    this._darkTokens = Object.freeze({ ...darkTokens });
    this._extends = extends_;
    Object.freeze(this);
  }

  /**
   * Factory method: Create a Skin with validation
   */
  static create(config: SkinCreateConfig): Skin {
    const {
      id,
      name,
      description,
      scope,
      light,
      dark,
      extends: extends_,
    } = config;

    // Validate id
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new Error("Skin id is required and must be a non-empty string");
    }

    // Validate scope
    if (!isValidScope(scope)) {
      throw new Error(
        `Skin scope must be one of: site, page, widget. Received: ${scope}`,
      );
    }

    // Merge tokens if extending, but don't validate extends here
    // (SkinRegistry will validate when registering)
    let mergedLight: ThemeTokens;
    let mergedDark: ThemeTokens;

    if (extends_) {
      // Deferred validation: mergeTokens will fail if parent doesn't exist
      mergedLight = mergeTokensDeferred(light, extends_, "light");
      mergedDark = mergeTokensDeferred(dark, extends_, "dark");
    } else {
      mergedLight = normalizeTokens(light);
      mergedDark = normalizeTokens(dark);
    }

    // Validate light and dark have same keys
    const lightKeys = Object.keys(mergedLight).sort();
    const darkKeys = Object.keys(mergedDark).sort();

    if (lightKeys.length !== darkKeys.length) {
      throw new Error(
        `Light and dark token sets have mismatched key counts: light=${lightKeys.length}, dark=${darkKeys.length}`,
      );
    }

    for (let i = 0; i < lightKeys.length; i++) {
      if (lightKeys[i] !== darkKeys[i]) {
        throw new Error(
          `Light and dark token sets are mismatched: light has "${lightKeys[i]}" but dark has "${darkKeys[i]}"`,
        );
      }
    }

    // Ensure we have exactly 27 tokens (all required)
    if (lightKeys.length !== 27) {
      throw new Error(
        `Skin must have exactly 27 tokens. Received: ${lightKeys.length}`,
      );
    }

    // Validate all keys are valid token names
    for (const key of lightKeys) {
      if (!VALID_TOKEN_KEYS.has(key as keyof ThemeTokens)) {
        throw new Error(`invalid token name: "${key}" is not a valid token`);
      }
    }

    return new Skin(
      id,
      name,
      description,
      scope,
      mergedLight,
      mergedDark,
      extends_,
    );
  }

  /**
   * Get skin id
   */
  get id(): string {
    return this._id;
  }

  /**
   * Get skin name
   */
  get name(): string {
    return this._name;
  }

  /**
   * Get skin description
   */
  get description(): string {
    return this._description;
  }

  /**
   * Get skin scope
   */
  get scope(): SkinScope {
    return this._scope;
  }

  /**
   * Get parent skin id (if extends is set)
   */
  get extends(): string | undefined {
    return this._extends;
  }

  /**
   * Get token set for a specific mode (light or dark)
   */
  getTokens(mode: "light" | "dark"): ThemeTokens {
    if (mode !== "light" && mode !== "dark") {
      throw new Error(`Mode must be "light" or "dark". Received: "${mode}"`);
    }

    const tokens = mode === "light" ? this._lightTokens : this._darkTokens;
    return Object.freeze({ ...tokens });
  }
}

/**
 * Check if a value is a valid SkinScope
 */
function isValidScope(scope: unknown): scope is SkinScope {
  return scope === "site" || scope === "page" || scope === "widget";
}

/**
 * Normalize tokens: ensure all 27 standard tokens are present with valid values
 * (or raise error if missing)
 */
function normalizeTokens(tokens: Partial<ThemeTokens>): ThemeTokens {
  const normalized: Record<string, unknown> = {};

  for (const key of VALID_TOKEN_KEYS) {
    const value = tokens[key];

    // Optional tokens can be null, but must be present (even if null)
    if (NULLABLE_TOKENS.has(key)) {
      if (!(key in tokens)) {
        throw new Error(
          `Required token "${String(key)}" is missing from skin definition`,
        );
      }
      normalized[key] = value; // value can be null
    } else {
      // Non-optional tokens must have a non-null, non-undefined value
      if (value === undefined || value === null) {
        throw new Error(
          `Required token "${String(key)}" is missing from skin definition`,
        );
      }
      normalized[key] = value;
    }
  }

  // Ensure no extra keys
  for (const key of Object.keys(tokens)) {
    if (!VALID_TOKEN_KEYS.has(key as keyof ThemeTokens)) {
      throw new Error(`invalid token name: "${key}" is not a valid token`);
    }
  }

  return normalized as ThemeTokens;
}

/**
 * Merge parent tokens with child tokens (child wins on conflict)
 * Used for extends mechanism
 */
function mergeTokensDeferred(
  childTokens: Partial<ThemeTokens>,
  parentSkinId: string,
  mode: "light" | "dark",
): ThemeTokens {
  if (!_getParentTokensHook) {
    throw new Error(
      "Skin registry not initialized. Cannot resolve parent skin tokens.",
    );
  }

  try {
    const parentTokens = _getParentTokensHook(parentSkinId);
    const merged: Record<string, unknown> = { ...parentTokens[mode] };

    // Apply child overrides
    for (const [key, value] of Object.entries(childTokens)) {
      if (!VALID_TOKEN_KEYS.has(key as keyof ThemeTokens)) {
        throw new Error(`invalid token name: "${key}" is not a valid token`);
      }

      if (value !== undefined && value !== null) {
        merged[key] = value;
      }
    }

    return merged as ThemeTokens;
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      throw new Error(
        `Skin extends references non-existent parent: "${parentSkinId}"`,
      );
    }
    throw err;
  }
}

// Register Skin with SkinRegistry after both modules are loaded
// This breaks the circular dependency by importing only after Skin is fully defined
import { SkinRegistry } from "./SkinRegistry";
SkinRegistry.setSkinClass(Skin);
