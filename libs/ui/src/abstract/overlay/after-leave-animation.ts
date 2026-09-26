import { whenAnimationsFinish } from './when-animations-finish';

/**
 * Invokes `onDone` once the element's own exit animation has finished, so a
 * closing surface is not torn down while its `--leave` animation is still
 * playing. Fires as soon as nothing runs (e.g. the `none` motion level, where
 * the motion mixin emits nothing), so reduced-motion users never wait.
 *
 * Shared by every container that swaps an `--enter` class for `--leave` and
 * defers disposal until the exit finishes (drawer, dialog).
 */
export function afterLeaveAnimation(element: HTMLElement, onDone: () => void): void {
  // The `--leave` class applies on the next change detection, so the element is
  // read once that has run. A task rather than an animation frame: the
  // scheduler queued its own tick first, so this runs after it, and a frame
  // never comes in a hidden tab, which would leave the surface alive until the
  // tab is shown again.
  setTimeout(() => {
    void whenAnimationsFinish(element).then(onDone);
  });
}
