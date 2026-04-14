/**
 * StaticPathBuilder — BDD unit tests
 *
 * buildMergedStaticPaths is a pure function so every test is deterministic.
 * MarkdownPageCollector is mocked so the spy can assert exact call arguments
 * and return controlled page sets without touching the file system.
 *
 * vi.mock is hoisted before imports — the mock is in place before
 * StaticPathBuilder (which imports collectMarkdownPages) is first evaluated.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock MarkdownPageCollector before StaticPathBuilder is imported ─────────
vi.mock("./MarkdownPageCollector", () => ({
  collectMarkdownPages: vi
    .fn()
    .mockReturnValue({ pages: [], skipped: [], errors: [] }),
}));

import { buildMergedStaticPaths } from "./StaticPathBuilder";
import { collectMarkdownPages } from "./MarkdownPageCollector";
import type { SubsectionDefinition } from "../types/site-tree.types";
import type { CollectionEntry } from "./MarkdownPageCollector";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeSubsection(path: string): SubsectionDefinition {
  return {
    id: path.replace(/^\//, ""),
    meta: { path, title: "Page", description: "Description." },
    sections: [],
  };
}

function makeEntry(id: string, path: string): CollectionEntry {
  return {
    id,
    data: {
      title: "MD Page",
      description: "A markdown page.",
      apps: ["test-app"],
      path,
    },
  };
}

// ─── Scenario 1: config-declared paths included in result ─────────────────────

describe("Scenario 1: buildMergedStaticPaths includes config-declared subsections in the result", () => {
  beforeEach(() => {
    vi.mocked(collectMarkdownPages).mockClear();
    vi.mocked(collectMarkdownPages).mockReturnValue({
      pages: [],
      skipped: [],
      errors: [],
    });
  });

  it(
    'Given: two config subsections at "/engineering" and "/art", ' +
      "When: buildMergedStaticPaths is called, " +
      "Then: the result includes StaticPaths for both slugs",
    () => {
      const configSubsections = [
        makeSubsection("/engineering"),
        makeSubsection("/art"),
      ];

      const result = buildMergedStaticPaths(configSubsections, [], "test-app");

      const slugs = result.map((p) => p.params.slug);
      expect(slugs).toContain("engineering");
      expect(slugs).toContain("art");
    },
  );

  it(
    'Given: a config subsection at "/about", ' +
      "When: buildMergedStaticPaths is called, " +
      "Then: the resulting StaticPath carries the subsection as props",
    () => {
      const sub = makeSubsection("/about");
      const result = buildMergedStaticPaths([sub], [], "test-app");

      expect(result[0].props.subsection).toBe(sub);
    },
  );
});

// ─── Scenario 2: collectMarkdownPages called with existingPaths Set ───────────

describe("Scenario 2: buildMergedStaticPaths passes the correct existingPaths Set to collectMarkdownPages", () => {
  beforeEach(() => {
    vi.mocked(collectMarkdownPages).mockClear();
    vi.mocked(collectMarkdownPages).mockReturnValue({
      pages: [],
      skipped: [],
      errors: [],
    });
  });

  it(
    'Given: config subsections at "/engineering" and "/art", ' +
      "When: buildMergedStaticPaths is called, " +
      'Then: collectMarkdownPages receives existingPaths = Set(["/engineering", "/art"])',
    () => {
      const configSubsections = [
        makeSubsection("/engineering"),
        makeSubsection("/art"),
      ];

      buildMergedStaticPaths(configSubsections, [], "test-app");

      expect(collectMarkdownPages).toHaveBeenCalledOnce();
      const [, , calledPaths] = vi.mocked(collectMarkdownPages).mock.calls[0];
      expect(calledPaths).toBeInstanceOf(Set);
      expect((calledPaths as Set<string>).has("/engineering")).toBe(true);
      expect((calledPaths as Set<string>).has("/art")).toBe(true);
      expect((calledPaths as Set<string>).size).toBe(2);
    },
  );

  it(
    "Given: collectMarkdownPages returns two pages, " +
      "When: buildMergedStaticPaths is called, " +
      "Then: the result includes both MD-derived StaticPaths appended after config paths",
    () => {
      const mdSubsection = makeSubsection("/blog-post");
      vi.mocked(collectMarkdownPages).mockReturnValue({
        pages: [mdSubsection],
        skipped: [],
        errors: [],
      });

      const configSub = makeSubsection("/about");
      const entries: CollectionEntry[] = [makeEntry("blog-post", "/blog-post")];

      const result = buildMergedStaticPaths([configSub], entries, "test-app");

      const slugs = result.map((p) => p.params.slug);
      expect(slugs).toContain("about");
      expect(slugs).toContain("blog-post");
      expect(result).toHaveLength(2);
    },
  );
});
