import { Day, eachDayOfInterval, endOfMonth, endOfWeek, startOfMonth, startOfWeek } from 'date-fns';

/**
 * Every day shown in a month grid for the month containing `anchor`: the natural 5–6 weeks that
 * cover it, starting at the first day of the first week (per `weekStartsOn`).
 */
export const buildMonthDays = (anchor: Date, weekStartsOn: Day): Date[] =>
  eachDayOfInterval({
    start: startOfWeek(startOfMonth(anchor), { weekStartsOn }),
    end: endOfWeek(endOfMonth(anchor), { weekStartsOn }),
  });
