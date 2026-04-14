/**
 * pages content collection Zod schema tests — fachada-core
 *
 * BDD: Given/When/Then structure. Uses schema.safeParse() — no Astro runtime needed.
 */
import { describe, it, expect } from "vitest";
import { pagesSchema } from "./pages.schema";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const minimalValid = {
  title: "Test Page",
  description: "A test page description.",
  apps: ["test-app"],
};

const minimalNoApps = {
  title: "Test Page",
  description: "A test page description.",
};

const fullValid = {
  title: "Full Test Page",
  description: "A page with all optional fields.",
  apps: "*" as const,
  path: "/custom-path",
  keywords: ["test", "vitest"],
  llmSummary: "A summary for LLMs.",
  ogImage: "/images/og.png",
  downloadFilename: "guide.pdf",
  backLink: { href: "/prev", label: "Previous" },
  nextLink: { href: "/next", label: "Next" },
};

// ─── Behavior: schema rejects entry missing required title ────────────────────

describe("pages collection schema", () => {
  describe("Behavior: rejects entry missing required title", () => {
    it("Given a page object without title, When parsed, Then safeParse returns failure with title error", () => {
      const { title: _omit, ...noTitle } = minimalValid;
      const result = pagesSchema.safeParse(noTitle);

      expect(result.success).toBe(false);
      if (result.success) return;
      const fields = result.error.issues.map((i) => i.path[0]);
      expect(fields).toContain("title");
    });
  });

  // ─── Behavior: schema rejects entry missing required description ────────────

  describe("Behavior: rejects entry missing required description", () => {
    it("Given a page object without description, When parsed, Then safeParse returns failure with description error", () => {
      const { description: _omit, ...noDesc } = minimalValid;
      const result = pagesSchema.safeParse(noDesc);

      expect(result.success).toBe(false);
      if (result.success) return;
      const fields = result.error.issues.map((i) => i.path[0]);
      expect(fields).toContain("description");
    });
  });

  // ─── Behavior: apps defaults to "*" when absent ────────────────────────────

  describe('Behavior: apps field absent — defaults to "*"', () => {
    it(
      "Given a page object without apps field, " +
        "When parsed, " +
        'Then safeParse returns success and apps defaults to "*"',
      () => {
        const result = pagesSchema.safeParse(minimalNoApps);

        expect(result.success).toBe(true);
        if (!result.success) return;
        expect(result.data.apps).toBe("*");
      },
    );
  });

  // ─── Behavior: schema accepts minimal valid entry ──────────────────────────

  describe("Behavior: accepts entry with all required fields (array apps)", () => {
    it("Given a page object with title, description and apps as string[], When parsed, Then safeParse returns success", () => {
      const result = pagesSchema.safeParse(minimalValid);
      expect(result.success).toBe(true);
    });
  });

  // ─── Behavior: schema accepts apps as literal "*" ────────────────────────

  describe('Behavior: accepts apps as literal "*"', () => {
    it('Given a page object with apps: "*", When parsed, Then safeParse returns success', () => {
      const result = pagesSchema.safeParse({ ...minimalValid, apps: "*" });
      expect(result.success).toBe(true);
    });
  });

  // ─── Behavior: schema accepts entry with all optional fields ───────────────

  describe("Behavior: accepts entry with all optional fields populated", () => {
    it("Given a page object with every field set, When parsed, Then safeParse returns success and data matches input", () => {
      const result = pagesSchema.safeParse(fullValid);

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.title).toBe("Full Test Page");
      expect(result.data.apps).toBe("*");
      expect(result.data.backLink).toEqual({
        href: "/prev",
        label: "Previous",
      });
      expect(result.data.nextLink).toEqual({ href: "/next", label: "Next" });
      expect(result.data.keywords).toEqual(["test", "vitest"]);
      expect(result.data.downloadFilename).toBe("guide.pdf");
    });
  });

  // ─── Behavior: optional fields are undefined when absent ──────────────────

  describe("Behavior: optional fields are undefined when absent", () => {
    it("Given a minimal valid entry, When parsed, Then all optional fields are undefined", () => {
      const result = pagesSchema.safeParse(minimalValid);

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.path).toBeUndefined();
      expect(result.data.keywords).toBeUndefined();
      expect(result.data.llmSummary).toBeUndefined();
      expect(result.data.ogImage).toBeUndefined();
      expect(result.data.downloadFilename).toBeUndefined();
      expect(result.data.backLink).toBeUndefined();
      expect(result.data.nextLink).toBeUndefined();
    });
  });
});
