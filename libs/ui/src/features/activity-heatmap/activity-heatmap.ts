import { Grid, GridCell, GridRow } from '@angular/aria/grid';
import {
  booleanAttribute,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  numberAttribute,
  output,
  OutputEmitterRef,
  Signal
} from '@angular/core';
import {
  addDays,
  Day,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  startOfDay,
  startOfWeek,
  subMonths
} from 'date-fns';
import { LOCALE_CONFIG, localeFormatOptions } from '../../abstract/locale';
import { color, controlSize } from '../../types';
import { createNowSignal, rotateWeekDays } from '../../utils';
import { TooltipDelegateDirective } from '../tooltip';
import {
  DAY_LABEL_FORMAT,
  DAYS_PER_WEEK,
  MIN_LEVEL_INTENSITY,
  MIN_LEVELS,
  MONTH_LABEL_FORMAT,
  NOW_REFRESH_INTERVAL_MS
} from './activity-heatmap.constants';
import { ACTIVITY_HEATMAP_CONFIG } from './activity-heatmap.token';
import {
  ActivityHeatmapDay,
  ActivityHeatmapEntry,
  ActivityHeatmapMonth,
  ActivityHeatmapRow
} from './activity-heatmap.types';
import { aggregateActivityEntries } from './aggregate-activity-entries';
import { buildActivityMonthSegments } from './build-activity-month-segments';
import { buildActivityThresholds } from './build-activity-thresholds';
import { resolveActivityLevel } from './resolve-activity-level';

/**
 * Calendar heatmap of daily activity: one column per week, one row per weekday, each cell
 * shaded by how much activity its day carries.
 *
 * Cells are deliberately dense — the year-at-a-glance layout is the point — so they fall
 * below the WCAG 2.5.8 target size and rely on that success criterion's essential-presentation
 * exception. Every cell is reachable with the grid's arrow keys and carries its exact total as
 * an accessible name, so the data never depends on either the fill shade or a precise tap.
 */
@Component({
  selector: 'tls-activity-heatmap',
  templateUrl: './activity-heatmap.html',
  imports: [Grid, GridRow, GridCell, TooltipDelegateDirective],
  host: {
    '[class]': 'hostClasses()',
  },
})
export class ActivityHeatmap {
  // Injections
  private readonly _config = inject(ACTIVITY_HEATMAP_CONFIG);
  private readonly _locale = inject(LOCALE_CONFIG);

  // Inputs
  public readonly entries: InputSignal<ActivityHeatmapEntry[]> = input<ActivityHeatmapEntry[]>([]);
  /** First day of the range; defaults to `rangeMonths` before the end of the range. */
  public readonly startDate = input<Date | undefined>(undefined);
  /** Last day of the range; defaults to today. */
  public readonly endDate = input<Date | undefined>(undefined);
  /** Intensity steps including the empty one, so `levels - 1` shades carry activity. */
  public readonly levels: InputSignalWithTransform<number, unknown> = input(this._config.levels, {
    transform: numberAttribute,
  });
  /**
   * Minimum count of each level from 1 upwards, ascending. Left unset the thresholds are
   * derived from the busiest day, so the scale always spans the data.
   */
  public readonly thresholds = input<number[] | undefined>(undefined);
  public readonly weekStartsOn: InputSignal<Day> = input<Day>(this._config.weekStartsOn);
  /** Short weekday labels, Sunday-first; rotated to honour `weekStartsOn`. */
  public readonly weekDays: InputSignal<string[]> = input<string[]>(this._config.weekDays);
  /** Every nth weekday row carries a label; 1 labels all seven, 2 labels every other row. */
  public readonly weekdayLabelInterval: InputSignalWithTransform<number, unknown> = input(
    this._config.weekdayLabelInterval,
    { transform: numberAttribute },
  );
  public readonly color: InputSignal<color> = input<color>(this._config.color);
  public readonly size: InputSignal<controlSize> = input<controlSize>(this._config.size);
  public readonly showMonthLabels: InputSignalWithTransform<boolean, unknown> = input(
    this._config.showMonthLabels,
    { transform: booleanAttribute },
  );
  public readonly showWeekdayLabels: InputSignalWithTransform<boolean, unknown> = input(
    this._config.showWeekdayLabels,
    { transform: booleanAttribute },
  );
  public readonly showLegend: InputSignalWithTransform<boolean, unknown> = input(
    this._config.showLegend,
    { transform: booleanAttribute },
  );
  public readonly showTooltip: InputSignalWithTransform<boolean, unknown> = input(
    this._config.showTooltip,
    { transform: booleanAttribute },
  );
  /** Accessible name for the grid; falls back to the configured label. */
  public readonly ariaLabel = input<string | undefined>(undefined);
  public readonly ariaLabelledby = input<string | undefined>(undefined);

  // Outputs
  /** Emits the activated day; padding days outside the range never emit. */
  public readonly daySelect: OutputEmitterRef<ActivityHeatmapDay> = output<ActivityHeatmapDay>();

  // State
  protected readonly legendLess = this._config.labels.less;
  protected readonly legendMore = this._config.labels.more;
  private readonly _dateOptions = localeFormatOptions(this._locale);
  /** Ticking current time, so the today marker tracks the clock across midnight. */
  private readonly _now = createNowSignal(NOW_REFRESH_INTERVAL_MS);

  // Computed
  /** Steps actually rendered; a heatmap needs an empty step plus at least one active one. */
  protected readonly resolvedLevels: Signal<number> = computed(() =>
    Math.max(MIN_LEVELS, Math.floor(this.levels())),
  );

  protected readonly gridLabel: Signal<string | undefined> = computed(() => {
    if (this.ariaLabelledby()) return undefined;
    return this.ariaLabel() ?? this._config.labels.grid;
  });

  /** Weekday rows, each holding one weekday's cell across every week column. */
  protected readonly rows: Signal<ActivityHeatmapRow[]> = computed(() => {
    const { start, end } = this._range();
    const weekStartsOn = this.weekStartsOn();
    const totals = aggregateActivityEntries(this.entries());
    const today = startOfDay(this._now());

    const days = eachDayOfInterval({
      start: startOfWeek(start, { weekStartsOn }),
      end: endOfWeek(end, { weekStartsOn }),
    });

    const thresholds = this._resolveThresholds(days, totals, start, end);
    const weekdayLabels = rotateWeekDays(this.weekDays(), weekStartsOn);
    const interval = Math.max(1, Math.floor(this.weekdayLabelInterval()));

    const rows: ActivityHeatmapRow[] = weekdayLabels.map((label, index) => ({
      // Sparse labelling starts one row in, mirroring the offset a dense grid reads best with.
      label: (index - 1) % interval === 0 ? label : '',
      days: [],
    }));

    for (let index = 0; index < days.length; index++) {
      const date = days[index];
      const total = totals.get(date.getTime());
      const inRange = date >= start && date <= end;
      const count = total && inRange ? total.count : 0;

      rows[index % DAYS_PER_WEEK].days.push({
        date,
        count,
        level: resolveActivityLevel(count, thresholds),
        inRange,
        isToday: isSameDay(date, today),
        label: inRange
          ? this._config.labels.day(count, format(date, DAY_LABEL_FORMAT, this._dateOptions))
          : this._config.labels.outsideRange,
        data: total && inRange ? total.data : undefined,
      });
    }

    return rows;
  });

  protected readonly weekCount: Signal<number> = computed(() => {
    const rows = this.rows();
    if (rows.length === 0) return 0;
    return rows[0].days.length;
  });

  protected readonly months: Signal<ActivityHeatmapMonth[]> = computed(() => {
    const rows = this.rows();
    if (rows.length === 0) return [];

    // The first row holds one day per week column, and each is that week's first day.
    const weekStarts = rows[0].days.map(day => day.date);

    return buildActivityMonthSegments(weekStarts, date =>
      format(date, MONTH_LABEL_FORMAT, this._dateOptions),
    );
  });

  /** Every intensity step, low to high, for the legend's sample swatches. */
  protected readonly legendLevels: Signal<number[]> = computed(() =>
    Array.from({ length: this.resolvedLevels() }, (unused, level) => level),
  );

  protected readonly hostClasses: Signal<string[]> = computed(() => {
    const className = 'tls-activity-heatmap';

    return [className, `${className}--${this.color()}`, `${className}--${this.size()}`];
  });

  /** Inclusive day range covered by the heatmap, whether given or derived from today. */
  private readonly _range: Signal<{ start: Date; end: Date }> = computed(() => {
    const endDate = this.endDate();
    const end = startOfDay(endDate ?? this._now());

    const startDate = this.startDate();
    if (startDate) return { start: startOfDay(startDate), end };

    // A month-aligned span is inclusive of both ends, so it starts the day after the offset.
    return { start: addDays(subMonths(end, this._config.rangeMonths), 1), end };
  });

  // Protected methods
  /**
   * Share of the theme color a cell of `level` is filled with, `0` leaving it on the empty
   * surface. Level 1 already carries `MIN_LEVEL_INTENSITY` so the faintest active day stays
   * distinguishable, and the remaining levels spread evenly up to the full color.
   */
  protected intensity(level: number): number {
    if (level <= 0) return 0;

    const topLevel = this.resolvedLevels() - 1;
    if (topLevel <= 1) return 1;

    return MIN_LEVEL_INTENSITY + ((1 - MIN_LEVEL_INTENSITY) * (level - 1)) / (topLevel - 1);
  }

  protected onDaySelect(day: ActivityHeatmapDay): void {
    if (!day.inRange) return;
    this.daySelect.emit(day);
  }

  /** Space would scroll the grid; consume it and activate the focused day instead. */
  protected onDaySpace(event: Event, day: ActivityHeatmapDay): void {
    event.preventDefault();
    this.onDaySelect(day);
  }

  // Private methods
  /** Consumer thresholds when given, otherwise a scale spanning the busiest day in range. */
  private _resolveThresholds(
    days: Date[],
    totals: Map<number, { count: number }>,
    start: Date,
    end: Date,
  ): number[] {
    const thresholds = this.thresholds();
    if (thresholds) return thresholds;

    let maxCount = 0;
    for (const date of days) {
      if (date < start || date > end) continue;

      const total = totals.get(date.getTime());
      if (total && total.count > maxCount) maxCount = total.count;
    }

    return buildActivityThresholds(maxCount, this.resolvedLevels());
  }
}
