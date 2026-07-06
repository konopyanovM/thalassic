import { Component, effect, input, InputSignal, signal, untracked, WritableSignal } from '@angular/core';
import {
  ODOMETER_CENTER_OFFSET,
  ODOMETER_DIGITS_PER_REPETITION,
  ODOMETER_STRIP,
} from './odometer.constants';

/**
 * A single rolling digit column of {@link Odometer}. Renders a vertical strip of
 * digits and translates it so the current value sits in the viewport; a change
 * animates the translation, so the digit appears to roll through the values
 * between the old and the new one — always by the shortest path around the
 * `0-9` wheel.
 *
 * Internal to {@link Odometer}; not part of the public component surface.
 */
@Component({
  selector: 'tls-odometer-digit',
  imports: [],
  template: `
    <span
      class="tls-odometer-digit__strip"
      [class.tls-odometer-digit__strip--animate]="animating()"
      [style.--tls-odometer-offset]="offset()"
    >
      @for (value of strip; track $index) {
        <span class="tls-odometer-digit__cell">{{ value }}</span>
      }
    </span>
  `,
  host: {
    class: 'tls-odometer-digit',
    '[style.--tls-odometer-duration.ms]': 'duration()',
  },
})
export class OdometerDigit {
  // Inputs
  public readonly digit: InputSignal<number> = input.required<number>();
  public readonly duration: InputSignal<number> = input.required<number>();

  // State
  protected readonly strip: readonly number[] = ODOMETER_STRIP;

  // Row the strip is translated to. Starts centred on the middle repetition.
  protected readonly offset: WritableSignal<number> = signal(ODOMETER_CENTER_OFFSET);

  // Whether the translation transition is armed. Disabled while re-centring so
  // the invisible jump between repetitions never animates.
  protected readonly animating: WritableSignal<boolean> = signal(false);

  // Digit currently settled in the viewport, tracked to derive the roll direction.
  private _currentDigit = 0;
  private _initialized = false;

  constructor() {
    effect(() => {
      const target = this.digit();
      untracked(() => this._roll(target));
    });
  }

  // Private methods
  private _roll(target: number): void {
    // First value paints in place, without a roll.
    if (!this._initialized) {
      this._currentDigit = target;
      this.offset.set(ODOMETER_CENTER_OFFSET + target);
      this._initialized = true;
      return;
    }

    if (target === this._currentDigit) return;

    const base = ODOMETER_CENTER_OFFSET + this._currentDigit;
    const delta = this._shortestDelta(this._currentDigit, target);
    this._currentDigit = target;

    // Re-centre onto the middle repetition without motion, then roll the short
    // way on the next frame. The re-centre keeps the same digit under the
    // viewport, so the jump is invisible while guaranteeing room to travel.
    this.animating.set(false);
    this.offset.set(base);

    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        this.animating.set(true);
        this.offset.set(base + delta);
      }),
    );
  }

  // Signed number of rows to travel from `from` to `to` around the `0-9` wheel,
  // taking the shorter arc (range `[-5, 5]`). Positive rolls up (9→0), negative
  // rolls down (0→9).
  private _shortestDelta(from: number, to: number): number {
    const half = ODOMETER_DIGITS_PER_REPETITION / 2;
    let delta = (to - from) % ODOMETER_DIGITS_PER_REPETITION;

    if (delta > half) delta -= ODOMETER_DIGITS_PER_REPETITION;
    if (delta < -half) delta += ODOMETER_DIGITS_PER_REPETITION;

    return delta;
  }
}
