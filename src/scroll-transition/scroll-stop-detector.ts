export function createScrollStopDetector(
  callback: () => void,
  debounceMs: number = 200
): { detach(): void } {
  // Use a boolean variable to avoid TypeScript control-flow narrowing window to 'never'
  const supportsScrollEnd: boolean = 'onscrollend' in window;

  if (supportsScrollEnd) {
    window.addEventListener('scrollend', callback);
    return {
      detach() {
        window.removeEventListener('scrollend', callback);
      },
    };
  }

  let timer: ReturnType<typeof setTimeout> | undefined;

  const onScroll = () => {
    clearTimeout(timer);
    timer = setTimeout(callback, debounceMs);
  };

  window.addEventListener('scroll', onScroll);

  return {
    detach() {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timer);
    },
  };
}
