/**
 * ScrollTransition domain — value objects for scroll-linked element transitions.
 *
 * This module defines the configuration contract for the hero-to-navbar shared
 * element transition: an animation that moves the brand element from the hero
 * section into the navbar as the user scrolls, in continuous sync with scroll
 * position (not just trigger-based).
 */

/**
 * HeroNavbarTransitionConfig — configuration for the scroll-linked hero-to-navbar
 * brand transition.
 *
 * When enabled, the hero brand (h1 in the hero section) fades out and shrinks
 * while the navbar brand simultaneously fades in, creating the visual illusion
 * of the element moving seamlessly from the hero into the navbar.
 *
 * The animation is implemented via CSS scroll-driven animations
 * (`animation-timeline: scroll()`) for 60fps GPU-accelerated performance with
 * no JS per frame. A requestAnimationFrame-based fallback activates automatically
 * on browsers that do not support CSS scroll-driven animations.
 *
 * Respects `prefers-reduced-motion`: when the user has requested reduced motion,
 * the transition is disabled and both elements use their static final states.
 *
 * @example
 * ```yaml
 * # application.yaml
 * navbar:
 *   heroTransition:
 *     enabled: true
 *     startScroll: 0
 *     endScroll: 300
 *     easing: "ease-in-out"
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
}
