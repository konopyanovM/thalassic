import { OverlayRef } from '@angular/cdk/overlay';

// Upper bound for how long to keep a detached pane alive so the panel's
// `animate.leave` can finish. Disposal happens on `animationend`; the timeout
// only fires when no exit animation runs (e.g. the `none` motion level).
const LEAVE_ANIMATION_FALLBACK_MS = 500;

/**
 * Disposes a detached overlay once the panel's exit animation has finished, so
 * the pane is not torn down while `animate.leave` is still playing. Falls back
 * to a timeout when no animation runs (e.g. the `none` motion level).
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

  let settled = false;
  const finalize = (): void => {
    if (settled) return;
    settled = true;
    window.clearTimeout(timeoutId);
    paneElement.removeEventListener('animationend', finalize);
    overlayRef.dispose();
  };

  paneElement.addEventListener('animationend', finalize);
  const timeoutId = window.setTimeout(finalize, LEAVE_ANIMATION_FALLBACK_MS);
}
