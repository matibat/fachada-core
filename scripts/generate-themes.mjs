#!/usr/bin/env node
/**
 * Build script: Generate theme constants from YAML files.
 * Run this before compiling TypeScript during `yarn build`.
 */

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const themesDir = path.join(__dirname, "..", "src/skin/themes");
const outputDir = path.join(__dirname, "..", "src/skin/defaults");
const outputFile = path.join(outputDir, "index.ts");

/**
 * Parse minimal YAML (key: value pairs and nested sections).
 */
function parseMinimalYaml(content) {
  const result = {};
  let currentSection = null;

  for (const line of content.split("\n")) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith("#")) continue;

    // Check indentation to determine if it's a nested value
    const isNested = line.startsWith("  ");

    if (!isNested && trimmed.endsWith(":")) {
      // Top-level section header
      const sectionName = trimmed.slice(0, -1);
      currentSection = {};
      result[sectionName] = currentSection;
    } else if (!isNested && trimmed.includes(":")) {
      // Top-level key-value pair
      const [rawKey, ...valueParts] = trimmed.split(":");
      const key = rawKey.trim();
      let value = valueParts.join(":").trim();
      value = parseValue(value);
      result[key] = value;
    } else if (isNested && trimmed.includes(":") && currentSection) {
      // Nested key-value pair
      const [rawKey, ...valueParts] = trimmed.split(":");
      const key = rawKey.trim();
      let value = valueParts.join(":").trim();
      value = parseValue(value);
      currentSection[key] = value;
    }
  }

  return result;
}

/**
 * Parse a YAML value (handle strings, booleans, null, etc).
 */
function parseValue(value) {
  if (value === "null") return null;
  if (value === "true") return true;
  if (value === "false") return false;
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

/**
 * Load all theme YAML files.
 */
function loadThemesFromYaml() {
  const themes = {};

  if (!fs.existsSync(themesDir)) {
    console.error(`ERROR: Themes directory not found: ${themesDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(themesDir).filter((f) => f.endsWith(".yaml"));

  for (const file of files) {
    const id = path.basename(file, ".yaml");
    const filePath = path.join(themesDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const parsed = parseMinimalYaml(content);

    const { name, description, light, dark } = parsed;

    if (!name || !description || !light || !dark) {
      console.error(`ERROR: Invalid theme file: ${file}`);
      process.exit(1);
    }

    themes[id] = { name, description, light, dark };
  }

  return themes;
}

// Main
const themes = loadThemesFromYaml();
console.log(`✓ Loaded ${Object.keys(themes).length} themes from YAML`);

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate TypeScript code
const themeIds = Object.keys(themes);
const code = `/**
 * AUTO-GENERATED. Do NOT edit manually.
 * Generated from YAML theme files in src/skin/themes/ by yarn build.
 */
import type { ThemeDefinition } from "../../utils/theme.config";

export const DEFAULT_SKINS: Record<string, ThemeDefinition> = ${JSON.stringify(themes, null, 2)};

export const THEME_STYLES = [${themeIds.map((id) => `"${id}"`).join(", ")}] as const;
`;

fs.writeFileSync(outputFile, code, "utf-8");
console.log(`✓ Generated: ${outputFile}`);

for (const id of Object.keys(themes)) {
  console.log(`  - ${id}`);
}
