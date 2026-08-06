import {
  Component,
  computed,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  numberAttribute,
  Signal
} from '@angular/core';
import { controlSize } from '../../types';
import { PROGRESS_CONFIG } from './progress.token';
import { progressActiveSegment, progressColor } from './progress.types';

/**
 * A read-only linear progress indicator. Renders one continuous bar by
 * default; `segments` splits the track into that many discrete pills that fill
 * in order as the value advances — the idiom for step-based flows ("step 2 of
 * 6"). The host carries the `progressbar` role and the value ARIA.
 */
@Component({
  selector: 'tls-progress',
  imports: [],
  templateUrl: './progress.html',
  styleUrl: './progress.scss',
  host: {
    role: 'progressbar',
    '[class]': 'hostClasses()',
    'aria-valuemin': '0',
    '[attr.aria-valuemax]': 'max()',
    '[attr.aria-valuenow]': 'clampedValue()',
    '[attr.aria-label]': 'ariaLabel() ?? null',
    '[attr.aria-labelledby]': 'ariaLabelledby() ?? null',
  },
})
export class Progress {
  // Injections
  private readonly _config = inject(PROGRESS_CONFIG);

  // Inputs
  public readonly value: InputSignalWithTransform<number, unknown> = input<number, unknown>(0, {
    transform: numberAttribute,
  });
  public readonly max: InputSignalWithTransform<number, unknown> = input<number, unknown>(
    this._config.max,
    { transform: numberAttribute },
  );

  /**
   * Splits the track into this many equal segments, filled one after another
   * as the value grows, the segment at the boundary partially. `null` renders
   * one continuous bar.
   */
  public readonly segments: InputSignal<number | null> = input<number | null>(null);

  /**
   * Segment rendered wider than the rest, marking the step in progress: a
   * zero-based index, or `'latest'` to follow the frontmost segment the value
   * has reached. `null` keeps every segment the same width. Only meaningful
   * with `segments`.
   */
  public readonly activeSegment: InputSignal<progressActiveSegment> =
    input<progressActiveSegment>(null);

  /** Width of the active segment relative to the others (a flex-grow ratio). */
  public readonly activeSegmentScale: InputSignalWithTransform<number, unknown> = input<
    number,
    unknown
  >(this._config.activeSegmentScale, { transform: numberAttribute });

  public readonly color: InputSignal<progressColor> = input<progressColor>(this._config.color);
  public readonly size: InputSignal<controlSize> = input<controlSize>(this._config.size);

  /** Accessible name for the progressbar. */
  public readonly ariaLabel = input<string | undefined>(undefined);
  public readonly ariaLabelledby = input<string | undefined>(undefined);

  // Computed
  protected readonly hostClasses = computed(() => {
    const className = 'tls-progress';

    const array: string[] = [className];

    array.push(`${className}--${this.color()}`);
    array.push(`${className}--${this.size()}`);

    return array;
  });

  /** Value clamped into [0, max]; the number exposed through ARIA. */
  protected readonly clampedValue: Signal<number> = computed<number>(() =>
    Math.min(Math.max(this.value(), 0), this.max()),
  );

  /** Filled share of the whole track, 0–1. */
  private readonly _fraction: Signal<number> = computed<number>(() => {
    const max = this.max();
    if (max <= 0) return 0;

    return this.clampedValue() / max;
  });

  /**
   * Per-segment fill percentages, 0–100. A continuous bar is a single
   * segment, so one loop renders both looks; in segmented mode the overall
   * fraction is distributed across the segments in order, so each is full,
   * empty, or — at the boundary — partial.
   */
  protected readonly segmentFills: Signal<number[]> = computed<number[]>(() => {
    const segments = this.segments();
    const fraction = this._fraction();

    if (segments === null || segments < 2) return [fraction * 100];

    const count = Math.floor(segments);

    return Array.from(
      { length: count },
      (_, index) => Math.min(Math.max(fraction * count - index, 0), 1) * 100,
    );
  });

  /**
   * Index of the emphasized segment, or `null` when none: the clamped
   * consumer-picked index, or — for `'latest'` — the frontmost segment the
   * value has reached (the first one when nothing is filled yet).
   */
  protected readonly activeIndex: Signal<number | null> = computed<number | null>(() => {
    const activeSegment = this.activeSegment();
    if (activeSegment === null) return null;

    const count = this.segmentFills().length;
    if (count < 2) return null;

    const index =
      activeSegment === 'latest'
        ? Math.ceil(this._fraction() * count) - 1
        : Math.floor(activeSegment);

    return Math.min(Math.max(index, 0), count - 1);
  });
}
