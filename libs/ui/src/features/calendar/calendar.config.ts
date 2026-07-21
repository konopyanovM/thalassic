import { Day } from 'date-fns';
import { DEFAULT_MAX_EVENTS_PER_DAY } from './calendar.constants';
import { calendarView } from './calendar.types';

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
}

export const DEFAULT_CALENDAR_CONFIG: CalendarConfig = {
  view: 'month',
  weekStartsOn: 0,
  weekDays: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  hourStart: 0,
  hourEnd: 24,
  showAllDayRow: true,
  maxEventsPerDay: DEFAULT_MAX_EVENTS_PER_DAY,
};
