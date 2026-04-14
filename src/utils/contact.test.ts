/**
 * contact.utils — BDD unit tests for resolveContactMessage.
 *
 * Priority (high → low):
 *   1. messageProp  — page-level override
 *   2. profileDefault — from profile config
 *   3. built-in fallback string
 */
import { describe, it, expect } from "vitest";
import { resolveContactMessage } from "./contact";

// ─── Scenario 1: page-level override wins ─────────────────────────────────────

describe("resolveContactMessage — page-level override takes top priority", () => {
  it("Given all three sources are defined, When resolving, Then returns messageProp", () => {
    expect(
      resolveContactMessage("page message", "profile message", "fallback message"),
    ).toBe("page message");
  });

  it("Given messageProp is set and profileDefault is undefined, When resolving, Then returns messageProp", () => {
    expect(resolveContactMessage("page message", undefined, "fallback")).toBe(
      "page message",
    );
  });

  it("Given messageProp is set and no fallback is supplied, When resolving, Then returns messageProp", () => {
    expect(resolveContactMessage("page message", undefined)).toBe(
      "page message",
    );
  });
});

// ─── Scenario 2: profileDefault used when messageProp is absent ───────────────

describe("resolveContactMessage — profileDefault wins when no page override", () => {
  it("Given messageProp is undefined and profileDefault is set, When resolving, Then returns profileDefault", () => {
    expect(resolveContactMessage(undefined, "profile message", "fallback")).toBe(
      "profile message",
    );
  });

  it("Given messageProp is undefined and profileDefault is set without a custom fallback, When resolving, Then returns profileDefault", () => {
    expect(resolveContactMessage(undefined, "Available for new projects.")).toBe(
      "Available for new projects.",
    );
  });
});

// ─── Scenario 3: fallback used when both upper sources are absent ─────────────

describe("resolveContactMessage — built-in fallback when neither source is provided", () => {
  it("Given a custom fallback and both other sources undefined, When resolving, Then returns the custom fallback", () => {
    expect(resolveContactMessage(undefined, undefined, "custom fallback")).toBe(
      "custom fallback",
    );
  });

  it("Given no arguments beyond the required undefineds, When resolving, Then returns a non-empty string", () => {
    const result = resolveContactMessage(undefined, undefined);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});
