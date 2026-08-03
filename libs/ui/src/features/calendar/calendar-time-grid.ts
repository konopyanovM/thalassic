import {
  Component,
  computed,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
  TemplateRef,
} from '@angular/core';
import { addHours, differenceInMinutes, format, isSameDay, startOfDay } from 'date-fns';
import { isHour12, localeFormatOptions, LOCALE_CONFIG } from '../../abstract/locale';
import { createNowSignal } from '../../utils';
import { assignEventLanes } from './assign-event-lanes';
import { CalendarEventItem } from './calendar-event';
import {
  HOUR_HEIGHT,
  HOUR_LABEL_FORMAT_12,
  HOUR_LABEL_FORMAT_24,
  MIN_EVENT_HEIGHT,
  NOW_REFRESH_INTERVAL_MS,
  PX_PER_MINUTE,
  TIME_GRID_HEADING_FORMAT,
} from './calendar.constants';
import { CALENDAR_CONFIG } from './calendar.token';
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
  // Injections
  private readonly _locale = inject(LOCALE_CONFIG);
  private readonly _config = inject(CALENDAR_CONFIG);

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
  protected readonly allDayLabel: string = this._config.labels.allDay;
  private readonly _dateOptions = localeFormatOptions(this._locale);
  private readonly _hourLabelFormat = isHour12(this._locale)
    ? HOUR_LABEL_FORMAT_12
    : HOUR_LABEL_FORMAT_24;
  /** Ticking current time, so the now line and today highlight track the clock. */
  private readonly _now = createNowSignal(NOW_REFRESH_INTERVAL_MS);

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
    const now = this._now();

    return this.days().map(day => {
      const dayStart = startOfDay(day);
      const windowStart = addHours(dayStart, hourStart);
      const windowEnd = addHours(dayStart, hourEnd);

      const dayEvents = events.filter(event => eventCoversDay(event, dayStart));
      const allDayEvents = dayEvents.filter(event => this._isAllDay(event));
      const timed = dayEvents.filter(
        event => !this._isAllDay(event) && this._overlapsWindow(event, windowStart, windowEnd),
      );

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

      return {
        date: day,
        isToday: isSameDay(day, now),
        heading: format(day, TIME_GRID_HEADING_FORMAT, this._dateOptions),
        allDayEvents,
        timedEvents,
      };
    });
  });

  /** Vertical offset (px) of the current-time line, or null when now is off-screen. */
  protected readonly nowOffset: Signal<number | null> = computed(() => {
    const now = this._now();
    if (!this.days().some(day => isSameDay(day, now))) return null;

    const dayStart = startOfDay(now);
    const windowStart = addHours(dayStart, this.hourStart());
    const windowEnd = addHours(dayStart, this.hourEnd());
    if (now.getTime() < windowStart.getTime() || now.getTime() > windowEnd.getTime()) return null;

    return differenceInMinutes(now, windowStart) * PX_PER_MINUTE;
  });

  // Protected methods
  protected hourLabel(hour: number): string {
    return format(addHours(startOfDay(new Date()), hour), this._hourLabelFormat, this._dateOptions);
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

  /**
   * Whether the event has any visible span inside the rendered hour window.
   * Events entirely before `hourStart` or after `hourEnd` are excluded — clamping
   * them would paint a zero-length sliver pinned to the window edge. An instant
   * (zero-duration) event counts while its start sits inside the window.
   */
  private _overlapsWindow(event: CalendarEvent, windowStart: Date, windowEnd: Date): boolean {
    const start = event.start;
    const end = event.end ?? event.start;
    if (end.getTime() === start.getTime()) return start >= windowStart && start < windowEnd;
    return end > windowStart && start < windowEnd;
  }

  private _clamp(date: Date, min: Date, max: Date): Date {
    return new Date(Math.min(Math.max(date.getTime(), min.getTime()), max.getTime()));
  }
}
