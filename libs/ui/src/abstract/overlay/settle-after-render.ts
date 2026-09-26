import { afterNextRender, Injector } from '@angular/core';
import { whenAnimationsFinish } from './when-animations-finish';

/**
 * Settles a dragged surface: once change detection has put its settling class
 * (which carries the settle transition) on `element`, writes the target with
 * `applyTarget`, then calls `onDone` when the transition that starts has run.
 * Written in the same frame as the class, the value would jump instead of
 * animating; a surface with no transition (the `none` motion level) settles at
 * once.
 *
 * Shared by every surface dragged toward a dismissal (drawer, menu sheet).
 */
export function settleAfterRender(
  injector: Injector,
  element: HTMLElement,
  applyTarget: () => void,
  onDone: () => void,
): void {
  afterNextRender(
    () => {
      applyTarget();
      void whenAnimationsFinish(element).then(onDone);
    },
    { injector },
  );
}
