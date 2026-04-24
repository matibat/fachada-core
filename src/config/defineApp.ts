import type {
  AppConfig,
  AssetConfig,
  GalleryConfig,
  AppThemes,
  ThemeOverride,
  SiteTreeConfig,
  NavbarConfig,
  PageConfig,
} from "../types/app.types";
import type {
  SiteConfig,
  ProfileConfig,
  ThemeConfig,
  AboutContent,
  SkillCategory,
  PageSectionConfig,
  MultiRoleDisplayConfig,
} from "../types/profile.types";
import type { WidgetLayoutConfig } from "../types/layout.types";

export interface AppIdentity {
  site: SiteConfig;
}

export interface AppPresentation {
  theme: ThemeConfig;
  about: AboutContent;
  skills: SkillCategory[];
  sections: PageSectionConfig[];
  contactMessage?: string;
  multiRoleDisplay?: MultiRoleDisplayConfig;
}

export interface AppComposition {
  page?: PageConfig;
  siteTree?: SiteTreeConfig;
  navbar?: NavbarConfig;
  footer?: AppConfig["footer"];
}

export interface AppTheming {
  themes?: AppThemes;
  themeVariants?: Record<string, ThemeOverride>;
  themeLayouts?: Record<string, WidgetLayoutConfig>;
}

export interface AppDefinition {
  identity: AppIdentity;
  presentation: AppPresentation;
  assets: AssetConfig;
  composition?: AppComposition;
  theming?: AppTheming;
  gallery?: GalleryConfig;
}

export interface AppDefinitionResult {
  appConfig: AppConfig;
  profileConfig: ProfileConfig;
}

function buildPage(definition: AppDefinition): PageConfig {
  if (definition.composition?.page) {
    return definition.composition.page;
  }

  return {
    sections: definition.presentation.sections.map((section) => ({
      ...section,
      widgets: [],
    })),
  };
}

export function defineApp(definition: AppDefinition): AppDefinitionResult {
  const profileConfig: ProfileConfig = {
    theme: definition.presentation.theme,
    about: definition.presentation.about,
    skills: definition.presentation.skills,
    sections: definition.presentation.sections,
    ...(definition.presentation.contactMessage !== undefined
      ? { contactMessage: definition.presentation.contactMessage }
      : {}),
    ...(definition.presentation.multiRoleDisplay !== undefined
      ? { multiRoleDisplay: definition.presentation.multiRoleDisplay }
      : {}),
  };

  const appConfig: AppConfig = {
    seo: definition.identity.site,
    theme: definition.presentation.theme,
    themeVariants: definition.theming?.themeVariants ?? {},
    assets: definition.assets,
    page: buildPage(definition),
    ...(definition.theming?.themes !== undefined
      ? { themes: definition.theming.themes }
      : {}),
    ...(definition.gallery !== undefined
      ? { gallery: definition.gallery }
      : {}),
    ...(definition.theming?.themeLayouts !== undefined
      ? { themeLayouts: definition.theming.themeLayouts }
      : {}),
    ...(definition.composition?.siteTree !== undefined
      ? { siteTree: definition.composition.siteTree }
      : {}),
    ...(definition.composition?.navbar !== undefined
      ? { navbar: definition.composition.navbar }
      : {}),
    ...(definition.composition?.footer !== undefined
      ? { footer: definition.composition.footer }
      : {}),
  };

  return { appConfig, profileConfig };
}

export function validateAppDefinition(definition: AppDefinition): string[] {
  const errors: string[] = [];

  if (!definition.identity.site.title) {
    errors.push("identity.site.title is required");
  }

  if (!definition.assets.ogImage) {
    errors.push("assets.ogImage is required");
  }

  if (definition.presentation.sections.length === 0) {
    errors.push("presentation.sections must contain at least one section");
  }

  return errors;
}
