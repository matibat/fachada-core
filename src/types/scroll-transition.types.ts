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
 * ```yaml
 * # application.yaml
 * navbar:
 *   heroTransition:
 *     enabled: true
 *     startScroll: 0
 *     endScroll: 300
 *     easing: "ease-in-out"
 *     targetAnchorSelector: ".navbar-brand"    # CSS selector for target
 *     targetAnchorMode: "fixed"                # how target is positioned
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
}
