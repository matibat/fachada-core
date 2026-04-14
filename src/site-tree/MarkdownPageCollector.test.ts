/**
 * MarkdownPageCollector domain service tests — fachada-core
 *
 * BDD: Given/When/Then structure. All fixtures use generic test data.
 * No astro:content imports — entries are plain objects.
 */
import { describe, it, expect } from "vitest";
import {
  collectMarkdownPages,
  type CollectionEntry,
  type CollectedPagesResult,
} from "./MarkdownPageCollector";

// ─── Shared fixtures ──────────────────────────────────────────────────────────

function makeEntry(
  id: string,
  overrides: Partial<CollectionEntry["data"]> = {},
): CollectionEntry {
  return {
    id,
    data: {
      title: "Test Page",
      description: "A test page.",
      apps: ["test-app"],
      ...overrides,
    },
  };
}

const noExistingPaths = new Set<string>();

// ─── Scenario 1: Matching app ─────────────────────────────────────────────────

describe("Scenario 1: Matching app — entry with apps matching activeApp returns one page", () => {
  it(
    "Given an entry with apps: ['test-app'] and activeApp 'test-app', " +
      "When collectMarkdownPages is called, " +
      "Then result.pages contains one SubsectionDefinition with template 'markdown' and correct meta",
    () => {
      const entry = makeEntry("about", {
        apps: ["test-app"],
        path: "/about",
      });
      const result: CollectedPagesResult = collectMarkdownPages(
        [entry],
        "test-app",
        noExistingPaths,
      );

      expect(result.pages).toHaveLength(1);
      const page = result.pages[0];
      expect(page.template).toBe("markdown");
      expect(page.meta.path).toBe("/about");
      expect(page.meta.title).toBe("Test Page");
      expect(page.meta.description).toBe("A test page.");
      expect(page.templateData).toMatchObject({ contentId: "about" });
      expect(result.skipped).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    },
  );
});

// ─── Scenario 2: Wildcard apps ────────────────────────────────────────────────

describe('Scenario 2: Wildcard apps — entry with apps: "*" is included for any activeApp', () => {
  it(
    'Given an entry with apps: "*" and activeApp "any-app", ' +
      "When collectMarkdownPages is called, " +
      "Then result.pages contains one page",
    () => {
      const entry = makeEntry("wildcard-page", {
        apps: "*",
        path: "/wildcard-page",
      });
      const result = collectMarkdownPages([entry], "any-app", noExistingPaths);

      expect(result.pages).toHaveLength(1);
      expect(result.skipped).toHaveLength(0);
    },
  );
});

// ─── Scenario 3: Wrong app ────────────────────────────────────────────────────

describe("Scenario 3: Wrong app — entry whose apps does not include activeApp is skipped", () => {
  it(
    "Given an entry with apps: ['other-app'] and activeApp 'test-app', " +
      "When collectMarkdownPages is called, " +
      "Then result.pages is empty and result.skipped contains the entry id",
    () => {
      const entry = makeEntry("foreign", { apps: ["other-app"] });
      const result = collectMarkdownPages(
        [entry],
        "test-app",
        noExistingPaths,
      );

      expect(result.pages).toHaveLength(0);
      expect(result.skipped.some((s) => s.id === "foreign")).toBe(true);
    },
  );
});

// ─── Scenario 4: Path collision ───────────────────────────────────────────────

describe("Scenario 4: Path collision — entry whose resolved path collides with existingPaths is added to errors", () => {
  it(
    "Given an entry with path '/about' and existingPaths containing '/about', " +
      "When collectMarkdownPages is called, " +
      "Then result.pages is empty and result.errors contains the entry id",
    () => {
      const entry = makeEntry("about", {
        apps: ["test-app"],
        path: "/about",
      });
      const existing = new Set(["/about"]);
      const result = collectMarkdownPages([entry], "test-app", existing);

      expect(result.pages).toHaveLength(0);
      expect(result.errors.some((e) => e.id === "about")).toBe(true);
      expect(result.skipped).toHaveLength(0);
    },
  );
});

// ─── Scenario 5: Path "/" skipped ─────────────────────────────────────────────

describe('Scenario 5: Path "/" skipped — entry with data.path "/" is added to skipped', () => {
  it(
    'Given an entry with path: "/" and a matching activeApp, ' +
      "When collectMarkdownPages is called, " +
      "Then result.pages is empty and result.skipped contains the entry id",
    () => {
      const entry = makeEntry("root-collision", {
        apps: ["test-app"],
        path: "/",
      });
      const result = collectMarkdownPages(
        [entry],
        "test-app",
        noExistingPaths,
      );

      expect(result.pages).toHaveLength(0);
      expect(result.skipped.some((s) => s.id === "root-collision")).toBe(true);
    },
  );
});

// ─── Scenario 6: Default path from id ─────────────────────────────────────────

describe("Scenario 6: Default path from id — entry with no data.path resolves to '/{id}'", () => {
  it(
    "Given an entry with id 'my-page' and no data.path, " +
      "When collectMarkdownPages is called, " +
      "Then result.pages[0].meta.path is '/my-page'",
    () => {
      const entry = makeEntry("my-page", { apps: ["test-app"] });
      delete (entry.data as { path?: string }).path;
      const result = collectMarkdownPages(
        [entry],
        "test-app",
        noExistingPaths,
      );

      expect(result.pages).toHaveLength(1);
      expect(result.pages[0].meta.path).toBe("/my-page");
    },
  );
});

// ─── Scenario 7: Optional meta fields preserved ───────────────────────────────

describe("Scenario 7: Optional meta fields — keywords, llmSummary, ogImage map into meta", () => {
  it(
    "Given an entry with keywords, llmSummary, and ogImage, " +
      "When collectMarkdownPages is called, " +
      "Then result.pages[0].meta carries all three fields correctly",
    () => {
      const entry = makeEntry("rich-meta", {
        apps: ["test-app"],
        path: "/rich-meta",
        keywords: ["test", "markdown"],
        llmSummary: "A summary for LLMs.",
        ogImage: "/images/og.png",
      });
      const result = collectMarkdownPages(
        [entry],
        "test-app",
        noExistingPaths,
      );

      expect(result.pages).toHaveLength(1);
      const meta = result.pages[0].meta;
      expect(meta.keywords).toEqual(["test", "markdown"]);
      expect(meta.llmSummary).toBe("A summary for LLMs.");
      expect(meta.ogImage).toBe("/images/og.png");
    },
  );
});

// ─── Scenario 8: Optional MarkdownPageData fields preserved ──────────────────

describe("Scenario 8: Optional MarkdownPageData fields — downloadFilename, backLink, nextLink map into templateData", () => {
  it(
    "Given an entry with downloadFilename, backLink, and nextLink, " +
      "When collectMarkdownPages is called, " +
      "Then result.pages[0].templateData carries all three fields correctly",
    () => {
      const entry = makeEntry("rich-template", {
        apps: ["test-app"],
        path: "/rich-template",
        downloadFilename: "guide.pdf",
        backLink: { href: "/prev", label: "Previous" },
        nextLink: { href: "/next", label: "Next" },
      });
      const result = collectMarkdownPages(
        [entry],
        "test-app",
        noExistingPaths,
      );

      expect(result.pages).toHaveLength(1);
      const td = result.pages[0].templateData as {
        contentId: string;
        downloadFilename?: string;
        backLink?: { href: string; label: string };
        nextLink?: { href: string; label: string };
      };
      expect(td.contentId).toBe("rich-template");
      expect(td.downloadFilename).toBe("guide.pdf");
      expect(td.backLink).toEqual({ href: "/prev", label: "Previous" });
      expect(td.nextLink).toEqual({ href: "/next", label: "Next" });
    },
  );
});
