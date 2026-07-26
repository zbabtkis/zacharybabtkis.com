// Thin wrapper around gtag so components can report events without
// caring whether analytics is loaded (no GA ID, script blocked, SSR).
type GtagParams = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'consent' | 'config' | 'js',
      target: string,
      params?: GtagParams,
    ) => void;
  }
}

export function track(eventName: string, params?: GtagParams): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }
  window.gtag('event', eventName, params);
}
