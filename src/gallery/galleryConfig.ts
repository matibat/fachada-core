/**
 * galleryConfig — pure helpers for the Gallery widget.
 *
 * This module is framework-agnostic (no Astro imports) so that it can be
 * tested with Vitest and reused by any rendering layer.
 */

import type {
  GalleryConfig,
  GalleryTransition,
  GalleryTransitionStyle,
} from "../types/index";

// ─── Resolved shape ───────────────────────────────────────────────────────────

/**
 * ResolvedGalleryConfig — `GalleryConfig` with all optional fields filled in
 * with their canonical defaults. Produced by `resolveGalleryDefaults`.
 */
export interface ResolvedGalleryConfig {
  title?: string;
  description?: string;
  images: GalleryConfig["images"];
  /** True when autoScrollInterval is a positive number. */
  autoScrollEnabled: boolean;
  /** Positive interval in ms, or undefined when auto-scroll is off. */
  autoScrollInterval?: number;
  /** Easing/curve type for each transition. */
  transition: GalleryTransition;
  /** Visual direction or effect of each slide change. */
  transitionStyle: GalleryTransitionStyle;
  /**
   * Explicit duration in ms, or undefined to inherit from the skin's
   * `--transition` CSS custom property.
   */
  transitionSpeed?: number;
}

// ─── Mapping tables ───────────────────────────────────────────────────────────

/**
 * CSS timing-function for each `GalleryTransition` value.
 * The carousel JS inlines this as the `transition-timing-function`.
 */
export const GALLERY_TRANSITION_EASING: Record<GalleryTransition, string> = {
  linear: "linear",
  exponential: "ease-in-out",
  none: "step-start",
};

/**
 * CSS class suffix applied to `.carousel-root` for each `GalleryTransitionStyle`.
 * The class encodes the motion direction so CSS handles the actual translation.
 */
export const GALLERY_TRANSITION_STYLES: Record<GalleryTransitionStyle, string> =
  {
    ltr: "carousel--ltr",
    rtl: "carousel--rtl",
    "top-to-bottom": "carousel--ttb",
    "bottom-to-top": "carousel--btt",
    "zoom-in": "carousel--zoom-in",
    "zoom-out": "carousel--zoom-out",
    fade: "carousel--fade",
  };

// ─── Default resolver ─────────────────────────────────────────────────────────

/**
 * resolveGalleryDefaults — fills in canonical defaults for a `GalleryConfig`.
 * Returns a new object; the input is never mutated.
 */
export function resolveGalleryDefaults(
  config: GalleryConfig,
): ResolvedGalleryConfig {
  const autoScrollEnabled =
    typeof config.autoScrollInterval === "number" &&
    config.autoScrollInterval > 0;

  return {
    title: config.title,
    description: config.description,
    images: config.images,
    autoScrollEnabled,
    autoScrollInterval: autoScrollEnabled
      ? config.autoScrollInterval
      : undefined,
    transition: config.transition ?? "linear",
    transitionStyle: config.transitionStyle ?? "fade",
    transitionSpeed: config.transitionSpeed,
  };
}
