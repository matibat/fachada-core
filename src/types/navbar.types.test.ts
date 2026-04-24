/**
 * navbar.types — BDD type-acceptance tests for NavbarConfig
 *
 * These are compile-time assertions: if TypeScript accepts the object literals
 * without error, the type is correct. Runtime assertions confirm field access.
 *
 * Behavior covered:
 *   B1: NavbarConfig accepts anchorLinks as an optional array of {label, href}
 *   B2: NavbarConfig without anchorLinks is still valid (field is optional)
 */
import { describe, it, expect } from "vitest";
import type { NavbarConfig } from "./navbar.types";

// ─── Helper: typed pass-through ───────────────────────────────────────────────

function acceptsNavbarConfig(config: NavbarConfig): NavbarConfig {
  return config;
}

// ─── B1: anchorLinks is accepted ─────────────────────────────────────────────

describe("B1: NavbarConfig accepts anchorLinks as an optional array field", () => {
  it("Given a NavbarConfig with anchorLinks, When TypeScript compiles, Then the value is preserved", () => {
    // Given
    const config = acceptsNavbarConfig({
      anchorLinks: [{ label: "Tatuajes", href: "#tatuajes" }],
    });

    // When
    const result = config.anchorLinks;

    // Then
    expect(result).toHaveLength(1);
    expect(result?.[0].label).toBe("Tatuajes");
    expect(result?.[0].href).toBe("#tatuajes");
  });

  it("Given a NavbarConfig with multiple anchorLinks, When TypeScript compiles, Then all entries are accessible", () => {
    // Given
    const config = acceptsNavbarConfig({
      anchorLinks: [
        { label: "Tatuajes", href: "#tatuajes" },
        { label: "Pinturas", href: "#pinturas" },
        { label: "Contacto", href: "#contacto" },
      ],
    });

    // When
    const result = config.anchorLinks;

    // Then
    expect(result).toHaveLength(3);
    expect(result?.[1].label).toBe("Pinturas");
    expect(result?.[2].href).toBe("#contacto");
  });
});

// ─── B3: backLabel is accepted ───────────────────────────────────────────────

describe("B3: NavbarConfig accepts backLabel as an optional string field", () => {
  it("Given a NavbarConfig with backLabel, When TypeScript compiles, Then the value is preserved", () => {
    // Given
    const config = acceptsNavbarConfig({
      backLabel: "← Inicio",
    });

    // When
    const result = config.backLabel;

    // Then
    expect(result).toBe("← Inicio");
  });
});

// ─── B4: backLabel is optional ───────────────────────────────────────────────

describe("B4: NavbarConfig without backLabel is still valid (backward compatibility)", () => {
  it("Given a NavbarConfig without backLabel, When TypeScript compiles, Then backLabel is undefined", () => {
    // Given / When
    const config = acceptsNavbarConfig({
      variant: "horizontal",
    });

    // Then
    expect(config.backLabel).toBeUndefined();
  });
});

// ─── B2: anchorLinks is optional ─────────────────────────────────────────────

describe("B2: NavbarConfig without anchorLinks is still valid (backward compatibility)", () => {
  it("Given a NavbarConfig without anchorLinks, When TypeScript compiles, Then no type error occurs and field is undefined", () => {
    // Given / When — TypeScript accepts this literal; if anchorLinks were required
    // this file would not compile.
    const config = acceptsNavbarConfig({
      variant: "horizontal",
      position: "sticky",
    });

    // Then — the field is absent (undefined) at runtime
    expect(config.anchorLinks).toBeUndefined();
  });

  it("Given an empty NavbarConfig, When TypeScript compiles, Then anchorLinks is undefined", () => {
    // Given / When
    const config = acceptsNavbarConfig({});

    // Then
    expect(config.anchorLinks).toBeUndefined();
  });
});

describe("B5: NavbarConfig accepts appearance as optional per-app style config", () => {
  it("Given a NavbarConfig with appearance options, When TypeScript compiles, Then appearance fields are accessible", () => {
    const config = acceptsNavbarConfig({
      appearance: {
        transparent: true,
        alpha: 0.01,
        removeBorder: true,
        centerDesktopNav: true,
        brandTextColor: "#000000",
        gradientOverlay: {
          light: "linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,0.01))",
        },
      },
    });

    expect(config.appearance?.transparent).toBe(true);
    expect(config.appearance?.alpha).toBe(0.01);
    expect(config.appearance?.removeBorder).toBe(true);
    expect(config.appearance?.centerDesktopNav).toBe(true);
    expect(config.appearance?.brandTextColor).toBe("#000000");
    expect(config.appearance?.gradientOverlay?.light).toContain("linear-gradient");
  });
});
