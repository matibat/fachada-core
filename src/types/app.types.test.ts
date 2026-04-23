/**
 * app.types — BDD type-acceptance tests for GalleryImage and AppConfig
 *
 * These are compile-time assertions: if TypeScript accepts the object literals
 * without error, the type is correct. Runtime assertions confirm field access.
 *
 * Behavior covered (T03):
 *   B1: GalleryImage accepts `technique` and `availability` optional fields
 *   B2: GalleryImage without technique/availability is still valid (backward compat)
 *   B3: Runtime: GalleryImage with availability "vendido" exposes the value correctly
 *
 * Behavior covered (T05):
 *   B1: AppConfig accepts optional `footer` config with layout and handle
 *   B2: AppConfig without `footer` is still valid (backward compat)
 */
import { describe, it, expect } from "vitest";
import type { GalleryImage, AppConfig } from "./index";

// ─── Helper: typed pass-through ───────────────────────────────────────────────

function acceptsGalleryImage(img: GalleryImage): GalleryImage {
  return img;
}

// ─── T03 — B1: technique and availability are accepted ───────────────────────

describe("T03 B1: GalleryImage accepts technique and availability optional fields", () => {
  it("Given a GalleryImage with technique and availability, When TypeScript compiles, Then the values are preserved", () => {
    // Given
    const img = acceptsGalleryImage({
      src: "/x.jpg",
      alt: "x",
      technique: "Óleo",
      availability: "disponible",
    });

    // When
    const technique = img.technique;
    const availability = img.availability;

    // Then
    expect(technique).toBe("Óleo");
    expect(availability).toBe("disponible");
  });

  it("Given a GalleryImage with technique: Acuarela and availability: vendido, When TypeScript compiles, Then both fields are accessible", () => {
    // Given
    const img = acceptsGalleryImage({
      src: "/x.jpg",
      alt: "x",
      technique: "Acuarela",
      availability: "vendido",
    });

    // When / Then
    expect(img.technique).toBe("Acuarela");
    expect(img.availability).toBe("vendido");
  });
});

// ─── T03 — B2: technique and availability are optional ───────────────────────

describe("T03 B2: GalleryImage without technique/availability is still valid (backward compatibility)", () => {
  it("Given a GalleryImage without technique or availability, When TypeScript compiles, Then no type error occurs and fields are undefined", () => {
    // Given / When
    const img = acceptsGalleryImage({ src: "/painting.jpg", alt: "Painting" });

    // Then
    expect(img.technique).toBeUndefined();
    expect(img.availability).toBeUndefined();
  });

  it("Given a GalleryImage with only caption (no technique/availability), When TypeScript compiles, Then technique and availability are undefined", () => {
    // Given / When
    const img = acceptsGalleryImage({
      src: "/painting.jpg",
      alt: "Painting",
      caption: "My artwork",
    });

    // Then
    expect(img.technique).toBeUndefined();
    expect(img.availability).toBeUndefined();
  });
});

// ─── T03 — B3: Runtime value check for availability ──────────────────────────

describe("T03 B3: Runtime GalleryImage availability field value is accessible", () => {
  it("Given a GalleryImage object with availability: vendido, When availability is read, Then it equals vendido", () => {
    // Given
    const img: GalleryImage = {
      src: "/obra.jpg",
      alt: "Obra",
      technique: "Acuarela",
      availability: "vendido",
    };

    // When
    const result = img.availability;

    // Then
    expect(result).toBe("vendido");
  });
});

// ─── T05 — B1: AppConfig accepts footer config ───────────────────────────────

describe("T05 B1: AppConfig accepts optional footer config with layout and handle", () => {
  it("Given an AppConfig fragment with footer: { layout: minimal, handle: @unbati }, When the footer is read, Then values are accessible", () => {
    // Given — partial AppConfig cast for type-checking purposes
    const config = {
      footer: { layout: "minimal" as const, handle: "@unbati" },
    } as Pick<AppConfig, "footer">;

    // When
    const footer = config.footer;

    // Then
    expect(footer?.layout).toBe("minimal");
    expect(footer?.handle).toBe("@unbati");
  });

  it("Given an AppConfig fragment with footer: { layout: default }, When footer is read, Then layout equals default", () => {
    // Given
    const config = {
      footer: { layout: "default" as const },
    } as Pick<AppConfig, "footer">;

    // When / Then
    expect(config.footer?.layout).toBe("default");
    expect(config.footer?.handle).toBeUndefined();
  });
});

// ─── T05 — B2: AppConfig without footer is still valid ───────────────────────

describe("T05 B2: AppConfig without footer is still valid (backward compatibility)", () => {
  it("Given an AppConfig fragment without footer, When footer is read, Then it is undefined", () => {
    // Given
    const config = {} as Pick<AppConfig, "footer">;

    // When / Then
    expect(config.footer).toBeUndefined();
  });
});

// ─── T01 — B1: GalleryImage accepts string availability and badgeLabel ────────

describe("T01 B1: GalleryImage accepts string availability and badgeLabel", () => {
  it("Given a GalleryImage with availability: in-stock and badgeLabel: Available, When TypeScript compiles, Then both fields are accessible at runtime", () => {
    // Given
    const img = acceptsGalleryImage({
      src: "/painting.jpg",
      alt: "Painting",
      availability: "in-stock",
      badgeLabel: "Available",
    });

    // When
    const availability = img.availability;
    const badgeLabel = img.badgeLabel;

    // Then
    expect(availability).toBe("in-stock");
    expect(badgeLabel).toBe("Available");
  });

  it("Given a GalleryImage with only badgeLabel, When badgeLabel is read, Then it equals the assigned value", () => {
    // Given
    const img = acceptsGalleryImage({
      src: "/obra.jpg",
      alt: "Obra",
      badgeLabel: "Sold",
    });

    // When / Then
    expect(img.badgeLabel).toBe("Sold");
  });

  it("Given a GalleryImage without badgeLabel, When badgeLabel is read, Then it is undefined", () => {
    // Given
    const img = acceptsGalleryImage({ src: "/obra.jpg", alt: "Obra" });

    // When / Then
    expect(img.badgeLabel).toBeUndefined();
  });
});

// ─── T01 — B2: AppConfig.footer accepts sectionsLabel and socialsLabel ────────

describe("T01 B2: AppConfig.footer accepts sectionsLabel and socialsLabel", () => {
  it("Given an AppConfig footer with sectionsLabel: Sections and socialsLabel: Social, When footer is read, Then both labels are accessible", () => {
    // Given
    const config = {
      footer: {
        layout: "default" as const,
        handle: "@example",
        sectionsLabel: "Sections",
        socialsLabel: "Social",
      },
    } as Pick<AppConfig, "footer">;

    // When
    const sectionsLabel = config.footer?.sectionsLabel;
    const socialsLabel = config.footer?.socialsLabel;

    // Then
    expect(sectionsLabel).toBe("Sections");
    expect(socialsLabel).toBe("Social");
  });

  it("Given an AppConfig footer without sectionsLabel or socialsLabel, When labels are read, Then they are undefined", () => {
    // Given
    const config = {
      footer: { layout: "minimal" as const },
    } as Pick<AppConfig, "footer">;

    // When / Then
    expect(config.footer?.sectionsLabel).toBeUndefined();
    expect(config.footer?.socialsLabel).toBeUndefined();
  });
});
