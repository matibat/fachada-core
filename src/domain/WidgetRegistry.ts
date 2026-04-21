/**
 * Widget Registry - maps widget types to parameter schemas
 *
 * Supports:
 * - Built-in widgets (hero, portfolio, skills, contact)
 * - Custom widget registration
 * - Schema validation during Widget creation
 */

/**
 * JSON Schema subset for widget parameter validation
 */
export interface WidgetSchema {
  type: "object" | "string" | "number" | "boolean" | "array" | "null";
  properties?: Record<string, Record<string, unknown>>;
  required?: string[];
  additionalProperties?: boolean;
  items?: Record<string, unknown>;
}

/**
 * Widget Registry - manages widget type to schema mappings
 */
export class WidgetRegistry {
  private schemas: Map<string, WidgetSchema> = new Map();

  constructor() {
    this.registerBuiltInWidgets();
  }

  /**
   * Register a widget type with its parameter schema
   */
  register(widgetType: string, schema: WidgetSchema): void {
    if (this.schemas.has(widgetType)) {
      throw new Error(
        `Widget type "${widgetType}" is already registered. Cannot re-register.`,
      );
    }
    this.schemas.set(widgetType, schema);
  }

  /**
   * Get schema for a widget type
   * Throws error if widget not found
   */
  getSchema(widgetType: string): WidgetSchema {
    const schema = this.schemas.get(widgetType);
    if (!schema) {
      throw new Error(
        `Widget type "${widgetType}" is not registered in the widget registry. Available types: ${Array.from(this.schemas.keys()).join(", ")}`,
      );
    }
    return schema;
  }

  /**
   * Check if widget type is registered
   */
  has(widgetType: string): boolean {
    return this.schemas.has(widgetType);
  }

  /**
   * Get all registered widget types
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.schemas.keys());
  }

  /**
   * Register built-in widget types
   */
  private registerBuiltInWidgets(): void {
    // Hero widget: title and subtitle
    this.schemas.set("hero", {
      type: "object",
      properties: {
        title: { type: "string", description: "Hero section title" },
        subtitle: {
          type: "string",
          description: "Hero section subtitle",
        },
        ctaText: {
          type: "string",
          description: "Call-to-action button text",
        },
        ctaUrl: {
          type: "string",
          description: "Call-to-action button URL",
        },
      },
      required: ["title"],
      additionalProperties: true,
    });

    // Portfolio widget: showcases projects
    this.schemas.set("portfolio", {
      type: "object",
      properties: {
        title: { type: "string", description: "Portfolio section title" },
        projects: {
          type: "array",
          description: "Array of project objects",
        },
      },
      required: ["title"],
      additionalProperties: true,
    });

    // Skills widget: lists skills or competencies
    this.schemas.set("skills", {
      type: "object",
      properties: {
        title: { type: "string", description: "Skills section title" },
        skills: {
          type: "array",
          description: "Array of skill items",
        },
        groupBy: {
          type: "string",
          description: "Optional skill grouping category",
        },
      },
      required: ["title"],
      additionalProperties: true,
    });

    // Contact widget: contact form or information
    this.schemas.set("contact", {
      type: "object",
      properties: {
        title: { type: "string", description: "Contact section title" },
        email: { type: "string", description: "Contact email address" },
        phone: { type: "string", description: "Contact phone number" },
        form: {
          type: "object",
          description: "Contact form configuration",
        },
      },
      required: ["title"],
      additionalProperties: true,
    });
  }
}
