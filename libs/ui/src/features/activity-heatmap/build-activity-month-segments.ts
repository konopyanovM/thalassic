import { isSameMonth } from 'date-fns';
import { ActivityHeatmapMonth } from './activity-heatmap.types';

/** Week columns a month must cover before it earns a heading, so slivers stay unlabelled. */
const MIN_SEGMENT_WEEKS = 2;

/** A month segment still being extended, holding the anchor date its label is formatted from. */
interface PendingSegment {
  date: Date;
  column: number;
  span: number;
}

/**
 * Month headings for the week columns starting at `weekStarts`, each spanning the columns
 * whose first day falls in that month. `formatMonth` renders the heading text, keeping the
 * locale concern with the caller.
 *
 * Segments are emitted as they close, so a discarded sliver is never formatted.
 */
export const buildActivityMonthSegments = (
  weekStarts: Date[],
  formatMonth: (date: Date) => string,
): ActivityHeatmapMonth[] => {
  const segments: ActivityHeatmapMonth[] = [];
  let pending: PendingSegment | undefined;

  const close = (segment: PendingSegment): void => {
    if (segment.span < MIN_SEGMENT_WEEKS) return;
    segments.push({ label: formatMonth(segment.date), column: segment.column, span: segment.span });
  };

  for (let index = 0; index < weekStarts.length; index++) {
    const weekStart = weekStarts[index];

    if (pending && isSameMonth(pending.date, weekStart)) {
      pending.span++;
      continue;
    }

    if (pending) close(pending);
    // Grid columns are 1-based.
    pending = { date: weekStart, column: index + 1, span: 1 };
  }

  if (pending) close(pending);

  return segments;
};
