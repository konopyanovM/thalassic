import {
  addDays,
  Day,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

const DAYS_IN_WEEK = 7;

/**
 * Every day shown in a month grid for the month containing `anchor`, starting at the
 * first day of the first week (per `weekStartsOn`).
 *
 * With `weeks` omitted the span is the natural 5–6 weeks that cover the month. Passing a
 * fixed `weeks` count returns exactly that many weeks, so the grid height never reflows
 * between months.
 */
export const buildMonthDays = (anchor: Date, weekStartsOn: Day, weeks?: number): Date[] => {
  const start = startOfWeek(startOfMonth(anchor), { weekStartsOn });
  const end =
    weeks === undefined
      ? endOfWeek(endOfMonth(anchor), { weekStartsOn })
      : addDays(start, weeks * DAYS_IN_WEEK - 1);

  return eachDayOfInterval({ start, end });
};
