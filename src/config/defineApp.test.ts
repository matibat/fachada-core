/**
 * defineApp BDD Tests — Declarative App Configuration API
 *
 * These tests describe the behavior of the defineApp function and serve as
 * living documentation for how to author a Fachada app configuration.
 *
 * Common Language Reference:
 *   AppDefinition   — the single root declaration users author
 *   AppIdentity     — site identity, role identity, SEO fields
 *   AppPresentation — theme, about, skills, sections, contactMessage
 *   AppComposition  — page, siteTree, navbar, footer layout
 *   AppTheming      — theme variants, theme pool, layouts
 *
 * Usage pattern:
 *   import { defineApp } from '@fachada/core';
 *   const { appConfig, profileConfig } = defineApp({ identity, presentation, assets });
 */

import { describe, it, expect } from "vitest";
import {
  defineApp,
  validateAppDefinition,
  type AppDefinition,
} from "./defineApp";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const minimalDefinition: AppDefinition = {
  identity: {
    site: {
      name: "My Portfolio",
      title: "My Portfolio — Work",
      description: "A developer portfolio.",
      author: "Jane Doe",
      url: "https://example.com",
      ogImage: "/og-image.png",
      social: {},
      location: { city: "Montevideo", country: "Uruguay" },
      roles: [
        {
          id: "dev",
          title: "Developer",
          specialties: [],
          featured: true,
          description: "Full-stack developer.",
        },
      ],
      primaryRole: "dev",
    },
  },
  presentation: {
    theme: {
      style: "minimalist",
      defaultMode: "system",
      enableStyleSwitcher: false,
      enableModeToggle: true,
    },
    about: {
      paragraphs: ["I build things for the web."],
    },
    skills: [{ name: "Core", skills: ["TypeScript", "Astro"] }],
    sections: [
      { id: "hero", enabled: true, order: 1 },
      { id: "about", enabled: true, order: 2 },
    ],
    contactMessage: "Get in touch!",
  },
  assets: {
    ogImage: "/og-image.png",
  },
};

// ─── Scenario 1: Minimal config produces valid appConfig and profileConfig ─────

describe("Scenario 1: defineApp produces both appConfig and profileConfig from a minimal definition", () => {
  it("Given a minimal AppDefinition, When defineApp is called, Then it returns appConfig and profileConfig", () => {
    const result = defineApp(minimalDefinition);

    expect(result).toHaveProperty("appConfig");
    expect(result).toHaveProperty("profileConfig");
  });

  it("Given a minimal AppDefinition, When defineApp is called, Then appConfig.seo reflects identity.site", () => {
    const { appConfig } = defineApp(minimalDefinition);

    expect(appConfig.seo.title).toBe("My Portfolio — Work");
    expect(appConfig.seo.author).toBe("Jane Doe");
    expect(appConfig.seo.url).toBe("https://example.com");
  });

  it("Given a minimal AppDefinition, When defineApp is called, Then profileConfig.theme reflects presentation.theme", () => {
    const { profileConfig } = defineApp(minimalDefinition);

    expect(profileConfig.theme.style).toBe("minimalist");
    expect(profileConfig.theme.defaultMode).toBe("system");
  });

  it("Given a minimal AppDefinition, When defineApp is called, Then profileConfig.sections reflects presentation.sections", () => {
    const { profileConfig } = defineApp(minimalDefinition);

    expect(profileConfig.sections).toHaveLength(2);
    expect(profileConfig.sections[0].id).toBe("hero");
  });

  it("Given a minimal AppDefinition, When defineApp is called, Then appConfig.page.sections are derived from presentation.sections", () => {
    const { appConfig } = defineApp(minimalDefinition);

    expect(appConfig.page.sections).toHaveLength(2);
    expect(appConfig.page.sections[0].id).toBe("hero");
  });
});

// ─── Scenario 2: Optional composition merges correctly ────────────────────────

describe("Scenario 2: Optional composition fields are conditionally applied to appConfig", () => {
  it("Given composition.navbar is provided, When defineApp is called, Then appConfig.navbar is set", () => {
    const def: AppDefinition = {
      ...minimalDefinition,
      composition: {
        navbar: {
          variant: "horizontal",
          position: "fixed",
          hasMenu: true,
          mobileBreakpoint: "md",
          anchorLinks: [{ label: "About", href: "#about" }],
        },
      },
    };

    const { appConfig } = defineApp(def);

    expect(appConfig.navbar).toBeDefined();
    expect(appConfig.navbar?.variant).toBe("horizontal");
    expect(appConfig.navbar?.anchorLinks).toHaveLength(1);
  });

  it("Given composition is omitted, When defineApp is called, Then appConfig.navbar is undefined", () => {
    const { appConfig } = defineApp(minimalDefinition);

    expect(appConfig.navbar).toBeUndefined();
  });

  it("Given composition.footer is provided, When defineApp is called, Then appConfig.footer is set", () => {
    const def: AppDefinition = {
      ...minimalDefinition,
      composition: {
        footer: { layout: "minimal", handle: "@me" },
      },
    };

    const { appConfig } = defineApp(def);

    expect(appConfig.footer?.handle).toBe("@me");
  });

  it("Given composition.page is explicitly provided, When defineApp is called, Then appConfig.page uses that config", () => {
    const customPage = {
      sections: [{ id: "custom", enabled: true, order: 1, widgets: [] }],
    };
    const def: AppDefinition = {
      ...minimalDefinition,
      composition: { page: customPage },
    };

    const { appConfig } = defineApp(def);

    expect(appConfig.page.sections[0].id).toBe("custom");
  });
});

// ─── Scenario 3: Theming variants are applied ─────────────────────────────────

describe("Scenario 3: Theming variants are carried through to appConfig", () => {
  it("Given theming.themeVariants is provided, When defineApp is called, Then appConfig.themeVariants is set", () => {
    const def: AppDefinition = {
      ...minimalDefinition,
      theming: {
        themeVariants: { dark: { overrides: {} } },
      },
    };

    const { appConfig } = defineApp(def);

    expect(appConfig.themeVariants).toHaveProperty("dark");
  });

  it("Given theming is omitted, When defineApp is called, Then appConfig.themeVariants defaults to empty object", () => {
    const { appConfig } = defineApp(minimalDefinition);

    expect(appConfig.themeVariants).toEqual({});
  });
});

// ─── Scenario 4: Gallery is carried through ────────────────────────────────────

describe("Scenario 4: Gallery configuration is applied when provided", () => {
  it("Given gallery is provided, When defineApp is called, Then appConfig.gallery is set", () => {
    const def: AppDefinition = {
      ...minimalDefinition,
      gallery: {
        title: "My Work",
        description: "Portfolio gallery.",
        autoScrollInterval: 5000,
        transition: "linear",
        transitionStyle: "fade",
        images: [{ src: "/img.jpg", alt: "photo" }],
      },
    };

    const { appConfig } = defineApp(def);

    expect(appConfig.gallery?.title).toBe("My Work");
    expect(appConfig.gallery?.images).toHaveLength(1);
  });

  it("Given gallery is omitted, When defineApp is called, Then appConfig.gallery is undefined", () => {
    const { appConfig } = defineApp(minimalDefinition);

    expect(appConfig.gallery).toBeUndefined();
  });
});

// ─── Scenario 5: Validation catches required field violations ─────────────────

describe("Scenario 5: validateAppDefinition reports domain constraint violations", () => {
  it("Given a valid AppDefinition, When validateAppDefinition is called, Then it returns no errors", () => {
    const errors = validateAppDefinition(minimalDefinition);

    expect(errors).toHaveLength(0);
  });

  it("Given identity.site.title is empty, When validateAppDefinition is called, Then it reports the violation", () => {
    const def: AppDefinition = {
      ...minimalDefinition,
      identity: {
        site: { ...minimalDefinition.identity.site, title: "" },
      },
    };

    const errors = validateAppDefinition(def);

    expect(errors.some((e) => e.includes("identity.site.title"))).toBe(true);
  });

  it("Given assets.ogImage is empty, When validateAppDefinition is called, Then it reports the violation", () => {
    const def: AppDefinition = {
      ...minimalDefinition,
      assets: { ogImage: "" },
    };

    const errors = validateAppDefinition(def);

    expect(errors.some((e) => e.includes("assets.ogImage"))).toBe(true);
  });

  it("Given presentation.sections is empty, When validateAppDefinition is called, Then it reports the violation", () => {
    const def: AppDefinition = {
      ...minimalDefinition,
      presentation: {
        ...minimalDefinition.presentation,
        sections: [],
      },
    };

    const errors = validateAppDefinition(def);

    expect(errors.some((e) => e.includes("presentation.sections"))).toBe(true);
  });
});

// ─── Scenario 6: contactMessage is optional but propagated when present ────────

describe("Scenario 6: Optional contactMessage propagates to profileConfig", () => {
  it("Given contactMessage is in presentation, When defineApp is called, Then profileConfig.contactMessage is set", () => {
    const { profileConfig } = defineApp(minimalDefinition);

    expect(profileConfig.contactMessage).toBe("Get in touch!");
  });

  it("Given contactMessage is omitted, When defineApp is called, Then profileConfig.contactMessage is undefined", () => {
    const def: AppDefinition = {
      ...minimalDefinition,
      presentation: {
        ...minimalDefinition.presentation,
        contactMessage: undefined,
      },
    };

    const { profileConfig } = defineApp(def);

    expect(profileConfig.contactMessage).toBeUndefined();
  });
});
