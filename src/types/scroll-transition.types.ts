/**
 * ScrollTransition domain — value objects for scroll-linked element transitions.
 *
 * This module defines the configuration contract for the hero-to-navbar shared
 * element transition: an animation that moves the brand element from the hero
 * section into the navbar as the user scrolls, in continuous sync with scroll
 * position (not just trigger-based).
 */

/**
 * Configuration for snap-to-position behavior.
 *
 * When enabled, after the user stops scrolling, the hero brand element
 * automatically animates to the nearest extreme (fully hidden at endScroll
 * OR fully visible at startScroll), preventing it from resting mid-animation.
 *
 * The snap direction threshold is at progress=0.5: below snaps to origin (0),
 * at or above snaps to target (1).
 */
export interface SnapToPositionConfig {
  /**
   * Enable snap-to-position behavior.
   * @default false
   */
  enabled: boolean;

  /**
   * Duration in milliseconds for the snap animation.
   * @default 350
   */
  durationMs?: number;

  /**
   * CSS easing for the snap animation.
   * Common values: 'ease-out', 'ease-in-out', 'linear'.
   * @default "ease-out"
   */
  easing?: string;
}

/**
 * A from/to interpolation range for a single animated property within a stage.
 */
export interface StagePropertyRange {
  /** Start value of the property at the beginning of this stage. */
  from: number;
  /** End value of the property at the end of this stage. */
  to: number;
}

/**
 * A single animation stage defining how properties animate over a portion of scroll progress.
 *
 * Stages must be contiguous (no gaps) and collectively span [0, 1].
 * Use validateStages() to enforce this at runtime.
 *
 * @example
 * ```yaml
 * stages:
 *   - range: [0, 0.6]
 *     scale: { from: 1, to: 0.8 }
 *   - range: [0.6, 1]
 *     translateFraction: { from: 0, to: 1 }
 * ```
 */
export interface AnimationStage {
  /**
   * The [start, end] scroll progress range for this stage.
   * Both values must be in [0, 1]. Start must equal previous stage end.
   * First stage must start at 0; last stage must end at 1.
   */
  range: [number, number];

  /**
   * Scale animation for this stage.
   * If omitted, scale interpolates linearly from 1 to the component's computed target scale.
   */
  scale?: StagePropertyRange;

  /**
   * Opacity animation for this stage.
   * If omitted, opacity stays at 1 (fully visible) throughout this stage.
   */
  opacity?: StagePropertyRange;

  /**
   * translateFraction controls how far along the path from origin to target the element has moved.
   * 0 = at origin (hero position), 1 = fully at target (navbar position).
   * If omitted, translateFraction uses a linear pass-through equal to stage-normalized progress.
   */
  translateFraction?: StagePropertyRange;
}

/**
 * HeroNavbarTransitionConfig — configuration for the scroll-linked hero-to-navbar
 * brand transition using FLIP (First, Last, Invert, Play) animation.
 *
 * When enabled, the hero brand element physically repositions itself from the hero
 * section to the navbar as the user scrolls. The target anchor (navbar element)
 * is configurable via `targetAnchorSelector`, allowing apps to specify which element
 * receives the animation target coordinates.
 *
 * The animation implementation:
 * - FLIP JS handler measures hero and target positions before transition
 * - Hero element is promoted to `position: fixed` and interpolates transform
 * - Transform includes translate (x, y) and scale based on scroll progress
 * - A placeholder holds layout space while hero element is fixed
 *
 * Respects `prefers-reduced-motion`: when the user has requested reduced motion,
 * no animation occurs — both elements display in their static final positions.
 *
 * @example
 * ```ts
 * // app/app.config.ts
 * navbar: {
 *   heroTransition: {
 *     enabled: true,
 *     startScroll: 0,
 *     endScroll: 300,
 *     easing: "ease-in-out",
 *     targetAnchorSelector: ".navbar-brand",
 *     targetAnchorMode: "fixed",
 *   }
 * }
 * ```
 */
export interface HeroNavbarTransitionConfig {
  /**
   * Enable the scroll-linked hero-to-navbar brand transition.
   *
   * When false (or omitted from NavbarConfig entirely), both the hero brand
   * and navbar brand render in their default static states — no behavior
   * changes to any existing layout.
   *
   * @default false
   */
  enabled: boolean;

  /**
   * Scroll position in pixels from the top of the page where the transition
   * begins. At this scroll position the hero brand is fully visible (opacity 1)
   * and the navbar brand is fully hidden (opacity 0).
   *
   * @default 0
   */
  startScroll?: number;

  /**
   * Scroll position in pixels from the top of the page where the transition
   * completes. At this scroll position the hero brand is fully hidden (opacity 0)
   * and the navbar brand is fully visible (opacity 1).
   *
   * Defaults to 300px, which approximates a half-viewport-height scroll on
   * most desktop screens.
   *
   * @default 300
   */
  endScroll?: number;

  /**
   * CSS easing function applied to the transition animation.
   *
   * For CSS scroll-driven animations this maps to `animation-timing-function`,
   * controlling how the animated value maps to scroll progress within the
   * defined range (e.g. `ease-in` makes the fade slow at start, fast at end).
   * For the JS fallback it is applied as a CSS `transition` on opacity.
   *
   * Any valid CSS `<easing-function>` value is accepted:
   * `"linear"`, `"ease"`, `"ease-in"`, `"ease-out"`, `"ease-in-out"`,
   * or a `cubic-bezier(...)` expression.
   *
   * @default "ease"
   */
  easing?: string;

  /**
   * CSS selector for the target anchor element — the element whose position
   * the hero brand animates toward.
   *
   * By default, core uses `[data-shared-navbar-brand]` (the navbar brand element).
   * Apps can override this to place the target anchor anywhere in the page.
   *
   * The target element's position is queried on each animation frame to support:
   * - Sticky/fixed navbars (where position doesn't scroll with page)
   * - Responsive layout changes
   * - Custom positioning
   *
   * @default "[data-shared-navbar-brand]"
   */
  targetAnchorSelector?: string;

  /**
   * How the target anchor element is positioned relative to the viewport.
   *
   * - `"fixed"` (default): Target is sticky to the viewport (e.g. sticky navbar).
   *   Uses viewport coordinates directly as the animation destination.
   * - `"scroll"`: Target scrolls with the page.
   *   Converts viewport coordinates to absolute page coordinates.
   *
   * Choosing the correct mode is critical for accurate animation targeting:
   * - Sticky navbar → use `"fixed"`
   * - Scrollable content → use `"scroll"`
   *
   * @default "fixed"
   */
  targetAnchorMode?: "fixed" | "scroll";

  /**
   * Snap-to-position behavior configuration.
   *
   * When enabled, after the user stops scrolling, the hero brand element
   * animates to the nearest extreme position (fully at origin or fully at target).
   *
   * @default { enabled: false }
   */
  snapToPosition?: SnapToPositionConfig;

  /**
   * Multi-stage animation configuration.
   *
   * When provided, the animation is divided into stages, each controlling
   * different properties (scale, opacity, translateFraction) over a portion
   * of the scroll range. Stages must be contiguous and span [0, 1].
   *
   * When omitted, all properties animate linearly across the full scroll range.
   *
   * @example
   * ```ts
   * stages: [
   *   { range: [0, 0.6], scale: { from: 1, to: 0.8 } },
   *   { range: [0.6, 1], translateFraction: { from: 0, to: 1 } },
   * ]
   * ```
   */
  stages?: AnimationStage[];
}
