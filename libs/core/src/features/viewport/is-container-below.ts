import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, ElementRef, inject, PLATFORM_ID, signal, Signal } from '@angular/core';
import { breakpoint } from './types';
import { VIEWPORT_CONFIG } from './viewport.token';

/**
 * A readonly signal that is `true` while an element's inline size is at or below the given
 * breakpoint — the condition under which `@include container-breakpoint(name, …)` applies to
 * the content of a container that element declares. It is that mixin's TypeScript
 * counterpart, as `ViewportService.isBelow` is the `breakpoint` mixin's: for the structural
 * decisions CSS cannot make, taken from the width a layout actually gets rather than from
 * the viewport's.
 *
 * The element is measured with a `ResizeObserver` on its content box, the size a container
 * query evaluates, against the same thresholds the mixins use (`VIEWPORT_CONFIG`), so both
 * flip at the same width. Measuring waits for the element to be laid out, so the signal is
 * `undefined` until the first measurement arrives — and stays so on the server — rather than
 * a guess that a decision might be taken on. Observation ends with the injection context it
 * was started in.
 *
 * Call it from an injection context. Without an element it measures the host of the
 * component or directive being created.
 *
 * @example
 * ```ts
 * // A page whose host declares `container: page / inline-size`.
 * protected readonly isCompact = isContainerBelow('md');
 * // undefined → false → true as the page narrows past 768px; nothing is decided on undefined.
 * ```
 */
export function isContainerBelow(
  name: breakpoint,
  element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement,
): Signal<boolean | undefined> {
  const isBelow = signal<boolean | undefined>(undefined);
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return isBelow.asReadonly();

  const threshold = inject(VIEWPORT_CONFIG).breakpoints[name];
  const observer = new ResizeObserver(entries => {
    // Only the latest size matters when several were queued before delivery.
    const [size] = entries[entries.length - 1].contentBoxSize;
    isBelow.set(size.inlineSize <= threshold);
  });
  observer.observe(element);
  inject(DestroyRef).onDestroy(() => observer.disconnect());

  return isBelow.asReadonly();
}
