/**
 * YAML Application Config Parser & JSON Schema Validator
 *
 * Loads application.yaml, validates against JSON Schema, and returns fully typed configuration.
 * Errors include file path and line numbers for excellent DX.
 */

import * as fs from "fs";
import * as path from "path";
import YAML from "yaml";
import Ajv from "ajv";
import type { ValidateFunction, ErrorObject } from "ajv";
import schema from "./schema/application-v1.json" assert { type: "json" };

// ─── Types ───────────────────────────────────────────────────────────────────

/**
 * ApplicationConfig — fully typed configuration object returned by parser.
 * Zero `any` types; all nested structures are strictly typed.
 */
export interface ApplicationConfig {
  seo: SEOConfig;
  themes: ThemesConfig;
  pages: Record<string, PageConfig>;
  skins?: Record<string, Record<string, unknown>>;
  assets?: Record<string, string | Record<string, string>>;
  siteTree?: Record<string, unknown>;
}

export interface SEOConfig {
  title: string;
  description?: string;
  author?: string;
  author_url?: string;
  keywords?: string[];
  og_image?: string;
}

export interface ThemesConfig {
  default: string;
  globals?: string[];
  custom?: Record<string, CustomThemeDefinition>;
}

export interface CustomThemeDefinition {
  name: string;
  description?: string;
  light: Record<string, unknown>;
  dark: Record<string, unknown>;
}

export interface PageConfig {
  title?: string;
  description?: string;
  content: ContentItem[];
  skin?: string | Record<string, unknown>;
  translations?: Record<string, Record<string, string>>;
  tags?: string[];
}

export type ContentItem = WidgetConfig | ContainerConfig;

export interface WidgetConfig {
  type: string;
  props?: Record<string, unknown>;
  skin?: string | Record<string, unknown>;
}

export interface ContainerConfig {
  type: "container";
  layout?: string;
  props?: Record<string, unknown>;
  children?: ContentItem[];
  skin?: string | Record<string, unknown>;
}

// ─── Custom Error Class ───────────────────────────────────────────────────────

/**
 * ConfigValidationError — validation error with file path and line numbers
 */
export class ConfigValidationError extends Error {
  constructor(
    public filePath: string,
    public lineNumber: number | null,
    message: string,
  ) {
    super(`${path.basename(filePath)}:${lineNumber ?? "?"}: ${message}`);
    this.name = "ConfigValidationError";
  }
}

// ─── Parser Implementation ────────────────────────────────────────────────────

const ajv = new Ajv({
  validateSchema: true,
  useDefaults: false,
  strict: true,
  allowUnionTypes: true,
});

/**
 * Compiles schema once for performance
 */
const validator: ValidateFunction = ajv.compile(schema);

/**
 * Parse YAML file and validate against schema.
 *
 * @param filePath — absolute path to application.yaml
 * @returns Fully typed ApplicationConfig object
 * @throws ConfigValidationError with line numbers on any validation failure
 */
export function parseApplicationYaml(filePath: string): ApplicationConfig {
  // 1. Read file
  let fileContent: string;
  try {
    fileContent = fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown file read error";
    throw new ConfigValidationError(
      filePath,
      null,
      `Failed to read: ${message}`,
    );
  }

  // 2. Parse YAML → JavaScript object
  let yamlObject: unknown;
  try {
    yamlObject = YAML.parse(fileContent);
  } catch (err) {
    const yamlErr = err as any;
    const lineNum = yamlErr.pos ? getPosLine(fileContent, yamlErr.pos) : null;
    throw new ConfigValidationError(
      filePath,
      lineNum,
      `Invalid YAML syntax: ${yamlErr.message || "Parse failed"}`,
    );
  }

  // 3. Validate against JSON Schema
  const isValid = validator(yamlObject);
  if (!isValid) {
    const error = validator.errors?.[0];
    const lineNum = error
      ? findYamlPathLineNumber(fileContent, error.instancePath, error.params)
      : null;
    const message = formatValidationError(error);
    throw new ConfigValidationError(filePath, lineNum, message);
  }

  // 4. Cast to ApplicationConfig (schema validation guarantees type safety)
  return yamlObject as ApplicationConfig;
}

// ─── Helper Functions ────────────────────────────────────────────────────────

/**
 * Convert byte position in YAML to line number
 */
function getPosLine(content: string, pos: number): number {
  return content.substring(0, pos).split("\n").length;
}

/**
 * Find the line number in YAML for a given JSONPath (e.g., "/pages/landing/content")
 * This is a best-effort heuristic: searches for the first occurrence of the last path segment.
 * Special handling for required field errors: extracts field name from error params.
 */
function findYamlPathLineNumber(
  content: string,
  jsonPath: string,
  errorParams?: Record<string, unknown>,
): number | null {
  const lines = content.split("\n");

  // For required field errors, try to find the missing field name from params
  if (errorParams && "missingProperty" in errorParams) {
    const missingProp = errorParams.missingProperty as string;
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      if (new RegExp(`\\b${escapeRegExp(missingProp)}\\s*:`).test(line)) {
        return lineIdx + 1; // 1-indexed
      }
    }
    // If not found, try to find near a comment or at the file start
    return 1;
  }

  if (!jsonPath || jsonPath === "") {
    return null;
  }

  const segments = jsonPath.split("/").filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  // Search from the end of the path backward to find the most specific match
  for (let segIdx = segments.length - 1; segIdx >= 0; segIdx--) {
    const segment = segments[segIdx];

    // For YAML keys, search for "key:" pattern; for array indices, skip
    if (!/^\d+$/.test(segment)) {
      for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const line = lines[lineIdx];
        // Match YAML key (followed by colon)
        if (new RegExp(`\\b${escapeRegExp(segment)}\\s*:`).test(line)) {
          return lineIdx + 1; // 1-indexed
        }
      }
    }
  }

  return null;
}

/**
 * Escape regex special characters in a string
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Format AJV validation error into human-readable message
 */
function formatValidationError(error: ErrorObject | undefined): string {
  if (!error) {
    return "Validation failed";
  }

  const path = error.instancePath || "/";
  const keyword = error.keyword;
  const params = error.params as Record<string, unknown>;

  switch (keyword) {
    case "required":
      return `${path || "root"} is missing required field: '${params.missingProperty}'`;

    case "type":
      return `${path || "root"} must be of type '${params.type}', but got '${typeof error.data}'`;

    case "additionalProperties":
      return `${path || "root"} has unexpected property: '${params.additionalProperty}'`;

    case "enum":
      return `${path || "root"} must be one of: [${(params.allowedValues as unknown[]).join(", ")}]`;

    default:
      return `${path || "root"} validation failed: ${error.message || "unknown error"}`;
  }
}

export default parseApplicationYaml;
