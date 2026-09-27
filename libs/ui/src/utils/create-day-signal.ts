import { computed, Signal } from '@angular/core';
import { startOfDay } from 'date-fns';

/**
 * The day `time` falls on, as its first moment, notifying only when the day
 * changes.
 *
 * A clock kept current to the minute would otherwise hand a new value to every
 * reader once a minute, and a reader that only asks "is this day today" — a grid
 * of day cells, a list of dates — would rebuild itself sixty times an hour for an
 * answer that changes once, at midnight.
 */
export const createDaySignal = (time: Signal<Date>): Signal<Date> =>
  computed(() => startOfDay(time()), {
    equal: (previous, next) => previous.getTime() === next.getTime(),
  });
