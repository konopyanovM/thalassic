import { calendarView } from './calendar.types';

/** Days in a calendar week. */
export const DAYS_PER_WEEK = 7;

/** Fixed number of week rows in the month grid, so its height never reflows between months. */
export const MONTH_GRID_ROWS = 6;

/** Default cap on events shown in a month day cell before a "+N more" affordance appears. */
export const DEFAULT_MAX_EVENTS_PER_DAY = 3;

/** `date-fns` format token for the month/week/day title in the header. */
export const MONTH_TITLE_FORMAT = 'MMMM yyyy';

/** `date-fns` format token for a day-of-month number. */
export const DAY_NUMBER_FORMAT = 'd';

/** `date-fns` format token for the single-day view title, e.g. "Monday, July 20, 2026". */
export const DAY_TITLE_FORMAT = 'EEEE, MMMM d, yyyy';

/**
 * View switcher options. Views beyond `month` are disabled until their sub-views ship;
 * flip `disabled` off as each lands.
 */
export const CALENDAR_VIEW_OPTIONS: { label: string; value: calendarView; disabled: boolean }[] = [
  { label: 'Month', value: 'month', disabled: false },
  { label: 'Week', value: 'week', disabled: true },
  { label: 'Day', value: 'day', disabled: true },
  { label: 'Agenda', value: 'agenda', disabled: true },
];
