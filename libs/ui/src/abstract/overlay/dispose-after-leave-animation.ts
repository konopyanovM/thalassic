import { OverlayRef } from '@angular/cdk/overlay';
import { whenAnimationsFinish } from './when-animations-finish';

/**
 * Disposes a detached overlay once the panel's exit animation has finished, so
 * the pane is not torn down while `animate.leave` is still playing. Disposes at
 * once when no animation runs (e.g. the `none` motion level).
 *
 * Shared by every surface that detaches a pane to let the exit animation play
 * (connected overlays, confirm, tooltip).
 */
export function disposeAfterLeaveAnimation(overlayRef: OverlayRef): void {
  const paneElement = overlayRef.overlayElement;
  if (!paneElement) {
    overlayRef.dispose();
    return;
  }

  // The exit plays on the content leaving the pane, not on the pane itself, and
  // starts once the detach has run its leave hooks on the next change
  // detection — so the whole subtree is read in a task queued behind that tick
  // (not a frame, which never comes in a hidden tab).
  setTimeout(() => {
    void whenAnimationsFinish(paneElement, { subtree: true }).then(() => overlayRef.dispose());
  });
}
