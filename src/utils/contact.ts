/**
 * Contact section utilities.
 * Extracted to keep Astro components thin and to allow unit testing.
 */

const FALLBACK_MESSAGE =
  "I'm always interested in hearing about new projects and opportunities.";

/**
 * Resolves the contact section message with priority:
 * 1. `messageProp`   — provided directly by the page (per-page override)
 * 2. `profileDefault` — from profileConfig.contactMessage
 * 3. module-level fallback
 */
export function resolveContactMessage(
  messageProp: string | undefined,
  profileDefault: string | undefined,
  fallback: string = FALLBACK_MESSAGE,
): string {
  return messageProp ?? profileDefault ?? fallback;
}
