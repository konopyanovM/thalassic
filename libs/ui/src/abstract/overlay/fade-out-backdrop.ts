import { Renderer2 } from '@angular/core';

/**
 * Fades a modal overlay's backdrop out alongside the surface's own exit, rather
 * than leaving it at full strength until the overlay is disposed and it vanishes
 * in a single frame. The fade is the stylesheet's backdrop transition, so it
 * follows the motion level like the rest of the exit. Written inline because a
 * drag may already have left an inline opacity on the backdrop, which no
 * stylesheet rule could override, and may have suspended its transition inline.
 */
export function fadeOutBackdrop(backdrop: HTMLElement | null, renderer: Renderer2): void {
  if (backdrop === null) return;

  renderer.removeStyle(backdrop, 'transition');
  renderer.setStyle(backdrop, 'opacity', '0');
}
