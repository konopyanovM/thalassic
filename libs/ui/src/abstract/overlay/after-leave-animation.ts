import { LEAVE_ANIMATION_FALLBACK_MS } from './overlay.constants';

/**
 * Invokes `onDone` once the element's own exit animation has finished, so a
 * closing surface is not torn down while its `--leave` animation is still
 * playing. Fires immediately when no animation runs (e.g. the `none` motion
 * level, where the motion mixin emits nothing) so reduced-motion users don't
 * wait out the fallback timeout.
 *
 * Shared by every container that swaps an `--enter` class for `--leave` and
 * defers disposal until the exit finishes (drawer, dialog).
 */
export function afterLeaveAnimation(element: HTMLElement, onDone: () => void): void {
  let settled = false;
  const finalize = (): void => {
    if (settled) return;
    settled = true;
    window.clearTimeout(timeoutId);
    element.removeEventListener('animationend', onAnimationEnd);
    onDone();
  };

  // Only the element's own exit animation finalizes; ignore `animationend`
  // bubbling up from animated content inside it.
  const onAnimationEnd = (event: AnimationEvent): void => {
    if (event.target === element) finalize();
  };

  element.addEventListener('animationend', onAnimationEnd);

  // Safety net if `animationend` never arrives (e.g. the element is torn down early).
  const timeoutId = window.setTimeout(finalize, LEAVE_ANIMATION_FALLBACK_MS);

  // The `--leave` class applies on the next change detection; on the following
  // frame, finalize at once if no animation is running. When motion is enabled
  // the computed `animationName` names the keyframes, so this cannot finalize
  // early. An engine that resolves no animation reports either `none` or an
  // empty string, and both mean the same thing here.
  requestAnimationFrame(() => {
    const animationName = getComputedStyle(element).animationName;
    if (animationName === 'none' || animationName === '') finalize();
  });
}
