# Getting Started with @fachada/core

Welcome to **Fachada** — a TypeScript-first portfolio framework that renders your entire site from a single config file. In ~5 minutes, you'll go from zero to deployed.

## What is Fachada?

Fachada is a config-driven portfolio framework built on Astro. You define your identity, content, and presentation in TypeScript. The framework compiles it into a static site—no templates, no component HTML, just pure data transformed into pages.

**Use Fachada if you want:**

- A portfolio that is **authentically configured, not componentized**
- **Type-safe** content and theme management
- **Multiple skins** (themes) without rebuilding
- **Multi-role support** (engineer, designer, founder—all in one config)

## Step 1: Install

```bash
npm install @fachada/core
# or
yarn add @fachada/core
```

## Step 2: Create Your First Config

Create a file at the root of your project: `app/app.config.ts`

```typescript
import type { AppConfig, ProfileConfig } from "@fachada/core";
import { defineApp } from "@fachada/core";

const site = {
  name: "Your Name",
  title: "Your Portfolio",
  description: "A portfolio built with Fachada",
  author: "Your Name",
  url: "https://yoursite.com",
  ogImage: "/og-image.png", // required: path to public image
};

const profileConfig: ProfileConfig = {
  theme: {
    style: "minimalist", // choose: "minimalist" | "modern-tech" | "professional" | "vaporwave"
    defaultMode: "system", // "light" | "dark" | "system"
    enableStyleSwitcher: true,
    enableModeToggle: true,
  },
  about: {
    paragraphs: [
      "Hi, I'm building something cool. I love TypeScript, design, and open source.",
    ],
  },
  skills: [
    {
      name: "Languages",
      skills: ["TypeScript", "JavaScript", "Python"],
    },
  ],
  sections: [
    { id: "hero", enabled: true, order: 1 },
    { id: "about", enabled: true, order: 2 },
    { id: "skills", enabled: true, order: 3 },
    { id: "contact", enabled: true, order: 4 },
  ],
  contactMessage: "Reach out if you'd like to collaborate.",
};

const { appConfig } = defineApp({
  identity: {
    site,
  },
  presentation: {
    theme: profileConfig.theme,
    about: profileConfig.about,
    skills: profileConfig.skills,
    sections: profileConfig.sections,
    contactMessage: profileConfig.contactMessage,
  },
  assets: {
    ogImage: site.ogImage,
  },
});

export { appConfig, profileConfig };
```

## Step 3: Import into Your Astro Layout

Add this to your Astro page component (e.g., `src/pages/index.astro`):

```astro
---
import { appConfig, profileConfig } from "../app/app.config";

// appConfig contains SEO, theming, and page structure
// profileConfig contains content (theme, about, skills, sections)

// Pass them to your layout component or renderer
---

<html>
  <head>
    <title>{appConfig.seo.title}</title>
    <meta name="description" content={appConfig.seo.description} />
    <meta property="og:image" content={appConfig.seo.ogImage} />
  </head>
  <body>
    <!-- Your page renderer goes here -->
  </body>
</html>
```

## What's Next?

You've created a minimal, type-safe config. From here:

### Learn Core Patterns

- **[API Reference](./API-REFERENCE.md)** — Complete type signatures, composition, and advanced features
- **Sections & Widgets** — Extend your portfolio with projects, gallery, multi-role display
- **[Navbar Configuration](./navbar-configuration.md)** — Customize header behavior per-app
- **[Skin System](./skin-system.md)** — Create custom themes or modify token colors

### Customize Your Site

1. **Assets**: Add social links, analytics, favicon to `site`
2. **Content**: Add more paragraphs, skills, and projects to `profileConfig`
3. **Structure**: Enable/disable sections, reorder them, add subsections via `composition.siteTree`
4. **Theming**: Define custom token colors with `theming.themeVariants`

### Deploy

When you're ready to ship:

```bash
npm run build
# Deploy the dist/ folder to Vercel, Netlify, Cloudflare Pages, or Firebase Hosting
```

## Validation

Before deploying, your app config will validate:

- ✓ `identity.site.title` is required
- ✓ `assets.ogImage` is required
- ✓ At least one section in `presentation.sections`

If validation fails, `defineApp()` will throw errors with clear guidance.

## Questions?

- **"How do I add a custom widget?"** → [Widget Registration Guide](./widget-registration.md)
- **"How do I create a custom theme?"** → [Skin System Guide](./skin-system.md)
- **"What are all the config options?"** → [API Reference](./API-REFERENCE.md)

---

**Good to go!** You now have everything needed to render your portfolio from config. Start with the minimal example above and expand from there. 🚀
