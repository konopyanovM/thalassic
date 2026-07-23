import { CalendarEvent } from './calendar.types';
import { eventCoversDay } from './event-covers-day';

/**
 * Events overlapping `day`, sorted by start time. A multi-day event is returned for every day
 * it covers, so callers bucketing events per day get it in each. `day` is expected at midnight.
 */
export const eventsForDay = (day: Date, events: CalendarEvent[]): CalendarEvent[] =>
  events
    .filter(event => eventCoversDay(event, day))
    .sort((first, second) => first.start.getTime() - second.start.getTime());
