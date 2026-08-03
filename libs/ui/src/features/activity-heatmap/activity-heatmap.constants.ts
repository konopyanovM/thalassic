/** Days in a calendar week; the grid renders one weekday row each. */
export const DAYS_PER_WEEK = 7;

/** Lowest meaningful step count: an empty step plus a single activity step. */
export const MIN_LEVELS = 2;

/** `date-fns` format token for a month heading above the week columns, e.g. "Jul". */
export const MONTH_LABEL_FORMAT = 'MMM';

/** `date-fns` format token for a day's accessible name, e.g. "July 20th, 2026". */
export const DAY_LABEL_FORMAT = 'PPP';

/**
 * Share of the color a level-1 cell already carries, so the faintest activity step stays
 * distinguishable from an empty day instead of fading into the surface.
 */
export const MIN_LEVEL_INTENSITY = 0.35;

/** How often the heatmap's notion of "today" refreshes, so the marker survives midnight. */
export const NOW_REFRESH_INTERVAL_MS = 60_000;
