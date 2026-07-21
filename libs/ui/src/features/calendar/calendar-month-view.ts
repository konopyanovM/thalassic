import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, InputSignal, output, OutputEmitterRef, Signal, TemplateRef } from '@angular/core';
import { Grid, GridCell, GridRow } from '@angular/aria/grid';
import { Day, format, isAfter, isBefore, isSameMonth, isToday, startOfDay } from 'date-fns';
import { buildMonthDays, isSemanticColor, rotateWeekDays } from '../../utils';
import { DAY_NUMBER_FORMAT, DAYS_PER_WEEK, MONTH_GRID_ROWS } from './calendar.constants';
import { CalendarEvent, CalendarEventContext } from './calendar.types';

/** A single day cell in the month grid, precomputed for the template. */
interface CalendarDayCell {
  date: Date;
  dayNumber: string;
  inCurrentMonth: boolean;
  isToday: boolean;
  visibleEvents: CalendarEvent[];
  hiddenCount: number;
}

@Component({
  selector: 'tls-calendar-month-view',
  templateUrl: './calendar-month-view.html',
  imports: [NgTemplateOutlet, Grid, GridRow, GridCell],
  host: { class: 'tls-calendar-month-view' },
})
export class CalendarMonthView {
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

  // Computed
  protected readonly weekdayHeaders: Signal<string[]> = computed(() =>
    rotateWeekDays(this.weekDays(), this.weekStartsOn()),
  );

  protected readonly weeks: Signal<CalendarDayCell[][]> = computed(() => {
    const activeDate = this.activeDate();
    const maxEvents = this.maxEventsPerDay();
    const events = this.events();

    // A fixed 6-week window keeps the grid height from reflowing between months.
    const days = buildMonthDays(activeDate, this.weekStartsOn(), MONTH_GRID_ROWS);

    const cells: CalendarDayCell[] = days.map(date => {
      const dayEvents = this._eventsForDay(date, events);
      return {
        date,
        dayNumber: format(date, DAY_NUMBER_FORMAT),
        inCurrentMonth: isSameMonth(date, activeDate),
        isToday: isToday(date),
        visibleEvents: dayEvents.slice(0, maxEvents),
        hiddenCount: Math.max(0, dayEvents.length - maxEvents),
      };
    });

    const weeks: CalendarDayCell[][] = [];
    for (let index = 0; index < cells.length; index += DAYS_PER_WEEK) {
      weeks.push(cells.slice(index, index + DAYS_PER_WEEK));
    }
    return weeks;
  });

  // Protected methods
  protected eventContext(event: CalendarEvent): CalendarEventContext {
    return { $implicit: event, view: 'month' };
  }

  /** Chip classes, adding a semantic color modifier when the event uses a color token. */
  protected eventClasses(event: CalendarEvent): string[] {
    const classes = ['tls-calendar-month-view__event'];
    if (event.color !== undefined && isSemanticColor(event.color)) {
      classes.push(`tls-calendar-month-view__event--${event.color}`);
    }
    return classes;
  }

  /** Raw CSS background for non-token colors; token colors are styled via the modifier class. */
  protected eventColor(event: CalendarEvent): string | null {
    if (event.color === undefined || isSemanticColor(event.color)) return null;
    return event.color;
  }

  protected onEventClick(event: MouseEvent, calendarEvent: CalendarEvent): void {
    // The chip lives inside a selectable day cell — keep its click from selecting the day.
    event.stopPropagation();
    this.eventSelect.emit(calendarEvent);
  }

  /** Space would scroll the page; consume it and select the focused day instead. */
  protected onDaySpace(event: Event, date: Date): void {
    event.preventDefault();
    this.dateSelect.emit(date);
  }

  // Private methods
  /** Events overlapping `day`; a multi-day event is returned for every day it covers. */
  private _eventsForDay(day: Date, events: CalendarEvent[]): CalendarEvent[] {
    return events
      .filter(event => {
        const start = startOfDay(event.start);
        const end = startOfDay(event.end ?? event.start);
        return !isBefore(day, start) && !isAfter(day, end);
      })
      .sort((first, second) => first.start.getTime() - second.start.getTime());
  }
}
