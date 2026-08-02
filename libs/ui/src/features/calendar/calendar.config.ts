import { Day } from 'date-fns';
import { DEFAULT_MAX_EVENTS_PER_DAY } from './calendar.constants';
import { calendarView } from './calendar.types';

/** User-facing strings rendered by the calendar and its views, overridable for localization. */
export interface CalendarLabels {
  /** Accessible name for the previous-period navigation button. */
  previous: string;
  /** Accessible name for the next-period navigation button. */
  next: string;
  /** Label for the button that snaps back to today. */
  today: string;
  /** Gutter label for the week/day all-day row. */
  allDay: string;
  /** Message shown by the agenda view when the active month has no events. */
  noEvents: string;
  /** Label for the "+N more" affordance on a month day cell with hidden events. */
  more: (count: number) => string;
  /** Labels for the view-switcher options, keyed by view. */
  views: Record<calendarView, string>;
}

export interface CalendarConfig {
  /** View shown on first render. */
  view: calendarView;
  /** First day of the week (`date-fns` convention: 0 = Sunday). */
  weekStartsOn: Day;
  /** Short weekday labels, Sunday-first; rotated to honour `weekStartsOn`. */
  weekDays: string[];
  /** First hour rendered by the week/day time-grid. */
  hourStart: number;
  /** Last hour rendered by the week/day time-grid. */
  hourEnd: number;
  /** Whether the week/day views show a dedicated all-day row above the time-grid. */
  showAllDayRow: boolean;
  /** Events shown in a month day cell before collapsing the rest into "+N more". */
  maxEventsPerDay: number;
  /** User-facing strings, overridable for localization. */
  labels: CalendarLabels;
}

export const DEFAULT_CALENDAR_CONFIG: CalendarConfig = {
  view: 'month',
  weekStartsOn: 0,
  weekDays: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  hourStart: 0,
  hourEnd: 24,
  showAllDayRow: true,
  maxEventsPerDay: DEFAULT_MAX_EVENTS_PER_DAY,
  labels: {
    previous: 'Previous',
    next: 'Next',
    today: 'Today',
    allDay: 'All day',
    noEvents: 'No events',
    more: count => `+${count} more`,
    views: {
      month: 'Month',
      week: 'Week',
      day: 'Day',
      agenda: 'Agenda',
    },
  },
};
