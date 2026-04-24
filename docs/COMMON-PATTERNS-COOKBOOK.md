# Common Patterns Cookbook

Recipes for the most common use cases in Fachada. Each pattern is minimal, repeatable, and ready to adapt to your needs.

## Recipe: Multi-Role Identity

**Problem:** You're a founder-engineer-designer. You want different portfolios per role without maintaining separate codebases.

```typescript
import type { AppDefinition } from "@fachada/core";
import { defineApp } from "@fachada/core";

const engineerProfile = {
  theme: { style: "minimalist" },
  about: ["I build web frameworks and open-source tools."],
  skills: [{ name: "Languages", skills: ["TypeScript", "Rust", "Python"] }],
};

const designerProfile = {
  theme: { style: "modern-tech" },
  about: ["I design systems and digital experiences."],
  skills: [{ name: "Tools", skills: ["Figma", "Framer", "Three.js"] }],
};

const site = {
  name: "Your Name",
  title: "Engineer Designer Founder",
  url: "https://yoursite.com",
  ogImage: "/og-image.png",
};

// Query URL param or env to select profile
const role = process.env.FACHADA_ROLE ?? "engineer"; // engineer | designer | founder
const profileConfig = role === "designer" ? designerProfile : engineerProfile;

const { appConfig } = defineApp({
  identity: { site },
  presentation: profileConfig,
});

export { appConfig, profileConfig };
```

**What defineApp() Validates:**

- ✓ `site.name`, `site.title`, `site.url` required
- ✓ `presentation.theme.style` is one of: minimalist, modern-tech, professional, vaporwave
- ✓ At least one role config has skills array

**Next Step:** [Skin System Guide](./skin-system.md) to customize theme tokens per role.

---

## Recipe: Custom Theme with Brand Colors

**Problem:** Your brand has custom colors (navy + gold). You want all pages to reflect that.

```typescript
import type { AppDefinition } from "@fachada/core";
import { defineApp } from "@fachada/core";

const { appConfig } = defineApp({
  identity: {
    site: {
      name: "Luxury Co.",
      title: "Design & Strategy",
      url: "https://luxury.co",
      ogImage: "/og.png",
    },
  },
  presentation: {
    theme: {
      style: "professional",
      defaultMode: "dark", // shows your brand best
      enableModeToggle: false, // lock to dark only
    },
    about: ["We craft premium digital experiences."],
  },
  theming: {
    themeVariants: {
      default: {
        primary: "#001f3f", // navy
        accent: "#FFD700", // gold
        background: "#0a0e27",
        text: "#f5f5f5",
      },
    },
  },
});

export { appConfig };
```

**What defineApp() Validates:**

- ✓ `theming.themeVariants[].primary` is a valid hex color
- ✓ `presentation.theme.enableModeToggle === false` requires `defaultMode` to be set

**Next Step:** [Skin System Guide](./skin-system.md) for advanced token structure.

---

## Recipe: Portfolio Projects Section

**Problem:** You want to showcase 3-5 featured projects with images, descriptions, and links.

```typescript
import type { AppDefinition } from "@fachada/core";
import { defineApp } from "@fachada/core";

const { appConfig } = defineApp({
  identity: {
    site: {
      name: "Dev Portfolio",
      title: "Projects & Work",
      url: "https://devportfolio.com",
      ogImage: "/og.png",
    },
  },
  presentation: {
    theme: { style: "minimalist" },
    sections: [
      { id: "hero", enabled: true, order: 1 },
      { id: "featured-projects", enabled: true, order: 2 },
      { id: "contact", enabled: true, order: 3 },
    ],
  },
  composition: {
    pageBlueprints: [
      {
        id: "featured-projects",
        title: "Featured Work",
        description: "Selected projects showcasing design & engineering.",
        widgets: [
          {
            type: "project-card",
            props: {
              title: "Fachada Framework",
              description: "Config-first portfolio framework in TypeScript.",
              image: "/images/fachada.png",
              links: [
                { label: "GitHub", url: "https://github.com/..." },
                { label: "Demo", url: "https://..." },
              ],
              tags: ["TypeScript", "Astro", "Open Source"],
            },
          },
          {
            type: "project-card",
            props: {
              title: "Design System",
              description: "Accessible component library for Figma & React.",
              image: "/images/design-system.png",
              links: [{ label: "Storybook", url: "https://..." }],
              tags: ["React", "Design", "a11y"],
            },
          },
        ],
      },
    ],
  },
});

export { appConfig };
```

**What defineApp() Validates:**

- ✓ Widget `type` is registered in the framework
- ✓ `props` match the widget schema (enforced per widget type)
- ✓ All `links[].url` are valid URLs

**Next Step:** [Widget Registration Guide](./widget-registration.md) to create custom project-card widgets.

---

## Recipe: Add Social Links & Contact CTA

**Problem:** You want your GitHub, Twitter, and email prominently linked.

```typescript
import type { AppDefinition } from "@fachada/core";
import { defineApp } from "@fachada/core";

const { appConfig } = defineApp({
  identity: {
    site: {
      name: "Sarah Dev",
      title: "Full-Stack Engineer",
      url: "https://sarah.dev",
      ogImage: "/og.png",
      social: {
        github: "https://github.com/sarah",
        twitter: "https://twitter.com/sarah",
        linkedin: "https://linkedin.com/in/sarah",
        email: "hi@sarah.dev",
      },
    },
  },
  presentation: {
    theme: { style: "minimalist" },
    contactMessage: "Build something great together. Let's chat! 👋",
    sections: [
      { id: "hero", enabled: true, order: 1 },
      { id: "contact", enabled: true, order: 2 },
    ],
  },
});

export { appConfig };
```

**What defineApp() Validates:**

- ✓ `identity.site.social` values are valid URLs (except `email` which is checked as email format)
- ✓ At least one social link is provided (optional but recommended)

**Next Step:** [Navbar Configuration](./navbar-configuration.md) to link social icons in the header.

---

## Recipe: Deploy with Environment-Specific Theme

**Problem:** Your staging site should look different from production (e.g., red accent in staging to signal non-prod).

```typescript
import type { AppDefinition } from "@fachada/core";
import { defineApp } from "@fachada/core";

const isProd = process.env.DEPLOYMENT_ENV === "production";

const { appConfig } = defineApp({
  identity: {
    site: {
      name: "API Dashboard",
      title: isProd ? "Dashboard" : "Dashboard [STAGING]",
      url: process.env.SITE_URL,
      ogImage: "/og.png",
    },
  },
  presentation: {
    theme: { style: "modern-tech" },
  },
  theming: {
    themeVariants: {
      default: {
        primary: isProd ? "#0066cc" : "#ff6b6b", // blue in prod, red in staging
        accent: "#ffd700",
      },
    },
  },
});

export { appConfig };
```

**What defineApp() Validates:**

- ✓ `identity.site.url` is a valid URL
- ✓ Theme colors are valid hex

**Next Step:** Deploy instructions in your CI/CD pipeline (see README for deployment guides).

---

## Recipe: Multi-Section Blog-Style Layout

**Problem:** You want an about section, a skills section, and a blog/articles feed.

```typescript
import type { AppDefinition } from "@fachada/core";
import { defineApp } from "@fachada/core";

const { appConfig } = defineApp({
  identity: {
    site: {
      name: "Tech Writer",
      title: "Engineering Blog & Portfolio",
      url: "https://blog.example.com",
      ogImage: "/og.png",
    },
  },
  presentation: {
    theme: { style: "minimalist" },
    about: [
      "I write about web performance, TypeScript patterns, and developer experience.",
      "My focus is making complex topics accessible.",
    ],
    skills: [
      {
        name: "Writing",
        skills: ["Technical Articles", "Documentation", "Tutorials"],
      },
      { name: "Topics", skills: ["Web Perf", "TypeScript", "DevOps", "CI/CD"] },
    ],
    sections: [
      { id: "hero", enabled: true, order: 1 },
      { id: "about", enabled: true, order: 2 },
      { id: "skills", enabled: true, order: 3 },
      { id: "articles", enabled: true, order: 4 },
      { id: "contact", enabled: true, order: 5 },
    ],
  },
  composition: {
    pageBlueprints: [
      {
        id: "articles",
        title: "Latest Articles",
        widgets: [
          {
            type: "article-link",
            props: {
              title: "Why TypeScript > JavaScript for Large Teams",
              date: "2024-01-15",
              readTime: "8 min",
              url: "/blog/typescript-teams",
              excerpt: "Type safety prevents entire classes of bugs at scale.",
            },
          },
        ],
      },
    ],
  },
});

export { appConfig };
```

**What defineApp() Validates:**

- ✓ `presentation.sections` has at least one section enabled
- ✓ Section IDs exist in registered section types

**Next Step:** [Widget Registration Guide](./widget-registration.md) to define custom article-link widgets.

---

## More Patterns

These recipes cover ~80% of common use cases. For advanced patterns:

- **Conditional sections** based on role or environment → Combine recipes 1 & 5
- **Dynamic assets** (CDN URLs per environment) → See [API Reference](./API-REFERENCE.md#assets)
- **Internationalization** (i18n configs) → See [Domain Model](./DOMAIN-MODEL.md#identity-subdomain)
- **Custom galleries** with uploads → [Skin System Guide](./skin-system.md)

---

## How to Use These Recipes

1. **Pick a recipe** that matches your use case
2. **Copy the code block** into your `app.config.ts`
3. **Replace placeholder values** (URLs, names, colors)
4. **Run `defineApp()`** and check that your app compiles
5. **Deploy & iterate** using the linked guides

All recipes use the same core API; mix and match as needed. 🎨
