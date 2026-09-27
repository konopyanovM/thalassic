import { Injector, Renderer2 } from '@angular/core';

/**
 * Where a dragged surface's transform comes from. `idle` leaves it to the
 * stylesheet's enter/leave keyframes; `dragging` hands it to the finger;
 * `settling` animates it to where the release sent it.
 */
export type sheetMotionState = 'idle' | 'dragging' | 'settling';

/** What a `SheetMotion` is fixed to for its lifetime. */
export interface SheetMotionOptions {
  /** The custom property the stylesheet turns into the surface's translate. */
  property: string;
  /**
   * Opacity of the scrim at a drag progress: `1 - progress` for a surface that
   * dims as it leaves, `progress` for one that dims as it grows.
   */
  backdropOpacity: (progress: number) => number;
  renderer: Renderer2;
  injector: Injector;
}

/**
 * The elements one gesture moves, given per gesture: a surface stamped fresh on
 * every open cannot be fixed at construction.
 */
export interface SheetMotionSurface {
  panel: HTMLElement;
  backdrop: HTMLElement | null;
  /** Travel in px from rest to fully committed. */
  extent: number;
}
