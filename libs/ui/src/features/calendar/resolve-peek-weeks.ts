import { CalendarPeekWeeks } from './calendar.types';

/**
 * Settles a count of week rows on one that still draws a grid: a fraction would open the grid
 * mid-week and a negative would cut into the month itself.
 */
const toRowCount = (value: number): number => Math.max(0, Math.trunc(value) || 0);

/**
 * Reads a peek given either as one count for both edges of the grid or as a count for each.
 *
 * @example
 * resolvePeekWeeks(1);                        // { before: 1, after: 1 }  one count, both edges
 * resolvePeekWeeks({ before: 1, after: 0 });  // { before: 1, after: 0 }  each edge on its own
 * resolvePeekWeeks(1.8);                      // { before: 1, after: 1 }  fraction dropped
 * resolvePeekWeeks({ before: -2, after: 1 }); // { before: 0, after: 1 }  negative settles on none
 */
export const resolvePeekWeeks = (value: number | CalendarPeekWeeks): CalendarPeekWeeks =>
  typeof value === 'number'
    ? { before: toRowCount(value), after: toRowCount(value) }
    : { before: toRowCount(value.before), after: toRowCount(value.after) };
