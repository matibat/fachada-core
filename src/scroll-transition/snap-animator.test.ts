/**
 * snap-animator.test.ts — TDD for snap direction and animation
 *
 * Modules under test do NOT exist yet — all tests are expected to fail
 * with a "Cannot find module" error (RED state).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { snapDirection, SnapAnimator } from "./snap-animator";

// ─── snapDirection ────────────────────────────────────────────────────────────

describe("snapDirection", () => {
  it("progress=0 returns 0", () => {
    expect(snapDirection(0)).toBe(0);
  });

  it("progress=0.3 returns 0", () => {
    expect(snapDirection(0.3)).toBe(0);
  });

  it("progress=0.499 returns 0", () => {
    expect(snapDirection(0.499)).toBe(0);
  });

  it("progress=0.5 returns 1 (threshold: >= 0.5 snaps forward)", () => {
    expect(snapDirection(0.5)).toBe(1);
  });

  it("progress=0.7 returns 1", () => {
    expect(snapDirection(0.7)).toBe(1);
  });

  it("progress=1 returns 1", () => {
    expect(snapDirection(1)).toBe(1);
  });
});

// ─── SnapAnimator ─────────────────────────────────────────────────────────────

describe("SnapAnimator", () => {
  let rafCallbacks: FrameRequestCallback[];
  let rafId: number;

  beforeEach(() => {
    vi.useFakeTimers();
    rafCallbacks = [];
    rafId = 0;

    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb);
      return ++rafId;
    });

    vi.stubGlobal("cancelAnimationFrame", (id: number) => {
      // no-op stub — cancellation is handled by the animator internally
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  function flushRaf(timestampMs = 0) {
    const callbacks = [...rafCallbacks];
    rafCallbacks.length = 0;
    for (const cb of callbacks) {
      cb(timestampMs);
    }
  }

  it("start() drives onTick toward toTarget and calls onComplete", () => {
    const animator = new SnapAnimator({ enabled: true });
    const onTick = vi.fn();
    const onComplete = vi.fn();

    animator.start(0, 1, 350, onTick, onComplete);

    // Flush rAF at start
    flushRaf(0);
    expect(onTick).toHaveBeenCalled();

    // Advance to end of animation
    vi.advanceTimersByTime(350);
    flushRaf(350);

    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("cancel() before completion stops further onTick calls", () => {
    const animator = new SnapAnimator({ enabled: true });
    const onTick = vi.fn();
    const onComplete = vi.fn();

    animator.start(0, 1, 350, onTick, onComplete);

    // Flush one frame so the loop is running
    flushRaf(0);
    const tickCountAfterFirstFrame = onTick.mock.calls.length;

    animator.cancel();

    // Advance timers and flush — should produce no more ticks
    vi.advanceTimersByTime(350);
    flushRaf(350);

    expect(onTick.mock.calls.length).toBe(tickCountAfterFirstFrame);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("starting new snap mid-flight cancels previous (no double-tick)", () => {
    const animator = new SnapAnimator({ enabled: true });
    const onTick1 = vi.fn();
    const onComplete1 = vi.fn();
    const onTick2 = vi.fn();
    const onComplete2 = vi.fn();

    animator.start(0, 1, 350, onTick1, onComplete1);
    flushRaf(0);

    // Start second snap immediately, cancelling the first
    animator.start(0.5, 0, 350, onTick2, onComplete2);
    flushRaf(50);

    // onTick1 should NOT be called after the second snap started
    const tick1CountAfterSecondStart = onTick1.mock.calls.length;

    vi.advanceTimersByTime(350);
    flushRaf(350);

    expect(onTick1.mock.calls.length).toBe(tick1CountAfterSecondStart);
    expect(onComplete1).not.toHaveBeenCalled();
    expect(onComplete2).toHaveBeenCalledOnce();
  });

  it("when enabled=false, start() is a no-op (onTick never called)", () => {
    const animator = new SnapAnimator({ enabled: false });
    const onTick = vi.fn();
    const onComplete = vi.fn();

    animator.start(0, 1, 350, onTick, onComplete);

    flushRaf(0);
    vi.advanceTimersByTime(350);
    flushRaf(350);

    expect(onTick).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });
});
