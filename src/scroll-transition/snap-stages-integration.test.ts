/**
 * Integration tests: SnapAnimator + stageInterpolate working together
 *
 * This test suite verifies that snap configuration works correctly with stages
 */

import { describe, it, expect } from "vitest";
import { snapDirection } from "./snap-animator.js";
import { stageInterpolate, validateStages } from "./stage-interpolator.js";
import type { AnimationStage } from "../types/scroll-transition.types.js";

describe("Snap + Stages Integration", () => {
  // ─── Configuration: Two-stage setup from unbati-app ──────────────────────────
  // Stage 1: [0, 0.6] scale from 1 to 0.7
  // Stage 2: [0.6, 1] translateFraction from 0 to 1
  const stages: AnimationStage[] = [
    {
      range: [0, 0.6],
      scale: { from: 1, to: 0.7 },
    },
    {
      range: [0.6, 1],
      translateFraction: { from: 0, to: 1 },
    },
  ];

  // ─── Test 1: Validate stages configuration
  it("Should pass validation for two-stage configuration", () => {
    expect(() => validateStages(stages)).not.toThrow();
  });

  // ─── Test 2: Interpolation at various progress values
  it("At progress=0.2: should be in stage 1, scale interpolating from 1 to 0.7", () => {
    const result = stageInterpolate(stages, 0.2);
    // localProgress in stage 1: 0.2 / 0.6 = 0.333
    // scale = 1 + (0.7 - 1) * 0.333 = 0.9
    expect(result.scale).toBeCloseTo(0.9, 1);
    expect(result.translateFraction).toBeCloseTo(0.2); // Pass-through when not defined
  });

  it("At progress=0.3: stage 1, about halfway through scale down", () => {
    const result = stageInterpolate(stages, 0.3);
    // localProgress: 0.3 / 0.6 = 0.5
    // scale = 1 + (0.7 - 1) * 0.5 = 0.85
    expect(result.scale).toBeCloseTo(0.85, 1);
  });

  it("At progress=0.6: end of stage 1, start of stage 2", () => {
    const result = stageInterpolate(stages, 0.6);
    // At 0.6, we're at the start of stage 2 [0.6, 1]
    // localProgress: (0.6 - 0.6) / (1 - 0.6) = 0
    // scale not defined in stage 2, use pass-through = 0.6
    expect(result.scale).toBeCloseTo(0.6);
    // translateFraction = 0 + (1 - 0) * 0 = 0
    expect(result.translateFraction).toBeCloseTo(0);
  });

  it("At progress=0.8: stage 2, translateFraction halfway", () => {
    const result = stageInterpolate(stages, 0.8);
    // Stage 2 localProgress: (0.8 - 0.6) / (1 - 0.6) = 0.5
    // translateFraction = 0 + (1 - 0) * 0.5 = 0.5
    expect(result.translateFraction).toBeCloseTo(0.5, 1);
    // scale not defined in stage 2, use pass-through
    expect(result.scale).toBeCloseTo(0.8); // Pass-through
  });

  it("At progress=1.0: end, full scale down + fully translated", () => {
    const result = stageInterpolate(stages, 1.0);
    expect(result.scale).toBeCloseTo(1.0); // Pass-through at end
    expect(result.translateFraction).toBeCloseTo(1.0);
  });

  // ─── Test 3: Snap direction determines target
  it("snapDirection(0.3) returns 0 (snap to origin)", () => {
    expect(snapDirection(0.3)).toBe(0);
  });

  it("snapDirection(0.5) returns 1 (snap to target)", () => {
    expect(snapDirection(0.5)).toBe(1);
  });

  it("snapDirection(0.7) returns 1 (snap to target)", () => {
    expect(snapDirection(0.7)).toBe(1);
  });

  // ─── Test 4: At snap target (progress=0), stages should show origin
  it("When snapping to progress=0 (origin), stages show no translation", () => {
    const result = stageInterpolate(stages, 0);
    expect(result.translateFraction).toBe(0);
    expect(result.scale).toBeCloseTo(1.0); // Full size at origin
  });

  // ─── Test 5: At snap target (progress=1), stages should show target
  it("When snapping to progress=1 (target), stages show full translation", () => {
    const result = stageInterpolate(stages, 1);
    expect(result.translateFraction).toBeCloseTo(1.0);
  });

  // ─── Test 6: Without stages configured, behavior is linear
  it("With stages=undefined, stageInterpolate returns linear interpolation", () => {
    const result = stageInterpolate(undefined, 0.5);
    expect(result.scale).toBeCloseTo(0.5);
    expect(result.translateFraction).toBeCloseTo(0.5);
    expect(result.opacity).toBe(1);
  });

  it("With stages=undefined at progress=0.8, all values are 0.8 (except opacity=1)", () => {
    const result = stageInterpolate(undefined, 0.8);
    expect(result.scale).toBeCloseTo(0.8);
    expect(result.translateFraction).toBeCloseTo(0.8);
    expect(result.opacity).toBe(1);
  });

  // ─── Test 7: Stage boundaries work correctly
  it("Should handle progress at exact stage boundaries", () => {
    // Progress exactly at boundary 0.6
    const result = stageInterpolate(stages, 0.6);
    expect(result).toBeDefined();
    expect(result.scale).toBeDefined();
    expect(result.translateFraction).toBeDefined();
  });

  // ─── Test 8: Snap sequence scenario from unbati-app
  it("Complete snap sequence: 0.3 → snap to 0 (origin)", () => {
    // At rest position 0.3
    const at03 = stageInterpolate(stages, 0.3);
    expect(at03.scale).toBeCloseTo(0.85, 1);
    
    // Snap fires: direction=0
    const dir = snapDirection(0.3);
    expect(dir).toBe(0);
    
    // At snap target (0)
    const at00 = stageInterpolate(stages, 0);
    expect(at00.scale).toBeCloseTo(1.0);
    expect(at00.translateFraction).toBe(0);
  });

  it("Complete snap sequence: 0.7 → snap to 1 (target)", () => {
    // At rest position 0.7
    const at07 = stageInterpolate(stages, 0.7);
    // Stage 2: localProgress = (0.7 - 0.6) / 0.4 = 0.25
    // translateFraction = 0 + (1 - 0) * 0.25 = 0.25
    expect(at07.translateFraction).toBeCloseTo(0.25, 1);
    
    // Snap fires: direction=1
    const dir = snapDirection(0.7);
    expect(dir).toBe(1);
    
    // At snap target (1)
    const at10 = stageInterpolate(stages, 1);
    expect(at10.translateFraction).toBeCloseTo(1.0);
  });
});
