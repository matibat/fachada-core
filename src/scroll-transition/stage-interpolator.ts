import type { AnimationStage } from '../types/scroll-transition.types.js';

export function validateStages(stages: AnimationStage[]): void {
  if (stages[0].range[0] !== 0) {
    throw new RangeError(
      `First stage must start at 0, but got ${stages[0].range[0]}`
    );
  }
  if (stages[stages.length - 1].range[1] !== 1) {
    throw new RangeError(
      `Last stage must end at 1, but got ${stages[stages.length - 1].range[1]}`
    );
  }
  for (let i = 0; i < stages.length - 1; i++) {
    if (stages[i].range[1] !== stages[i + 1].range[0]) {
      throw new RangeError(
        `Gap between stage ${i} end (${stages[i].range[1]}) and stage ${i + 1} start (${stages[i + 1].range[0]})`
      );
    }
  }
}

export function stageInterpolate(
  stages: AnimationStage[] | undefined,
  progress: number
): { scale: number; opacity: number; translateFraction: number } {
  if (stages === undefined) {
    return { scale: progress, opacity: 1, translateFraction: progress };
  }

  const lastIndex = stages.length - 1;
  let activeStage = stages[lastIndex];
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    if (progress < stage.range[1] || i === lastIndex) {
      activeStage = stage;
      break;
    }
  }

  const [rangeStart, rangeEnd] = activeStage.range;
  const localProgress = (progress - rangeStart) / (rangeEnd - rangeStart);

  const interpolate = (prop: { from: number; to: number } | undefined, defaultValue: number): number => {
    if (prop !== undefined) {
      return prop.from + (prop.to - prop.from) * localProgress;
    }
    return defaultValue;
  };

  return {
    scale: interpolate(activeStage.scale, progress),
    opacity: interpolate(activeStage.opacity, 1),
    translateFraction: interpolate(activeStage.translateFraction, progress),
  };
}
