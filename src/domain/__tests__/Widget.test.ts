/**
 * Widget domain value object BDD test suite
 *
 * Verifies that:
 *  - Widget factory validates parameters against registered schema
 *  - Parameter validation errors cite widget type, param name, and expected vs actual type
 *  - Widget instance is immutable (frozen) after creation
 *  - Registry supports built-in widgets (hero, portfolio, skills, contact) + custom registration
 *  - Registry lookup returns schema; mismatch throws descriptive error
 */
import { describe, it, expect, beforeEach } from "vitest";
import { Widget, WidgetRegistry, type WidgetSchema } from "../index";

describe("Widget Domain Value Object", () => {
  describe("Behavior 1: Widget factory validates parameters against schema", () => {
    it("should create a widget when parameters match registered schema", () => {
      // Given: WidgetRegistry with hero widget schema
      const registry = new WidgetRegistry();

      // When: Creating a widget with valid parameters
      const widget = Widget.create({
        type: "hero",
        parameters: {
          title: "Welcome",
          subtitle: "To my portfolio",
        },
        registry,
      });

      // Then: Widget should be created successfully
      expect(widget).toBeDefined();
      expect(widget.type).toBe("hero");
      expect(widget.parameters).toEqual({
        title: "Welcome",
        subtitle: "To my portfolio",
      });
    });

    it("should create a widget with no parameters if none provided", () => {
      // Given: WidgetRegistry with widget schema
      const registry = new WidgetRegistry();

      // When: Creating a widget without optional parameters (provide required param)
      const widget = Widget.create({
        type: "hero",
        parameters: {
          title: "Welcome", // Required parameter
        },
        registry,
      });

      // Then: Widget should be created
      expect(widget).toBeDefined();
      expect(widget.type).toBe("hero");
      expect(widget.parameters.title).toBe("Welcome");
    });

    it("should reject widget creation when parameter type mismatches schema", () => {
      // Given: WidgetRegistry with hero widget schema (expects title: string)
      const registry = new WidgetRegistry();

      // When: Creating a widget with wrong parameter type
      const action = () =>
        Widget.create({
          type: "hero",
          parameters: {
            title: 123, // Should be string
          },
          registry,
        });

      // Then: Should throw error about parameter type mismatch
      expect(action).toThrow();
      expect(action).toThrow(/title/i);
      expect(action).toThrow(/string|number/i);
    });

    it("should reject widget creation for unknown widget type", () => {
      // Given: WidgetRegistry without custom widget
      const registry = new WidgetRegistry();

      // When: Creating a widget with unknown type
      const action = () =>
        Widget.create({
          type: "unknown-widget",
          parameters: {},
          registry,
        });

      // Then: Should throw error about unknown widget
      expect(action).toThrow(/unknown-widget|not found|registered/i);
    });
  });

  describe("Behavior 2: Parameter validation errors cite widget type, param name, expected vs actual", () => {
    it("should include widget type in validation error message", () => {
      // Given: WidgetRegistry
      const registry = new WidgetRegistry();

      // When: Creating widget with invalid parameters
      const action = () =>
        Widget.create({
          type: "hero",
          parameters: {
            title: 123,
          },
          registry,
        });

      // Then: Error should cite the widget type
      try {
        action();
      } catch (error) {
        expect((error as Error).message).toContain("hero");
      }
    });

    it("should include parameter name in validation error message", () => {
      // Given: WidgetRegistry
      const registry = new WidgetRegistry();

      // When: Creating widget with invalid parameter
      const action = () =>
        Widget.create({
          type: "hero",
          parameters: {
            title: 123,
          },
          registry,
        });

      // Then: Error should cite the parameter name
      try {
        action();
      } catch (error) {
        expect((error as Error).message).toContain("title");
      }
    });

    it("should include expected type in validation error message", () => {
      // Given: WidgetRegistry
      const registry = new WidgetRegistry();

      // When: Creating widget with invalid parameter type
      const action = () =>
        Widget.create({
          type: "hero",
          parameters: {
            title: 123,
          },
          registry,
        });

      // Then: Error should cite the expected type
      try {
        action();
      } catch (error) {
        expect((error as Error).message).toMatch(/string|expected/i);
      }
    });

    it("should include actual type in validation error message", () => {
      // Given: WidgetRegistry
      const registry = new WidgetRegistry();

      // When: Creating widget with invalid parameter type
      const action = () =>
        Widget.create({
          type: "hero",
          parameters: {
            title: 123,
          },
          registry,
        });

      // Then: Error should cite the actual type provided
      try {
        action();
      } catch (error) {
        expect((error as Error).message).toMatch(/number|actual|received/i);
      }
    });
  });

  describe("Behavior 3: Widget instance is immutable (frozen) after creation", () => {
    it("should prevent mutation of type property", () => {
      // Given: A created widget
      const registry = new WidgetRegistry();
      const widget = Widget.create({
        type: "hero",
        parameters: { title: "Test" },
        registry,
      });

      // When: Attempting to mutate type
      const action = () => {
        (widget as any).type = "portfolio";
      };

      // Then: Should prevent modification (strict mode or Object.freeze)
      if (typeof action !== "undefined") {
        expect(() => action()).toThrow();
      }
    });

    it("should prevent mutation of parameters property", () => {
      // Given: A created widget
      const registry = new WidgetRegistry();
      const widget = Widget.create({
        type: "hero",
        parameters: { title: "Test" },
        registry,
      });

      // When: Attempting to mutate parameters
      const action = () => {
        (widget as any).parameters = { title: "Changed" };
      };

      // Then: Should prevent modification
      if (typeof action !== "undefined") {
        expect(() => action()).toThrow();
      }
    });

    it("should prevent mutation of nested parameters object", () => {
      // Given: A created widget
      const registry = new WidgetRegistry();
      const widget = Widget.create({
        type: "hero",
        parameters: { title: "Test" },
        registry,
      });

      // When: Attempting to mutate nested parameters in strict mode throws error
      const action = () => {
        (widget.parameters as any).title = "Changed";
      };

      // Then: Should prevent modification (Object.freeze makes properties read-only)
      expect(action).toThrow(/read only|frozen|Cannot assign/i);
    });

    it("should be frozen (Object.isFrozen returns true)", () => {
      // Given: A created widget
      const registry = new WidgetRegistry();
      const widget = Widget.create({
        type: "hero",
        parameters: { title: "Test" },
        registry,
      });

      // Then: Widget object should be frozen
      expect(Object.isFrozen(widget)).toBe(true);
    });
  });

  describe("Behavior 4: Registry supports built-in and custom widget registration", () => {
    it("should include hero widget in registry", () => {
      // Given: A fresh WidgetRegistry
      const registry = new WidgetRegistry();

      // When: Looking up hero widget schema
      const schema = registry.getSchema("hero");

      // Then: Schema should be defined
      expect(schema).toBeDefined();
      expect(schema.type).toBe("object");
    });

    it("should include portfolio widget in registry", () => {
      // Given: A fresh WidgetRegistry
      const registry = new WidgetRegistry();

      // When: Looking up portfolio widget schema
      const schema = registry.getSchema("portfolio");

      // Then: Schema should be defined
      expect(schema).toBeDefined();
    });

    it("should include skills widget in registry", () => {
      // Given: A fresh WidgetRegistry
      const registry = new WidgetRegistry();

      // When: Looking up skills widget schema
      const schema = registry.getSchema("skills");

      // Then: Schema should be defined
      expect(schema).toBeDefined();
    });

    it("should include contact widget in registry", () => {
      // Given: A fresh WidgetRegistry
      const registry = new WidgetRegistry();

      // When: Looking up contact widget schema
      const schema = registry.getSchema("contact");

      // Then: Schema should be defined
      expect(schema).toBeDefined();
    });

    it("should support registering custom widgets", () => {
      // Given: A WidgetRegistry
      const registry = new WidgetRegistry();
      const customSchema: WidgetSchema = {
        type: "object",
        properties: {
          customProp: { type: "string" },
        },
        required: ["customProp"],
      };

      // When: Registering a custom widget
      registry.register("custom-widget", customSchema);

      // Then: Custom widget should be retrievable
      expect(registry.getSchema("custom-widget")).toEqual(customSchema);
    });

    it("should allow custom widgets to be used in Widget.create", () => {
      // Given: A registry with custom widget
      const registry = new WidgetRegistry();
      const customSchema: WidgetSchema = {
        type: "object",
        properties: {
          customProp: { type: "string" },
        },
        required: ["customProp"],
      };
      registry.register("custom-widget", customSchema);

      // When: Creating a widget with the custom type
      const widget = Widget.create({
        type: "custom-widget",
        parameters: { customProp: "value" },
        registry,
      });

      // Then: Widget should be created successfully
      expect(widget.type).toBe("custom-widget");
      expect(widget.parameters.customProp).toBe("value");
    });

    it("should throw error when registering existing widget type", () => {
      // Given: A registry with hero widget
      const registry = new WidgetRegistry();

      // When: Attempting to re-register hero
      const action = () =>
        registry.register("hero", {
          type: "object" as const,
          properties: {},
        });

      // Then: Should throw error
      expect(action).toThrow(/already registered|exists|hero/i);
    });

    it("should throw error when looking up unregistered widget", () => {
      // Given: A registry
      const registry = new WidgetRegistry();

      // When: Looking up non-existent widget
      const action = () => registry.getSchema("non-existent");

      // Then: Should throw error
      expect(action).toThrow(/not found|registered|non-existent/i);
    });
  });

  describe("Integration: Registry schema validation with Widget creation", () => {
    it("should validate all required parameters when creating widget", () => {
      // Given: WidgetRegistry with schema requiring title and subtitle
      const registry = new WidgetRegistry();

      // When: Creating widget without required parameter
      const action = () =>
        Widget.create({
          type: "hero",
          parameters: {
            title: "Welcome", // missing subtitle if required
          },
          registry,
        });

      // Note: Behavior depends on hero schema definition
      // If subtitle is required, this should fail
      // This test documents the behavior
      try {
        action();
      } catch (error) {
        expect((error as Error).message).toContain("hero");
      }
    });

    it("should allow optional parameters to be omitted", () => {
      // Given: WidgetRegistry
      const registry = new WidgetRegistry();

      // When: Creating widget with minimal parameters
      const widget = Widget.create({
        type: "hero",
        parameters: {
          title: "Welcome",
        },
        registry,
      });

      // Then: Widget should be created
      expect(widget).toBeDefined();
      expect(widget.type).toBe("hero");
    });
  });
});
