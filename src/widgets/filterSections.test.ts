/**
 * filterSections — BDD unit tests
 *
 * Covers:
 *   - disabled sections excluded
 *   - requiresContent sections excluded when collection is empty
 *   - requiresRole sections excluded when no matching role present
 *   - sort order applied to the output
 */
import { describe, it, expect } from "vitest";
import { filterSections } from "./filterSections";
import type { PageSectionConfig } from "../types/profile.types";

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const baseContext = {
  projectsCount: 3,
  blogCount: 2,
  availableRoles: ["engineer"],
};

// ─── Scenario 1: disabled sections are excluded ───────────────────────────────

describe("Scenario 1: disabled sections are excluded from output", () => {
  it("Given hero is disabled and about is enabled, When filtered, Then 'hero' is absent and 'about' is present", () => {
    // Given
    const sections: PageSectionConfig[] = [
      { id: "hero", enabled: false, order: 1 },
      { id: "about", enabled: true, order: 2 },
    ];

    // When
    const result = filterSections(sections, baseContext);

    // Then
    expect(result).not.toContain("hero");
    expect(result).toContain("about");
  });

  it("Given all sections are disabled, When filtered, Then the result is an empty array", () => {
    // Given
    const sections: PageSectionConfig[] = [
      { id: "hero", enabled: false, order: 1 },
      { id: "about", enabled: false, order: 2 },
      { id: "skills", enabled: false, order: 3 },
    ];

    // When
    const result = filterSections(sections, baseContext);

    // Then
    expect(result).toHaveLength(0);
  });
});

// ─── Scenario 2: requiresContent filtering ────────────────────────────────────

describe("Scenario 2: sections requiring content are excluded when the collection is empty", () => {
  it("Given a projects section with requiresContent='projects' and projectsCount=0, When filtered, Then 'projects' is excluded", () => {
    // Given
    const sections: PageSectionConfig[] = [
      { id: "hero", enabled: true, order: 1 },
      { id: "projects", enabled: true, order: 2, requiresContent: "projects" },
    ];

    // When
    const result = filterSections(sections, { ...baseContext, projectsCount: 0 });

    // Then
    expect(result).not.toContain("projects");
    expect(result).toContain("hero");
  });

  it("Given a projects section with requiresContent='projects' and projectsCount>0, When filtered, Then 'projects' is included", () => {
    // Given
    const sections: PageSectionConfig[] = [
      { id: "projects", enabled: true, order: 1, requiresContent: "projects" },
    ];

    // When
    const result = filterSections(sections, { ...baseContext, projectsCount: 5 });

    // Then
    expect(result).toContain("projects");
  });

  it("Given a blog section with requiresContent='blog' and blogCount=0, When filtered, Then 'blog' is excluded", () => {
    // Given
    const sections: PageSectionConfig[] = [
      { id: "blog", enabled: true, order: 1, requiresContent: "blog" },
    ];

    // When
    const result = filterSections(sections, { ...baseContext, blogCount: 0 });

    // Then
    expect(result).not.toContain("blog");
  });

  it("Given a blog section with requiresContent='blog' and blogCount>0, When filtered, Then 'blog' is included", () => {
    // Given
    const sections: PageSectionConfig[] = [
      { id: "blog", enabled: true, order: 1, requiresContent: "blog" },
    ];

    // When
    const result = filterSections(sections, { ...baseContext, blogCount: 3 });

    // Then
    expect(result).toContain("blog");
  });
});

// ─── Scenario 3: requiresRole filtering ──────────────────────────────────────

describe("Scenario 3: sections requiring a role are excluded when no matching role is available", () => {
  it("Given a section requiresRole=['artist'] and availableRoles=['engineer'], When filtered, Then section is excluded", () => {
    // Given
    const sections: PageSectionConfig[] = [
      { id: "art-showcase", enabled: true, order: 1, requiresRole: ["artist"] },
    ];

    // When
    const result = filterSections(sections, { ...baseContext, availableRoles: ["engineer"] });

    // Then
    expect(result).not.toContain("art-showcase");
  });

  it("Given a section requiresRole=['engineer'] and availableRoles=['engineer'], When filtered, Then section is included", () => {
    // Given
    const sections: PageSectionConfig[] = [
      { id: "tech-stack", enabled: true, order: 1, requiresRole: ["engineer"] },
    ];

    // When
    const result = filterSections(sections, { ...baseContext, availableRoles: ["engineer"] });

    // Then
    expect(result).toContain("tech-stack");
  });
});

// ─── Scenario 4: sort order is applied ───────────────────────────────────────

describe("Scenario 4: output is sorted by ascending order value", () => {
  it("Given sections with orders 3, 1, 2, When filtered, Then result is sorted [1, 2, 3] by id", () => {
    // Given
    const sections: PageSectionConfig[] = [
      { id: "c", enabled: true, order: 3 },
      { id: "a", enabled: true, order: 1 },
      { id: "b", enabled: true, order: 2 },
    ];

    // When
    const result = filterSections(sections, baseContext);

    // Then
    expect(result).toEqual(["a", "b", "c"]);
  });

  it("Given sections with only one enabled (others disabled), When filtered, Then only that section is returned", () => {
    // Given
    const sections: PageSectionConfig[] = [
      { id: "hero", enabled: true, order: 5 },
      { id: "hidden", enabled: false, order: 1 },
    ];

    // When
    const result = filterSections(sections, baseContext);

    // Then
    expect(result).toEqual(["hero"]);
  });
});
