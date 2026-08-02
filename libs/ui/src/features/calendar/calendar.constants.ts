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

/** Vertical pixels per minute in the time-grid, derived from the hour row height. */
export const PX_PER_MINUTE = HOUR_HEIGHT / 60;

/** `date-fns` format token for a time-grid column heading, e.g. "Mon 20". */
export const TIME_GRID_HEADING_FORMAT = 'EEE d';

/** `date-fns` format token for an hour label in the time gutter, e.g. "9 AM". */
export const HOUR_LABEL_FORMAT = 'h a';

/** `date-fns` format token for an agenda day's weekday, e.g. "Wednesday". */
export const AGENDA_WEEKDAY_FORMAT = 'EEEE';

/** `date-fns` format token for an agenda day's date, e.g. "Jul 22". */
export const AGENDA_DATE_FORMAT = 'MMM d';

/** How often the calendar's notion of "now" refreshes (current-time line, today highlight). */
export const NOW_REFRESH_INTERVAL_MS = 60_000;

/** Views that prefix an event chip with its start time; the month grid shows the title alone. */
export const TIME_AWARE_VIEWS: calendarView[] = ['week', 'day', 'agenda'];

/** View switcher order; labels are resolved from the calendar config for localization. */
export const CALENDAR_VIEW_ORDER: calendarView[] = ['month', 'week', 'day', 'agenda'];
