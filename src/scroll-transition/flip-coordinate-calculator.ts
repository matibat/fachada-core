/**
 * FLIP Coordinate Calculator — compute hero element transform for scroll-linked animation
 *
 * This module computes the transform (translate + scale) for the hero element
 * as it animates from its original position to the target anchor position.
 *
 * Supports both fixed and scrolling target anchors:
 * - Fixed: navbar sticky to viewport → use viewport coordinates directly
 * - Scroll: navbar scrolls with page → add scrollY to viewport y coordinate
 */

export interface FlipCoordinateState {
  /** Hero element's original page-relative left position (px) */
  heroOriginLeft: number;
  /** Hero element's original page-relative top position (px) */
  heroOriginTop: number;
  /** Hero element's height (px) */
  heroHeight: number;
  /** Hero element's width (px) */
  heroWidth: number;
  /** Target anchor element's bounding rect from getBoundingClientRect() */
  navRect: {
    top: number;
    left: number;
    height: number;
    width: number;
  };
  /** Current window.scrollY (px) */
  scrollY: number;
  /** Animation progress: 0 = hero position, 1 = target position */
  progress: number;
  /** How target anchor is positioned: 'fixed' (sticky) or 'scroll' (with page) */
  targetAnchorMode: "fixed" | "scroll";
}

export interface FlipCoordinates {
  /** Horizontal translate (px) */
  left: number;
  /** Vertical translate (px) */
  top: number;
  /** Uniform scale factor (unitless) */
  scale: number;
}

/**
 * Calculate interpolated FLIP coordinates for the hero element.
 *
 * At progress=0: returns hero's original position, scale=1
 * At progress=1: returns target anchor's position, scale based on height ratio
 * Intermediate: linearly interpolates both position and scale
 *
 * @param state Current FLIP animation state
 * @returns Transform coordinates: { left, top, scale }
 */
export function calculateFlipCoordinates(
  state: FlipCoordinateState,
): FlipCoordinates {
  const {
    heroOriginLeft,
    heroOriginTop,
    heroHeight,
    navRect,
    scrollY,
    progress,
    targetAnchorMode,
  } = state;

  // ─ Determine target position based on anchor mode ──────────────────────────
  // If target is fixed/sticky to viewport, viewport coords are absolute coords.
  // If target scrolls with page, we need to add scrollY to get absolute coords.
  let navAbsTop: number;
  let navAbsLeft: number;

  if (targetAnchorMode === "fixed") {
    // Sticky navbar: viewport position IS the absolute position
    navAbsTop = navRect.top;
    navAbsLeft = navRect.left;
  } else {
    // Scrolling element: add scroll offset to get absolute position
    navAbsTop = navRect.top + scrollY;
    navAbsLeft = navRect.left;
  }

  // ─ Compute scale based on height ratio ──────────────────────────────────────
  // Scale factor shrinks hero from heroHeight to navHeight
  const targetScale = navRect.height > 0 ? navRect.height / heroHeight : 1;

  // ─ Interpolate position and scale ──────────────────────────────────────────
  const interpolatedScale = 1 + (targetScale - 1) * progress;
  const interpolatedLeft =
    heroOriginLeft + (navAbsLeft - heroOriginLeft) * progress;
  const interpolatedTop =
    heroOriginTop + (navAbsTop - heroOriginTop) * progress;

  return {
    left: interpolatedLeft,
    top: interpolatedTop,
    scale: interpolatedScale,
  };
}
