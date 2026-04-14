/**
 * AppContentPathResolver pure function tests — fachada-core
 *
 * BDD: Given/When/Then structure. All fixtures use generic test data.
 */
import { describe, it, expect } from "vitest";
import { resolveAppContentPath } from "./AppContentPathResolver";

describe("resolveAppContentPath", () => {
  describe("Behavior 1: test-app with pages contentType", () => {
    it(
      "Given appName 'test-app' and contentType 'pages', " +
        "When resolveAppContentPath is called, " +
        "Then it returns './apps/test-app/pages'",
      () => {
        const result = resolveAppContentPath("test-app", "pages");
        expect(result).toBe("./apps/test-app/pages");
      },
    );
  });

  describe("Behavior 2: test-app with blog contentType", () => {
    it(
      "Given appName 'test-app' and contentType 'blog', " +
        "When resolveAppContentPath is called, " +
        "Then it returns './apps/test-app/blog'",
      () => {
        const result = resolveAppContentPath("test-app", "blog");
        expect(result).toBe("./apps/test-app/blog");
      },
    );
  });

  describe("Behavior 3: my-app with pages contentType", () => {
    it(
      "Given appName 'my-app' and contentType 'pages', " +
        "When resolveAppContentPath is called, " +
        "Then it returns './apps/my-app/pages'",
      () => {
        const result = resolveAppContentPath("my-app", "pages");
        expect(result).toBe("./apps/my-app/pages");
      },
    );
  });

  describe("Behavior 4: my-app with blog contentType", () => {
    it(
      "Given appName 'my-app' and contentType 'blog', " +
        "When resolveAppContentPath is called, " +
        "Then it returns './apps/my-app/blog'",
      () => {
        const result = resolveAppContentPath("my-app", "blog");
        expect(result).toBe("./apps/my-app/blog");
      },
    );
  });

  describe("Behavior 5: path format uses relative prefix and correct separator", () => {
    it(
      "Given any appName and contentType, " +
        "When resolveAppContentPath is called, " +
        "Then the result always starts with './apps/'",
      () => {
        const result = resolveAppContentPath("sample-app", "pages");
        expect(result.startsWith("./apps/")).toBe(true);
      },
    );
  });
});
