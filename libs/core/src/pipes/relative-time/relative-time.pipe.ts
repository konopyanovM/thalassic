import { formatDate } from '@angular/common';
import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import {
  RELATIVE_TIME_ABSOLUTE_FORMAT,
  RELATIVE_TIME_DAY_LIMIT,
  RELATIVE_TIME_DAY_MS,
  RELATIVE_TIME_HOUR_MS,
  RELATIVE_TIME_MINUTE_MS,
} from './relative-time.constants';

/**
 * How far a moment lies from the present, in the coarsest unit that still reads as near — "now",
 * then minutes, hours, and calendar days, in the past ("3 hours ago", "yesterday") or the future
 * ("in 2 days", "tomorrow"). A moment a week or more away is written as an absolute date instead.
 *
 * All phrasing comes from `Intl.RelativeTimeFormat` in the active `LOCALE_ID`, which carries each
 * locale's own plural rules and its words for "now", "yesterday" and "tomorrow", so the pipe needs no
 * translated strings of its own.
 *
 * The pipe is pure: it measures against the clock when its input changes, not continuously, so a
 * value that must stay current on screen is re-bound by its host as time passes.
 */
@Pipe({ name: 'tlsRelativeTime' })
export class RelativeTimePipe implements PipeTransform {
  // Injections
  /** Locale the phrasing and the absolute fallback are written in. */
  private readonly _localeId = inject(LOCALE_ID);

  // Public methods
  /** Phrases the gap between `value` and the present. */
  public transform(value: Date | string | number): string {
    const date = new Date(value);
    const now = new Date();
    const differenceMs = date.getTime() - now.getTime();
    const distanceMs = Math.abs(differenceMs);

    // `auto` lets the locale use its idiomatic word where one exists ("now", "yesterday") in
    // place of a numeric "in 0 seconds" or "1 day ago".
    const relativeFormat = new Intl.RelativeTimeFormat(this._localeId, { numeric: 'auto' });

    if (distanceMs < RELATIVE_TIME_MINUTE_MS) return relativeFormat.format(0, 'second');

    if (distanceMs < RELATIVE_TIME_HOUR_MS) {
      return relativeFormat.format(Math.trunc(differenceMs / RELATIVE_TIME_MINUTE_MS), 'minute');
    }

    if (distanceMs < RELATIVE_TIME_DAY_MS) {
      return relativeFormat.format(Math.trunc(differenceMs / RELATIVE_TIME_HOUR_MS), 'hour');
    }

    // Days count calendar days rather than 24-hour spans, so "yesterday" always names the
    // previous date: 47 hours before 1 am is two dates back, not one.
    const calendarDays = calendarDayDifference(now, date);
    if (Math.abs(calendarDays) < RELATIVE_TIME_DAY_LIMIT) {
      return relativeFormat.format(calendarDays, 'day');
    }

    return formatDate(date, RELATIVE_TIME_ABSOLUTE_FORMAT, this._localeId);
  }
}

/** Whole local calendar dates from `from` to `to`, negative when `to` is earlier. */
function calendarDayDifference(from: Date, to: Date): number {
  const fromMidnight = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const toMidnight = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  // A daylight-saving shift makes one day 23 or 25 hours long; rounding absorbs it.
  return Math.round((toMidnight.getTime() - fromMidnight.getTime()) / RELATIVE_TIME_DAY_MS);
}
