# YAML Configuration Guide for Fachada v1.x

## Introduction

**What is `application.yaml`?**

`application.yaml` is the **single source of truth** for your Fachada application. It defines:

- **SEO metadata** (title, description, keywords, social preview)
- **Available themes** (built-in and custom color schemes)
- **Page structure** (landing page URL hierarchy)
- **Content layout** (widgets, containers, hierarchical sections)
- **Design tokens** (colors, fonts, spacing via skins)
- **Multi-language support** (per-page translations)

**Why YAML in v1.x?**

YAML is human-readable, easy to version-control, and integrates seamlessly with static site generation. No database needed — your entire site structure is declarative and portable.

**How Fachada Uses It**

1. **Build Time**: Loads `application.yaml`, validates against JSON Schema
2. **Type Safety**: Parsed YAML becomes fully typed TypeScript objects
3. **No Runtime Overhead**: All validation happens at build time
4. **Configuration-Driven**: Change your site structure without touching code

---

## File Structure

### Top-Level Sections

```yaml
# Required fields
seo:              # Site identity and SEO metadata
  title: string
  # ... see SEO Section below

themes:           # Theme configuration
  default: string
  # ... see Themes Section below

pages:            # Page definitions
  [page-id]:
    # ... see Pages Section below

# Optional fields
skins:            # Global CSS token definitions
  [skin-name]:
    # ... see Skins Section below

assets:           # Asset references (images, files)
  [asset-name]: string | {[variant]: string}

siteTree:         # Navigation hierarchy (for sitemap/robots.txt)
  # Arbitrary structure for site navigation
```

### File Location

By default, Fachada looks for `application.yaml` in these locations (in order):

1. **Explicit flag**: `--config-path ./my-app.yaml`
2. **Environment variable**: `FACHADA_CONFIG=./path/to/app.yaml`
3. **Default**: `./application.yaml` (current directory)

---

## SEO Section

Configure site identity and search engine metadata.

### Required Fields

```yaml
seo:
  title: "Your Site Title" # Appears in <title> tag, browser tab
```

### Optional Fields

```yaml
seo:
  title: "My Portfolio"
  description: "A brief site description for search engines"
  author: "John Designer"
  author_url: "https://johndesigner.com"
  keywords:
    - portfolio
    - design
    - ux
  og_image: "https://example.com/og-image.png" # Open Graph preview
```

### Example: Minimal SEO

```yaml
seo:
  title: "Jane's Design Portfolio"
```

### Example: Complete SEO

```yaml
seo:
  title: "Jane's Design Portfolio"
  description: "Digital product designer with 8+ years of experience in SaaS and mobile"
  author: "Jane Smith"
  author_url: "https://janesmith.design"
  keywords:
    - product design
    - ux research
    - design systems
    - figma
  og_image: "https://janesmith.design/og-hero.png"
```

---

## Themes Section

Define which color schemes are available to your users.

### Required Fields

```yaml
themes:
  default: "minimalist" # Theme name shown by default
```

### Optional Fields

```yaml
themes:
  default: "minimalist"
  globals: # Built-in theme keys to enable
    - minimalist
    - modern-tech
    - professional
    - vaporwave
  custom: # Custom theme definitions
    my-brand:
      name: "My Brand"
      description: "Custom corporate theme"
      light: { ... } # Light mode tokens
      dark: { ... } # Dark mode tokens
```

### Built-in Themes

Fachada includes four built-in themes:

| Key            | Description                                |
| -------------- | ------------------------------------------ |
| `minimalist`   | Clean typographic aesthetic, light default |
| `modern-tech`  | Dark, high-contrast, monospace accents     |
| `professional` | Balanced, business-appropriate             |
| `vaporwave`    | Bold gradients, retro-futurist palette     |

Each theme includes both **light** and **dark** color modes.

### Example: Only Built-in Themes

```yaml
themes:
  default: "minimalist"
  globals:
    - minimalist
    - modern-tech
```

### Example: Custom Theme

```yaml
themes:
  default: "minimalist"
  globals:
    - minimalist
  custom:
    corporate-blue:
      name: "Corporate Blue"
      description: "Official company branding"
      light:
        bgPrimary: "#ffffff"
        bgSecondary: "#f0f4f8"
        textPrimary: "#1a1a1a"
        textSecondary: "#666666"
        accent: "#0066cc"
        accentHover: "#0052a3"
        accentSecondary: null
        accentTertiary: null
        border: "#e0e0e0"
        shadow: "0 2px 8px rgba(0,0,0,0.08)"
        borderRadius: "6px"
        transition: "0.2s ease"
        glow: "0 0 12px rgba(0,102,204,0.2)"
        gradient: "linear-gradient(135deg, #0066cc 0%, #003d99 100%)"
        spacingSection: "3rem"
        spacingCard: "1.5rem"
        spacingElement: "0.75rem"
        fontBody: "'Inter', sans-serif"
        fontHeading: "'Inter', sans-serif"
        fontMono: "'Courier New', monospace"
        headingWeight: "600"
        headingLetterSpacing: "0"
        bodyLineHeight: "1.6"
        contentMaxWidth: "1000px"
        buttonTextColor: "#ffffff"
        buttonTextShadow: "none"
      dark:
        bgPrimary: "#0a0e1a"
        bgSecondary: "#1a1f2e"
        textPrimary: "#ffffff"
        textSecondary: "#aaa"
        accent: "#0099ff"
        accentHover: "#00b3ff"
        accentSecondary: null
        accentTertiary: null
        border: "#333"
        shadow: "0 2px 8px rgba(0,0,0,0.4)"
        borderRadius: "6px"
        transition: "0.2s ease"
        glow: "0 0 12px rgba(0,153,255,0.3)"
        gradient: "linear-gradient(135deg, #0099ff 0%, #005f99 100%)"
        spacingSection: "3rem"
        spacingCard: "1.5rem"
        spacingElement: "0.75rem"
        fontBody: "'Inter', sans-serif"
        fontHeading: "'Inter', sans-serif"
        fontMono: "'Courier New', monospace"
        headingWeight: "600"
        headingLetterSpacing: "0"
        bodyLineHeight: "1.6"
        contentMaxWidth: "1000px"
        buttonTextColor: "#0a0e1a"
        buttonTextShadow: "none"
```

---

## Pages Section

Define page structure, content layout, and URL hierarchy.

### Required Fields

Each page must have a `content` array (widgets and containers).

```yaml
pages:
  landing: # Page ID (becomes URL slug: /)
    content: [] # Array of widgets and containers
```

### Optional Fields

```yaml
pages:
  landing:
    title: "Home" # Page title (browser tab, SEO)
    description: "..." # Page meta description
    content: [...]
    skin: string|object # Page-level skin override
    translations: {} # Per-language strings
    tags: [string] # Metadata tags
```

### Page ID Convention

- `landing` → homepage (`/`)
- `about` → `/about`
- `portfolio` → `/portfolio`
- `contact` → `/contact`

### Example: Minimal Page

```yaml
pages:
  landing:
    content:
      - type: hero
        props:
          title: "Welcome"
```

### Example: Complete Page

```yaml
pages:
  portfolio:
    title: "My Work"
    description: "Portfolio of recent projects"
    skin: "modern-tech"
    translations:
      en:
        projects_heading: "My Recent Work"
      es:
        projects_heading: "Mi trabajo reciente"
    content:
      - type: hero
        props:
          title: "Portfolio"
          subtitle: "Hand-crafted digital experiences"
      - type: portfolio
        props:
          title: "Featured Project"
          description: "Award-winning e-commerce redesign"
```

---

## Widgets Section

Widgets are **leaf components** — the actual UI elements (hero sections, cards, forms, etc.).

### Structure

```yaml
content:
  - type: "HeroWidget" # Component registry key
    props: # Component-specific props
      title: "Welcome"
      subtitle: "Subheading"
      ctaText: "Learn More"
    skin: string|object # Optional: widget-level skin override
```

### Required Fields

- `type` — Registry key identifying the component (e.g., `hero`, `portfolio`, `contact`, `skills`)

### Optional Fields

- `props` — Arbitrary configuration passed to the widget
- `skin` — Widget-level skin override (takes precedence over page/site skin)

### Common Widget Types

| Type          | Purpose                | Typical Props                              |
| ------------- | ---------------------- | ------------------------------------------ |
| `hero`        | Hero banner with CTA   | title, subtitle, ctaText, ctaUrl, imageUrl |
| `portfolio`   | Project showcase card  | title, description, imageUrl               |
| `contact`     | Contact form and links | email, phone, address, social              |
| `skills`      | Skill listing          | title, skills (array)                      |
| `gallery`     | Image gallery/carousel | title, images, autoRotate                  |
| `testimonial` | Client testimonial     | quote, author, role, imageUrl              |
| `cta`         | Call-to-action section | title, text, buttonText, buttonUrl         |

### Widget Examples

#### Hero Widget

```yaml
- type: hero
  props:
    title: "Welcome to My Site"
    subtitle: "I design beautiful digital experiences"
    ctaText: "View My Work"
    ctaUrl: "/portfolio"
    imageUrl: "https://example.com/hero.jpg"
```

#### Portfolio Widget

```yaml
- type: portfolio
  props:
    title: "E-commerce Redesign"
    description: "Increased conversion by 28%"
    imageUrl: "https://example.com/project.jpg"
    link: "/portfolio/ecommerce-redesign"
```

#### Contact Widget

```yaml
- type: contact
  props:
    title: "Get in Touch"
    email: "hello@example.com"
    phone: "+1-555-123-4567"
    address: "San Francisco, CA"
    social:
      twitter: "https://twitter.com/me"
      linkedin: "https://linkedin.com/in/me"
      instagram: "https://instagram.com/me"
```

#### Skills Widget

```yaml
- type: skills
  props:
    title: "Core Competencies"
    skills:
      - "Product Design"
      - "User Research"
      - "Figma"
      - "Design Systems"
      - "Prototyping"
```

---

## Containers Section

Containers are **grouping elements** that support layout and unlimited nesting.

### Structure

```yaml
content:
  - type: "container" # Must be literal "container"
    layout: "grid" # Layout type (grid, flex, stack)
    props: # Layout configuration
      columns: 3
      gap: "2rem"
    children: [...] # Child widgets and containers
    skin: string|object # Optional: container-level skin override
```

### Required Fields

- `type: "container"` — Literal string (not a registry key)

### Optional Fields

- `layout` — Layout type (grid, flex, stack, etc.)
- `props` — Layout-specific configuration
- `children` — Nested widgets and containers
- `skin` — Container-level skin override

### Container Nesting

Containers support **unlimited nesting** — you can nest containers within containers indefinitely:

```yaml
- type: container
  layout: grid
  children:
    - type: container # Nested container
      layout: flex
      children:
        - type: container # Triple-nested container
          layout: stack
          children:
            - type: hero # Finally a widget
```

### Layout Types

| Layout  | CSS Equivalent | Use Case                    |
| ------- | -------------- | --------------------------- |
| `grid`  | CSS Grid       | Multi-column layouts        |
| `flex`  | CSS Flexbox    | Row/column flexible layouts |
| `stack` | Flex column    | Vertical stacking (default) |

### Example: Grid Container

```yaml
- type: container
  layout: grid
  props:
    columns: 3
    gap: "2rem"
  children:
    - type: portfolio
      props:
        title: "Project 1"
    - type: portfolio
      props:
        title: "Project 2"
    - type: portfolio
      props:
        title: "Project 3"
```

### Example: Flex Container

```yaml
- type: container
  layout: flex
  props:
    direction: "row"
    wrap: true
    gap: "1rem"
  children:
    - type: skills
      props:
        title: "Frontend"
    - type: skills
      props:
        title: "Backend"
    - type: skills
      props:
        title: "Design"
```

### Example: Nested Containers

```yaml
content:
  - type: container
    layout: grid
    props:
      columns: 2
    children:
      - type: container # Left column
        layout: stack
        children:
          - type: hero
            props:
              title: "About Me"
          - type: skills
            props:
              title: "My Skills"
      - type: container # Right column
        layout: flex
        children:
          - type: portfolio
            props:
              title: "Featured Work"
```

---

## Skins Section

Skins define **CSS design tokens** — colors, fonts, spacing, shadows, etc. They're applied globally or per-page/widget.

### Structure

```yaml
skins:
  [skin-name]:
    name: string # Display name
    description: string # Human-readable description
    scope: "site" # Always "site" (global scope)
    light: { ... } # Light mode tokens
    dark: { ... } # Dark mode tokens
```

### Design Tokens (28 Properties)

| Token                  | CSS Variable               | Purpose                         |
| ---------------------- | -------------------------- | ------------------------------- |
| `bgPrimary`            | `--bg-primary`             | Primary background              |
| `bgSecondary`          | `--bg-secondary`           | Secondary background (cards)    |
| `textPrimary`          | `--text-primary`           | Body text color                 |
| `textSecondary`        | `--text-secondary`         | Muted/secondary text            |
| `accent`               | `--accent`                 | Primary brand color             |
| `accentHover`          | `--accent-hover`           | Accent on hover state           |
| `accentSecondary`      | `--accent-secondary`       | Secondary color (nullable)      |
| `accentTertiary`       | `--accent-tertiary`        | Tertiary color (nullable)       |
| `border`               | `--border`                 | Border/divider color            |
| `shadow`               | `--shadow`                 | Box shadow value                |
| `borderRadius`         | `--border-radius`          | Component roundness             |
| `transition`           | `--transition`             | CSS transition shorthand        |
| `glow`                 | `--glow`                   | Glow/shadow effect              |
| `gradient`             | `--gradient`               | Gradient for decorative use     |
| `spacingSection`       | `--spacing-section`        | Section vertical padding        |
| `spacingCard`          | `--spacing-card`           | Card internal padding           |
| `spacingElement`       | `--spacing-element`        | Small element padding           |
| `fontBody`             | `--font-body`              | Body font stack (serif/sans)    |
| `fontHeading`          | `--font-heading`           | Heading font stack              |
| `fontMono`             | `--font-mono`              | Monospace font stack            |
| `headingWeight`        | `--heading-weight`         | Font weight (400-900)           |
| `headingLetterSpacing` | `--heading-letter-spacing` | Heading letter spacing          |
| `bodyLineHeight`       | `--body-line-height`       | Line height for body text       |
| `contentMaxWidth`      | `--content-max-width`      | Max width for main content      |
| `buttonTextColor`      | `--button-text-color`      | Text color on filled buttons    |
| `buttonTextShadow`     | `--button-text-shadow`     | Text shadow on buttons          |
| `scanlineOpacity`      | `--scanline-opacity`       | Scanline effect (for vaporwave) |

### Example: Minimal Skin

```yaml
skins:
  my-brand:
    name: "My Brand"
    light:
      bgPrimary: "#ffffff"
      textPrimary: "#000000"
      accent: "#0066ff"
      border: "#e0e0e0"
      fontBody: "'Inter', sans-serif"
      headingWeight: "700"
    dark:
      bgPrimary: "#1a1a1a"
      textPrimary: "#ffffff"
      accent: "#00aaff"
      border: "#333"
      fontBody: "'Inter', sans-serif"
      headingWeight: "700"
```

### Example: Complete Skin

```yaml
skins:
  corporate:
    name: "Corporate"
    description: "Professional business theme"
    scope: site
    light:
      bgPrimary: "#ffffff"
      bgSecondary: "#f8f9fa"
      textPrimary: "#2c2c2c"
      textSecondary: "#606060"
      accent: "#003d6b"
      accentHover: "#002b4a"
      accentSecondary: "#e74c3c"
      accentTertiary: null
      border: "#ddd"
      shadow: "0 2px 4px rgba(0,0,0,0.1)"
      borderRadius: "4px"
      transition: "0.15s ease"
      glow: "0 0 8px rgba(0,61,107,0.15)"
      gradient: "linear-gradient(135deg, #003d6b 0%, #00547e 100%)"
      spacingSection: "3.5rem"
      spacingCard: "2rem"
      spacingElement: "0.875rem"
      fontBody: "'Segoe UI', sans-serif"
      fontHeading: "'Segoe UI', sans-serif"
      fontMono: "'Courier New', monospace"
      headingWeight: "700"
      headingLetterSpacing: "0"
      bodyLineHeight: "1.6"
      contentMaxWidth: "1100px"
      buttonTextColor: "#ffffff"
      buttonTextShadow: "none"
    dark:
      bgPrimary: "#1a1a1a"
      bgSecondary: "#2a2a2a"
      textPrimary: "#f0f0f0"
      textSecondary: "#aaa"
      accent: "#0099ff"
      accentHover: "#00aaff"
      accentSecondary: "#ff6b5b"
      accentTertiary: null
      border: "#444"
      shadow: "0 2px 4px rgba(0,0,0,0.4)"
      borderRadius: "4px"
      transition: "0.15s ease"
      glow: "0 0 12px rgba(0,153,255,0.2)"
      gradient: "linear-gradient(135deg, #0099ff 0%, #006bb8 100%)"
      spacingSection: "3.5rem"
      spacingCard: "2rem"
      spacingElement: "0.875rem"
      fontBody: "'Segoe UI', sans-serif"
      fontHeading: "'Segoe UI', sans-serif"
      fontMono: "'Courier New', monospace"
      headingWeight: "700"
      headingLetterSpacing: "0"
      bodyLineHeight: "1.6"
      contentMaxWidth: "1100px"
      buttonTextColor: "#1a1a1a"
      buttonTextShadow: "none"
```

### Skin Cascade (Priority)

Skins are applied in this order (later overrides earlier):

1. **Site-level skin** — Default for all pages
2. **Page-level skin** — Overrides site skin for that page
3. **Widget/Container-level skin** — Overrides page skin for that element

This means you can, for example, use a corporate theme globally but apply a "fun" theme to just your marketing page.

---

## Translations Section

Add multi-language support per-page with automatic fallback.

### Structure

```yaml
pages:
  landing:
    translations:
      en: # Language code
        key: "string value"
      es: # Another language
        key: "valor de cadena"
```

### Language Codes

Use standard **ISO 639-1 codes**:

- `en` — English
- `es` — Spanish
- `fr` — French
- `de` — German
- `ja` — Japanese
- `zh` — Chinese (Simplified)
- `pt` — Portuguese

### Fallback Behavior

If a translation string is missing, it falls back to the **first language defined** (usually English).

### Example: Multi-Language Translations

```yaml
pages:
  landing:
    title: "Home"
    translations:
      en:
        welcome_title: "Welcome to My Portfolio"
        welcome_subtitle: "Digital Product Designer"
        cta_text: "View My Work"
      es:
        welcome_title: "Bienvenido a Mi Portafolio"
        welcome_subtitle: "Diseñador de Productos Digitales"
        cta_text: "Ver Mi Trabajo"
      fr:
        welcome_title: "Bienvenue sur Mon Portfolio"
        welcome_subtitle: "Concepteur de Produits Numériques"
        cta_text: "Voir Mon Travail"
    content:
      - type: hero
        props:
          title: "{{welcome_title}}"
          subtitle: "{{welcome_subtitle}}"
          ctaText: "{{cta_text}}"
```

### Usage in Templates

In your page template or widget, access translation strings via the page config:

```typescript
const { translations, currentLanguage } = pageConfig;
const welcomeTitle = translations[currentLanguage].welcome_title;
```

---

## Complete Examples

### Example 1: Minimal 5-Line Portfolio

```yaml
seo:
  title: "Jane Designer"

themes:
  default: minimalist

pages:
  landing:
    content:
      - type: hero
        props:
          title: "Welcome"
      - type: portfolio
        props:
          title: "My Work"
```

### Example 2: Small Business Site (30 lines)

```yaml
seo:
  title: "Smith Design Studio"
  description: "Creative design agency in San Francisco"
  author: "Smith Design"
  keywords:
    - design
    - agency
    - creative

themes:
  default: modern-tech
  globals:
    - minimalist
    - modern-tech

pages:
  landing:
    title: Home
    content:
      - type: hero
        props:
          title: "Smith Design Studio"
          subtitle: "Award-winning creative design"
          ctaText: "View Our Work"
          ctaUrl: "/portfolio"

  portfolio:
    title: Our Work
    content:
      - type: container
        layout: grid
        props:
          columns: 2
        children:
          - type: portfolio
            props:
              title: "Project 1: Website Redesign"
          - type: portfolio
            props:
              title: "Project 2: Brand Identity"

  contact:
    title: Get in Touch
    content:
      - type: contact
        props:
          email: hello@smithdesign.com
          phone: "+1-555-123-4567"
```

### Example 3: Full-Featured Portfolio (100+ lines)

```yaml
seo:
  title: "Jane Doe — Product Designer"
  description: "Product designer with 8+ years building SaaS platforms and mobile apps"
  author: "Jane Doe"
  author_url: "https://janedoe.design"
  keywords:
    - product design
    - ux research
    - figma
    - design systems
    - saas
  og_image: "https://janedoe.design/og-hero.png"

themes:
  default: modern-tech
  globals:
    - minimalist
    - modern-tech
    - professional
  custom:
    jane-brand:
      name: "Jane's Brand"
      description: "Personal brand with custom colors"
      light:
        bgPrimary: "#fafafa"
        bgSecondary: "#f3f3f3"
        textPrimary: "#1a1a1a"
        textSecondary: "#666"
        accent: "#7b2cbf"
        accentHover: "#5a0399"
        accentSecondary: "#ff006e"
        accentTertiary: "#00d9ff"
        border: "#e0e0e0"
        shadow: "0 4px 12px rgba(123,44,191,0.1)"
        borderRadius: "8px"
        transition: "0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        glow: "0 0 20px rgba(123,44,191,0.2)"
        gradient: "linear-gradient(135deg, #7b2cbf 0%, #ff006e 100%)"
        spacingSection: "4rem"
        spacingCard: "2rem"
        spacingElement: "1rem"
        fontBody: "'Segoe UI', sans-serif"
        fontHeading: "'Segoe UI', sans-serif"
        fontMono: "'Monaco', monospace"
        headingWeight: "700"
        headingLetterSpacing: "-0.01em"
        bodyLineHeight: "1.7"
        contentMaxWidth: "1200px"
        buttonTextColor: "#ffffff"
        buttonTextShadow: "none"
      dark:
        bgPrimary: "#0f0f1e"
        bgSecondary: "#1a1a2e"
        textPrimary: "#f5f5f5"
        textSecondary: "#aaa"
        accent: "#b750e6"
        accentHover: "#d65bff"
        accentSecondary: "#ff1a75"
        accentTertiary: "#00e6ff"
        border: "#2a2a3e"
        shadow: "0 4px 12px rgba(183,80,230,0.2)"
        borderRadius: "8px"
        transition: "0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        glow: "0 0 20px rgba(183,80,230,0.3)"
        gradient: "linear-gradient(135deg, #b750e6 0%, #ff1a75 100%)"
        spacingSection: "4rem"
        spacingCard: "2rem"
        spacingElement: "1rem"
        fontBody: "'Segoe UI', sans-serif"
        fontHeading: "'Segoe UI', sans-serif"
        fontMono: "'Monaco', monospace"
        headingWeight: "700"
        headingLetterSpacing: "-0.01em"
        bodyLineHeight: "1.7"
        contentMaxWidth: "1200px"
        buttonTextColor: "#0f0f1e"
        buttonTextShadow: "none"

pages:
  landing:
    title: Home
    description: "Jane Doe's product design portfolio — SaaS, mobile, design systems"
    skin: jane-brand
    translations:
      en:
        hero_title: "Product Designer & Design Strategist"
        hero_subtitle: "Crafting delightful digital experiences for SaaS platforms and mobile apps"
        cta_primary: "View My Work"
        cta_secondary: "Let's Talk"
      es:
        hero_title: "Diseñadora de Productos y Estratega de Diseño"
        hero_subtitle: "Creando experiencias digitales encantadoras"
        cta_primary: "Ver Mi Trabajo"
        cta_secondary: "Hablemos"
    content:
      - type: hero
        props:
          title: "{{hero_title}}"
          subtitle: "{{hero_subtitle}}"
          ctaText: "{{cta_primary}}"
          ctaUrl: "/portfolio"
          imageUrl: "https://janedoe.design/hero-bg.jpg"

      - type: container
        layout: grid
        props:
          columns: 3
          gap: "2rem"
        skin: modern-tech # Use different skin for this section
        children:
          - type: portfolio
            props:
              title: "Design Systems"
              description: "Built a comprehensive design system"
          - type: portfolio
            props:
              title: "SaaS Platform"
              description: "Founded analytics dashboard from scratch"
          - type: portfolio
            props:
              title: "Mobile App"
              description: "Shipped iOS and Android on time"

      - type: skills
        props:
          title: "Core Competencies"
          skills:
            - Product Design
            - UX Research
            - Figma
            - Design Systems
            - Prototyping
            - User Testing
            - Information Architecture

  portfolio:
    title: Work
    description: "Featured projects and case studies"
    skin: minimalist # Light minimal theme for portfolio
    content:
      - type: hero
        props:
          title: "Featured Work"
          subtitle: "A selection of recent projects"

      - type: container
        layout: grid
        props:
          columns: 2
          gap: "3rem"
        children:
          - type: container
            layout: stack
            children:
              - type: portfolio
                props:
                  title: "Analytics Dashboard"
                  description: |
                    Built a real-time analytics dashboard for a SaaS startup.
                    Improved report generation time by 60%.
                  imageUrl: "https://janedoe.design/project-analytics.jpg"
                  link: "/case-study/analytics"

              - type: portfolio
                props:
                  title: "Mobile Banking App"
                  description: |
                    Designed iOS and Android banking app with 1M+ users.
                    Focus on accessibility and security.
                  imageUrl: "https://janedoe.design/project-banking.jpg"
                  link: "/case-study/banking"

          - type: container
            layout: stack
            children:
              - type: portfolio
                props:
                  title: "E-commerce Redesign"
                  description: |
                    Redesigned checkout flow, increasing conversion by 28%.
                    Conducted extensive user research.
                  imageUrl: "https://janedoe.design/project-ecom.jpg"
                  link: "/case-study/ecom"

              - type: portfolio
                props:
                  title: "Design System"
                  description: |
                    Created corporate design system with 200+ components.
                    Reduced design time by 40% across teams.
                  imageUrl: "https://janedoe.design/project-ds.jpg"
                  link: "/case-study/design-system"

  about:
    title: About
    description: "More about my background and approach"
    translations:
      en:
        about_intro: "I'm a product designer with 8+ years of experience"
        about_bio: "In 2015, I started helping startups design better products. Today, I work with Fortune 500 companies building scalable design systems."
      es:
        about_intro: "Soy una diseñadora de productos con 8+ años de experiencia"
        about_bio: "En 2015, comencé ayudando a startups a diseñar mejores productos."
    content:
      - type: hero
        props:
          title: About Me
          subtitle: "The story behind my design practice"

      - type: container
        layout: grid
        props:
          columns: 2
          gap: "3rem"
        children:
          - type: container
            layout: stack
            children:
              - type: hero
                props:
                  title: "{{about_intro}}"
                  subtitle: "{{about_bio}}"

          - type: skills
            props:
              title: "Specializations"
              skills:
                - SaaS Product Design
                - User Research
                - Design Systems
                - Figma & Prototyping
                - Design Leadership

  contact:
    title: Get in Touch
    description: "Let's work together"
    content:
      - type: hero
        props:
          title: "Let's Work Together"
          subtitle: "I'm always interested in design challenges"

      - type: contact
        props:
          title: "Reach Out"
          email: hello@janedoe.design
          phone: "+1-555-123-4567"
          address: "San Francisco, CA"
          social:
            twitter: "https://twitter.com/janedoe"
            linkedin: "https://linkedin.com/in/janedoe"
            dribbble: "https://dribbble.com/janedoe"
            instagram: "https://instagram.com/janedoe"

skins:
  portfolio-dark:
    name: "Portfolio Dark"
    description: "Dark theme optimized for showcasing visual work"
    scope: site
    light:
      bgPrimary: "#ffffff"
      bgSecondary: "#f8f8f8"
      textPrimary: "#000000"
      textSecondary: "#666"
      accent: "#0066ff"
      accentHover: "#0052cc"
      border: "#e5e5e5"
      shadow: "0 2px 8px rgba(0,0,0,0.08)"
      borderRadius: "8px"
      transition: "0.2s ease"
      glow: "0 0 10px rgba(0,102,255,0.15)"
      gradient: "linear-gradient(135deg, #0066ff 0%, #00cc88 100%)"
      spacingSection: "4rem"
      spacingCard: "2.5rem"
      spacingElement: "1rem"
      fontBody: "'Inter', sans-serif"
      fontHeading: "'Inter', sans-serif"
      fontMono: "'Monaco', monospace"
      headingWeight: "700"
      bodyLineHeight: "1.7"
      contentMaxWidth: "1300px"
      buttonTextColor: "#ffffff"
    dark:
      bgPrimary: "#0a0a0a"
      bgSecondary: "#1a1a1a"
      textPrimary: "#ffffff"
      textSecondary: "#ccc"
      accent: "#00ccff"
      accentHover: "#00ddff"
      border: "#333"
      shadow: "0 4px 12px rgba(0,0,0,0.5)"
      borderRadius: "8px"
      transition: "0.2s ease"
      glow: "0 0 20px rgba(0,204,255,0.3)"
      gradient: "linear-gradient(135deg, #00ccff 0%, #00ff99 100%)"
      spacingSection: "4rem"
      spacingCard: "2.5rem"
      spacingElement: "1rem"
      fontBody: "'Inter', sans-serif"
      fontHeading: "'Inter', sans-serif"
      fontMono: "'Monaco', monospace"
      headingWeight: "700"
      bodyLineHeight: "1.7"
      contentMaxWidth: "1300px"
      buttonTextColor: "#000000"

assets:
  hero_image: "https://janedoe.design/hero.jpg"
  og_image: "https://janedoe.design/og.png"
  favicon: "/favicon.ico"
  logo:
    light: "/logo-dark.svg"
    dark: "/logo-light.svg"
```

---

## Validation & Error Handling

Fachada provides **build-time schema validation** to catch errors early.

### JSON Schema

All YAML is validated against a strict schema (`application-v1.json`) that enforces:

- **Required fields** (seo, themes, pages)
- **Type safety** (strings, numbers, booleans, objects, arrays)
- **Field constraints** (e.g., widgets must have a `type`, pages must have `content`)
- **No extra properties** (typos are caught immediately)

### Error Format

Validation errors include:

- **Filename** — Which config file
- **Line number** — Exact location of the error
- **Field name** — What field is wrong
- **Expected type** — What type was expected
- **Actual value** — What was provided

### Common Error Messages

#### Missing Required Field

```
Error: application.yaml:2: root is missing required field: 'themes'
```

**Fix**: Add the required field:

```yaml
themes:
  default: minimalist
```

#### Wrong Type

```
Error: application.yaml:5: /themes/default must be of type 'string', but got 'object'
```

**Fix**: Use the correct type (string, not object):

```yaml
themes:
  default: "minimalist" # String, not an object
```

#### Unexpected Property

```
Error: application.yaml:12: /pages/landing has unexpected property: 'contnet'
```

**Fix**: Check spelling (typo — should be `content`, not `contnet`):

```yaml
pages:
  landing:
    content: [] # Correct spelling
```

#### Missing Nested Field

```
Error: application.yaml:8: /pages/landing is missing required field: 'content'
```

**Fix**: Every page must have a `content` array:

```yaml
pages:
  landing:
    content:
      - type: hero
```

#### Invalid Theme Reference

```
Error: application.yaml:3: themes.default must be one of: [minimalist, modern-tech, professional]
```

**Fix**: Use a valid built-in theme or define a custom theme:

```yaml
themes:
  default: minimalist
  custom:
    my-custom:
      name: "My Custom"
      light: { ... }
      dark: { ... }
```

### Validation at Build Time

```bash
# Validation happens automatically during build
npm run build

# If YAML is invalid, build fails with helpful error message
# Fix the error and re-run build
```

### Manual Validation (CLI)

You can validate your YAML without building:

```bash
# Using Node.js (if CLI command exists)
node bin/validate-config.js ./application.yaml

# Output:
# ✓ application.yaml is valid
# or
# ✗ application.yaml:12: /pages/home is missing required field: 'content'
```

---

## CLI Usage

### Loading Config with Explicit Path

```bash
npm run build -- --config-path ./my-app.yaml
```

### Using Environment Variable

```bash
export FACHADA_CONFIG=./application.yaml
npm run build
```

### Default Location

If no `--config-path` is specified and `FACHADA_CONFIG` is not set, Fachada looks for:

```
./application.yaml
```

in the current working directory.

### Create App with Config

```bash
npx create-fachada-app --config-path ./my-portfolio.yaml
```

### Validation Only

```bash
node bin/validate-config.js ./application.yaml
```

Returns exit code 0 if valid, 1 if invalid.

---

## Best Practices

### 1. DRY Principle — Reuse Skins and Containers

**Bad**: Defining the same layout for each page

```yaml
pages:
  portfolio:
    content:
      - type: container
        layout: grid
        props:
          columns: 3
          gap: 2rem
        # ... children ...

  clients:
    content:
      - type: container
        layout: grid
        props:
          columns: 3
          gap: 2rem
        # ... different children ...
```

**Better**: Extract common layouts (requires custom component or config inheritance)

```yaml
pages:
  portfolio:
    content:
      - type: portfolio-grid
        children: [...]

  clients:
    content:
      - type: portfolio-grid # Reuse same layout
        children: [...]
```

### 2. Skin Cascade — Use Global Defaults

**Bad**: Specifying skin on every widget

```yaml
pages:
  landing:
    content:
      - type: hero
        skin: modern-tech # Repeated
      - type: portfolio
        skin: modern-tech # Repeated
```

**Better**: Set skin once at page level

```yaml
pages:
  landing:
    skin: modern-tech # All children inherit
    content:
      - type: hero
      - type: portfolio
```

### 3. Structure — Follow Page Hierarchy

**Bad**: Flat structure without organization

```yaml
pages:
  landing: { ... }
  portfolio: { ... }
  portfolio_project_1: { ... }
  portfolio_project_2: { ... }
```

**Better**: Use containers to organize hierarchy

```yaml
pages:
  landing: { ... }
  portfolio:
    content:
      - type: container
        children:
          - type: portfolio # Individual projects as children
```

### 4. Translations — Centralize Language Strings

**Bad**: Hardcoding strings in props

```yaml
pages:
  landing:
    content:
      - type: hero
        props:
          title: "Welcome"
          subtitle: "Hello"
```

**Better**: Use translations for multi-language support

```yaml
pages:
  landing:
    translations:
      en:
        hero_title: "Welcome"
        hero_subtitle: "Hello"
      es:
        hero_title: "Bienvenido"
        hero_subtitle: "Hola"
    content:
      - type: hero
        props:
          title: "{{hero_title}}"
          subtitle: "{{hero_subtitle}}"
```

### 5. Naming — Use Descriptive Keys

**Bad**: Unclear page IDs

```yaml
pages:
  p1: { ... }
  p2: { ... }
  p3: { ... }
```

**Better**: Use semantic names

```yaml
pages:
  landing: { ... }
  portfolio: { ... }
  contact: { ... }
```

### 6. Comments — Document Complex Sections

```yaml
pages:
  # Homepage with hero banner and featured projects
  landing:
    title: Home
    content:
      # Hero section with call-to-action
      - type: hero
        props:
          title: "Welcome"

      # Featured projects in 3-column grid
      - type: container
        layout: grid
        props:
          columns: 3
```

### 7. Immutability — Keep Configs in Version Control

- **Do**: Commit `application.yaml` to Git
- **Do**: Use semantic versioning for breaking changes
- **Don't**: Generate YAML from other sources at build time
- **Don't**: Store environment-specific configs (use env vars instead)

### 8. Modularity — Split Large Configs

If your YAML grows beyond 500 lines, consider:

- Breaking into multiple YAML files per "app variant"
- Using `FACHADA_CONFIG` env var to load different configs per environment
- Maintaining separate configs for dev/staging/prod

### 9. SEO — Always Fill Metadata

```yaml
seo:
  title: "Meaningful Title" # Max 60 chars
  description: "Concise description" # Max 160 chars
  keywords:
    - keyword1
    - keyword2
  og_image: "full-url-to-image.jpg"
```

### 10. Themes — Use Built-in + One Custom

**Pattern**: Offer built-in variety, then one custom brand theme

```yaml
themes:
  default: minimalist
  globals:
    - minimalist
    - modern-tech
    - professional
  custom:
    my-brand: { ... }
```

---

## Troubleshooting

### Issue: "application.yaml not found"

**Cause**: Fachada can't locate your config file

**Solutions**:

1. Ensure file exists in current directory: `ls application.yaml`
2. Use explicit path: `npm run build -- --config-path ./my-app.yaml`
3. Set environment variable: `export FACHADA_CONFIG=./path/to/app.yaml`

### Issue: "Missing required field: 'pages'"

**Cause**: Config doesn't have `pages` section

**Fix**:

```yaml
seo:
  title: "My Site"
themes:
  default: minimalist
pages: # Add this section
  landing:
    content: []
```

### Issue: Widgets aren't rendering

**Cause**: Widget type doesn't exist in registry

**Solutions**:

1. Check spelling: `HeroWidget` vs `hero` vs `Hero`
2. Ensure widget is registered in the app
3. Use common widget types: `hero`, `portfolio`, `contact`, `skills`

### Issue: Theme not applying to page

**Cause**: Theme name doesn't exist or page skin is overriding

**Solutions**:

1. Check theme exists in `themes.globals` or `themes.custom`
2. Verify skin name at page level isn't `skin: "other-skin"`
3. Clear browser cache (CSS cached from old build)

### Issue: Translations not working

**Cause**: Translation key not found or language code wrong

**Solutions**:

1. Verify language code in `translations` (e.g., `en`, `es`, not `eng`)
2. Ensure key exists in translated object:
   ```yaml
   translations:
     en:
       my_key: "value" # Must match template variable name
   ```
3. Use in widget with correct syntax: `"{{my_key}}"`

### Issue: Build fails with validation error

**Cause**: YAML syntax or schema violation

**Solutions**:

1. Read error message carefully— it includes line number
2. Check indentation (YAML is whitespace-sensitive)
3. Verify required fields are present
4. Look for typos in field names
5. Validate YAML online: https://www.yamllint.com/

### Issue: Page layout looks wrong

**Cause**: Container props not applied correctly

**Solutions**:

1. Verify layout type exists: `grid`, `flex`, `stack`
2. Check props are spelled correctly (e.g., `columns`, `gap`)
3. Ensure grid `columns` matches number of children (or it wraps)
4. Test in different screen sizes

---

## Next Steps

1. **Create your first `application.yaml`** — Start with the minimal example
2. **Add pages** — Define landing, portfolio, contact pages
3. **Customize skins** — Create a custom theme matching your brand
4. **Add translations** — Support multiple languages for global reach
5. **Deploy** — Fachada handles the rest (build, validation, rendering)

For more help:

- **Schema Docs**: See `src/config/schema/application-v1.json` for complete schema
- **Examples**: Check `src/__tests__/fixtures/sample-app.yaml`
- **Type Definitions**: See `src/types/app.types.ts` for TypeScript interfaces
- **Live Validation**: Run `npm run build` to catch errors early
