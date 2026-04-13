/**
 * Profile type definitions — single source of truth for all profile shapes.
 * All three config systems (siteConfig, profileConfig, content collections) derive from these.
 */

import type { ThemeStyle, ColorMode } from "../utils/theme.config";

export type { ThemeStyle, ColorMode };

// ─── Role ────────────────────────────────────────────────────────────────────

export interface Role {
  /** Unique identifier used for filtering and routing, e.g. "engineer", "artist" */
  id: string;
  /** Display title, e.g. "Software Engineer" */
  title: string;
  /** Primary specialties for this role */
  specialties: string[];
  /** Optional icon identifier for UI rendering */
  icon?: string;
  /** Whether this role appears prominently in the hero section */
  featured: boolean;
  /** Short teaser shown on the role selection card */
  description?: string;
  /** Role-specific bio paragraphs shown when this role is selected in a multi-role explorer */
  about?: AboutContent;
  /** Role-specific skill categories shown when this role is selected in a multi-role explorer */
  skills?: SkillCategory[];
}

// ─── Content ─────────────────────────────────────────────────────────────────

export interface AboutContent {
  /** Exactly 3 paragraphs of bio text shown in the About section */
  paragraphs: [string, string, string];
}

export interface SkillCategory {
  name: string;
  skills: string[];
}

// ─── Sections ────────────────────────────────────────────────────────────────

export interface PageSectionConfig {
  /** Matches component ID — "hero" | "about" | "skills" | "projects" | "contact" */
  id: string;
  /** Whether to render this section at all */
  enabled: boolean;
  /** Render order (ascending); allows reordering sections per profile */
  order: number;
  /** Only show this section when the primary role matches one of these ids */
  requiresRole?: string[];
  /** Only show this section when the named content collection is non-empty */
  requiresContent?: "projects" | "blog";
  /**
   * Layout variant for this widget. Valid values depend on the widget type:
   * - hero:     HeroLayout     — "centered" | "split"
   * - about:    AboutLayout    — "card" | "plain"
   * - skills:   SkillsLayout   — "grid-3" | "grid-2" | "list"
   * - projects: ProjectsLayout — "grid-3" | "grid-2" | "list"
   * - contact:  ContactLayout  — "centered" | "split"
   * Omit to use each widget's built-in default.
   */
  layout?: string;
}

// ─── Multi-Role Display ───────────────────────────────────────────────────────

export type MultiRoleDisplayStyle = "storytelling" | "tabs" | "combined";

export interface MultiRoleDisplayConfig {
  /**
   * Visual presentation strategy.
   * "storytelling" — inline role explorer section with card selection (recommended)
   * "tabs"         — tab bar switching (future)
   * "combined"     — all roles shown simultaneously (future)
   */
  style: MultiRoleDisplayStyle;
}

// ─── Theme ───────────────────────────────────────────────────────────────────

export interface ThemeConfig {
  style: ThemeStyle;
  defaultMode: ColorMode | "system";
  /** Show the visual style switcher widget */
  enableStyleSwitcher: boolean;
  /** Show the light/dark mode toggle widget */
  enableModeToggle: boolean;
}

// ─── Profile Config ───────────────────────────────────────────────────────────

export interface ProfileConfig {
  theme: ThemeConfig;
  about: AboutContent;
  skills: SkillCategory[];
  /** Ordered list of page sections and their visibility rules */
  sections: PageSectionConfig[];
  /** Optional message shown at the top of the contact section */
  contactMessage?: string;
  /** Multi-role UI options — required when siteConfig has more than one role */
  multiRoleDisplay?: MultiRoleDisplayConfig;
}

// ─── Site Config ─────────────────────────────────────────────────────────────

export interface SiteConfig {
  name: string;
  title: string;
  description: string;
  author: string;
  url: string;
  ogImage: string;
  social: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
    blogger?: string;
    whatsapp?: string;
    /** Pre-filled message appended to the WhatsApp link as ?text= */
    whatsappMessage?: string;
    email?: string;
  };
  location: {
    city: string;
    country: string;
  };
  /** All professional identities for this person */
  roles: Role[];
  /** ID of the role shown by default in hero/about */
  primaryRole: string;
  analytics: {
    plausibleDomain: string;
  };
}
