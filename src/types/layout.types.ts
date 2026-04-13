/**
 * Layout type definitions — one union per widget section.
 *
 * Each widget declares which structural variants it supports.
 * Themes pick a variant per section via WidgetLayoutConfig.
 * WidgetRenderer resolves the active layout at build time and forwards it
 * as a typed prop to the widget dispatcher, which renders the matching
 * sub-component.
 */

/** Hero section layout variants */
export type HeroLayout =
  /** Centred single column — name, title, description, CTAs all stacked */
  | "centered"
  /** Two-column split — identity (name + title) on the left, content (description + CTAs) on the right */
  | "split";

/** About section layout variants */
export type AboutLayout =
  /** Paragraphs inside a themed Card container */
  | "card"
  /** Paragraphs rendered directly without a card wrapper */
  | "plain";

/** Skills section layout variants */
export type SkillsLayout =
  /** Three-column responsive grid (default) */
  | "grid-3"
  /** Two-column grid — wider tiles */
  | "grid-2"
  /** Vertical list — category name left, skills right */
  | "list";

/** Projects section layout variants */
export type ProjectsLayout =
  /** Three-column responsive grid (default) */
  | "grid-3"
  /** Two-column grid — larger project cards */
  | "grid-2"
  /** Horizontal list — title + description inline */
  | "list";

/** Contact section layout variants */
export type ContactLayout =
  /** Single centred column with card (default) */
  | "centered"
  /** Two-column split — message + socials left, CTA card right */
  | "split";

/**
 * WidgetLayoutConfig — maps each section to its chosen layout variant.
 * All fields are optional; widgets fall back to their own defaults when unset.
 */
export interface WidgetLayoutConfig {
  hero?: HeroLayout;
  about?: AboutLayout;
  skills?: SkillsLayout;
  projects?: ProjectsLayout;
  contact?: ContactLayout;
}
