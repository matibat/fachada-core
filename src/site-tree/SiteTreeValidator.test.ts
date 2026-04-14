/**
 * SiteTreeValidator domain service tests — fachada-core
 *
 * BDD: Given/When/Then structure. All fixtures use generic test data.
 */
import { describe, it, expect } from "vitest";
import { validateSiteTree } from "./SiteTreeValidator";
import type { SiteTreeConfig } from "../types/site-tree.types";

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const minimalValidTree: SiteTreeConfig = {
  landing: {
    meta: { path: "/", title: "Home", description: "Landing page." },
    sections: [],
  },
};

const treeWithSubsections: SiteTreeConfig = {
  landing: {
    meta: { path: "/", title: "Home", description: "Landing page." },
    sections: [],
    subsections: [
      {
        id: "section-a",
        meta: {
          path: "/section-a",
          title: "Section A",
          description: "First section.",
        },
        sections: [],
      },
      {
        id: "section-b",
        meta: {
          path: "/section-b",
          title: "Section B",
          description: "Second section.",
        },
        sections: [],
      },
    ],
  },
};

// ─── Scenario 1: Valid tree with only landing passes ──────────────────────────

describe("Scenario 1: A valid tree with only a landing page passes validation", () => {
  it("Given: landing with path '/', When: validated, Then: isValid is true and errors is empty", () => {
    const result = validateSiteTree(minimalValidTree);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

// ─── Scenario 2: Valid tree with subsections passes ───────────────────────────

describe("Scenario 2: A valid tree with unique subsections passes validation", () => {
  it("Given: landing '/' with subsections '/section-a' and '/section-b', When: validated, Then: isValid is true", () => {
    const result = validateSiteTree(treeWithSubsections);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

// ─── Scenario 3: Landing path must be "/" ─────────────────────────────────────

describe("Scenario 3: Landing page path must be exactly '/'", () => {
  it("Given: landing with path '/home', When: validated, Then: isValid is false with a path error mentioning '/'", () => {
    const tree: SiteTreeConfig = {
      landing: {
        meta: { path: "/home", title: "Home", description: "..." },
        sections: [],
      },
    };
    const result = validateSiteTree(tree);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("/"))).toBe(true);
  });

  it("Given: landing with empty path, When: validated, Then: isValid is false", () => {
    const tree: SiteTreeConfig = {
      landing: {
        meta: { path: "", title: "Home", description: "..." },
        sections: [],
      },
    };
    const result = validateSiteTree(tree);
    expect(result.isValid).toBe(false);
  });
});

// ─── Scenario 4: Subsection paths must be unique ─────────────────────────────

describe("Scenario 4: Subsection paths must be unique across the tree", () => {
  it("Given: two subsections with the same path '/duplicate', When: validated, Then: isValid is false with a duplicate-path error", () => {
    const tree: SiteTreeConfig = {
      landing: {
        meta: { path: "/", title: "Home", description: "" },
        sections: [],
        subsections: [
          {
            id: "alpha",
            meta: { path: "/duplicate", title: "Alpha", description: "" },
            sections: [],
          },
          {
            id: "beta",
            meta: { path: "/duplicate", title: "Beta", description: "" },
            sections: [],
          },
        ],
      },
    };
    const result = validateSiteTree(tree);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("/duplicate"))).toBe(true);
  });
});

// ─── Scenario 5: Subsection IDs must be unique ───────────────────────────────

describe("Scenario 5: Subsection IDs must be unique", () => {
  it("Given: two subsections with the same id 'dup-id', When: validated, Then: isValid is false mentioning the duplicate id", () => {
    const tree: SiteTreeConfig = {
      landing: {
        meta: { path: "/", title: "Home", description: "" },
        sections: [],
        subsections: [
          {
            id: "dup-id",
            meta: { path: "/path-one", title: "One", description: "" },
            sections: [],
          },
          {
            id: "dup-id",
            meta: { path: "/path-two", title: "Two", description: "" },
            sections: [],
          },
        ],
      },
    };
    const result = validateSiteTree(tree);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("dup-id"))).toBe(true);
  });
});

// ─── Scenario 6: Subsection path must not be "/" ─────────────────────────────

describe("Scenario 6: Subsection path must not conflict with landing ('/')", () => {
  it("Given: a subsection with path '/', When: validated, Then: isValid is false", () => {
    const tree: SiteTreeConfig = {
      landing: {
        meta: { path: "/", title: "Home", description: "" },
        sections: [],
        subsections: [
          {
            id: "root-conflict",
            meta: { path: "/", title: "Root", description: "" },
            sections: [],
          },
        ],
      },
    };
    const result = validateSiteTree(tree);
    expect(result.isValid).toBe(false);
  });
});

// ─── Scenario 7: Validation result is pure ───────────────────────────────────

describe("Scenario 7: validateSiteTree is a pure function", () => {
  it("Given: the same valid input, When: called twice, Then: results are deeply equal", () => {
    const r1 = validateSiteTree(minimalValidTree);
    const r2 = validateSiteTree(minimalValidTree);
    expect(r1).toEqual(r2);
  });

  it("Given: the same valid input, When: called twice, Then: results are different object references", () => {
    const r1 = validateSiteTree(minimalValidTree);
    const r2 = validateSiteTree(minimalValidTree);
    expect(r1).not.toBe(r2);
  });
});
