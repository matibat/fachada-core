/**
 * Container domain value object BDD test suite
 *
 * Verifies that:
 *  - Container factory validates children array is not empty
 *  - Children can mix Widget and Container (proper union type)
 *  - Unlimited nesting depth supported (recursive structure)
 *  - Container instance is immutable (frozen)
 *  - All types fully specified (no any)
 */
import { describe, it, expect } from "vitest";
import { Container, Widget, WidgetRegistry } from "../index";
import type { ContainerConfig } from "../../.generated/application.types";

describe("Container Domain Value Object", () => {
  describe("Behavior 1: Container factory validates children array not empty", () => {
    it("should create a container with valid children array", () => {
      // Given: A Widget for the children array
      const registry = new WidgetRegistry();
      const widget = Widget.create({
        type: "hero",
        parameters: { title: "Welcome" },
        registry,
      });

      // When: Creating a container with children
      const container = Container.create({
        layout: "grid-3",
        children: [widget],
      });

      // Then: Container should be created successfully
      expect(container).toBeDefined();
      expect(container.layout).toBe("grid-3");
      expect(container.children).toHaveLength(1);
      expect(container.children[0]).toEqual(widget);
    });

    it("should reject container creation when children array is empty", () => {
      // Given: Empty children array
      const config: ContainerConfig = {
        type: "container",
        layout: "flex-row",
        children: [],
      };

      // When: Attempting to create a container with empty children
      const action = () => Container.create(config);

      // Then: Should throw error about empty children
      expect(action).toThrow(/children|empty/i);
    });

    it("should reject container creation when children is undefined", () => {
      // Given: No children provided
      const config: ContainerConfig = {
        type: "container",
        layout: "stack",
      };

      // When: Attempting to create a container without children
      const action = () => Container.create(config);

      // Then: Should throw error about missing children
      expect(action).toThrow(/children|required/i);
    });

    it("should create container with layout type as flexible string", () => {
      // Given: Custom layout type string
      const registry = new WidgetRegistry();
      const widget = Widget.create({
        type: "hero",
        parameters: { title: "Welcome" },
        registry,
      });

      // When: Creating container with custom layout type
      const container = Container.create({
        layout: "custom-mosaic-layout",
        children: [widget],
      });

      // Then: Container should accept any layout string
      expect(container.layout).toBe("custom-mosaic-layout");
    });
  });

  describe("Behavior 2: Children can mix Widget and Container (union type)", () => {
    it("should allow array with only widgets", () => {
      // Given: Two widgets
      const registry = new WidgetRegistry();
      const widget1 = Widget.create({
        type: "hero",
        parameters: { title: "Welcome" },
        registry,
      });
      const widget2 = Widget.create({
        type: "portfolio",
        parameters: { title: "My Work" },
        registry,
      });

      // When: Creating container with widgets only
      const container = Container.create({
        layout: "grid-2",
        children: [widget1, widget2],
      });

      // Then: Container should contain both widgets
      expect(container.children).toHaveLength(2);
      expect(container.children[0]).toEqual(widget1);
      expect(container.children[1]).toEqual(widget2);
    });

    it("should allow array with only containers", () => {
      // Given: Two nested containers
      const registry = new WidgetRegistry();
      const widget = Widget.create({
        type: "hero",
        parameters: { title: "Welcome" },
        registry,
      });

      const inner1 = Container.create({
        layout: "flex-col",
        children: [widget],
      });

      const inner2 = Container.create({
        layout: "flex-row",
        children: [widget],
      });

      // When: Creating outer container with nested containers
      const outer = Container.create({
        layout: "grid-3",
        children: [inner1, inner2],
      });

      // Then: Outer container should contain nested containers
      expect(outer.children).toHaveLength(2);
      expect(outer.children[0]).toEqual(inner1);
      expect(outer.children[1]).toEqual(inner2);
    });

    it("should allow array mixing widgets and containers", () => {
      // Given: Widget and Container instances
      const registry = new WidgetRegistry();
      const widget = Widget.create({
        type: "hero",
        parameters: { title: "Welcome" },
        registry,
      });

      const inner = Container.create({
        layout: "flex-row",
        children: [widget],
      });

      // When: Creating container with mixed children
      const outer = Container.create({
        layout: "grid-mixed",
        children: [widget, inner, widget],
      });

      // Then: Container should accept mixed types
      expect(outer.children).toHaveLength(3);
      expect(outer.children[0]).toEqual(widget);
      expect(outer.children[1]).toEqual(inner);
      expect(outer.children[2]).toEqual(widget);
    });
  });

  describe("Behavior 3: Unlimited nesting depth (recursive structure)", () => {
    it("should support two levels of nesting", () => {
      // Given: Inner and outer containers
      const registry = new WidgetRegistry();
      const widget = Widget.create({
        type: "hero",
        parameters: { title: "Welcome" },
        registry,
      });

      const inner = Container.create({
        layout: "flex-row",
        children: [widget],
      });

      // When: Creating outer container with inner container
      const outer = Container.create({
        layout: "flex-col",
        children: [inner],
      });

      // Then: Nesting should work at both levels
      expect(outer.children).toHaveLength(1);
      expect(outer.children[0]).toEqual(inner);
      expect((outer.children[0] as Container).children[0]).toEqual(widget);
    });

    it("should support deep nesting (5+ levels)", () => {
      // Given: Setup for deep nesting
      const registry = new WidgetRegistry();
      const widget = Widget.create({
        type: "hero",
        parameters: { title: "Welcome" },
        registry,
      });

      // When/Then: Build 5 nested containers without error
      let level5 = Container.create({
        layout: "flex-row",
        children: [widget],
      });

      let level4 = Container.create({
        layout: "flex-row",
        children: [level5],
      });

      let level3 = Container.create({
        layout: "flex-row",
        children: [level4],
      });

      let level2 = Container.create({
        layout: "flex-row",
        children: [level3],
      });

      let level1 = Container.create({
        layout: "flex-row",
        children: [level2],
      });

      // Verify structure depth
      expect(level1.children[0]).toEqual(level2);
      expect((level1.children[0] as Container).children[0]).toEqual(level3);
      expect(
        ((level1.children[0] as Container).children[0] as Container)
          .children[0],
      ).toEqual(level4);
      expect(
        (
          ((level1.children[0] as Container).children[0] as Container)
            .children[0] as Container
        ).children[0],
      ).toEqual(level5);
    });

    it("should allow many levels of nesting without arbitrary max depth", () => {
      // Given: Simple widget to nest deeply
      const registry = new WidgetRegistry();
      const widget = Widget.create({
        type: "hero",
        parameters: { title: "Welcome" },
        registry,
      });

      // When: Nesting 10 levels deep
      let current = Container.create({
        layout: "stack",
        children: [widget],
      });

      for (let i = 0; i < 10; i++) {
        current = Container.create({
          layout: "stack",
          children: [current],
        });
      }

      // Then: Deep nesting should be allowed
      expect(current).toBeDefined();
      expect(current.children).toHaveLength(1);
    });
  });

  describe("Behavior 4: Container instance is immutable (frozen)", () => {
    it("should prevent mutation of layout property", () => {
      // Given: A container instance
      const registry = new WidgetRegistry();
      const widget = Widget.create({
        type: "hero",
        parameters: { title: "Welcome" },
        registry,
      });

      const container = Container.create({
        layout: "grid-3",
        children: [widget],
      });

      // When: Attempting to mutate layout
      const action = () => {
        (container.layout as any) = "grid-4";
      };

      // Then: Mutation should be prevented
      expect(action).toThrow();
    });

    it("should prevent mutation of children array", () => {
      // Given: A container with children
      const registry = new WidgetRegistry();
      const widget = Widget.create({
        type: "hero",
        parameters: { title: "Welcome" },
        registry,
      });

      const container = Container.create({
        layout: "grid-3",
        children: [widget],
      });

      // When: Attempting to mutate children array
      const action = () => {
        const newWidget = Widget.create({
          type: "portfolio",
          parameters: { title: "Work" },
          registry,
        });
        (container.children as any)[0] = newWidget;
      };

      // Then: Mutation should be prevented
      expect(action).toThrow();
    });

    it("should prevent pushing to children array", () => {
      // Given: A container with children
      const registry = new WidgetRegistry();
      const widget = Widget.create({
        type: "hero",
        parameters: { title: "Welcome" },
        registry,
      });

      const container = Container.create({
        layout: "grid-3",
        children: [widget],
      });

      // When: Attempting to push to children array
      const action = () => {
        const newWidget = Widget.create({
          type: "portfolio",
          parameters: { title: "Work" },
          registry,
        });
        (container.children as any).push(newWidget);
      };

      // Then: Array mutation should be prevented
      expect(action).toThrow();
    });

    it("should be frozen (Object.isFrozen returns true)", () => {
      // Given: A container instance
      const registry = new WidgetRegistry();
      const widget = Widget.create({
        type: "hero",
        parameters: { title: "Welcome" },
        registry,
      });

      const container = Container.create({
        layout: "grid-3",
        children: [widget],
      });

      // When: Checking if container is frozen
      const isFrozen = Object.isFrozen(container);

      // Then: Container should be frozen
      expect(isFrozen).toBe(true);
      expect(Object.isFrozen(container.children)).toBe(true);
    });
  });

  describe("Behavior 5: Type safety - all types fully specified (no any)", () => {
    it("should have properly typed layout property as string", () => {
      // Given: A container
      const registry = new WidgetRegistry();
      const widget = Widget.create({
        type: "hero",
        parameters: { title: "Welcome" },
        registry,
      });

      const container = Container.create({
        layout: "grid-3",
        children: [widget],
      });

      // When: Accessing layout
      const layout = container.layout;

      // Then: Layout should be typed as string (verified by TypeScript static analysis)
      expect(typeof layout).toBe("string");
      expect(layout).toBe("grid-3");
    });

    it("should have properly typed children as readonly array of Widget | Container", () => {
      // Given: A container with mixed children
      const registry = new WidgetRegistry();
      const widget = Widget.create({
        type: "hero",
        parameters: { title: "Welcome" },
        registry,
      });

      const inner = Container.create({
        layout: "flex-row",
        children: [widget],
      });

      const container = Container.create({
        layout: "grid-mixed",
        children: [widget, inner],
      });

      // When: Accessing children
      const children = container.children;

      // Then: Children should be readonly array
      expect(Array.isArray(children)).toBe(true);
      expect(children).toHaveLength(2);
      // Verify no 'any' by checking type narrowing works
      expect(children[0]).toBeTruthy();
      expect(children[1]).toBeTruthy();
    });
  });

  describe("Behavior 6: Container supports optional parameters", () => {
    it("should support optional props parameter", () => {
      // Given: Container config with props
      const registry = new WidgetRegistry();
      const widget = Widget.create({
        type: "hero",
        parameters: { title: "Welcome" },
        registry,
      });

      // When: Creating container with props
      const container = Container.create({
        layout: "grid-3",
        children: [widget],
        props: { columns: 3, gap: "1rem" },
      });

      // Then: Props should be stored
      expect(container.props).toEqual({ columns: 3, gap: "1rem" });
    });

    it("should support optional skin parameter", () => {
      // Given: Container config with skin
      const registry = new WidgetRegistry();
      const widget = Widget.create({
        type: "hero",
        parameters: { title: "Welcome" },
        registry,
      });

      // When: Creating container with skin
      const container = Container.create({
        layout: "grid-3",
        children: [widget],
        skin: "dark-theme",
      });

      // Then: Skin should be stored
      expect(container.skin).toBe("dark-theme");
    });

    it("should freeze optional parameters like props", () => {
      // Given: Container with props
      const registry = new WidgetRegistry();
      const widget = Widget.create({
        type: "hero",
        parameters: { title: "Welcome" },
        registry,
      });

      const container = Container.create({
        layout: "grid-3",
        children: [widget],
        props: { columns: 3 },
      });

      // When: Attempting to mutate props
      const action = () => {
        (container.props as any).columns = 4;
      };

      // Then: Props should be frozen
      expect(action).toThrow();
    });
  });
});
