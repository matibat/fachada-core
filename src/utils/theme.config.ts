/**
 * Theme configuration — single source of truth for all visual theme definitions.
 * Each theme defines light and dark token sets that ThemeProvider applies as CSS custom properties.
 */

export type ThemeStyle = string;
export type ColorMode = "light" | "dark" | "auto";

export interface ThemeTokens {
  bgPrimary: string;
  bgSecondary: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentHover: string;
  accentSecondary?: string;
  accentTertiary?: string;
  border: string;
  shadow: string;
  borderRadius: string;
  transition: string;
  glow: string;
  gradient: string;
  spacingSection: string;
  spacingCard: string;
  spacingElement: string;
  /** Font family for body text */
  fontBody: string;
  /** Font family for headings */
  fontHeading: string;
  /** Monospace font family */
  fontMono: string;
  /** Font weight for headings */
  headingWeight: string;
  /** Line-height for body text */
  bodyLineHeight: string;
  /** Max content width for the main container */
  contentMaxWidth: string;
  /** Letter-spacing for headings */
  headingLetterSpacing: string;
  /** Button text color on gradient backgrounds */
  buttonTextColor: string;
  /** Button text shadow for readability */
  buttonTextShadow: string;
  /** Scanline opacity for decorative effects */
  scanlineOpacity: string;
}

export interface ThemeDefinition {
  name: string;
  description: string;
  light: ThemeTokens;
  dark: ThemeTokens;
}

/** Maps ThemeTokens keys to CSS custom property names. */
export const CSS_VAR_MAP: Record<keyof ThemeTokens, string> = {
  bgPrimary: "--bg-primary",
  bgSecondary: "--bg-secondary",
  textPrimary: "--text-primary",
  textSecondary: "--text-secondary",
  accent: "--accent",
  accentHover: "--accent-hover",
  accentSecondary: "--accent-secondary",
  accentTertiary: "--accent-tertiary",
  border: "--border",
  shadow: "--shadow",
  borderRadius: "--border-radius",
  transition: "--transition",
  glow: "--glow",
  gradient: "--gradient",
  spacingSection: "--spacing-section",
  spacingCard: "--spacing-card",
  spacingElement: "--spacing-element",
  fontBody: "--font-body",
  fontHeading: "--font-heading",
  fontMono: "--font-mono",
  headingWeight: "--heading-weight",
  bodyLineHeight: "--body-line-height",
  contentMaxWidth: "--content-max-width",
  headingLetterSpacing: "--heading-letter-spacing",
  buttonTextColor: "--button-text-color",
  buttonTextShadow: "--button-text-shadow",
  scanlineOpacity: "--scanline-opacity",
};

export const THEME_DEFINITIONS: Record<ThemeStyle, ThemeDefinition> = {
  minimalist: {
    name: "Minimalist",
    description: "Maximum simplicity, generous whitespace, content-first",
    light: {
      bgPrimary: "#F9F8F5",
      bgSecondary: "#FFFFFF",
      textPrimary: "#141414",
      textSecondary: "#555550",
      accent: "#141414",
      accentHover: "#000000",
      border: "#E5E4DF",
      shadow: "rgba(0, 0, 0, 0.05)",
      borderRadius: "0",
      transition: "0.3s ease",
      glow: "none",
      gradient: "none",
      spacingSection: "8rem",
      spacingCard: "2rem",
      spacingElement: "1.5rem",
      fontBody: "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
      fontHeading: "'Playfair Display', 'Georgia', serif",
      fontMono: "'JetBrains Mono', 'Courier New', monospace",
      headingWeight: "400",
      bodyLineHeight: "1.8",
      contentMaxWidth: "720px",
      headingLetterSpacing: "-0.02em",
      buttonTextColor: "#141414",
      buttonTextShadow: "none",
      scanlineOpacity: "0",
    },
    dark: {
      bgPrimary: "#0E0E0C",
      bgSecondary: "#161614",
      textPrimary: "#F0EFE8",
      textSecondary: "#A8A89E",
      accent: "#F0EFE8",
      accentHover: "#FFFFFF",
      border: "#2A2A26",
      shadow: "rgba(255, 255, 255, 0.04)",
      borderRadius: "0",
      transition: "0.3s ease",
      glow: "none",
      gradient: "none",
      spacingSection: "8rem",
      spacingCard: "2rem",
      spacingElement: "1.5rem",
      fontBody: "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
      fontHeading: "'Playfair Display', 'Georgia', serif",
      fontMono: "'JetBrains Mono', 'Courier New', monospace",
      headingWeight: "400",
      bodyLineHeight: "1.8",
      contentMaxWidth: "720px",
      headingLetterSpacing: "-0.02em",
      buttonTextColor: "inherit",
      buttonTextShadow: "none",
      scanlineOpacity: "0",
    },
  },

  "modern-tech": {
    name: "Modern Tech",
    description: "Futuristic and dynamic with an advanced-technology feel",
    light: {
      bgPrimary: "#F0F4F8",
      bgSecondary: "#FFFFFF",
      textPrimary: "#0f0f0f",
      textSecondary: "#4A5568",
      accent: "#0095C8",
      accentHover: "#0077A3",
      accentSecondary: "#6D3FD9",
      border: "#CBD5E0",
      shadow: "rgba(0, 149, 200, 0.12)",
      borderRadius: "0.75rem",
      transition: "0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      glow: "0 0 20px rgba(0, 149, 200, 0.25)",
      gradient: "linear-gradient(135deg, #0095C8 0%, #6D3FD9 100%)",
      spacingSection: "6rem",
      spacingCard: "1.5rem",
      spacingElement: "1rem",
      fontBody: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      fontHeading: "'Space Grotesk', 'Inter', sans-serif",
      fontMono: "'JetBrains Mono', 'Fira Code', monospace",
      headingWeight: "700",
      bodyLineHeight: "1.65",
      contentMaxWidth: "1100px",
      headingLetterSpacing: "-0.03em",
      buttonTextColor: "#0f0f0f",
      buttonTextShadow: "none",
      scanlineOpacity: "0",
    },
    dark: {
      bgPrimary: "#080C10",
      bgSecondary: "#0F1620",
      textPrimary: "#E8EFF5",
      textSecondary: "#8A9BB0",
      accent: "#00D4FF",
      accentHover: "#00BBDF",
      accentSecondary: "#8B5CF6",
      accentTertiary: "#00FF88",
      border: "#1E2D40",
      shadow: "rgba(0, 212, 255, 0.2)",
      borderRadius: "0.75rem",
      transition: "0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      glow: "0 0 30px rgba(0, 212, 255, 0.4)",
      gradient: "linear-gradient(135deg, #00D4FF 0%, #8B5CF6 100%)",
      spacingSection: "6rem",
      spacingCard: "1.5rem",
      spacingElement: "1rem",
      fontBody: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      fontHeading: "'Space Grotesk', 'Inter', sans-serif",
      fontMono: "'JetBrains Mono', 'Fira Code', monospace",
      headingWeight: "700",
      bodyLineHeight: "1.65",
      contentMaxWidth: "1100px",
      headingLetterSpacing: "-0.03em",
      buttonTextColor: "#fff",
      buttonTextShadow: "none",
      scanlineOpacity: "0",
    },
  },

  professional: {
    name: "Professional",
    description: "Corporate yet modern — clean, structured, and trustworthy",
    light: {
      bgPrimary: "#FFFFFF",
      bgSecondary: "#F8FAFC",
      textPrimary: "#1A202C",
      textSecondary: "#4A5568",
      accent: "#0055FF",
      accentHover: "#0044CC",
      accentSecondary: "#00AA77",
      border: "#E2E8F0",
      shadow: "rgba(0, 0, 0, 0.08)",
      borderRadius: "0.375rem",
      transition: "0.25s ease-out",
      glow: "none",
      gradient: "linear-gradient(135deg, #0055FF 0%, #00AA77 100%)",
      spacingSection: "5rem",
      spacingCard: "1.75rem",
      spacingElement: "1.25rem",
      fontBody: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      fontHeading: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      fontMono: "'JetBrains Mono', monospace",
      headingWeight: "600",
      bodyLineHeight: "1.7",
      contentMaxWidth: "960px",
      headingLetterSpacing: "-0.01em",
      buttonTextColor: "#1A202C",
      buttonTextShadow: "none",
      scanlineOpacity: "0",
    },
    dark: {
      bgPrimary: "#0F172A",
      bgSecondary: "#1E293B",
      textPrimary: "#F1F5F9",
      textSecondary: "#94A3B8",
      accent: "#3B82F6",
      accentHover: "#60A5FA",
      accentSecondary: "#10B981",
      border: "#334155",
      shadow: "rgba(59, 130, 246, 0.15)",
      borderRadius: "0.375rem",
      transition: "0.25s ease-out",
      glow: "none",
      gradient: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
      spacingSection: "5rem",
      spacingCard: "1.75rem",
      spacingElement: "1.25rem",
      fontBody: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      fontHeading: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      fontMono: "'JetBrains Mono', monospace",
      headingWeight: "600",
      bodyLineHeight: "1.7",
      contentMaxWidth: "960px",
      headingLetterSpacing: "-0.01em",
      buttonTextColor: "#fff",
      buttonTextShadow: "none",
      scanlineOpacity: "0",
    },
  },

  vaporwave: {
    name: "Vaporwave",
    description:
      "Retro-futuristic 80s/90s nostalgia with a cyber-Japanese aesthetic",
    light: {
      bgPrimary: "#FFD6E8",
      bgSecondary: "#D4F1F4",
      textPrimary: "#2D1B4E",
      textSecondary: "#6B4D8A",
      accent: "#FF00FF",
      accentHover: "#CC00CC",
      accentSecondary: "#00FFFF",
      accentTertiary: "#FFFF00",
      border: "#B794F4",
      shadow: "rgba(255, 0, 255, 0.2)",
      borderRadius: "1rem",
      transition: "0.35s ease-in-out",
      glow: "0 0 40px rgba(255, 0, 255, 0.5)",
      gradient:
        "linear-gradient(135deg, #FF00FF 0%, #00FFFF 50%, #FFFF00 100%)",
      spacingSection: "6rem",
      spacingCard: "2rem",
      spacingElement: "1.5rem",
      fontBody: "'Space Mono', 'Courier New', monospace",
      fontHeading: "'Exo 2', 'Impact', sans-serif",
      fontMono: "'Space Mono', 'Courier New', monospace",
      headingWeight: "800",
      bodyLineHeight: "1.75",
      contentMaxWidth: "900px",
      headingLetterSpacing: "0.02em",
      buttonTextColor: "#fff",
      buttonTextShadow:
        "0 2px 6px rgba(0, 0, 0, 0.6), 0 0 12px rgba(0, 0, 0, 0.4)",
      scanlineOpacity: "0.03",
    },
    dark: {
      bgPrimary: "#1A0033",
      bgSecondary: "#2D0052",
      textPrimary: "#FFD6E8",
      textSecondary: "#D4A5F9",
      accent: "#FF00FF",
      accentHover: "#FF4DFF",
      accentSecondary: "#00FFFF",
      accentTertiary: "#FFFF00",
      border: "#6B2E8A",
      shadow: "rgba(255, 0, 255, 0.3)",
      borderRadius: "1rem",
      transition: "0.35s ease-in-out",
      glow: "0 0 50px rgba(255, 0, 255, 0.6)",
      gradient:
        "linear-gradient(135deg, #FF00FF 0%, #00FFFF 50%, #FFFF00 100%)",
      spacingSection: "6rem",
      spacingCard: "2rem",
      spacingElement: "1.5rem",
      fontBody: "'Space Mono', 'Courier New', monospace",
      fontHeading: "'Exo 2', 'Impact', sans-serif",
      fontMono: "'Space Mono', 'Courier New', monospace",
      headingWeight: "800",
      bodyLineHeight: "1.75",
      contentMaxWidth: "900px",
      headingLetterSpacing: "0.02em",
      buttonTextColor: "#fff",
      buttonTextShadow:
        "0 2px 6px rgba(0, 0, 0, 0.6), 0 0 12px rgba(0, 0, 0, 0.4)",
      scanlineOpacity: "0.03",
    },
  },
};

export const THEME_STYLES = Object.keys(THEME_DEFINITIONS) as ThemeStyle[];

/** Returns the active token set for a given style and effective color mode. */
export function getActiveTokens(
  styleTheme: ThemeStyle,
  effectiveColorMode: "light" | "dark",
): ThemeTokens {
  return THEME_DEFINITIONS[styleTheme][effectiveColorMode];
}
