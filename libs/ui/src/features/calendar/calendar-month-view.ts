import { Component, computed, inject, input, InputSignal, output, OutputEmitterRef, Signal, TemplateRef } from '@angular/core';
import { Grid, GridCell, GridRow } from '@angular/aria/grid';
import { Day, format, isSameMonth, isToday } from 'date-fns';
import { localeFormatOptions, LOCALE_CONFIG } from '../../abstract/locale';
import { buildMonthDays, rotateWeekDays } from '../../utils';
import { assignWeekLanes } from './assign-week-lanes';
import { CalendarEventItem } from './calendar-event';
import { DAY_NUMBER_FORMAT, DAYS_PER_WEEK, MONTH_GRID_ROWS } from './calendar.constants';
import { CALENDAR_CONFIG } from './calendar.token';
import { CalendarEvent, CalendarEventContext } from './calendar.types';

/** A day cell in the month grid: its number and how many of its events are hidden. */
interface MonthDay {
  date: Date;
  dayNumber: string;
  inCurrentMonth: boolean;
  isToday: boolean;
  hiddenCount: number;
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
  imports: [Grid, GridRow, GridCell, CalendarEventItem],
  host: { class: 'tls-calendar-month-view' },
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
  public readonly eventTemplate = input<TemplateRef<CalendarEventContext> | undefined>(undefined);
  /** Accessible name for the grid, announced when focus enters it. */
  public readonly label = input<string | undefined>(undefined);

  // Outputs
  public readonly dateSelect: OutputEmitterRef<Date> = output<Date>();
  public readonly eventSelect: OutputEmitterRef<CalendarEvent> = output<CalendarEvent>();

  // State
  private readonly _dateOptions = localeFormatOptions(this._locale);

  // Computed
  protected readonly weekdayHeaders: Signal<string[]> = computed(() =>
    rotateWeekDays(this.weekDays(), this.weekStartsOn()),
  );

  protected readonly weeks: Signal<MonthWeek[]> = computed(() => {
    const activeDate = this.activeDate();
    const maxLanes = this.maxEventsPerDay();
    const events = this.events();

    // A fixed 6-week window keeps the grid height from reflowing between months.
    const days = buildMonthDays(activeDate, this.weekStartsOn(), MONTH_GRID_ROWS);

    const weeks: MonthWeek[] = [];
    for (let index = 0; index < days.length; index += DAYS_PER_WEEK) {
      const weekDays = days.slice(index, index + DAYS_PER_WEEK);
      const segments = assignWeekLanes(weekDays, events);

      const hiddenPerColumn = new Array<number>(weekDays.length).fill(0);
      const bars: MonthEventBar[] = [];
      for (const segment of segments) {
        if (segment.lane < maxLanes) {
          bars.push({
            event: segment.event,
            gridColumn: `${segment.startColumn + 1} / span ${segment.endColumn - segment.startColumn + 1}`,
            gridRow: `${segment.lane + 1}`,
            continuesBefore: segment.continuesBefore,
            continuesAfter: segment.continuesAfter,
          });
        } else {
          for (let column = segment.startColumn; column <= segment.endColumn; column++) {
            hiddenPerColumn[column]++;
          }
        }
      }

      const cells: MonthDay[] = weekDays.map((date, column) => ({
        date,
        dayNumber: format(date, DAY_NUMBER_FORMAT, this._dateOptions),
        inCurrentMonth: isSameMonth(date, activeDate),
        isToday: isToday(date),
        hiddenCount: hiddenPerColumn[column],
      }));

      weeks.push({ days: cells, bars });
    }
    return weeks;
  });

  // Protected methods
  /** Localized "+N more" label for a day cell with `count` hidden events. */
  protected moreLabel(count: number): string {
    return this._config.labels.more(count);
  }

  /** Space would scroll the page; consume it and select the focused day instead. */
  protected onDaySpace(event: Event, date: Date): void {
    event.preventDefault();
    this.dateSelect.emit(date);
  }
}
