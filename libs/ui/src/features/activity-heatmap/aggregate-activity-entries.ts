import { startOfDay } from 'date-fns';
import { ActivityHeatmapEntry } from './activity-heatmap.types';

/** A day's summed activity together with the payload of the last entry that contributed to it. */
export interface ActivityHeatmapTotal {
  count: number;
  data: unknown;
}

/**
 * Sums entries per calendar day, keyed by the day's start-of-day timestamp so lookups
 * are exact regardless of the time of day each entry carries.
 */
export const aggregateActivityEntries = (
  entries: ActivityHeatmapEntry[],
): Map<number, ActivityHeatmapTotal> => {
  const totals = new Map<number, ActivityHeatmapTotal>();

  for (const entry of entries) {
    const key = startOfDay(entry.date).getTime();
    const existing = totals.get(key);
    const count = existing ? existing.count + entry.count : entry.count;
    // The last entry of a day wins the payload slot, so a single-entry-per-day feed —
    // the common case — always surfaces its own payload.
    totals.set(key, { count, data: entry.data });
  }

  return totals;
};
