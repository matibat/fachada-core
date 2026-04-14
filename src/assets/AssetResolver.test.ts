/**
 * AssetResolver — BDD unit tests for resolveAsset.
 *
 * Resolution strategy under test:
 *   1. Plain string → return as-is.
 *   2. Variant map  → return map[activeVariant] when present,
 *                     fall back to map['default'] otherwise.
 *   3. Missing key  → return undefined without throwing.
 */
import { describe, it, expect } from "vitest";
import { resolveAsset } from "./AssetResolver";
import type { AssetConfig } from "../types/app.types";

// ─── Scenario 1: plain string asset ──────────────────────────────────────────

describe("resolveAsset — plain string asset", () => {
  it("Given a plain-string asset, When no activeVariant is supplied, Then returns the string", () => {
    const assets: AssetConfig = { ogImage: "/images/og.png" };
    expect(resolveAsset("ogImage", assets, undefined)).toBe("/images/og.png");
  });

  it("Given a plain-string asset, When activeVariant is supplied, Then still returns the string unchanged", () => {
    const assets: AssetConfig = { ogImage: "/images/og.png" };
    expect(resolveAsset("ogImage", assets, "dark")).toBe("/images/og.png");
  });
});

// ─── Scenario 2: variant-map asset — matching variant ────────────────────────

describe("resolveAsset — variant-map asset with a matching variant", () => {
  const assets: AssetConfig = {
    logo: { default: "/logo-light.svg", dark: "/logo-dark.svg" },
  };

  it("Given a variant map with a 'dark' key, When activeVariant='dark', Then returns the dark value", () => {
    expect(resolveAsset("logo", assets, "dark")).toBe("/logo-dark.svg");
  });

  it("Given a variant map with a 'default' key, When activeVariant='light' (not in map), Then falls back to default", () => {
    expect(resolveAsset("logo", assets, "light")).toBe("/logo-light.svg");
  });
});

// ─── Scenario 3: variant-map fallback when active variant is absent ───────────

describe("resolveAsset — variant-map fallback behaviour", () => {
  it("Given a map with only 'default', When activeVariant is an unknown key, Then returns the default value", () => {
    const assets: AssetConfig = { logo: { default: "/logo.svg" } };
    expect(resolveAsset("logo", assets, "vaporwave")).toBe("/logo.svg");
  });

  it("Given a map with no 'default' or matching key, When any activeVariant is used, Then returns undefined", () => {
    const assets: AssetConfig = { logo: { dark: "/logo-dark.svg" } };
    expect(resolveAsset("logo", assets, "light")).toBeUndefined();
  });
});

// ─── Scenario 4: missing key ──────────────────────────────────────────────────

describe("resolveAsset — missing asset key", () => {
  it("Given an AssetConfig without 'banner', When resolving 'banner' with no variant, Then returns undefined", () => {
    const assets: AssetConfig = { ogImage: "/og.png" };
    expect(resolveAsset("banner", assets, undefined)).toBeUndefined();
  });

  it("Given an AssetConfig without 'banner', When resolving 'banner' with a variant, Then does not throw and returns undefined", () => {
    const assets: AssetConfig = { ogImage: "/og.png" };
    expect(() => resolveAsset("banner", assets, "dark")).not.toThrow();
    expect(resolveAsset("banner", assets, "dark")).toBeUndefined();
  });
});
