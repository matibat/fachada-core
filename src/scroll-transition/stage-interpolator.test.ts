import { describe, it, expect } from "vitest";
import { validateStages, stageInterpolate } from "./stage-interpolator";
import type { AnimationStage } from "../types/scroll-transition.types";

describe("validateStages", () => {
  it("valid two-stage [0,0.6]+[0.6,1] passes without error", () => {
    const stages: AnimationStage[] = [{ range: [0, 0.6] }, { range: [0.6, 1] }];
    expect(() => validateStages(stages)).not.toThrow();
  });

  it("gap between stages [0,0.5]+[0.6,1] throws RangeError mentioning the gap", () => {
    const stages: AnimationStage[] = [{ range: [0, 0.5] }, { range: [0.6, 1] }];
    expect(() => validateStages(stages)).toThrow(RangeError);
  });

  it("first stage not starting at 0 throws RangeError", () => {
    const stages: AnimationStage[] = [{ range: [0.1, 1] }];
    expect(() => validateStages(stages)).toThrow(RangeError);
  });

  it("last stage not ending at 1 throws RangeError", () => {
    const stages: AnimationStage[] = [{ range: [0, 0.9] }];
    expect(() => validateStages(stages)).toThrow(RangeError);
  });
});

describe("stageInterpolate", () => {
  it("progress=0.3 in stage [0,0.6] with scale {from:1,to:0.8} gives scale approx 0.9", () => {
    const stages: AnimationStage[] = [
      { range: [0, 0.6], scale: { from: 1, to: 0.8 } },
      { range: [0.6, 1] },
    ];
    const result = stageInterpolate(stages, 0.3);
    // localProgress = 0.3 / 0.6 = 0.5, scale = 1 + (0.8 - 1) * 0.5 = 0.9
    expect(result.scale).toBeCloseTo(0.9, 2);
  });

  it("progress=0.8 in stage [0.6,1] with translateFraction {from:0,to:1} gives translateFraction=0.5", () => {
    const stages: AnimationStage[] = [
      { range: [0, 0.6] },
      { range: [0.6, 1], translateFraction: { from: 0, to: 1 } },
    ];
    const result = stageInterpolate(stages, 0.8);
    // localProgress = (0.8 - 0.6) / (1 - 0.6) = 0.5, translateFraction = 0 + 1 * 0.5 = 0.5
    expect(result.translateFraction).toBeCloseTo(0.5, 2);
  });

  it("stages=undefined, progress=0.5 returns { translateFraction:0.5, scale:0.5, opacity:1 }", () => {
    const result = stageInterpolate(undefined, 0.5);
    expect(result.translateFraction).toBeCloseTo(0.5);
    expect(result.scale).toBeCloseTo(0.5);
    expect(result.opacity).toBe(1);
  });

  it("translateFraction=0 is at origin; translateFraction=1 is at target", () => {
    const stages: AnimationStage[] = [
      { range: [0, 1], translateFraction: { from: 0, to: 1 } },
    ];

    const atOrigin = stageInterpolate(stages, 0);
    expect(atOrigin.translateFraction).toBeCloseTo(0);

    const atTarget = stageInterpolate(stages, 1);
    expect(atTarget.translateFraction).toBeCloseTo(1);
  });
});
