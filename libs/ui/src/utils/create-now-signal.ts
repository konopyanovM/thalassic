import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, inject, PLATFORM_ID, Signal, signal } from '@angular/core';

/**
 * A signal of the current time, refreshed every `intervalMs` (browser only), so
 * time-dependent computed's — a current-time indicator, a "today" highlight —
 * stay correct while the view is left open instead of freezing at first render.
 *
 * Must be called from an injection context (a field initializer or
 * constructor); the refresh interval is cleared when that context is destroyed.
 * On the server the signal holds the construction time and never ticks.
 */
export const createNowSignal = (intervalMs: number): Signal<Date> => {
  const now = signal(new Date());

  if (isPlatformBrowser(inject(PLATFORM_ID))) {
    const handle = setInterval(() => now.set(new Date()), intervalMs);
    inject(DestroyRef).onDestroy(() => clearInterval(handle));
  }

  return now.asReadonly();
};
