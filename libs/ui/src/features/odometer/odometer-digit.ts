import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  InputSignal,
  Signal,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import { MotionService } from '@thalassic/core';
import { ODOMETER_DIGIT_REPETITIONS, ODOMETER_DIGITS_PER_REPETITION } from './odometer.constants';
import { odometerDirection } from './odometer.types';

/**
 * A single rolling digit column of {@link Odometer}. Renders a vertical strip of
 * digits and translates it so the current value sits in the viewport; a change
 * animates the translation, so the digit appears to roll through the values
 * between the old and the new one around the `0-9` wheel, in the configured
 * direction and with any extra full turns.
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
      @for (value of strip(); track $index) {
        <span class="tls-odometer-digit__cell">{{ value }}</span>
      }
    </span>
  `,
  host: {
    class: 'tls-odometer-digit',
    '[style.--tls-odometer-duration.ms]': 'duration()',
    '[style.--tls-odometer-delay.ms]': 'delay()',
  },
})
export class OdometerDigit {
  // Injections
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);
  private readonly _motionService: MotionService | null = inject(MotionService, {
    optional: true,
  });

  // Inputs
  public readonly digit: InputSignal<number> = input.required<number>();
  public readonly duration: InputSignal<number> = input.required<number>();
  public readonly delay: InputSignal<number> = input.required<number>();
  public readonly animated: InputSignal<boolean> = input.required<boolean>();
  public readonly revolutions: InputSignal<number> = input.required<number>();
  public readonly direction: InputSignal<odometerDirection> = input.required<odometerDirection>();
  public readonly rollIn: InputSignal<boolean> = input.required<boolean>();

  // State
  /**
   * Whether the translation transition is armed. Disabled while re-centring so
   * the invisible jump between repetitions never animates.
   */
  protected readonly animating: WritableSignal<boolean> = signal(false);

  /**
   * Rows the strip sits away from its centre. The centre holds a `0`, so at
   * rest this is the digit in the viewport; mid-roll it runs past the wheel's
   * ends into the repetitions on either side.
   */
  private readonly _shift: WritableSignal<number> = signal(0);

  /**
   * Digit currently settled in the viewport, tracked to derive the roll direction.
   */
  private _currentDigit = 0;
  /** Whether the column has received its first digit. */
  private _initialized = false;
  /**
   * The frame that will start a pending roll. A newer value cancels it, so a
   * roll queued for a value already replaced never lands on top of it.
   */
  private _pendingFrame: number | null = null;

  // Computed
  /**
   * The stacked digits of the column, from top to bottom: the `0-9` wheel
   * repeated so a roll, full turns included, never runs off either end.
   */
  protected readonly strip: Signal<number[]> = computed(() =>
    Array.from(
      {
        length: (ODOMETER_DIGIT_REPETITIONS + 2 * this._turns()) * ODOMETER_DIGITS_PER_REPETITION,
      },
      (_unused, index) => index % ODOMETER_DIGITS_PER_REPETITION,
    ),
  );

  /** Row the strip is translated to: its centre plus the current shift. */
  protected readonly offset: Signal<number> = computed(() => this._center() + this._shift());

  /**
   * Row of the `0` that starts the middle repetition. Every roll re-centres
   * here first, which leaves a full repetition plus one per turn of room in
   * either direction.
   */
  private readonly _center: Signal<number> = computed(
    () => (this._turns() + 1) * ODOMETER_DIGITS_PER_REPETITION,
  );

  /**
   * Full turns a roll makes before it lands. Extra turns are expressive rather
   * than informative, so they play only at the `full` motion level; below it a
   * roll still takes its direct path to the new digit.
   */
  private readonly _turns: Signal<number> = computed(() =>
    this._isFullMotion() ? Math.max(0, Math.floor(this.revolutions())) : 0,
  );

  /** Whether the user's motion level allows expressive motion; full when no service is provided. */
  private readonly _isFullMotion: Signal<boolean> = computed(() => {
    if (!this._motionService) return true;
    return this._motionService.currentMotionLevel() === 'full';
  });

  // Constructor
  constructor() {
    effect(() => {
      const target = this.digit();
      untracked(() => this._roll(target));
    });

    this._destroyRef.onDestroy(() => this._cancelPendingFrame());
  }

  // Private methods
  /**
   * Rolls to a new digit. The first digit paints in place, unless the column
   * rolls in, which is entrance motion and so plays only at the `full` level:
   * the wheel then starts from `0` and every column rolls, even one landing on
   * the `0` it started from, as long as it has turns to make.
   */
  private _roll(target: number): void {
    const isFirst = !this._initialized;
    this._initialized = true;

    const rollsIn = isFirst && this.rollIn() && this._isFullMotion();
    if (isFirst && !rollsIn) {
      this._settle(target);
      return;
    }

    const turns = this._turns();
    if (target === this._currentDigit && (!rollsIn || turns === 0)) return;

    this._cancelPendingFrame();

    // Read as this value arrives, so a roll already under way plays out when
    // rolling is switched off for the values after it.
    if (!this.animated()) {
      this._settle(target);
      return;
    }

    const base = this._currentDigit;
    const delta = this._delta(this._currentDigit, target, turns);
    this._currentDigit = target;

    // Re-centre onto the middle repetition without motion, then roll on the
    // next frame. The re-centre keeps the same digit under the viewport, so the
    // jump is invisible while guaranteeing room to travel.
    this.animating.set(false);
    this._shift.set(base);

    this._pendingFrame = requestAnimationFrame(() => {
      this._pendingFrame = requestAnimationFrame(() => {
        this._pendingFrame = null;
        this.animating.set(true);
        this._shift.set(base + delta);
      });
    });
  }

  /** Shows a digit in place, with the transition disarmed. */
  private _settle(target: number): void {
    this._currentDigit = target;
    this.animating.set(false);
    this._shift.set(target);
  }

  /** Cancels a roll still waiting for its frame. */
  private _cancelPendingFrame(): void {
    if (this._pendingFrame === null) return;

    cancelAnimationFrame(this._pendingFrame);
    this._pendingFrame = null;
  }

  /**
   * Signed number of rows to travel from `from` to `to` around the `0-9` wheel
   * in the configured direction, plus `turns` full turns the same way. Positive
   * rolls up (9→0), negative rolls down (0→9). A roll with no arc of its own
   * and turns to make turns down when the direction is `down`, otherwise up.
   */
  private _delta(from: number, to: number, turns: number): number {
    const direction = this.direction();
    const upward =
      (((to - from) % ODOMETER_DIGITS_PER_REPETITION) + ODOMETER_DIGITS_PER_REPETITION) %
      ODOMETER_DIGITS_PER_REPETITION;

    let arc: number;
    if (direction === 'up') {
      arc = upward;
    } else if (direction === 'down') {
      arc = upward === 0 ? 0 : upward - ODOMETER_DIGITS_PER_REPETITION;
    } else {
      arc = this._shortestDelta(from, to);
    }

    const turnsDown = arc < 0 || (arc === 0 && direction === 'down');
    const turnRows = turns * ODOMETER_DIGITS_PER_REPETITION;

    return arc + (turnsDown ? -turnRows : turnRows);
  }

  /**
   * Signed number of rows to travel from `from` to `to` around the `0-9` wheel,
   * taking the shorter arc (range `[-5, 5]`). Positive rolls up (9→0), negative
   * rolls down (0→9).
   */
  private _shortestDelta(from: number, to: number): number {
    const half = ODOMETER_DIGITS_PER_REPETITION / 2;
    let delta = (to - from) % ODOMETER_DIGITS_PER_REPETITION;

    if (delta > half) delta -= ODOMETER_DIGITS_PER_REPETITION;
    if (delta < -half) delta += ODOMETER_DIGITS_PER_REPETITION;

    return delta;
  }
}
