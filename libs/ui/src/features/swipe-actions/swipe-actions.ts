import { Directionality } from '@angular/cdk/bidi';
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  ElementRef,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  TemplateRef,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { PanDirective, PanEvent } from '@thalassic/core';
import { color } from '../../types';
import { SWIPE_ACTIONS_CONFIG } from './swipe-actions.token';

/**
 * Swipeable row: dragging the projected content sideways reveals a colored
 * action panel behind it, and releasing past the commit threshold — or
 * flicking — fires that side's action. Releasing earlier snaps the row back.
 *
 * A side takes part only when its template is projected: `#startAction` is
 * revealed by dragging the content toward inline-end, `#endAction` by dragging
 * toward inline-start; both resolve against the layout direction. Projected
 * content is the consumer's to style — the panel only centres it. Whether
 * releasing would commit is exposed twice for the content to react to: the
 * `tls-swipe-actions__panel--armed` class on the revealed panel (for CSS
 * choreography — an icon pop, a label reveal) and the `armedChanged` output
 * (for behaviour — a haptic tick). Actions
 * committed by swipe must never be the only path to the behaviour — the
 * gesture is invisible and unavailable to keyboards and assistive tech, so a
 * visible control (a button, a menu item) has to offer the same actions.
 *
 * Vertical scrolling stays native: the gesture claims only the horizontal
 * axis, waits out the pan slop, and yields to any scrollable ancestor with
 * room to travel (see {@link PanDirective}).
 */
@Component({
  selector: 'tls-swipe-actions',
  imports: [NgTemplateOutlet, PanDirective],
  templateUrl: './swipe-actions.html',
  host: {
    class: 'tls-swipe-actions',
    '[class.tls-swipe-actions--dragging]': 'dragging()',
    // Published for the theme: panel content sits in a slot capped at the
    // nominal reveal, pinned to the outer edge, so an overdrag stretches the
    // panel without dragging the content inward with it.
    '[style.--tls-swipe-actions-reveal]': 'revealWidth() + "px"',
  },
})
export class SwipeActions {
  // Injections
  private readonly _config = inject(SWIPE_ACTIONS_CONFIG);
  private readonly _directionality = inject(Directionality);

  // View children
  private readonly contentElement =
    viewChild.required<ElementRef<HTMLElement>>('content');
  private readonly startPanel = viewChild<ElementRef<HTMLElement>>('startPanel');
  private readonly endPanel = viewChild<ElementRef<HTMLElement>>('endPanel');

  // Content children
  protected readonly startActionTemplate = contentChild<TemplateRef<unknown>>('startAction');
  protected readonly endActionTemplate = contentChild<TemplateRef<unknown>>('endAction');

  // Inputs
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });
  /** Fill of the panel behind the inline-start edge. */
  public readonly startColor: InputSignal<color> = input<color>('primary');
  /** Fill of the panel behind the inline-end edge. */
  public readonly endColor: InputSignal<color> = input<color>('tertiary');
  public readonly revealWidth: InputSignal<number> = input<number>(this._config.revealWidth);
  public readonly overdrag: InputSignal<number> = input<number>(this._config.overdrag);
  public readonly commitThreshold: InputSignal<number> = input<number>(
    this._config.commitThreshold,
  );
  public readonly flickVelocity: InputSignal<number> = input<number>(this._config.flickVelocity);
  public readonly pointerTypes: InputSignal<readonly string[] | null> = input<
    readonly string[] | null
  >(this._config.pointerTypes);

  // Outputs
  /** The start-side action was committed (content dragged toward inline-end). */
  public readonly startCommitted: OutputEmitterRef<void> = output<void>();
  /** The end-side action was committed (content dragged toward inline-start). */
  public readonly endCommitted: OutputEmitterRef<void> = output<void>();
  /**
   * Whether releasing right now would commit the revealed action. Fires on
   * every change of that answer during a drag — the hook for a haptic tick on
   * arming — and always ends `false` when the gesture ends.
   */
  public readonly armedChanged: OutputEmitterRef<boolean> = output<boolean>();

  // State
  protected readonly dragging: WritableSignal<boolean> = signal(false);
  // Travel already spent crossing the pan slop when the gesture locked. Deltas
  // are rebased against it so the reveal grows from zero at the lock point
  // instead of jumping by the slop the moment the first move lands.
  private _lockDelta = 0;
  // Whether the current reveal has passed the commit threshold. Written from
  // the move stream, so the DOM class rides along directly (see _applyOffset).
  private _armed = false;

  // Computed
  protected readonly panEnabled: Signal<boolean> = computed(() => {
    if (this.disabled()) return false;
    return Boolean(this.startActionTemplate()) || Boolean(this.endActionTemplate());
  });

  // Protected methods
  protected onPanStart(event: PanEvent): void {
    this._lockDelta = event.deltaX;
    this.dragging.set(true);
  }

  /**
   * Fired outside the Angular zone at pointer rate (see {@link PanDirective}),
   * so the reveal is written straight to the DOM rather than through bindings.
   */
  protected onPanMove(event: PanEvent): void {
    this._applyOffset(
      this._clampOffset((event.deltaX - this._lockDelta) * this._logicalFactor()),
    );
  }

  protected onPanEnd(event: PanEvent): void {
    const factor = this._logicalFactor();
    const offset = this._clampOffset((event.deltaX - this._lockDelta) * factor);
    const velocity = event.velocityX * factor;

    if (offset > 0 && this._commits(offset, velocity)) {
      this.startCommitted.emit();
    } else if (offset < 0 && this._commits(-offset, -velocity)) {
      this.endCommitted.emit();
    }

    this._settle();
  }

  protected onPanCancel(): void {
    this._settle();
  }

  // Private methods
  private _commits(reveal: number, velocity: number): boolean {
    return reveal >= this.commitThreshold() || velocity >= this.flickVelocity();
  }

  /** Snaps the row shut; leaving the dragging state re-enables the transitions. */
  private _settle(): void {
    this.dragging.set(false);
    // The dragging class suppresses the settle transition, and its removal only
    // reaches the DOM with the next render pass — resetting the transform in
    // the same task races that recalc and can land with transitions still off
    // (reliably so in WebKit, where the snap-back then jumps). Two frames
    // guarantee a committed style with transitions re-enabled before the
    // travel back starts.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        // A gesture that restarted meanwhile owns the offset again.
        if (this.dragging()) return;
        this._applyOffset(0);
      }),
    );
  }

  /** Maps a physical horizontal delta onto the logical axis: `1` in LTR, `-1` in RTL. */
  private _logicalFactor(): number {
    return this._directionality.value === 'rtl' ? -1 : 1;
  }

  /**
   * A side with no action projected refuses to open at all. Travel past the
   * full reveal rubber-bands: the overshoot is damped along `L·o / (o + L)`,
   * whose slope is exactly 1 at the boundary — the hand-off from linear
   * tracking into resistance has no corner to feel — and which saturates at
   * the `overdrag` allowance instead of following the finger.
   */
  private _clampOffset(offset: number): number {
    const startMax = this.startActionTemplate() ? this.revealWidth() : 0;
    const endMax = this.endActionTemplate() ? this.revealWidth() : 0;

    if (offset > startMax) return startMax + this._damp(offset - startMax);
    if (offset < -endMax) return -endMax - this._damp(-endMax - offset);
    return offset;
  }

  private _damp(overshoot: number): number {
    const allowance = this.overdrag();
    if (allowance <= 0) return 0;
    return (allowance * overshoot) / (overshoot + allowance);
  }

  private _applyOffset(offset: number): void {
    const factor = this._logicalFactor();
    this.contentElement().nativeElement.style.transform = `translateX(${offset * factor}px)`;

    const startPanel = this.startPanel();
    if (startPanel) startPanel.nativeElement.style.width = `${Math.max(0, offset)}px`;

    const endPanel = this.endPanel();
    if (endPanel) endPanel.nativeElement.style.width = `${Math.max(0, -offset)}px`;

    this._updateArmed(offset);
  }

  /**
   * Tracks whether releasing at this reveal would commit, mirroring the answer
   * onto the panels as a class and onto `armedChanged`. Both writes bypass
   * bindings: this runs on the move stream, outside the Angular zone.
   */
  private _updateArmed(offset: number): void {
    const armed = Math.abs(offset) >= this.commitThreshold();
    if (armed === this._armed) return;
    this._armed = armed;

    // Disarming clears both panels: the offset may already have crossed zero
    // (or been settled there), no longer naming the side that was armed.
    const startPanel = this.startPanel();
    if (startPanel) {
      startPanel.nativeElement.classList.toggle(
        'tls-swipe-actions__panel--armed',
        armed && offset > 0,
      );
    }
    const endPanel = this.endPanel();
    if (endPanel) {
      endPanel.nativeElement.classList.toggle(
        'tls-swipe-actions__panel--armed',
        armed && offset < 0,
      );
    }
    this.armedChanged.emit(armed);
  }
}
