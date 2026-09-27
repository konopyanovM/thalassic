/**
 * How often a component's notion of "now" refreshes. Fine enough for a current-time line;
 * a reader that only needs the day derives one from it (see `createDaySignal`).
 */
export const NOW_REFRESH_INTERVAL_MS = 60_000;
