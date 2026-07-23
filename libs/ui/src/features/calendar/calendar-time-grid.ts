import {
  Component,
  computed,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
  TemplateRef,
} from '@angular/core';
import { addHours, differenceInMinutes, format, isSameDay, isToday, startOfDay } from 'date-fns';
import { assignEventLanes } from './assign-event-lanes';
import { CalendarEventItem } from './calendar-event';
import {
  HOUR_HEIGHT,
  HOUR_LABEL_FORMAT,
  MIN_EVENT_HEIGHT,
  PX_PER_MINUTE,
  TIME_GRID_HEADING_FORMAT,
} from './calendar.constants';
import { CalendarEvent, CalendarEventContext, calendarView } from './calendar.types';
import { eventCoversDay } from './event-covers-day';

/** A timed event with its absolute placement inside a day column. */
interface TimedEventLayout {
  event: CalendarEvent;
  top: number;
  height: number;
  lane: number;
  laneCount: number;
}

/** One day column of the time-grid, precomputed for the template. */
interface TimeGridColumn {
  date: Date;
  isToday: boolean;
  heading: string;
  allDayEvents: CalendarEvent[];
  timedEvents: TimedEventLayout[];
}

/**
 * A time-grid of one or more day columns with an hour axis. Timed events are positioned by
 * their start/end and laid side-by-side when they overlap; all-day and multi-day events sit in
 * a header row. Shared by the week (seven columns) and day (single column) views.
 */
@Component({
  selector: 'tls-calendar-time-grid',
  templateUrl: './calendar-time-grid.html',
  imports: [CalendarEventItem],
  host: {
    class: 'tls-calendar-time-grid',
    role: 'group',
    '[attr.aria-label]': 'label() ?? null',
    '[style.--tls-calendar-hour-height.px]': 'hourHeight',
    '[style.--tls-calendar-columns]': 'days().length',
  },
})
export class CalendarTimeGrid {
  // Inputs
  public readonly days: InputSignal<Date[]> = input.required<Date[]>();
  public readonly events: InputSignal<CalendarEvent[]> = input.required<CalendarEvent[]>();
  public readonly view: InputSignal<calendarView> = input.required<calendarView>();
  public readonly hourStart: InputSignal<number> = input.required<number>();
  public readonly hourEnd: InputSignal<number> = input.required<number>();
  public readonly showAllDayRow: InputSignal<boolean> = input.required<boolean>();
  public readonly eventTemplate = input<TemplateRef<CalendarEventContext> | undefined>(undefined);
  /** Accessible name for the time-grid region. */
  public readonly label = input<string | undefined>(undefined);

  // Outputs
  public readonly dateSelect: OutputEmitterRef<Date> = output<Date>();
  public readonly eventSelect: OutputEmitterRef<CalendarEvent> = output<CalendarEvent>();

  // State
  protected readonly hourHeight = HOUR_HEIGHT;

  // Computed
  protected readonly hours: Signal<number[]> = computed(() => {
    const hours: number[] = [];
    for (let hour = this.hourStart(); hour < this.hourEnd(); hour++) hours.push(hour);
    return hours;
  });

  protected readonly columns: Signal<TimeGridColumn[]> = computed(() => {
    const events = this.events();
    const hourStart = this.hourStart();
    const hourEnd = this.hourEnd();

    return this.days().map(day => {
      const dayStart = startOfDay(day);
      const windowStart = addHours(dayStart, hourStart);
      const windowEnd = addHours(dayStart, hourEnd);

      const dayEvents = events.filter(event => eventCoversDay(event, dayStart));
      const allDayEvents = dayEvents.filter(event => this._isAllDay(event));
      const timed = dayEvents.filter(event => !this._isAllDay(event));

      const timedEvents: TimedEventLayout[] = assignEventLanes(timed).map(laid => {
        const start = this._clamp(laid.event.start, windowStart, windowEnd);
        const end = this._clamp(laid.event.end ?? laid.event.start, windowStart, windowEnd);
        return {
          event: laid.event,
          lane: laid.lane,
          laneCount: laid.laneCount,
          top: differenceInMinutes(start, windowStart) * PX_PER_MINUTE,
          height: Math.max(MIN_EVENT_HEIGHT, differenceInMinutes(end, start) * PX_PER_MINUTE),
        };
      });

      return { date: day, isToday: isToday(day), heading: format(day, TIME_GRID_HEADING_FORMAT), allDayEvents, timedEvents };
    });
  });

  /** Vertical offset (px) of the current-time line, or null when now is off-screen. */
  protected readonly nowOffset: Signal<number | null> = computed(() => {
    if (!this.days().some(day => isToday(day))) return null;

    const now = new Date();
    const dayStart = startOfDay(now);
    const windowStart = addHours(dayStart, this.hourStart());
    const windowEnd = addHours(dayStart, this.hourEnd());
    if (now.getTime() < windowStart.getTime() || now.getTime() > windowEnd.getTime()) return null;

    return differenceInMinutes(now, windowStart) * PX_PER_MINUTE;
  });

  // Protected methods
  protected hourLabel(hour: number): string {
    return format(addHours(startOfDay(new Date()), hour), HOUR_LABEL_FORMAT);
  }

  protected laneOffset(layout: TimedEventLayout): number {
    return (layout.lane * 100) / layout.laneCount;
  }

  protected laneWidth(layout: TimedEventLayout): number {
    return 100 / layout.laneCount;
  }

  // Private methods
  private _isAllDay(event: CalendarEvent): boolean {
    return event.allDay === true || !isSameDay(event.start, event.end ?? event.start);
  }

  private _clamp(date: Date, min: Date, max: Date): Date {
    return new Date(Math.min(Math.max(date.getTime(), min.getTime()), max.getTime()));
  }
}
