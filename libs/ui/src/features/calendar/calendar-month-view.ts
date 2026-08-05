import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
  TemplateRef
} from '@angular/core';
import { Grid, GridCell, GridRow } from '@angular/aria/grid';
import { Day, format, isSameDay, isSameMonth } from 'date-fns';
import { LOCALE_CONFIG, localeFormatOptions } from '../../abstract/locale';
import { color } from '../../types';
import { buildMonthDays, createNowSignal, rotateWeekDays } from '../../utils';
import { assignWeekLanes } from './assign-week-lanes';
import { CalendarEventItem } from './calendar-event';
import {
  DAY_NUMBER_FORMAT,
  DAYS_PER_WEEK,
  MAX_DAY_MARKERS,
  MONTH_GRID_ROWS,
  NOW_REFRESH_INTERVAL_MS
} from './calendar.constants';
import { CALENDAR_CONFIG } from './calendar.token';
import { CalendarDayContext, CalendarEvent, CalendarEventContext } from './calendar.types';

/** A dot marking one of a day's events in the dense layout, tinted by that event's color. */
interface MonthDayMarker {
  id: string;
  /** Resolved with the cell so the binding keeps one array rather than rebuilding per check. */
  classes: string[];
}

/** A day cell in the month grid: its number and how many of its events are hidden. */
interface MonthDay {
  date: Date;
  dayNumber: string;
  inCurrentMonth: boolean;
  isToday: boolean;
  hiddenCount: number;
  /** How many events cover the day in total, however the layout chooses to present them. */
  eventCount: number;
  markers: MonthDayMarker[];
  /** Built with the cell so a template slot is not handed a fresh object on every check. */
  context: CalendarDayContext;
}

/** A visible event bar placed on the week's lane overlay. */
interface MonthEventBar {
  event: CalendarEvent;
  gridColumn: string;
  gridRow: string;
  continuesBefore: boolean;
  continuesAfter: boolean;
}

/** One week row: the base day cells plus the event bars overlaid across them. */
interface MonthWeek {
  days: MonthDay[];
  bars: MonthEventBar[];
}

@Component({
  selector: 'tls-calendar-month-view',
  templateUrl: './calendar-month-view.html',
  imports: [Grid, GridRow, GridCell, CalendarEventItem, NgTemplateOutlet],
  host: {
    class: 'tls-calendar-month-view',
    '[class.tls-calendar-month-view--square]': 'squareCells()',
  },
})
export class CalendarMonthView {
  // Injections
  private readonly _locale = inject(LOCALE_CONFIG);
  private readonly _config = inject(CALENDAR_CONFIG);

  // Inputs
  public readonly activeDate: InputSignal<Date> = input.required<Date>();
  public readonly events: InputSignal<CalendarEvent[]> = input.required<CalendarEvent[]>();
  public readonly weekStartsOn: InputSignal<Day> = input.required<Day>();
  public readonly weekDays: InputSignal<string[]> = input.required<string[]>();
  public readonly maxEventsPerDay: InputSignal<number> = input.required<number>();
  /** Whether day cells are held to a 1:1 ratio instead of sizing to the events they hold. */
  public readonly squareCells: InputSignal<boolean> = input<boolean>(false);
  public readonly eventTemplate = input<TemplateRef<CalendarEventContext> | undefined>(undefined);
  /** Replaces what a day cell renders, leaving the cell's own semantics and chrome in place. */
  public readonly dayTemplate = input<TemplateRef<CalendarDayContext> | undefined>(undefined);
  /** Accessible name for the grid, announced when focus enters it. */
  public readonly label = input<string | undefined>(undefined);

  // Outputs
  public readonly dateSelect: OutputEmitterRef<Date> = output<Date>();
  public readonly eventSelect: OutputEmitterRef<CalendarEvent> = output<CalendarEvent>();

  // State
  private readonly _dateOptions = localeFormatOptions(this._locale);
  /** Ticking current time, so the today highlight tracks the clock across midnight. */
  private readonly _now = createNowSignal(NOW_REFRESH_INTERVAL_MS);

  // Computed
  protected readonly weekdayHeaders: Signal<string[]> = computed(() =>
    rotateWeekDays(this.weekDays(), this.weekStartsOn()),
  );

  protected readonly weeks: Signal<MonthWeek[]> = computed(() => {
    const activeDate = this.activeDate();
    const maxLanes = this.maxEventsPerDay();
    const events = this.events();
    const now = this._now();

    // A fixed 6-week window keeps the grid height from reflowing between months.
    const days = buildMonthDays(activeDate, this.weekStartsOn(), MONTH_GRID_ROWS);

    const weeks: MonthWeek[] = [];
    for (let index = 0; index < days.length; index += DAYS_PER_WEEK) {
      const weekDays = days.slice(index, index + DAYS_PER_WEEK);
      const segments = assignWeekLanes(weekDays, events);

      const hiddenPerColumn = new Array<number>(weekDays.length).fill(0);
      // Segments already carry each event clipped to the columns it covers, so bucketing them
      // here costs nothing beyond the walk — far cheaper than re-testing every event per day.
      const eventsPerColumn: CalendarEvent[][] = weekDays.map(() => []);
      const bars: MonthEventBar[] = [];
      for (const segment of segments) {
        const beyondLanes = segment.lane >= maxLanes;
        if (!beyondLanes) {
          bars.push({
            event: segment.event,
            gridColumn: `${segment.startColumn + 1} / span ${segment.endColumn - segment.startColumn + 1}`,
            gridRow: `${segment.lane + 1}`,
            continuesBefore: segment.continuesBefore,
            continuesAfter: segment.continuesAfter,
          });
        }

        for (let column = segment.startColumn; column <= segment.endColumn; column++) {
          eventsPerColumn[column].push(segment.event);
          if (beyondLanes) hiddenPerColumn[column]++;
        }
      }

      const cells: MonthDay[] = weekDays.map((date, column) => {
        // Lane packing orders segments by column and span; a day's own events read chronologically.
        const dayEvents = eventsPerColumn[column].sort(
          (first, second) => first.start.getTime() - second.start.getTime(),
        );
        const dayNumber = format(date, DAY_NUMBER_FORMAT, this._dateOptions);
        const inCurrentMonth = isSameMonth(date, activeDate);
        const isToday = isSameDay(date, now);
        return {
          date,
          dayNumber,
          inCurrentMonth,
          isToday,
          hiddenCount: hiddenPerColumn[column],
          context: { $implicit: date, dayNumber, inCurrentMonth, isToday, events: dayEvents },
          eventCount: dayEvents.length,
          markers: dayEvents.slice(0, MAX_DAY_MARKERS).map(event => ({
            id: event.id,
            classes: this._markerClasses(event.color),
          })),
        };
      });

      weeks.push({ days: cells, bars });
    }
    return weeks;
  });

  // Protected methods
  /** Localized "+N more" label for a day cell with `count` hidden events. */
  protected moreLabel(count: number): string {
    return this._config.labels.more(count);
  }

  /** Localized event-count summary, the only textual form the dense layout's dots have. */
  protected eventCountLabel(count: number): string {
    return this._config.labels.eventCount(count);
  }

  /** Space would scroll the page; consume it and select the focused day instead. */
  protected onDaySpace(event: Event, date: Date): void {
    event.preventDefault();
    this.dateSelect.emit(date);
  }

  // Private methods
  private _markerClasses(eventColor: color | undefined): string[] {
    const classes = ['tls-calendar-month-view__marker'];
    if (eventColor) classes.push(`tls-calendar-month-view__marker--${eventColor}`);

    return classes;
  }
}
