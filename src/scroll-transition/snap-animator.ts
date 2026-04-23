/**
 * snapDirection — determine snap target (0: origin, 1: target) from scroll progress.
 *
 * At exactly 0.5, snaps forward to target (1) per UX convention.
 */
export function snapDirection(progress: number): 0 | 1 {
  return progress >= 0.5 ? 1 : 0;
}

export class SnapAnimator {
  private rafId: ReturnType<typeof requestAnimationFrame> | null = null;
  private prevTimestamp: number | null = null;
  private currentProgress = 0;
  private generation = 0;

  constructor(private config: { enabled: boolean } = { enabled: true }) {}

  start(
    fromProgress: number,
    toTarget: 0 | 1,
    durationMs: number,
    onTick: (progress: number) => void,
    onComplete: () => void,
  ): void {
    if (!this.config.enabled) return;

    this.cancel();

    const gen = ++this.generation;
    this.currentProgress = fromProgress;
    this.prevTimestamp = null;

    const tick = (timestamp: number) => {
      if (this.generation !== gen) return;

      if (this.prevTimestamp === null) {
        this.prevTimestamp = timestamp;
      }
      const deltaMs = timestamp - this.prevTimestamp;
      this.prevTimestamp = timestamp;

      const delta = deltaMs / durationMs;
      if (toTarget === 1) {
        this.currentProgress = Math.min(this.currentProgress + delta, 1);
      } else {
        this.currentProgress = Math.max(this.currentProgress - delta, 0);
      }

      onTick(this.currentProgress);

      if (this.currentProgress === toTarget) {
        this.rafId = null;
        this.prevTimestamp = null;
        onComplete();
      } else {
        this.rafId = requestAnimationFrame(tick);
      }
    };

    this.rafId = requestAnimationFrame(tick);
  }

  cancel(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
      this.prevTimestamp = null;
      this.generation++;
    }
  }
}
