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
import { buildMonthDays } from '../../utils';
import { CalendarAgendaView } from './calendar-agenda-view';
import { CalendarMonthView } from './calendar-month-view';
import { CalendarTimeGrid } from './calendar-time-grid';
import { CalendarLabels } from './calendar.config';
import {
  CALENDAR_VIEW_ORDER,
  DAY_TITLE_FORMAT,
  MONTH_GRID_ROWS,
  MONTH_TITLE_FORMAT,
} from './calendar.constants';
import { CALENDAR_CONFIG } from './calendar.token';
import { CalendarEvent, CalendarEventContext, CalendarRange, calendarView } from './calendar.types';

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

  protected readonly viewOptions: { label: string; value: calendarView }[] = CALENDAR_VIEW_ORDER.map(
    value => ({ label: this._config.labels.views[value], value }),
  );

  protected readonly eventTemplate = contentChild<TemplateRef<CalendarEventContext>>('eventTemplate');

  private readonly _dateOptions = localeFormatOptions(this._locale);

  // Computed
  protected readonly hostClasses: Signal<string[]> = computed(() => [
    'tls-calendar',
    `tls-calendar--${this.view()}`,
  ]);

  /** Whether the active period already includes today, so "Today" would be a no-op. */
  protected readonly isViewingToday: Signal<boolean> = computed(() => {
    const activeDate = this.activeDate();
    const now = new Date();
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
