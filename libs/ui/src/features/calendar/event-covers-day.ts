import { isAfter, isBefore, startOfDay } from 'date-fns';
import { CalendarEvent } from './calendar.types';

/**
 * Whether `event` overlaps the calendar day `day`. Compared at day granularity via `startOfDay`,
 * so a spring-forward day (only 23h long) never mis-buckets an event into an adjacent column.
 * `day` is expected at midnight.
 */
export const eventCoversDay = (event: CalendarEvent, day: Date): boolean => {
  const start = startOfDay(event.start);
  const end = startOfDay(event.end ?? event.start);
  return !isBefore(day, start) && !isAfter(day, end);
};
