import { Day, startOfMonth, startOfWeek, subWeeks } from 'date-fns';
import { MONTH_GRID_ROWS } from './calendar.constants';

/** The run of week rows a month grid renders. */
export interface MonthWindow {
  /** First day of the window's first week. */
  start: Date;
  /** Week rows the window spans. */
  weekCount: number;
}

/**
 * Locates the grid window of the month containing `anchor`: the fixed run of weeks opening on
 * the week that holds the 1st, widened by `peekWeeks` further weeks on each side.
 */
export const buildMonthWindow = (
  anchor: Date,
  weekStartsOn: Day,
  peekWeeks: number,
): MonthWindow => ({
  start: subWeeks(startOfWeek(startOfMonth(anchor), { weekStartsOn }), peekWeeks),
  weekCount: MONTH_GRID_ROWS + 2 * peekWeeks,
});
