import { RendererStyleFlags2, signal } from '@angular/core';
import { settleAfterRender } from '../overlay';
import { SheetMotionOptions, SheetMotionSurface, sheetMotionState } from './sheet-motion.types';

/**
 * Moves a dragged surface along one axis: writes its displacement to the
 * custom property the stylesheet turns into a translate, keeps a scrim's
 * opacity in step with the drag, and settles the surface to where a release
 * sent it through the stylesheet's transition.
 *
 * The engine knows nothing of what the offsets mean — where rest is, what
 * range is legal, which release commits — and no pan events; the owning
 * component maps its gesture onto `begin`, `follow` and `settle`.
 */
export class SheetMotion {
  // State
  private readonly _state = signal<sheetMotionState>('idle');
  /** Bound to the surface's `--dragging` / `--settling` classes. */
  public readonly state = this._state.asReadonly();
  private _surface: SheetMotionSurface | null = null;
  // Incremented by begin and rest; a settle belongs to the gesture that started it.
  private _gesture = 0;

  constructor(private readonly _options: SheetMotionOptions) {}

  // Public methods
  /** Travel in px of the gesture in progress, from rest to fully committed; 0 outside a gesture. */
  public get extent(): number {
    return this._surface === null ? 0 : this._surface.extent;
  }

  /** Takes hold of the surface for one gesture. */
  public begin(surface: SheetMotionSurface): void {
    this._gesture += 1;
    this._surface = surface;
    this._state.set('dragging');
    // The backdrop tracks the finger for the drag's duration, so its own
    // transition — which exists to animate the settle — must not lag it.
    if (surface.backdrop !== null) {
      this._options.renderer.setStyle(surface.backdrop, 'transition', 'none');
    }
  }

  /**
   * Moves the surface to `offset` px. The offset is written as given: what
   * range is legal is the caller's rule.
   */
  public follow(offset: number): void {
    const surface = this._surface;
    if (surface === null) return;
    this._write(surface, offset);
  }

  /**
   * Animates the surface to `target` px through the stylesheet's settle
   * transition, then calls `done`. The state stays `settling` until `rest` is
   * called: a settle that ends in a dispose keeps its class on until the
   * overlay is gone, so the keyframe the class stands down cannot replay.
   *
   * A `begin` or `rest` that arrives before the settle finishes supersedes it:
   * a superseded settle neither moves the surface nor reports `done`.
   */
  public settle(target: number, done: () => void): void {
    const surface = this._surface;
    const gesture = this._gesture;
    if (surface === null) return;

    this._state.set('settling');
    if (surface.backdrop !== null) this._options.renderer.removeStyle(surface.backdrop, 'transition');

    // Marked by the gesture counter rather than the surface: a caller that
    // reuses one surface object across gestures must still be able to supersede.
    settleAfterRender(
      this._options.injector,
      surface.panel,
      () => {
        if (this._gesture === gesture) this._write(surface, target);
      },
      () => {
        if (this._gesture === gesture) done();
      },
    );
  }

  /** Lets go of the surface; the transform is the stylesheet's again. */
  public rest(): void {
    this._gesture += 1;
    this._surface = null;
    this._state.set('idle');
  }

  // Private methods
  // Only the backdrop's progress is clamped to the extent; the offset itself
  // is written unclamped.
  private _write(surface: SheetMotionSurface, offset: number): void {
    const { property, backdropOpacity, renderer } = this._options;
    renderer.setStyle(surface.panel, property, `${offset}px`, RendererStyleFlags2.DashCase);

    if (surface.backdrop === null) return;
    const progress = surface.extent > 0 ? Math.min(1, Math.max(0, offset / surface.extent)) : 0;
    renderer.setStyle(surface.backdrop, 'opacity', `${backdropOpacity(progress)}`);
  }
}
