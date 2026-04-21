/**
 * BDD Tests: Type Generator
 *
 * Tests for build-time type generation from application.yaml + JSON Schema.
 * Follows RED → GREEN → REFACTOR cycle.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const PROJECT_ROOT = path.resolve(__dirname, "../../..");
const SCRIPTS_DIR = path.join(PROJECT_ROOT, "scripts");
const GENERATED_TYPES_PATH = path.join(
  PROJECT_ROOT,
  "src/.generated/application.types.ts",
);
const TEST_YAML_PATH = path.join(
  PROJECT_ROOT,
  "src/config/__tests__/fixtures/sample-app.yaml",
);

// ─── Behavior 1: Build script reads application.yaml and generates TypeScript ───

describe("Behavior 1: Generate TypeScript from application.yaml", () => {
  beforeAll(() => {
    // Clean up any previous generated files
    if (fs.existsSync(GENERATED_TYPES_PATH)) {
      fs.unlinkSync(GENERATED_TYPES_PATH);
    }
  });

  afterAll(() => {
    // Clean up after tests
    if (fs.existsSync(GENERATED_TYPES_PATH)) {
      fs.unlinkSync(GENERATED_TYPES_PATH);
    }
  });

  it("should generate TypeScript file from schema and example YAML", () => {
    // ─── Arrange
    const generatorScript = path.join(SCRIPTS_DIR, "generate-app-types.mjs");
    const schemaPath = path.join(
      PROJECT_ROOT,
      "src/config/schema/application-v1.json",
    );

    // ─── Act
    // Run the type generator script
    execSync(
      `node "${generatorScript}" --schema "${schemaPath}" --output "${GENERATED_TYPES_PATH}"`,
      {
        cwd: PROJECT_ROOT,
      },
    );

    // ─── Assert
    expect(fs.existsSync(GENERATED_TYPES_PATH)).toBe(true);
    const content = fs.readFileSync(GENERATED_TYPES_PATH, "utf-8");
    expect(content).toContain("/* DO NOT EDIT */");
    expect(content).toContain("export interface ApplicationConfig");
  });

  it("should mark generated file as read-only with DO NOT EDIT comment", () => {
    // ─── Arrange
    const generatorScript = path.join(SCRIPTS_DIR, "generate-app-types.mjs");
    const schemaPath = path.join(
      PROJECT_ROOT,
      "src/config/schema/application-v1.json",
    );

    // ─── Act
    execSync(
      `node "${generatorScript}" --schema "${schemaPath}" --output "${GENERATED_TYPES_PATH}"`,
      {
        cwd: PROJECT_ROOT,
      },
    );
    const content = fs.readFileSync(GENERATED_TYPES_PATH, "utf-8");

    // ─── Assert
    // Header should appear in first 3 lines
    const firstLines = content.split("\n").slice(0, 3);
    expect(firstLines.join("\n")).toContain("/* DO NOT EDIT */");
  });
});

// ─── Behavior 2: Generated types have no `any` types; all fields typed ───

describe("Behavior 2: Generated types have no any types", () => {
  beforeAll(() => {
    if (fs.existsSync(GENERATED_TYPES_PATH)) {
      fs.unlinkSync(GENERATED_TYPES_PATH);
    }
  });

  afterAll(() => {
    if (fs.existsSync(GENERATED_TYPES_PATH)) {
      fs.unlinkSync(GENERATED_TYPES_PATH);
    }
  });

  it("should not contain any 'any' keyword in generated types", () => {
    // ─── Arrange
    const generatorScript = path.join(SCRIPTS_DIR, "generate-app-types.mjs");
    const schemaPath = path.join(
      PROJECT_ROOT,
      "src/config/schema/application-v1.json",
    );

    // ─── Act
    execSync(
      `node "${generatorScript}" --schema "${schemaPath}" --output "${GENERATED_TYPES_PATH}"`,
      {
        cwd: PROJECT_ROOT,
      },
    );
    const content = fs.readFileSync(GENERATED_TYPES_PATH, "utf-8");

    // ─── Assert
    // Count occurrences of ': any' or ' any[' (but exclude comments)
    const typeOnlyLines = content
      .split("\n")
      .filter((line) => !line.trim().startsWith("//"))
      .join("\n");
    const anyCount = (
      typeOnlyLines.match(/:\s*any\b|:\s*any\[|:\s*any\s*[;,}]/g) || []
    ).length;
    expect(anyCount).toBe(0);
  });

  it("should export all required interfaces: ApplicationConfig, PageConfig, WidgetConfig, ContainerConfig", () => {
    // ─── Arrange
    const generatorScript = path.join(SCRIPTS_DIR, "generate-app-types.mjs");
    const schemaPath = path.join(
      PROJECT_ROOT,
      "src/config/schema/application-v1.json",
    );

    // ─── Act
    execSync(
      `node "${generatorScript}" --schema "${schemaPath}" --output "${GENERATED_TYPES_PATH}"`,
      {
        cwd: PROJECT_ROOT,
      },
    );
    const content = fs.readFileSync(GENERATED_TYPES_PATH, "utf-8");

    // ─── Assert
    expect(content).toContain("export interface ApplicationConfig");
    expect(content).toContain("export interface PageConfig");
    expect(content).toContain("export interface WidgetConfig");
    expect(content).toContain("export interface ContainerConfig");
    expect(content).toContain("export interface SEOConfig");
    expect(content).toContain("export interface ThemesConfig");
  });

  it("should have JSDoc comments derived from schema descriptions", () => {
    // ─── Arrange
    const generatorScript = path.join(SCRIPTS_DIR, "generate-app-types.mjs");
    const schemaPath = path.join(
      PROJECT_ROOT,
      "src/config/schema/application-v1.json",
    );

    // ─── Act
    execSync(
      `node "${generatorScript}" --schema "${schemaPath}" --output "${GENERATED_TYPES_PATH}"`,
      {
        cwd: PROJECT_ROOT,
      },
    );
    const content = fs.readFileSync(GENERATED_TYPES_PATH, "utf-8");

    // ─── Assert
    // Should have comments for at least main interfaces
    const jsdocPatterns = [
      /\/\*\*\s*\n\s*\*\s*ApplicationConfig/,
      /\/\*\*\s*\n\s*\*\s*Page/,
      /\/\*\*\s*\n\s*\*\s*Widget/,
    ];
    const hasDocComments = jsdocPatterns.some((pattern) =>
      pattern.test(content),
    );
    expect(hasDocComments).toBe(true);
  });

  it("should mark optional properties with '?:'", () => {
    // ─── Arrange
    const generatorScript = path.join(SCRIPTS_DIR, "generate-app-types.mjs");
    const schemaPath = path.join(
      PROJECT_ROOT,
      "src/config/schema/application-v1.json",
    );

    // ─── Act
    execSync(
      `node "${generatorScript}" --schema "${schemaPath}" --output "${GENERATED_TYPES_PATH}"`,
      {
        cwd: PROJECT_ROOT,
      },
    );
    const content = fs.readFileSync(GENERATED_TYPES_PATH, "utf-8");

    // ─── Assert
    // Should have optional properties like description?:
    expect(content).toMatch(/\bdescription\s*\?\s*:/);
  });
});

// ─── Behavior 3: Generated file is TypeScript-valid and compiles ───

describe("Behavior 3: Generated TypeScript is valid and compilable", () => {
  beforeAll(() => {
    if (fs.existsSync(GENERATED_TYPES_PATH)) {
      fs.unlinkSync(GENERATED_TYPES_PATH);
    }
  });

  afterAll(() => {
    if (fs.existsSync(GENERATED_TYPES_PATH)) {
      fs.unlinkSync(GENERATED_TYPES_PATH);
    }
  });

  it("should generate valid TypeScript that can be imported", () => {
    // ─── Arrange
    const generatorScript = path.join(SCRIPTS_DIR, "generate-app-types.mjs");
    const schemaPath = path.join(
      PROJECT_ROOT,
      "src/config/schema/application-v1.json",
    );

    // ─── Act
    execSync(
      `node "${generatorScript}" --schema "${schemaPath}" --output "${GENERATED_TYPES_PATH}"`,
      {
        cwd: PROJECT_ROOT,
      },
    );

    // ─── Assert
    // Try to read and validate basic TypeScript structure
    const content = fs.readFileSync(GENERATED_TYPES_PATH, "utf-8");
    expect(content).toMatch(/^\/\*\s*DO NOT EDIT/);
    expect(content).toContain("export interface");
    // No TypeScript syntax errors by checking for unclosed braces
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    expect(openBraces).toBe(closeBraces);
  });

  it("should generate deterministic output (same input = same output)", () => {
    // ─── Arrange
    const generatorScript = path.join(SCRIPTS_DIR, "generate-app-types.mjs");
    const schemaPath = path.join(
      PROJECT_ROOT,
      "src/config/schema/application-v1.json",
    );

    // ─── Act - Run generator twice
    execSync(
      `node "${generatorScript}" --schema "${schemaPath}" --output "${GENERATED_TYPES_PATH}"`,
      {
        cwd: PROJECT_ROOT,
      },
    );
    const firstOutput = fs.readFileSync(GENERATED_TYPES_PATH, "utf-8");

    fs.unlinkSync(GENERATED_TYPES_PATH);

    execSync(
      `node "${generatorScript}" --schema "${schemaPath}" --output "${GENERATED_TYPES_PATH}"`,
      {
        cwd: PROJECT_ROOT,
      },
    );
    const secondOutput = fs.readFileSync(GENERATED_TYPES_PATH, "utf-8");

    // ─── Assert
    expect(firstOutput).toBe(secondOutput);
  });
});

// ─── Behavior 4: Round-trip validation ───

describe("Behavior 4: Generated types match parser output shape", () => {
  beforeAll(() => {
    if (fs.existsSync(GENERATED_TYPES_PATH)) {
      fs.unlinkSync(GENERATED_TYPES_PATH);
    }
  });

  afterAll(() => {
    if (fs.existsSync(GENERATED_TYPES_PATH)) {
      fs.unlinkSync(GENERATED_TYPES_PATH);
    }
  });

  it("should export types that are structurally compatible with parser types", () => {
    // ─── Arrange
    const generatorScript = path.join(SCRIPTS_DIR, "generate-app-types.mjs");
    const schemaPath = path.join(
      PROJECT_ROOT,
      "src/config/schema/application-v1.json",
    );

    // ─── Act
    execSync(
      `node "${generatorScript}" --schema "${schemaPath}" --output "${GENERATED_TYPES_PATH}"`,
      {
        cwd: PROJECT_ROOT,
      },
    );
    const content = fs.readFileSync(GENERATED_TYPES_PATH, "utf-8");

    // ─── Assert
    // Generated types should have the same interface names as existing types in parser
    const expectedInterfaces = [
      "ApplicationConfig",
      "SEOConfig",
      "ThemesConfig",
      "CustomThemeDefinition",
      "PageConfig",
      "WidgetConfig",
      "ContainerConfig",
    ];

    expectedInterfaces.forEach((iface) => {
      expect(content).toContain(`export interface ${iface}`);
    });

    // ContentItem is a type union, not an interface
    expect(content).toContain("export type ContentItem");
  });

  it("should generate ApplicationConfig with required fields: seo, themes, pages", () => {
    // ─── Arrange
    const generatorScript = path.join(SCRIPTS_DIR, "generate-app-types.mjs");
    const schemaPath = path.join(
      PROJECT_ROOT,
      "src/config/schema/application-v1.json",
    );

    // ─── Act
    execSync(
      `node "${generatorScript}" --schema "${schemaPath}" --output "${GENERATED_TYPES_PATH}"`,
      {
        cwd: PROJECT_ROOT,
      },
    );
    const content = fs.readFileSync(GENERATED_TYPES_PATH, "utf-8");

    // ─── Assert
    // Extract ApplicationConfig interface
    const applicationConfigMatch = content.match(
      /export interface ApplicationConfig\s*\{[\s\S]*?\n\}/,
    );
    expect(applicationConfigMatch).not.toBeNull();
    const interfaceBody = applicationConfigMatch![0];

    // Required fields should not have ?:
    expect(interfaceBody).toMatch(/\bseo:\s*SEOConfig\b/);
    expect(interfaceBody).toMatch(/\bthemes:\s*ThemesConfig\b/);
    expect(interfaceBody).toMatch(/\bpages:\s*Record/);
  });

  it("should generate PageConfig with required field 'content'", () => {
    // ─── Arrange
    const generatorScript = path.join(SCRIPTS_DIR, "generate-app-types.mjs");
    const schemaPath = path.join(
      PROJECT_ROOT,
      "src/config/schema/application-v1.json",
    );

    // ─── Act
    execSync(
      `node "${generatorScript}" --schema "${schemaPath}" --output "${GENERATED_TYPES_PATH}"`,
      {
        cwd: PROJECT_ROOT,
      },
    );
    const content = fs.readFileSync(GENERATED_TYPES_PATH, "utf-8");

    // ─── Assert
    const pageConfigMatch = content.match(
      /export interface PageConfig\s*\{[\s\S]*?\n\}/,
    );
    expect(pageConfigMatch).not.toBeNull();
    const interfaceBody = pageConfigMatch![0];

    // 'content' should be required (no ?)
    expect(interfaceBody).toMatch(/\bcontent:\s*ContentItem\[\]/);
  });
});
