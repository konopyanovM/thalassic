import { color } from '../../types';

export type calendarView = 'month' | 'week' | 'day' | 'agenda';

/** A single entry rendered on the calendar. `end` defaults to `start` when omitted. */
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  /**
   * Tints the default event chip. A semantic token (`'primary'`, `'success'`, …) applies the
   * matching container/on-container pair; any other value is used as a raw CSS background color.
   */
  color?: color | string;
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
