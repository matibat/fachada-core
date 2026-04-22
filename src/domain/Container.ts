/**
 * Container domain value object
 *
 * Represents a layout container that can hold nested Widgets and Containers:
 * - Immutable layout type
 * - Children array (Widget | Container union)
 * - Optional layout configuration props
 * - Supports unlimited nesting depth (recursive)
 * - Factory method with validation
 */

import type { ContainerConfig } from "../.generated/application.types";
import type { Widget } from "./Widget";

/**
 * Type representing a child (Widget or Container)
 */
export type ContainerChild = Widget | Container;

/**
 * Configuration for creating a Container
 */
export interface ContainerCreateConfig extends Omit<ContainerConfig, "type" | "children"> {
  layout: string; // Required for creation
  children: ContainerChild[] | readonly ContainerChild[]; // Required for creation
}

/**
 * Container domain value object - represents a layout container
 * Immutable after creation (frozen)
 * Supports unlimited nesting of Widgets and Containers
 */
export class Container {
  private readonly _layout: string;
  private readonly _children: readonly ContainerChild[];
  private readonly _props?: Record<string, unknown>;
  private readonly _skin?: string | Record<string, unknown>;

  private constructor(
    layout: string,
    children: readonly ContainerChild[],
    props?: Record<string, unknown>,
    skin?: string | Record<string, unknown>,
  ) {
    this._layout = layout;
    this._children = Object.freeze([...children]);
    this._props = props ? Object.freeze(props) : undefined;
    this._skin = skin
      ? typeof skin === "object"
        ? Object.freeze(skin)
        : skin
      : undefined;
    Object.freeze(this);
  }

  /**
   * Factory method: Create a Container with validation
   */
  static create(config: ContainerCreateConfig): Container {
    const { layout, children, props, skin } = config;

    // Validate layout is provided
    if (!layout || typeof layout !== "string") {
      throw new Error("Container layout must be provided and must be a string");
    }

    // Validate children is provided and not empty
    if (
      !children ||
      !(Array.isArray(children) || Array.isArray(Array.from(children)))
    ) {
      throw new Error("Container children must be provided as an array");
    }

    // Convert to array if readonly
    const childrenArray = Array.isArray(children)
      ? children
      : Array.from(children);

    if (childrenArray.length === 0) {
      throw new Error("Container children array cannot be empty");
    }

    // Validate all children are Widget or Container instances
    for (let i = 0; i < childrenArray.length; i++) {
      const child = childrenArray[i];
      if (!isContainerChild(child)) {
        throw new Error(
          `Container child at index ${i} must be a Widget or Container instance, got ${typeof child}`,
        );
      }
    }

    // Create and return immutable container
    return new Container(layout, childrenArray, props, skin);
  }

  /**
   * Get container layout type
   */
  get layout(): string {
    return this._layout;
  }

  /**
   * Get container children (frozen readonly array)
   */
  get children(): readonly ContainerChild[] {
    return this._children;
  }

  /**
   * Get container layout props (frozen)
   */
  get props(): Record<string, unknown> | undefined {
    return this._props;
  }

  /**
   * Get container skin (frozen)
   */
  get skin(): string | Record<string, unknown> | undefined {
    return this._skin;
  }
}

/**
 * Type guard to check if a value is a valid ContainerChild (Widget or Container)
 */
function isContainerChild(value: unknown): boolean {
  // Check if it's an instance of Widget or Container
  // Widget and Container both have specific shapes we can check
  if (
    value &&
    typeof value === "object" &&
    "type" in value &&
    "parameters" in value
  ) {
    // This is a Widget (has type and parameters)
    return true;
  }

  if (
    value &&
    typeof value === "object" &&
    "layout" in value &&
    "children" in value
  ) {
    // This is a Container (has layout and children)
    return true;
  }

  return false;
}
