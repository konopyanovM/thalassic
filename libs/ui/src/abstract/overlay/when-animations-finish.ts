/**
 * Resolves once every animation and transition currently running on the element
 * — or within it, with `subtree` — has finished, as the Web Animations API
 * reports it. Waiting on each animation's own `finished` promise follows the
 * animation's real clock: a long exit, a slowed-down playback rate or a janky
 * first frame all wait as long as the motion actually takes, where a fixed
 * timeout would cut it short.
 *
 * Settles at once when nothing is running (the `none` motion level) or where the
 * API is missing, and settles as well when an animation is cancelled — which is
 * what tearing its element down does — so a caller is never left waiting. Only
 * animations actually playing are waited on: one that is paused, or never ends
 * (a spinner inside a panel), would otherwise hold the caller forever.
 *
 * Read the element only after the exit has been put in place: an animation is
 * only reported once the styles that start it apply.
 */
export function whenAnimationsFinish(
  element: Element,
  options?: GetAnimationsOptions,
): Promise<void> {
  if (typeof element.getAnimations !== 'function') return Promise.resolve();

  const running = element
    .getAnimations(options)
    .filter(animation => {
      const effect = animation.effect;
      return (
        animation.playState === 'running' &&
        effect !== null &&
        Number.isFinite(effect.getComputedTiming().endTime)
      );
    });

  return Promise.allSettled(running.map(animation => animation.finished)).then(() => undefined);
}
