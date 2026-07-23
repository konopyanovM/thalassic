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

/** Pixel height of one hour row in the week/day time-grid; drives event positioning too. */
export const HOUR_HEIGHT = 48;

/** Minimum rendered height (px) for a timed event, so brief events stay readable. */
export const MIN_EVENT_HEIGHT = 24;

/** `date-fns` format token for a time-grid column heading, e.g. "Mon 20". */
export const TIME_GRID_HEADING_FORMAT = 'EEE d';

/** `date-fns` format token for an hour label in the time gutter, e.g. "9 AM". */
export const HOUR_LABEL_FORMAT = 'h a';

/** `date-fns` format token for an agenda day's weekday, e.g. "Wednesday". */
export const AGENDA_WEEKDAY_FORMAT = 'EEEE';

/** `date-fns` format token for an agenda day's date, e.g. "Jul 22". */
export const AGENDA_DATE_FORMAT = 'MMM d';

/** View switcher options. */
export const CALENDAR_VIEW_OPTIONS: { label: string; value: calendarView }[] = [
  { label: 'Month', value: 'month' },
  { label: 'Week', value: 'week' },
  { label: 'Day', value: 'day' },
  { label: 'Agenda', value: 'agenda' },
];
