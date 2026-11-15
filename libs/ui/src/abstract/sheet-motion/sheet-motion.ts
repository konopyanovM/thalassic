import { RendererStyleFlags2, signal } from '@angular/core';
import { settleAfterRender } from '../overlay';
import { settleCurve } from './settle-curve';
import { SETTLE_DURATION_PROPERTY, SETTLE_EASING_PROPERTY } from './sheet-motion.constants';
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
  /**
   * Incremented by begin and rest; a settle belongs to the gesture that started it.
   */
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
    // Both track the finger for the drag's duration, so their transitions —
    // which exist to animate the settle — must not lag it. Set inline rather
    // than left to the `--dragging` class, which renders a frame later: the
    // first offset the drag writes would otherwise start a transition of its
    // own, from wherever a settle caught mid-flight had got to.
    this._options.renderer.setStyle(surface.panel, 'transition', 'none');
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
   * `velocity` is the surface's speed at the start, in px/ms along the offset
   * (positive as the offset grows) — a released finger's. The settle's timing
   * goes onto the surface and its scrim as `--tls-settle-duration` and
   * `--tls-settle-easing` (see `settleCurve`), for a settle transition to
   * read, so the stylesheet keeps the motion's gating while the curve carries
   * the hand's momentum on.
   *
   * A `begin` or `rest` that arrives before the settle finishes supersedes it:
   * a superseded settle neither moves the surface nor reports `done`.
   */
  public settle(target: number, done: () => void, velocity = 0): void {
    const surface = this._surface;
    const gesture = this._gesture;
    if (surface === null) return;

    this._state.set('settling');
    this._options.renderer.removeStyle(surface.panel, 'transition');
    if (surface.backdrop !== null)
      this._options.renderer.removeStyle(surface.backdrop, 'transition');

    // Marked by the gesture counter rather than the surface: a caller that
    // reuses one surface object across gestures must still be able to supersede.
    settleAfterRender(
      this._options.injector,
      surface.panel,
      () => {
        if (this._gesture !== gesture) return;
        // The curve goes on in the same style change as the target, so the
        // transition the target starts is timed by it.
        this._writeCurve(surface, target, velocity);
        this._write(surface, target);
      },
      () => {
        if (this._gesture === gesture) done();
      },
    );
  }

  /**
   * A settle from rest with no drag: takes hold of `surface` and settles it to
   * `target` in one step, for a change asked by a click, a key or code rather
   * than a finger. Supersedes a running settle the way a `begin` does.
   */
  public moveTo(surface: SheetMotionSurface, target: number, done: () => void): void {
    this.begin(surface);
    this.settle(target, done);
  }

  /**
   * Lets go of the surface; the transform is the stylesheet's again. The
   * settle's timing comes off with it, so a transition that outlives the
   * gesture — a scrim's fade on close — keeps the stylesheet's own pace rather
   * than the curve of the last settle.
   */
  public rest(): void {
    const surface = this._surface;
    this._gesture += 1;
    this._surface = null;
    this._state.set('idle');
    if (surface === null) return;

    for (const element of [surface.panel, surface.backdrop]) {
      if (element === null) continue;
      this._options.renderer.removeStyle(
        element,
        SETTLE_DURATION_PROPERTY,
        RendererStyleFlags2.DashCase,
      );
      this._options.renderer.removeStyle(
        element,
        SETTLE_EASING_PROPERTY,
        RendererStyleFlags2.DashCase,
      );
    }
  }

  // Private methods
  /**
   * Writes the timing of a settle to `target` onto the surface and its scrim.
   * The travel starts from the offset last written inline, which is where a
   * released drag left the surface; a settle that supersedes another starts
   * from the other's target, and the browser's own retargeting of the running
   * transition covers the difference.
   */
  private _writeCurve(surface: SheetMotionSurface, target: number, velocity: number): void {
    const { property, renderer } = this._options;
    const written = Number.parseFloat(surface.panel.style.getPropertyValue(property));
    const from = Number.isNaN(written) ? target : written;
    const { duration, easing } = settleCurve(target - from, velocity);

    for (const element of [surface.panel, surface.backdrop]) {
      if (element === null) continue;
      renderer.setStyle(
        element,
        SETTLE_DURATION_PROPERTY,
        `${duration}ms`,
        RendererStyleFlags2.DashCase,
      );
      renderer.setStyle(element, SETTLE_EASING_PROPERTY, easing, RendererStyleFlags2.DashCase);
    }
  }

  /**
   * Only the backdrop's progress is clamped to the extent; the offset itself
   * is written unclamped.
   */
  private _write(surface: SheetMotionSurface, offset: number): void {
    const { property, backdropOpacity, renderer } = this._options;
    renderer.setStyle(surface.panel, property, `${offset}px`, RendererStyleFlags2.DashCase);

    if (surface.backdrop === null) return;
    const progress = surface.extent > 0 ? Math.min(1, Math.max(0, offset / surface.extent)) : 0;
    renderer.setStyle(surface.backdrop, 'opacity', `${backdropOpacity(progress)}`);
  }
}
