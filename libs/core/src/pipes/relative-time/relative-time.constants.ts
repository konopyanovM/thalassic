/** One minute; any gap shorter than this, either way, reads as "now". */
export const RELATIVE_TIME_MINUTE_MS = 60_000;

/** One hour; gaps below it are counted in minutes. */
export const RELATIVE_TIME_HOUR_MS = 60 * RELATIVE_TIME_MINUTE_MS;

/** One day; gaps below it are counted in hours. */
export const RELATIVE_TIME_DAY_MS = 24 * RELATIVE_TIME_HOUR_MS;

/**
 * Calendar days within which a moment is still counted in days; from here on a relative count stops
 * being useful and the moment is written as an absolute date.
 */
export const RELATIVE_TIME_DAY_LIMIT = 7;

/** Angular date format of the absolute fallback beyond the day limit. */
export const RELATIVE_TIME_ABSOLUTE_FORMAT = 'mediumDate';
