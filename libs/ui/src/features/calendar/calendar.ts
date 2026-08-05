import {
  Component,
  computed,
  contentChild,
  effect,
  inject,
  input,
  InputSignal,
  model,
  ModelSignal,
  output,
  OutputEmitterRef,
  Signal,
  TemplateRef,
} from '@angular/core';
import {
  addDays,
  addMonths,
  addWeeks,
  Day,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isSameWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { localeFormatOptions, LOCALE_CONFIG } from '../../abstract/locale';
import { Button } from '../button';
import { ToggleGroup } from '../form/toggle-group';
import { Icon } from '../icon';
import { buildMonthDays, createNowSignal } from '../../utils';
import { CalendarAgendaView } from './calendar-agenda-view';
import { CalendarMonthView } from './calendar-month-view';
import { CalendarTimeGrid } from './calendar-time-grid';
import { CalendarLabels } from './calendar.config';
import {
  DAY_TITLE_FORMAT,
  MONTH_GRID_ROWS,
  MONTH_TITLE_FORMAT,
  NOW_REFRESH_INTERVAL_MS,
} from './calendar.constants';
import { CALENDAR_CONFIG } from './calendar.token';
import {
  calendarCompact,
  CalendarDayContext,
  CalendarEvent,
  CalendarEventContext,
  CalendarRange,
  calendarView,
} from './calendar.types';

@Component({
  selector: 'tls-calendar',
  templateUrl: './calendar.html',
  imports: [Button, ToggleGroup, CalendarMonthView, CalendarTimeGrid, CalendarAgendaView, Icon],
  host: {
    '[class]': 'hostClasses()',
  },
})
export class Calendar {
  // Injections
  private readonly _config = inject(CALENDAR_CONFIG);
  private readonly _locale = inject(LOCALE_CONFIG);

  // Inputs
  public readonly events: InputSignal<CalendarEvent[]> = input<CalendarEvent[]>([]);
  public readonly weekStartsOn: InputSignal<Day> = input<Day>(this._config.weekStartsOn);
  public readonly weekDays: InputSignal<string[]> = input<string[]>(this._config.weekDays);
  public readonly hourStart: InputSignal<number> = input<number>(this._config.hourStart);
  public readonly hourEnd: InputSignal<number> = input<number>(this._config.hourEnd);
  public readonly showAllDayRow: InputSignal<boolean> = input<boolean>(this._config.showAllDayRow);
  public readonly maxEventsPerDay: InputSignal<number> = input<number>(this._config.maxEventsPerDay);
  /**
   * Views the switcher offers, in the order they appear. Narrowing it to one entry hides the
   * switcher, and the active view is pulled back into the set whenever it falls outside.
   */
  public readonly views: InputSignal<calendarView[]> = input<calendarView[]>(this._config.views);
  /** Whether the header renders at all; when false, drive the calendar through its own API. */
  public readonly showHeader: InputSignal<boolean> = input<boolean>(true);
  /** Whether the header shows the period title. */
  public readonly showTitle: InputSignal<boolean> = input<boolean>(true);
  /** Whether the header shows the previous/today/next controls. */
  public readonly showNavigation: InputSignal<boolean> = input<boolean>(true);
  /** Whether the header shows the view switcher; it is hidden anyway with fewer than two views. */
  public readonly showViewSwitcher: InputSignal<boolean> = input<boolean>(true);
  /**
   * Density of the layout: `'auto'` lets the rendered width decide, `true` pins the dense layout
   * on and `false` pins it off. The dense month grid marks each day with a dot per event rather
   * than laying out event bars, so only `dateSelect` fires there — `eventSelect` has no target.
   */
  public readonly compact: InputSignal<calendarCompact> = input<calendarCompact>('auto');
  /**
   * Whether the month grid holds its day cells to a 1:1 ratio. Off by default, where a cell is
   * as tall as the events it has to show; on, the grid's height follows from its width alone.
   */
  public readonly squareCells: InputSignal<boolean> = input<boolean>(false);
  /** Accessible name forwarded to the active view's grid. */
  public readonly ariaLabel = input<string | undefined>(undefined);

  // Outputs
  public readonly eventSelect: OutputEmitterRef<CalendarEvent> = output<CalendarEvent>();
  public readonly dateSelect: OutputEmitterRef<Date> = output<Date>();
  /** Fires whenever the visible span changes, so consumers can lazy-load that window's events. */
  public readonly rangeChange: OutputEmitterRef<CalendarRange> = output<CalendarRange>();

  // State
  public readonly view: ModelSignal<calendarView> = model<calendarView>(this._config.view);
  /** Anchor date driving the visible range; navigation shifts it by the view's unit. */
  public readonly activeDate: ModelSignal<Date> = model<Date>(new Date());

  protected readonly labels: CalendarLabels = this._config.labels;

  protected readonly eventTemplate = contentChild<TemplateRef<CalendarEventContext>>('eventTemplate');
  protected readonly dayTemplate = contentChild<TemplateRef<CalendarDayContext>>('dayTemplate');

  private readonly _dateOptions = localeFormatOptions(this._locale);
  /** Ticking current time, so the "Today" affordance stays correct across midnight. */
  private readonly _now = createNowSignal(NOW_REFRESH_INTERVAL_MS);

  // Computed
  protected readonly hostClasses: Signal<string[]> = computed(() => {
    const classes = ['tls-calendar', `tls-calendar--${this.view()}`];
    // Pinned off contributes no class at all, so neither dense rule can match.
    const compact = this.compact();
    if (compact === true) classes.push('tls-calendar--compact');
    if (compact === 'auto') classes.push('tls-calendar--compact-auto');

    return classes;
  });

  protected readonly viewOptions: Signal<{ label: string; value: calendarView }[]> = computed(() =>
    this.views().map(value => ({ label: this.labels.views[value], value })),
  );

  /** A lone view has nothing to switch between, so the group is suppressed regardless. */
  protected readonly showsViewSwitcher: Signal<boolean> = computed(
    () => this.showViewSwitcher() && this.views().length > 1,
  );

  /** Suppresses the header wrapper once every part it would hold is hidden. */
  protected readonly showsHeader: Signal<boolean> = computed(
    () =>
      this.showHeader() && (this.showNavigation() || this.showTitle() || this.showsViewSwitcher()),
  );

  /** Whether the active period already includes today, so "Today" would be a no-op. */
  protected readonly isViewingToday: Signal<boolean> = computed(() => {
    const activeDate = this.activeDate();
    const now = this._now();
    switch (this.view()) {
      case 'week':
        return isSameWeek(activeDate, now, { weekStartsOn: this.weekStartsOn() });
      case 'day':
        return isSameDay(activeDate, now);
      default:
        return isSameMonth(activeDate, now);
    }
  });

  protected readonly title: Signal<string> = computed(() => {
    const activeDate = this.activeDate();
    switch (this.view()) {
      case 'week':
        return this._weekTitle(activeDate);
      case 'day':
        return format(activeDate, DAY_TITLE_FORMAT, this._dateOptions);
      default:
        return format(activeDate, MONTH_TITLE_FORMAT, this._dateOptions);
    }
  });

  protected readonly visibleRange: Signal<CalendarRange> = computed(() => {
    const activeDate = this.activeDate();
    const weekStartsOn = this.weekStartsOn();

    switch (this.view()) {
      case 'week': {
        const { start, end } = this._weekBounds(activeDate);
        return { start, end: startOfDay(addDays(end, 1)) };
      }
      case 'day': {
        const start = startOfDay(activeDate);
        return { start, end: addDays(start, 1) };
      }
      case 'agenda': {
        // The agenda lists the calendar month proper, not the padded grid window.
        return { start: startOfMonth(activeDate), end: startOfDay(addDays(endOfMonth(activeDate), 1)) };
      }
      default: {
        // Mirror the month view's fixed 6-week window.
        const days = buildMonthDays(activeDate, weekStartsOn, MONTH_GRID_ROWS);
        return { start: days[0], end: addDays(days[days.length - 1], 1) };
      }
    }
  });

  /** Day columns fed to the time-grid: a full week for `week`, a single day for `day`. */
  protected readonly timeGridDays: Signal<Date[]> = computed(() => {
    const activeDate = this.activeDate();
    if (this.view() === 'day') return [startOfDay(activeDate)];

    return eachDayOfInterval(this._weekBounds(activeDate));
  });

  constructor() {
    // Surface the visible window so consumers can fetch events for it (fires on first render too).
    effect(() => this.rangeChange.emit(this.visibleRange()));

    // An active view outside the offered set would be unreachable once hidden from the
    // switcher, so it snaps to the first view on offer.
    effect(() => {
      const views = this.views();
      if (views.length === 0 || views.includes(this.view())) return;

      this.view.set(views[0]);
    });
  }

  // Public methods
  /** Moves to the next period in the current view's unit. */
  public next(): void {
    this._step(1);
  }

  /** Moves to the previous period in the current view's unit. */
  public previous(): void {
    this._step(-1);
  }

  /** Snaps the anchor date back to today. */
  public today(): void {
    this.activeDate.set(startOfDay(new Date()));
  }

  // Protected methods
  protected onViewChange(views: calendarView[]): void {
    const [selected] = views;
    if (selected) this.view.set(selected);
  }

  // Private methods
  private _step(amount: number): void {
    switch (this.view()) {
      case 'week':
        this.activeDate.update(date => addWeeks(date, amount));
        break;
      case 'day':
        this.activeDate.update(date => addDays(date, amount));
        break;
      default:
        this.activeDate.update(date => addMonths(date, amount));
    }
  }

  private _weekBounds(activeDate: Date): { start: Date; end: Date } {
    const weekStartsOn = this.weekStartsOn();
    return {
      start: startOfWeek(activeDate, { weekStartsOn }),
      end: endOfWeek(activeDate, { weekStartsOn }),
    };
  }

  private _weekTitle(activeDate: Date): string {
    const { start, end } = this._weekBounds(activeDate);
    return `${format(start, 'MMM d', this._dateOptions)} – ${format(end, 'MMM d, yyyy', this._dateOptions)}`;
  }
}
