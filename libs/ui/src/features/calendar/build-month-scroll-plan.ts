import { Day, differenceInCalendarDays } from 'date-fns';
import { buildMonthWindow } from './build-month-window';
import { DAYS_PER_WEEK, MONTH_GRID_ROWS } from './calendar.constants';

/**
 * Geometry of a month-navigation scroll: the widened week window that holds both the outgoing
 * and the incoming month grid, and where each grid sits inside it, in week rows.
 */
export interface MonthScrollPlan {
  /** First day of the union window's first week. */
  unionStart: Date;
  /** Week rows the union window spans. */
  weekCount: number;
  /** Row offset of the outgoing month's window within the union. */
  fromRow: number;
  /** Row offset of the incoming month's window within the union. */
  toRow: number;
}

/**
 * Plans the scroll between two months' grid windows, or `null` when there is nothing to scroll:
 * both dates render the same window, or the windows are so far apart that the weeks between
 * them would dwarf the grids themselves — a far jump reads better as a plain swap.
 */
export const buildMonthScrollPlan = (
  from: Date,
  to: Date,
  weekStartsOn: Day,
  peekWeeks: number,
): MonthScrollPlan | null => {
  const fromWindow = buildMonthWindow(from, weekStartsOn, peekWeeks);
  const toWindow = buildMonthWindow(to, weekStartsOn, peekWeeks);

  // Calendar days, not milliseconds: a DST shift must not break the whole-week arithmetic.
  const offsetWeeks = differenceInCalendarDays(toWindow.start, fromWindow.start) / DAYS_PER_WEEK;
  if (offsetWeeks === 0) return null;
  // Measured against the months' own weeks rather than the widened windows, so how far a jump
  // may scroll does not grow with the peek: beyond a full month grid of distance the two
  // months no longer touch, while adjacent months always do.
  if (Math.abs(offsetWeeks) > MONTH_GRID_ROWS) return null;

  const distance = Math.abs(offsetWeeks);
  const forward = offsetWeeks > 0;
  return {
    unionStart: forward ? fromWindow.start : toWindow.start,
    weekCount: distance + fromWindow.weekCount,
    fromRow: forward ? 0 : distance,
    toRow: forward ? distance : 0,
  };
};
