/**
 * GalleryConfig BDD test suite
 *
 * Verifies the contract of the GalleryConfig shape and the helper that
 * resolves defaults for the carousel widget.
 *
 * Structure:
 *  - Each `describe` block → one named behavior
 *  - Each `it` → one `Then` clause from the behavior's Given/When/Then scenario
 */

import { describe, it, expect } from "vitest";
import {
  resolveGalleryDefaults,
  GALLERY_TRANSITION_EASING,
  GALLERY_TRANSITION_STYLES,
} from "./galleryConfig";
import type {
  GalleryConfig,
  GalleryTransition,
  GalleryTransitionStyle,
} from "../types/index";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const BASE_IMAGES = [
  { src: "/img/a.jpg", alt: "Image A" },
  { src: "/img/b.jpg", alt: "Image B" },
];

function makeConfig(overrides: Partial<GalleryConfig> = {}): GalleryConfig {
  return { images: BASE_IMAGES, ...overrides };
}

// ─── Behavior 1: Auto-scroll is disabled by default ───────────────────────────

describe("Behavior 1: Auto-scroll is disabled when autoScrollInterval is absent or zero", () => {
  it("Given no autoScrollInterval, When resolving defaults, Then autoScrollEnabled is false", () => {
    // Given
    const config = makeConfig();

    // When
    const resolved = resolveGalleryDefaults(config);

    // Then
    expect(resolved.autoScrollEnabled).toBe(false);
  });

  it("Given autoScrollInterval = 0, When resolving defaults, Then autoScrollEnabled is false", () => {
    // Given
    const config = makeConfig({ autoScrollInterval: 0 });

    // When
    const resolved = resolveGalleryDefaults(config);

    // Then
    expect(resolved.autoScrollEnabled).toBe(false);
  });

  it("Given autoScrollInterval = 4000, When resolving defaults, Then autoScrollEnabled is true and interval is 4000", () => {
    // Given
    const config = makeConfig({ autoScrollInterval: 4000 });

    // When
    const resolved = resolveGalleryDefaults(config);

    // Then
    expect(resolved.autoScrollEnabled).toBe(true);
    expect(resolved.autoScrollInterval).toBe(4000);
  });
});

// ─── Behavior 2: Transition defaults to "linear" ──────────────────────────────

describe("Behavior 2: Transition defaults to 'linear' when not specified", () => {
  it("Given no transition field, When resolving defaults, Then transition is 'linear'", () => {
    // Given
    const config = makeConfig();

    // When
    const resolved = resolveGalleryDefaults(config);

    // Then
    expect(resolved.transition).toBe("linear");
  });

  it("Given transition = 'exponential', When resolving defaults, Then transition is preserved", () => {
    // Given
    const config = makeConfig({ transition: "exponential" });

    // When
    const resolved = resolveGalleryDefaults(config);

    // Then
    expect(resolved.transition).toBe("exponential");
  });

  it("Given transition = 'none', When resolving defaults, Then transition is 'none'", () => {
    // Given
    const config = makeConfig({ transition: "none" });

    // When
    const resolved = resolveGalleryDefaults(config);

    // Then
    expect(resolved.transition).toBe("none");
  });
});

// ─── Behavior 3: Transition style defaults to "fade" ──────────────────────────

describe("Behavior 3: Transition style defaults to 'fade' when not specified", () => {
  it("Given no transitionStyle, When resolving defaults, Then transitionStyle is 'fade'", () => {
    // Given
    const config = makeConfig();

    // When
    const resolved = resolveGalleryDefaults(config);

    // Then
    expect(resolved.transitionStyle).toBe("fade");
  });

  const availableStyles: GalleryTransitionStyle[] = [
    "ltr",
    "rtl",
    "top-to-bottom",
    "bottom-to-top",
    "zoom-in",
    "zoom-out",
    "fade",
  ];

  for (const style of availableStyles) {
    it(`Given transitionStyle = '${style}', When resolving defaults, Then transitionStyle is preserved`, () => {
      // Given
      const config = makeConfig({ transitionStyle: style });

      // When
      const resolved = resolveGalleryDefaults(config);

      // Then
      expect(resolved.transitionStyle).toBe(style);
    });
  }
});

// ─── Behavior 4: Transition speed falls back to undefined (uses skin) ──────────

describe("Behavior 4: transitionSpeed is passed through; undefined means 'inherit from skin'", () => {
  it("Given no transitionSpeed, When resolving defaults, Then transitionSpeed is undefined", () => {
    // Given
    const config = makeConfig();

    // When
    const resolved = resolveGalleryDefaults(config);

    // Then
    expect(resolved.transitionSpeed).toBeUndefined();
  });

  it("Given transitionSpeed = 300, When resolving defaults, Then transitionSpeed is 300", () => {
    // Given
    const config = makeConfig({ transitionSpeed: 300 });

    // When
    const resolved = resolveGalleryDefaults(config);

    // Then
    expect(resolved.transitionSpeed).toBe(300);
  });
});

// ─── Behavior 5: GALLERY_TRANSITION_EASING maps transitions to CSS timing ─────

describe("Behavior 5: GALLERY_TRANSITION_EASING maps every GalleryTransition value to a CSS timing function", () => {
  const transitions: GalleryTransition[] = ["linear", "exponential", "none"];

  for (const t of transitions) {
    it(`Given transition = '${t}', Then GALLERY_TRANSITION_EASING has a non-empty CSS value`, () => {
      expect(GALLERY_TRANSITION_EASING[t]).toBeTruthy();
      expect(typeof GALLERY_TRANSITION_EASING[t]).toBe("string");
    });
  }

  it("Given transition = 'linear', Then easing is the CSS 'linear' keyword", () => {
    expect(GALLERY_TRANSITION_EASING["linear"]).toBe("linear");
  });

  it("Given transition = 'exponential', Then easing is an ease-in-out CSS value", () => {
    expect(GALLERY_TRANSITION_EASING["exponential"]).toContain("ease");
  });

  it("Given transition = 'none', Then CSS timing is 'step-start' (instant cut)", () => {
    expect(GALLERY_TRANSITION_EASING["none"]).toBe("step-start");
  });
});

// ─── Behavior 6: GALLERY_TRANSITION_STYLES maps style keys to CSS class names ─

describe("Behavior 6: GALLERY_TRANSITION_STYLES maps every GalleryTransitionStyle to a CSS class name", () => {
  const styles: GalleryTransitionStyle[] = [
    "ltr",
    "rtl",
    "top-to-bottom",
    "bottom-to-top",
    "zoom-in",
    "zoom-out",
    "fade",
  ];

  for (const s of styles) {
    it(`Given transitionStyle = '${s}', Then GALLERY_TRANSITION_STYLES returns a non-empty CSS class`, () => {
      expect(GALLERY_TRANSITION_STYLES[s]).toBeTruthy();
      expect(typeof GALLERY_TRANSITION_STYLES[s]).toBe("string");
    });
  }
});

// ─── Behavior 7: resolveGalleryDefaults never mutates the input config ─────────

describe("Behavior 7: resolveGalleryDefaults returns a new object — the input is not mutated", () => {
  it("Given a config object, When resolving defaults, Then the original config is unchanged", () => {
    // Given
    const config = makeConfig();
    const originalRef = config;

    // When
    const resolved = resolveGalleryDefaults(config);

    // Then — resolved is a different object
    expect(resolved).not.toBe(originalRef);
    // And original has no injected keys
    expect(
      (config as Record<string, unknown>).autoScrollEnabled,
    ).toBeUndefined();
    expect((config as Record<string, unknown>).transition).toBeUndefined();
  });
});
