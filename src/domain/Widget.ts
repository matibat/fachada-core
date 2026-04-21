/**
 * Widget domain value object
 *
 * Represents a concrete widget component with:
 * - Immutable type identifier
 * - Schema-validated parameters
 * - Factory method with validation
 */

import { WidgetRegistry, type WidgetSchema } from "./WidgetRegistry";

/**
 * Configuration for creating a Widget
 */
export interface WidgetCreateConfig {
  type: string;
  parameters: Record<string, unknown>;
  registry: WidgetRegistry;
}

/**
 * Widget domain value object - represents a concrete widget component
 * Immutable after creation (frozen)
 */
export class Widget {
  private readonly _type: string;
  private readonly _parameters: Record<string, unknown>;

  private constructor(type: string, parameters: Record<string, unknown>) {
    this._type = type;
    this._parameters = Object.freeze(parameters);
    Object.freeze(this);
  }

  /**
   * Factory method: Create a Widget with validation against registry schema
   */
  static create(config: WidgetCreateConfig): Widget {
    const { type, parameters, registry } = config;

    // Get schema from registry (will throw if widget not found)
    const schema = registry.getSchema(type);

    // Validate parameters against schema
    validateParametersAgainstSchema(type, parameters, schema);

    // Create and return immutable widget
    return new Widget(type, parameters);
  }

  /**
   * Get widget type identifier
   */
  get type(): string {
    return this._type;
  }

  /**
   * Get widget parameters (frozen)
   */
  get parameters(): Record<string, unknown> {
    return this._parameters;
  }
}

/**
 * Validate widget parameters against JSON Schema
 * Throws descriptive error if validation fails
 */
function validateParametersAgainstSchema(
  widgetType: string,
  parameters: Record<string, unknown>,
  schema: WidgetSchema,
): void {
  // If schema doesn't define properties, accept any parameters
  if (!schema.properties) {
    return;
  }

  // Track validation errors
  const errors: string[] = [];

  // Check each parameter against its schema property
  for (const [paramName, paramValue] of Object.entries(parameters)) {
    const propSchema = schema.properties[paramName];

    if (!propSchema) {
      // Parameter not in schema - could be allowed or error depending on additionalProperties
      if (schema.additionalProperties === false) {
        errors.push(
          `Parameter "${paramName}" is not allowed in widget type "${widgetType}"`,
        );
      }
      continue;
    }

    // Validate parameter type
    validateParameterType(
      widgetType,
      paramName,
      paramValue,
      propSchema,
      errors,
    );
  }

  // Check required properties
  if (schema.required) {
    for (const requiredProp of schema.required) {
      if (!(requiredProp in parameters)) {
        errors.push(
          `Widget "${widgetType}" requires parameter "${requiredProp}"`,
        );
      }
    }
  }

  // If validation failed, throw descriptive error
  if (errors.length > 0) {
    throw new Error(
      `Validation error for widget type "${widgetType}":\n${errors.join("\n")}`,
    );
  }
}

/**
 * Validate a single parameter against its schema property
 */
function validateParameterType(
  widgetType: string,
  paramName: string,
  paramValue: unknown,
  propSchema: Record<string, unknown>,
  errors: string[],
): void {
  const expectedType = propSchema.type as string | string[] | undefined;

  if (!expectedType) {
    return; // No type constraint
  }

  const actualType = getActualType(paramValue);

  // Check if actual type matches expected type(s)
  const expectedTypes = Array.isArray(expectedType)
    ? expectedType
    : [expectedType];

  const isTypeValid = expectedTypes.some((expectedT) =>
    isTypeMatching(actualType, expectedT as string),
  );

  if (!isTypeValid) {
    const expectedStr = expectedTypes.join(" | ");
    errors.push(
      `Widget "${widgetType}" parameter "${paramName}": expected ${expectedStr}, got ${actualType}`,
    );
  }
}

/**
 * Helper: Get the actual runtime type of a value
 */
function getActualType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

/**
 * Helper: Check if actual type matches expected schema type
 */
function isTypeMatching(actual: string, expected: string): boolean {
  if (actual === expected) return true;

  // Handle common type mappings
  if (expected === "number" && actual === "number") return true;
  if (expected === "string" && actual === "string") return true;
  if (expected === "boolean" && actual === "boolean") return true;
  if (expected === "array" && actual === "array") return true;
  if (expected === "object" && actual === "object") return true;

  return false;
}
