import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createScrollStopDetector } from './scroll-stop-detector';

describe('createScrollStopDetector', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Given scrollend is supported', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'onscrollend', {
        value: null,
        writable: true,
        configurable: true,
      });
    });

    it('fires callback when scrollend event fires', () => {
      const callback = vi.fn();
      createScrollStopDetector(callback);

      window.dispatchEvent(new Event('scrollend'));

      expect(callback).toHaveBeenCalledOnce();
    });

    it('does NOT fire callback on plain scroll event (uses scrollend instead)', () => {
      const callback = vi.fn();
      createScrollStopDetector(callback);

      window.dispatchEvent(new Event('scroll'));

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Given scrollend is NOT supported', () => {
    beforeEach(() => {
      // Ensure 'onscrollend' is not present on window
      const descriptor = Object.getOwnPropertyDescriptor(window, 'onscrollend');
      if (descriptor) {
        delete (window as Record<string, unknown>)['onscrollend'];
      }
    });

    it('fires callback via 200ms debounce when scroll event fires', () => {
      const callback = vi.fn();
      createScrollStopDetector(callback);

      window.dispatchEvent(new Event('scroll'));

      vi.advanceTimersByTime(199);
      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(callback).toHaveBeenCalledOnce();
    });

    it('scroll event before debounce expires resets timer; callback not called prematurely', () => {
      const callback = vi.fn();
      createScrollStopDetector(callback);

      // First scroll at t=0
      window.dispatchEvent(new Event('scroll'));

      vi.advanceTimersByTime(100);

      // Second scroll at t=100
      window.dispatchEvent(new Event('scroll'));

      // At t=299 (199ms since second scroll), callback should NOT be called
      vi.advanceTimersByTime(199);
      expect(callback).not.toHaveBeenCalled();

      // At t=300 (200ms since second scroll), callback should be called
      vi.advanceTimersByTime(1);
      expect(callback).toHaveBeenCalledOnce();
    });

    it('detach() removes all listeners; callback never fires after detach', () => {
      const callback = vi.fn();
      const detector = createScrollStopDetector(callback);

      detector.detach();

      window.dispatchEvent(new Event('scrollend'));
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(500);

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
