import { isAfter, isBefore, startOfDay } from 'date-fns';
import { CalendarEvent } from './calendar.types';

/**
 * Events overlapping `day`, sorted by start time. A multi-day event is returned for every day
 * it covers, so callers bucketing events per day get it in each. `day` is expected at midnight.
 */
export const eventsForDay = (day: Date, events: CalendarEvent[]): CalendarEvent[] =>
  events
    .filter(event => {
      const start = startOfDay(event.start);
      const end = startOfDay(event.end ?? event.start);
      return !isBefore(day, start) && !isAfter(day, end);
    })
    .sort((first, second) => first.start.getTime() - second.start.getTime());
