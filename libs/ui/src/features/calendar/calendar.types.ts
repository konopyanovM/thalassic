import { color } from '../../types';

export type calendarView = 'month' | 'week' | 'day' | 'agenda';

/**
 * Density of the calendar's layout. `'auto'` resolves from the calendar's own rendered width, so
 * a calendar in a narrow column is dense even on a wide screen; a boolean pins it either way.
 */
export type calendarCompact = boolean | 'auto';

/**
 * Week rows a month grid shows beyond the month's own, counted for each edge of the grid on
 * its own.
 */
export interface CalendarPeekWeeks {
  /** Rows above the week that holds the 1st. */
  before: number;
  /** Rows below the last of the month's own rows. */
  after: number;
}

/** A single entry rendered on the calendar. `end` defaults to `start` when omitted. */
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  /** Tints the default event chip with a wash of a semantic color token, inked in the same hue. */
  color?: color;
  /** Consumer payload, surfaced in the template context and selection outputs. */
  data?: unknown;
}

/** Half-open date interval `[start, end)` describing the currently visible span. */
export interface CalendarRange {
  start: Date;
  end: Date;
}

/** Context object exposed to a consumer-provided event template slot. */
export interface CalendarEventContext {
  $implicit: CalendarEvent;
  view: calendarView;
}

/**
 * Context object exposed to a consumer-provided month day-cell template slot. The slot replaces
 * what the cell renders — its number, event dots and "+N more" — while the cell element itself
 * keeps its grid semantics, selection and borders.
 */
export interface CalendarDayContext {
  $implicit: Date;
  /** Day of the month, formatted for the active locale. */
  dayNumber: string;
  /** Whether the day belongs to the month on screen rather than the padding around it. */
  inCurrentMonth: boolean;
  isToday: boolean;
  /** Every event covering the day, in start order. */
  events: CalendarEvent[];
}
