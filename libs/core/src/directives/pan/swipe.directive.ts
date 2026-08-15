import { Directive, inject, input, InputSignal, output } from '@angular/core';
import { SWIPE_DEFAULT_MIN_DISTANCE, SWIPE_DEFAULT_MIN_VELOCITY } from './pan.constants';
import { PanDirective } from './pan.directive';
import { PanEvent, SwipeEvent } from './pan.types';

/**
 * Sugar over {@link PanDirective} for consumers that only care that a swipe
 * happened, not about live tracking. A released pan commits as a swipe when it
 * travelled `minDistance` px **or** its dominant-axis release velocity reached
 * `minVelocity` px/ms (a short flick).
 *
 * The bare `tlsSwipe` attribute enables the gesture; bind `[tlsSwipe]="false"`
 * to disable. `axis`, `threshold`, `edge`, `edgeSize`, `pointerTypes` and
 * `manageTouchAction` are forwarded to the underlying pan.
 */
@Directive({
  selector: '[tlsSwipe]',
  hostDirectives: [
    {
      directive: PanDirective,
      inputs: [
        'tlsPan: tlsSwipe',
        'axis',
        'threshold',
        'edge',
        'edgeSize',
        'pointerTypes',
        'manageTouchAction',
      ],
    },
  ],
})
export class SwipeDirective {
  // Injections
  private readonly _pan = inject(PanDirective);

  // Inputs
  /** Minimum travel in px for a released pan to commit as a swipe. */
  public readonly minDistance: InputSignal<number> = input<number>(SWIPE_DEFAULT_MIN_DISTANCE);
  /** Minimum dominant-axis release velocity in px/ms that commits regardless of distance. */
  public readonly minVelocity: InputSignal<number> = input<number>(SWIPE_DEFAULT_MIN_VELOCITY);

  // Outputs
  /** Emits once per gesture, when the released pan qualifies as a swipe. */
  public readonly swipe = output<SwipeEvent>();

  constructor() {
    this._pan.panEnd.subscribe(panEvent => this._onPanEnd(panEvent));
  }

  // Private methods
  private _onPanEnd(panEvent: PanEvent): void {
    const isHorizontal = panEvent.direction === 'left' || panEvent.direction === 'right';
    const dominantVelocity = Math.abs(isHorizontal ? panEvent.velocityX : panEvent.velocityY);

    const committed =
      panEvent.distance >= this.minDistance() || dominantVelocity >= this.minVelocity();
    if (!committed) return;

    this.swipe.emit({
      direction: panEvent.direction,
      logicalDirection: panEvent.logicalDirection,
      distance: panEvent.distance,
      velocityX: panEvent.velocityX,
      velocityY: panEvent.velocityY,
      pointerType: panEvent.pointerType,
      originalEvent: panEvent.originalEvent,
    });
  }
}
