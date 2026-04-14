/**
 * LlmTextGenerator domain service tests — fachada-core
 *
 * BDD: Given/When/Then structure. All fixtures use generic test data.
 */
import { describe, it, expect } from "vitest";
import { generateLlmTxt } from "./LlmTextGenerator";
import type { SiteConfig } from "../types/profile.types";
import type { SiteTreeConfig } from "../types/site-tree.types";

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const baseSiteConfig: SiteConfig = {
  name: "Test Author",
  title: "Test Author — Engineer",
  description: "A software engineer and digital artist.",
  author: "Test Author",
  url: "https://test.example.com",
  ogImage: "/og.png",
  social: {
    github: "testuser",
    linkedin: "testuser",
    twitter: "testuser",
    email: "test@example.com",
  },
  location: { city: "Test City", country: "Test Country" },
  roles: [],
  primaryRole: "engineer",
  analytics: { plausibleDomain: "" },
};

const baseTree: SiteTreeConfig = {
  landing: {
    meta: {
      path: "/",
      title: "Home",
      description: "Landing page.",
      llmSummary: "Main landing — overview of the site.",
    },
    sections: [],
  },
};

const treeWithSubsections: SiteTreeConfig = {
  landing: {
    meta: {
      path: "/",
      title: "Home",
      description: "Landing page.",
      llmSummary: "Main landing — overview of the site.",
    },
    sections: [],
    subsections: [
      {
        id: "work",
        meta: {
          path: "/work",
          title: "Work",
          description: "Portfolio of work.",
          llmSummary: "Various projects and case studies.",
        },
        sections: [],
      },
      {
        id: "about",
        meta: {
          path: "/about",
          title: "About",
          description: "About the author.",
          llmSummary: "Background and experience.",
        },
        sections: [],
      },
    ],
  },
};

// ─── Scenario 1: H1 heading with site name ────────────────────────────────────

describe("Scenario 1: Output begins with the site name as an H1 heading", () => {
  it("Given: siteConfig.name = 'Test Author', When: generateLlmTxt, Then: output starts with '# Test Author'", () => {
    const result = generateLlmTxt(baseSiteConfig, baseTree);
    expect(result.startsWith("# Test Author")).toBe(true);
  });
});

// ─── Scenario 2: Site description as blockquote ──────────────────────────────

describe("Scenario 2: Site description appears as a Markdown blockquote", () => {
  it("Given: siteConfig.description = 'A software engineer and digital artist.', When: generateLlmTxt, Then: output contains '> A software engineer and digital artist.'", () => {
    const result = generateLlmTxt(baseSiteConfig, baseTree);
    expect(result).toContain("> A software engineer and digital artist.");
  });
});

// ─── Scenario 3: Landing llmSummary in output ────────────────────────────────

describe("Scenario 3: Landing page llmSummary appears in the output", () => {
  it("Given: landing.meta.llmSummary set, When: generateLlmTxt, Then: the summary text is present in output", () => {
    const result = generateLlmTxt(baseSiteConfig, baseTree);
    expect(result).toContain("Main landing — overview of the site.");
  });
});

// ─── Scenario 4: Subsections listed as Markdown links ────────────────────────

describe("Scenario 4: Each subsection appears as a Markdown link with description", () => {
  it("Given: subsection 'Work' at '/work', When: generateLlmTxt, Then: output contains '[Work](/work)'", () => {
    const result = generateLlmTxt(baseSiteConfig, treeWithSubsections);
    expect(result).toContain("[Work](/work)");
  });

  it("Given: subsection 'About' at '/about', When: generateLlmTxt, Then: output contains '[About](/about)'", () => {
    const result = generateLlmTxt(baseSiteConfig, treeWithSubsections);
    expect(result).toContain("[About](/about)");
  });

  it("Given: subsection 'Work' with description 'Portfolio of work.', When: generateLlmTxt, Then: the description is in the output", () => {
    const result = generateLlmTxt(baseSiteConfig, treeWithSubsections);
    expect(result).toContain("Portfolio of work.");
  });
});

// ─── Scenario 5: Landing appears as the first page link ──────────────────────

describe("Scenario 5: Landing page is included as a link to '/'", () => {
  it("Given: landing with title 'Home', When: generateLlmTxt, Then: output contains '[Home](/)'", () => {
    const result = generateLlmTxt(baseSiteConfig, baseTree);
    expect(result).toContain("[Home](/)");
  });
});

// ─── Scenario 6: No subsections — no extra page links ────────────────────────

describe("Scenario 6: With no subsections only the landing link is listed", () => {
  it("Given: landing-only tree, When: generateLlmTxt, Then: output does not contain '/work' or '/about'", () => {
    const result = generateLlmTxt(baseSiteConfig, baseTree);
    expect(result).not.toContain("/work");
    expect(result).not.toContain("/about");
  });
});

// ─── Scenario 7: Pure function ───────────────────────────────────────────────

describe("Scenario 7: generateLlmTxt is a pure function", () => {
  it("Given: the same inputs, When: called twice, Then: the results are identical strings", () => {
    const r1 = generateLlmTxt(baseSiteConfig, baseTree);
    const r2 = generateLlmTxt(baseSiteConfig, baseTree);
    expect(r1).toBe(r2);
  });

  it("Given: the same inputs with subsections, When: called twice, Then: results are identical", () => {
    const r1 = generateLlmTxt(baseSiteConfig, treeWithSubsections);
    const r2 = generateLlmTxt(baseSiteConfig, treeWithSubsections);
    expect(r1).toBe(r2);
  });
});
