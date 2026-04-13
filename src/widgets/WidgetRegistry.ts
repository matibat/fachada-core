/**
 * WidgetRegistry — domain service.
 *
 * The single place in the codebase that maps widget type strings to component
 * factories. Nothing outside this module should import widgets by name.
 *
 * Invariant: WidgetRegistry has no knowledge of AppConfig or /apps/. It is
 * populated at startup by the application layer.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = (...args: any[]) => any;

export interface WidgetRegistry {
  /** Resolve a component factory by its registered type string. */
  resolve(type: string): AnyComponent | undefined;
  /** Returns true when the type string is in the registry. */
  has(type: string): boolean;
  /** Read-only snapshot of registered type keys. */
  readonly types: readonly string[];
}

/**
 * Creates an immutable WidgetRegistry from a plain component map.
 *
 * @param components - Record mapping type strings to component factories.
 */
export function createWidgetRegistry(
  components: Record<string, AnyComponent>,
): WidgetRegistry {
  const map = new Map<string, AnyComponent>(Object.entries(components));

  return {
    resolve(type: string): AnyComponent | undefined {
      return map.get(type);
    },

    has(type: string): boolean {
      return map.has(type);
    },

    // Returns a new array copy each call — mutations to the returned array
    // have no effect on the registry's internal state.
    get types(): readonly string[] {
      return [...map.keys()];
    },
  };
}
