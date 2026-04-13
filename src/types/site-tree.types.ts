/**
 * SiteTree domain type definitions — Fachada v2
 *
 * SiteTreeConfig is a value object that describes the full page hierarchy of a
 * deployed app. It contains a mandatory landing page and optional subsections,
 * each with their own SEO metadata and widget composition.
 *
 * Downstream consumers:
 *   - RobotsGenerator  → robots.txt
 *   - LlmTextGenerator → llm.txt
 *   - SiteTreeValidator → build-time validation
 *   - Astro routes     → dynamic page generation
 */

/** Sentinel value — used by tests to confirm the module loaded correctly. */
export const SITE_TREE_VERSION = "v1" as const;

// ─── Page Template Data ───────────────────────────────────────────────────────

/**
 * LandingPageData — configuration passed to the "landing" core template.
 *
 * The landing template auto-generates layout from siteConfig.roles.
 * These fields let apps customise the marketing copy without code.
 */
export interface LandingPageData {
  /** Primary hero headline. Falls back to siteConfig.title when omitted. */
  hook?: string;
  /** Hero sub-headline. Falls back to siteConfig.description when omitted. */
  subheading?: string;
  /** Heading for the bottom CTA section. Falls back to "Let's work on something." */
  ctaHeading?: string;
  /** Body copy for the bottom CTA section. Falls back to a generic message. */
  ctaMessage?: string;
  /** Label for the bottom CTA button when single-role. Falls back to "Get in touch". */
  ctaLabel?: string;
}

/**
 * RolePageData — configuration passed to the "role" core template.
 *
 * The role template renders a full-page role presentation driven entirely by
 * siteConfig.roles[roleId]. No app-specific .astro required.
 */
export interface RolePageData {
  /** Must match a role id in siteConfig.roles. */
  roleId: string;
  /**
   * Hero visual style.
   *   "split"       — 60vh two-column layout (technical/engineering feel)
   *   "atmospheric" — full-viewport centred layout (artistic/ambient feel)
   * @default "split"
   */
  heroStyle?: "split" | "atmospheric";
  /** Show a breadcrumb nav back to "/". @default true */
  showBreadcrumb?: boolean;
  /** Override for the contact section message. */
  contactMessage?: string;
  /** Contact widget layout. @default "split" */
  contactLayout?: "split" | "centered";
  /** Projects widget grid layout. @default "grid-3" */
  projectsLayout?: "grid-2" | "grid-3";
  /** Label for the works/gallery section heading. */
  galleryLabel?: string;
  /** Label for the skills section heading. */
  skillsLabel?: string;
  /** Label for the bio/process section heading. */
  bioLabel?: string;
  /** Scroll CTA shown in atmospheric hero. Falls back to "↓ Ver trabajo". */
  scrollCta?: string;
  /** Availability line shown in split hero. Omit to hide. */
  availabilityLine?: string;
}

/**
 * DocumentPageData — configuration passed to the "document" core template.
 *
 * The document template renders a navigable guide page with an optional
 * download button. Content is loaded from docs/ via a glob key.
 */
export interface DocumentPageData {
  /**
   * Key used to resolve the content file.
   * Resolved as /docs/{contentKey}.md via import.meta.glob at build time.
   */
  contentKey: string;
  /** Filename offered by the download button. Omit to hide the button. */
  downloadFilename?: string;
  /** Back navigation link (← …). */
  backLink?: { href: string; label: string };
  /** Forward navigation link (… →). */
  nextLink?: { href: string; label: string };
}

/**
 * MarkdownPageData — configuration passed to the "markdown" core template.
 *
 * The markdown template renders a content-collection entry as a full page,
 * resolved at render time by contentId.
 */
export interface MarkdownPageData {
  /** Content collection entry ID for resolving content at render time. */
  contentId: string;
  /** Filename offered by the download button. Omit to hide the button. */
  downloadFilename?: string;
  /** Back navigation link (← …). */
  backLink?: { href: string; label: string };
  /** Forward navigation link (… →). */
  nextLink?: { href: string; label: string };
}

/**
 * HubPageData — configuration passed to the "hub" core template.
 *
 * The hub template renders a card grid linking to sibling pages.
 */
export interface HubPageData {
  cards: Array<{
    title: string;
    description: string;
    link: string;
    bullets: string[];
  }>;
}

// ─── Robots Domain ────────────────────────────────────────────────────────────

/**
 * RobotsConfig — per-page crawler directives.
 * Omitting this field means: respect global defaults (allow all).
 */
export interface RobotsConfig {
  /** Paths to allow (defaults to implicit allow-all if omitted). */
  allow?: string[];
  /** Paths to disallow for all crawlers. */
  disallow?: string[];
  /** Crawl delay in seconds to request from polite crawlers. */
  crawlDelay?: number;
}

// ─── Page Metadata ────────────────────────────────────────────────────────────

/**
 * PageMeta — SEO and discovery metadata for a single page in the site tree.
 *
 * Every page in the tree (landing or subsection) must carry this shape so that
 * robots.txt, llm.txt, and <head> meta tags can be generated automatically.
 */
export interface PageMeta {
  /** URL path for this page. Landing must be "/". Subsections must start with "/". */
  path: string;
  /** Page-specific <title> tag content. */
  title: string;
  /** Meta description — used for <meta name="description"> and llm.txt. */
  description: string;
  /** Optional keyword list for SEO and structured data. */
  keywords?: string[];
  /** Override canonical URL (defaults to siteConfig.url + path). */
  canonicalUrl?: string;
  /** Override OG image for this page (defaults to AppConfig.assets.ogImage). */
  ogImage?: string;
  /** Per-page crawler directives written into robots.txt. */
  robots?: RobotsConfig;
  /**
   * Human-readable summary for AI indexers (llm.txt).
   * Should describe what a visitor finds on this page in 1–2 sentences.
   */
  llmSummary?: string;
}

// ─── Section Composition (shared by landing and subsections) ──────────────────

/**
 * SectionRef — lightweight reference to a visual section (widget block) placed
 * on a page. The full SectionConfig (with widgets) lives in AppConfig.page;
 * SiteTree only declares which sections appear in the routing hierarchy.
 *
 * Keeping this minimal prevents tight coupling between routing and widget config.
 */
export interface SectionRef {
  /** Matches a SectionConfig.id in AppConfig.page.sections. */
  id: string;
  /** Order of this section on the page (ascending). */
  order: number;
  /** Whether this section is rendered. Useful for toggling without removal. */
  enabled: boolean;
}

// ─── Tree Nodes ───────────────────────────────────────────────────────────────

/**
 * SubsectionDefinition — a non-root page in the site tree.
 * Corresponds to a route generated under a distinct URL path.
 */
export interface SubsectionDefinition {
  /** Unique identifier — used as a route key and for cross-references. */
  id: string;
  /** SEO and discovery metadata for this page. Path must NOT be "/". */
  meta: PageMeta;
  /** Ordered visual sections rendered on this subsection's page. */
  sections: SectionRef[];
  /**
   * Core rendering template for this page.
   *   "role"     — Renders full-page role presentation from siteConfig.roles.
   *   "document" — Renders a navigable guide page from a docs/ markdown file.
   *   "hub"      — Renders a card-grid linking to sibling pages.
   *   "sections" — Renders widget sections from appConfig.page.sections (default).
   *   "markdown" — Renders a content-collection entry as a full page.
   * @default "sections"
   */
  template?: "sections" | "role" | "document" | "hub" | "markdown";
  /** Template-specific configuration. Shape is determined by template type. */
  templateData?:
    | RolePageData
    | DocumentPageData
    | HubPageData
    | MarkdownPageData;
}

/**
 * LandingDefinition — the mandatory root page of the site tree.
 * Always served at path "/".
 */
export interface LandingDefinition {
  /** SEO and discovery metadata. meta.path MUST be "/". */
  meta: PageMeta;
  /** Ordered visual sections rendered on the landing page. */
  sections: SectionRef[];
  /** Optional child pages accessible from the landing. */
  subsections?: SubsectionDefinition[];
  /**
   * Core rendering template for the landing page.
   *   "landing"  — Auto-builds from siteConfig.roles (default).
   *   "sections" — Renders widget sections from appConfig.page.sections.
   * @default "landing"
   */
  template?: "landing" | "sections";
  /** Landing page copy overrides. */
  templateData?: LandingPageData;
}

// ─── Aggregate Root ───────────────────────────────────────────────────────────

/**
 * SiteTreeConfig — aggregate root for site structure and SEO configuration.
 *
 * Added to AppConfig as an optional field (backward-compatible).
 * When present, it overrides robots.txt and llm.txt generation logic and
 * enables multi-page routing for declared subsections.
 */
export interface SiteTreeConfig {
  /** Mandatory landing page at "/". */
  landing: LandingDefinition;
}
