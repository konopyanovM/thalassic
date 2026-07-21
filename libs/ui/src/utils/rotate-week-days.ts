import { Day } from 'date-fns';

/** Reorders Sunday-first weekday labels so the one for `weekStartsOn` comes first. */
export const rotateWeekDays = (weekDays: string[], weekStartsOn: Day): string[] => [
  ...weekDays.slice(weekStartsOn),
  ...weekDays.slice(0, weekStartsOn),
];
