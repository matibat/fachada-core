/**
 * generateFoucCss — pure helper for FOUC (Flash of Unstyled Content) prevention.
 *
 * Generates the per-section-per-variant CSS activation rules that WidgetRenderer
 * emits via `<style is:global set:html={foucCss}>`. These rules work in concert
 * with a single static hide-all rule that lives in globals.css:
 *
 *   [data-layout-section][data-layout-variant] { display: none; }
 *
 * For each registered section + variant pair this function emits:
 *   1. A default-visibility rule (display: block) for the FIRST variant — shown
 *      before the FOUC script has had a chance to write data-layout-* attributes
 *      to <html>. Only the first variant gets this rule so exactly one variant
 *      is visible without JavaScript.
 *   2. An activation rule (display: block !important) that fires when the FOUC
 *      script has written the correct data-layout-{section}="{variant}" attribute
 *      to the <html> element.
 *
 * Sections whose variant array is empty are silently skipped — those sections
 * render without a variant wrapper and are never subject to the hide-all rule.
 *
 * See ADR SB-2 for the full design rationale and selector pattern specification.
 */
export function generateFoucCss(sectionVariants: Map<string, string[]>): string {
  const rules: string[] = [];

  for (const [sectionId, variants] of sectionVariants) {
    if (variants.length === 0) continue;

    // Rule 1: default visibility — show the first variant before the FOUC script runs.
    rules.push(
      `[data-layout-section="${sectionId}"][data-layout-variant="${variants[0]}"] { display: block; }`
    );

    // Rule 2: activation rules — show the correct variant once the FOUC script has run.
    for (const v of variants) {
      rules.push(
        `html[data-layout-${sectionId}="${v}"] [data-layout-section="${sectionId}"][data-layout-variant="${v}"] { display: block !important; }`
      );
    }
  }

  return rules.join("\n");
}
