#!/usr/bin/env node

/**
 * Type Generator: Reads JSON Schema and generates TypeScript interfaces
 *
 * Usage: node scripts/generate-app-types.mjs --schema <path> --output <path>
 *
 * Generates fully-typed TypeScript from application-v1.json:
 * - ApplicationConfig
 * - SEOConfig
 * - ThemesConfig
 * - CustomThemeDefinition
 * - PageConfig
 * - WidgetConfig
 * - ContainerConfig
 * - ContentItem (union type)
 *
 * No `any` types; all fields properly typed with JSDoc comments.
 */

import * as fs from "fs";
import * as path from "path";

// ─── CLI Arguments ────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
let schemaPath = null;
let outputPath = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--schema" && i + 1 < args.length) {
    schemaPath = args[i + 1];
  }
  if (args[i] === "--output" && i + 1 < args.length) {
    outputPath = args[i + 1];
  }
}

if (!schemaPath || !outputPath) {
  console.error(
    "Usage: node scripts/generate-app-types.mjs --schema <path> --output <path>",
  );
  process.exit(1);
}

// ─── Load Schema ──────────────────────────────────────────────────────────────

let schema;
try {
  const schemaContent = fs.readFileSync(schemaPath, "utf-8");
  schema = JSON.parse(schemaContent);
} catch (err) {
  console.error(`Failed to load schema from ${schemaPath}:`, err.message);
  process.exit(1);
}

// ─── Type Generator ──────────────────────────────────────────────────────────

/**
 * Generate TypeScript interface for a JSON Schema object
 */
function generateInterface(interfaceName, schemaDef, definitions = {}) {
  const description = schemaDef.description || "";
  let code = "";

  // Add JSDoc comment
  if (description) {
    code += `/**\n`;
    code += ` * ${description}\n`;
    code += ` */\n`;
  }

  code += `export interface ${interfaceName} {\n`;

  if (schemaDef.properties) {
    const required = schemaDef.required || [];
    const props = schemaDef.properties;

    Object.entries(props).forEach(([propName, propDef]) => {
      const isRequired = required.includes(propName);
      const propDescription = propDef.description || "";
      const propType = inferTypeFromSchema(propDef, definitions);

      // Add JSDoc for property
      if (propDescription) {
        code += `  /** ${propDescription} */\n`;
      }

      // Property signature
      const optional = isRequired ? "" : "?";
      code += `  ${propName}${optional}: ${propType};\n`;
    });
  }

  code += `}\n\n`;
  return code;
}

/**
 * Infer TypeScript type from JSON Schema definition
 */
function inferTypeFromSchema(schemaDef, definitions = {}) {
  // Handle $ref
  if (schemaDef.$ref) {
    const refName = schemaDef.$ref.split("/").pop();
    // Map definition names to interface names
    if (refName === "page") return "PageConfig";
    if (refName === "widget") return "WidgetConfig";
    if (refName === "container") return "ContainerConfig";
    return capitalizeFirstLetter(refName);
  }

  // Handle oneOf (union types)
  if (schemaDef.oneOf && schemaDef.oneOf.length > 0) {
    const types = schemaDef.oneOf.map((item) =>
      inferTypeFromSchema(item, definitions),
    );
    return types.join(" | ");
  }

  // Handle type: string
  if (schemaDef.type === "string") {
    if (schemaDef.enum) {
      return schemaDef.enum.map((v) => `"${v}"`).join(" | ");
    }
    return "string";
  }

  // Handle type: number
  if (schemaDef.type === "number" || schemaDef.type === "integer") {
    return "number";
  }

  // Handle type: boolean
  if (schemaDef.type === "boolean") {
    return "boolean";
  }

  // Handle arrays
  if (schemaDef.type === "array") {
    // Special case: content items should be ContentItem[]
    if (schemaDef.items) {
      if (schemaDef.items.oneOf) {
        // This is a content array with widget/container items
        return "ContentItem[]";
      }
      const itemType = inferTypeFromSchema(schemaDef.items, definitions);
      return `${itemType}[]`;
    }
    return "unknown[]";
  }

  // Handle objects with additionalProperties
  if (schemaDef.type === "object") {
    if (
      schemaDef.additionalProperties === true ||
      typeof schemaDef.additionalProperties === "object"
    ) {
      let valueType = "unknown";
      if (typeof schemaDef.additionalProperties === "object") {
        valueType = inferTypeFromSchema(
          schemaDef.additionalProperties,
          definitions,
        );
      }
      return `Record<string, ${valueType}>`;
    }
    // If no additionalProperties and no properties, treat as unknown
    if (!schemaDef.properties) {
      return "Record<string, unknown>";
    }
    return "Record<string, unknown>";
  }

  // Default fallback
  return "unknown";
}

/**
 * Capitalize first letter of string
 */
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert snake_case to camelCase for interface names
 */
function toPascalCase(str) {
  return str
    .split("_")
    .map((word) => capitalizeFirstLetter(word))
    .join("");
}

// ─── Generate Type Definitions ────────────────────────────────────────────────

let typeOutput = `/* DO NOT EDIT */
/**
 * Auto-generated TypeScript types from application-v1.json schema
 *
 * This file is generated by scripts/generate-app-types.mjs
 * DO NOT MANUALLY EDIT - your changes will be overwritten on next build
 */

`;

// Generate interfaces from definitions first (for references)
const { definitions = {} } = schema;

// Page interface
if (definitions.page) {
  typeOutput += generateInterface("PageConfig", definitions.page, definitions);
}

// Widget interface
if (definitions.widget) {
  typeOutput += generateInterface(
    "WidgetConfig",
    definitions.widget,
    definitions,
  );
}

// Container interface
if (definitions.container) {
  typeOutput += generateInterface(
    "ContainerConfig",
    definitions.container,
    definitions,
  );
}

// ContentItem union type
typeOutput += `/**
 * ContentItem — union type: either Widget or Container
 */
export type ContentItem = WidgetConfig | ContainerConfig;

`;

// SEO interface
typeOutput += generateInterface("SEOConfig", schema.properties.seo);

// Themes interface
typeOutput += generateInterface("ThemesConfig", schema.properties.themes);

// CustomThemeDefinition interface (extract from themes.custom.additionalProperties)
if (schema.properties.themes.properties.custom) {
  const customThemeDef =
    schema.properties.themes.properties.custom.additionalProperties;
  typeOutput += generateInterface("CustomThemeDefinition", customThemeDef);
}

// ApplicationConfig interface (main config)
// We need to manually build this to ensure proper types
typeOutput += `/**
 * ${schema.description}
 */
export interface ApplicationConfig {
  /** ${schema.properties.seo.description} */
  seo: SEOConfig;
  /** ${schema.properties.themes.description} */
  themes: ThemesConfig;
  /** ${schema.properties.pages.description} */
  pages: Record<string, PageConfig>;
`;

if (schema.properties.skins) {
  typeOutput += `  /** ${schema.properties.skins.description} */
  skins?: Record<string, Record<string, unknown>>;
`;
}

if (schema.properties.assets) {
  typeOutput += `  /** ${schema.properties.assets.description} */
  assets?: Record<string, string | Record<string, string>>;
`;
}

if (schema.properties.siteTree) {
  typeOutput += `  /** ${schema.properties.siteTree.description} */
  siteTree?: Record<string, unknown>;
`;
}

typeOutput += `}
`;

// ─── Write Output File ────────────────────────────────────────────────────────

try {
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, typeOutput, "utf-8");
  console.log(`✅ Generated ${outputPath}`);
} catch (err) {
  console.error(`Failed to write output to ${outputPath}:`, err.message);
  process.exit(1);
}
