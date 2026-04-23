/**
 * profile.types — BDD type-acceptance tests
 *
 * These are compile-time assertions: if TypeScript accepts the object literals
 * without error, the type is correct. Runtime assertions confirm field access.
 *
 * Behavior covered:
 *   B1: PageSectionConfig accepts `background?: string` — field is optional
 *   B2: PageSectionConfig with background value exposes the value as a string
 *
 * Behavior covered (T04):
 *   B1: AboutContent accepts optional `image` string field
 *   B2: AboutContent without `image` is still valid (backward compat)
 */
import { describe, it, expect } from "vitest";
import type { PageSectionConfig, AboutContent, SiteConfig } from "./index";

// ─── B1: background field is optional ────────────────────────────────────────

describe("B1: PageSectionConfig.background is an optional string field", () => {
  it("Given a PageSectionConfig without background, When TypeScript compiles, Then no type error occurs", () => {
    // Given / When — TypeScript accepts this literal; if the field were required
    // this file would not compile.
    const section: PageSectionConfig = {
      id: "hero",
      enabled: true,
      order: 1,
    };

    // Then — the field is absent (undefined) at runtime
    expect(section.background).toBeUndefined();
  });

  it("Given a PageSectionConfig with background: 'url(/img/hero.jpg)', When TypeScript compiles, Then the value is accepted as a string", () => {
    // Given / When
    const section: PageSectionConfig = {
      id: "hero",
      enabled: true,
      order: 1,
      background: "url(/img/hero.jpg)",
    };

    // Then
    expect(section.background).toBe("url(/img/hero.jpg)");
  });
});

// ─── B2: background value is accessible as string ────────────────────────────

describe("B2: PageSectionConfig.background value is accessible as a string", () => {
  it("Given a section with a CSS gradient background, When the value is read, Then it is a string matching the configured value", () => {
    // Given
    const bgValue =
      "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(/img/hero.jpg) center/cover no-repeat";
    const section: PageSectionConfig = {
      id: "about",
      enabled: true,
      order: 2,
      background: bgValue,
    };

    // When
    const result: string | undefined = section.background;

    // Then
    expect(typeof result).toBe("string");
    expect(result).toBe(bgValue);
  });

  it("Given a section with a hex color background, When the value is read, Then it equals the hex string", () => {
    // Given
    const section: PageSectionConfig = {
      id: "contact",
      enabled: true,
      order: 5,
      background: "#1A1410",
    };

    // When / Then
    expect(section.background).toBe("#1A1410");
  });
});

// ─── T04 — B1: AboutContent accepts image field ───────────────────────────────

describe("T04 B1: AboutContent accepts optional image string field", () => {
  it("Given an AboutContent with paragraphs and image, When TypeScript compiles, Then both fields are accessible", () => {
    // Given
    const about: AboutContent = {
      paragraphs: ["p1", "p2", "p3"],
      image: "/images/bati.jpg",
    };

    // When
    const result = about.image;

    // Then
    expect(result).toBe("/images/bati.jpg");
  });

  it("Given an AboutContent with image: /images/bati-pintando.jpeg, When image is read, Then it equals the configured path", () => {
    // Given
    const about: AboutContent = {
      paragraphs: ["Para 1", "Para 2", "Para 3"],
      image: "/images/bati-pintando.jpeg",
    };

    // When / Then
    expect(about.image).toBe("/images/bati-pintando.jpeg");
  });
});

// ─── T04 — B2: AboutContent without image is still valid ─────────────────────

describe("T04 B2: AboutContent without image is still valid (backward compatibility)", () => {
  it("Given an AboutContent without image, When TypeScript compiles, Then no type error occurs and image is undefined", () => {
    // Given / When
    const about: AboutContent = {
      paragraphs: ["p1", "p2", "p3"],
    };

    // Then
    expect(about.image).toBeUndefined();
  });
});

// ─── T02 — B1: SiteConfig accepts optional lang field ────────────────────────

describe("T02 B1: SiteConfig accepts optional lang field", () => {
  const baseSiteConfig: SiteConfig = {
    name: "Test Site",
    title: "Test Title",
    description: "Test description",
    author: "Test Author",
    url: "https://example.com",
    ogImage: "/og.jpg",
    social: {},
    location: { city: "Buenos Aires", country: "Argentina" },
    roles: [],
    primaryRole: "engineer",
    analytics: { plausibleDomain: "example.com" },
  };

  it("Given a SiteConfig with lang: 'es', When TypeScript compiles, Then lang is accessible at runtime", () => {
    // Given / When
    const config: SiteConfig = { ...baseSiteConfig, lang: "es" };

    // Then
    expect(config.lang).toBe("es");
  });

  it("Given a SiteConfig with lang: 'en', When lang is read, Then it equals 'en'", () => {
    // Given
    const config: SiteConfig = { ...baseSiteConfig, lang: "en" };

    // When / Then
    expect(config.lang).toBe("en");
  });
});

// ─── T02 — B2: SiteConfig without lang is still valid ────────────────────────

describe("T02 B2: SiteConfig without lang is still valid (backward compatibility)", () => {
  it("Given a SiteConfig without lang, When TypeScript compiles, Then no type error occurs and lang is undefined", () => {
    // Given / When
    const config: SiteConfig = {
      name: "Test Site",
      title: "Test Title",
      description: "Test description",
      author: "Test Author",
      url: "https://example.com",
      ogImage: "/og.jpg",
      social: {},
      location: { city: "Buenos Aires", country: "Argentina" },
      roles: [],
      primaryRole: "engineer",
      analytics: { plausibleDomain: "example.com" },
    };

    // Then
    expect(config.lang).toBeUndefined();
  });
});
