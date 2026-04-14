/**
 * RobotsGenerator domain service tests — fachada-core
 *
 * BDD: Given/When/Then structure. All fixtures use generic test data.
 */
import { describe, it, expect } from "vitest";
import { generateRobotsTxt } from "./RobotsGenerator";
import type { SiteTreeConfig } from "../types/site-tree.types";

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const siteUrl = "https://example.com";

const baseTree: SiteTreeConfig = {
  landing: {
    meta: { path: "/", title: "Home", description: "Landing." },
    sections: [],
  },
};

const treeWithSubsections: SiteTreeConfig = {
  landing: {
    meta: { path: "/", title: "Home", description: "Landing." },
    sections: [],
    subsections: [
      {
        id: "section-a",
        meta: { path: "/section-a", title: "Section A", description: "" },
        sections: [],
      },
      {
        id: "section-b",
        meta: { path: "/section-b", title: "Section B", description: "" },
        sections: [],
      },
    ],
  },
};

// ─── Scenario 1: Basic output — User-agent and Allow for landing ──────────────

describe("Scenario 1: Landing-only tree produces User-agent wildcard and Allow: /", () => {
  it("Given: a tree with only landing, When: generateRobotsTxt, Then: output contains 'User-agent: *'", () => {
    const result = generateRobotsTxt(baseTree, siteUrl);
    expect(result).toContain("User-agent: *");
  });

  it("Given: a tree with only landing, When: generateRobotsTxt, Then: output contains 'Allow: /'", () => {
    const result = generateRobotsTxt(baseTree, siteUrl);
    expect(result).toContain("Allow: /");
  });
});

// ─── Scenario 2: Sitemap directive is always included ────────────────────────

describe("Scenario 2: Sitemap directive is always appended", () => {
  it("Given: siteUrl = 'https://example.com', When: generateRobotsTxt, Then: output contains the expected Sitemap line", () => {
    const result = generateRobotsTxt(baseTree, siteUrl);
    expect(result).toContain("Sitemap: https://example.com/sitemap-index.xml");
  });

  it("Given: siteUrl with trailing slash, When: generateRobotsTxt, Then: Sitemap URL has no double slash", () => {
    const result = generateRobotsTxt(baseTree, "https://example.com/");
    expect(result).not.toContain("//sitemap-index.xml");
    expect(result).toContain("sitemap-index.xml");
  });
});

// ─── Scenario 3: Subsection Allow directives ─────────────────────────────────

describe("Scenario 3: Each subsection path appears as an Allow directive", () => {
  it("Given: subsections '/section-a' and '/section-b', When: generateRobotsTxt, Then: output includes Allow for both", () => {
    const result = generateRobotsTxt(treeWithSubsections, siteUrl);
    expect(result).toContain("Allow: /section-a");
    expect(result).toContain("Allow: /section-b");
  });
});

// ─── Scenario 4: Disallow directive for restricted pages ─────────────────────

describe("Scenario 4: A page with robots.disallow generates Disallow directives", () => {
  it("Given: a subsection '/restricted' with robots.disallow=['/restricted'], When: generateRobotsTxt, Then: output has 'Disallow: /restricted'", () => {
    const tree: SiteTreeConfig = {
      landing: {
        meta: { path: "/", title: "Home", description: "" },
        sections: [],
        subsections: [
          {
            id: "restricted",
            meta: {
              path: "/restricted",
              title: "Restricted",
              description: "",
              robots: { disallow: ["/restricted"] },
            },
            sections: [],
          },
        ],
      },
    };
    const result = generateRobotsTxt(tree, siteUrl);
    expect(result).toContain("Disallow: /restricted");
  });

  it("Given: landing with robots.disallow=['/admin'], When: generateRobotsTxt, Then: output has 'Disallow: /admin'", () => {
    const tree: SiteTreeConfig = {
      landing: {
        meta: {
          path: "/",
          title: "Home",
          description: "",
          robots: { disallow: ["/admin"] },
        },
        sections: [],
      },
    };
    const result = generateRobotsTxt(tree, siteUrl);
    expect(result).toContain("Disallow: /admin");
  });
});

// ─── Scenario 5: Crawl-delay directive ───────────────────────────────────────

describe("Scenario 5: A page with robots.crawlDelay generates a Crawl-delay directive", () => {
  it("Given: landing with robots.crawlDelay=10, When: generateRobotsTxt, Then: output contains 'Crawl-delay: 10'", () => {
    const tree: SiteTreeConfig = {
      landing: {
        meta: {
          path: "/",
          title: "Home",
          description: "",
          robots: { crawlDelay: 10 },
        },
        sections: [],
      },
    };
    const result = generateRobotsTxt(tree, siteUrl);
    expect(result).toContain("Crawl-delay: 10");
  });
});

// ─── Scenario 6: Pure function ───────────────────────────────────────────────

describe("Scenario 6: generateRobotsTxt is a pure function", () => {
  it("Given: the same inputs, When: called twice, Then: results are identical strings", () => {
    const r1 = generateRobotsTxt(baseTree, siteUrl);
    const r2 = generateRobotsTxt(baseTree, siteUrl);
    expect(r1).toBe(r2);
  });

  it("Given: the same inputs with subsections, When: called twice, Then: results are identical", () => {
    const r1 = generateRobotsTxt(treeWithSubsections, siteUrl);
    const r2 = generateRobotsTxt(treeWithSubsections, siteUrl);
    expect(r1).toBe(r2);
  });
});
