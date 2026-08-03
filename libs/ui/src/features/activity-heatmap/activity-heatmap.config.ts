import { Day } from 'date-fns';
import { color, controlSize } from '../../types';

/** User-facing strings rendered by the heatmap, overridable for localization. */
export interface ActivityHeatmapLabels {
  /** Accessible name for the grid, used when the consumer supplies none. */
  grid: string;
  /** Accessible name and tooltip for a day inside the range, given its total and formatted date. */
  day: (count: number, date: string) => string;
  /** Accessible name for a padding day that only completes the first or last week. */
  outsideRange: string;
  /** Legend caption at the low-intensity end. */
  less: string;
  /** Legend caption at the high-intensity end. */
  more: string;
}

export interface ActivityHeatmapConfig {
  /** Intensity steps including the empty one, so `levels - 1` shades carry activity. */
  levels: number;
  /** First day of the week (`date-fns` convention: 0 = Sunday); becomes the grid's first row. */
  weekStartsOn: Day;
  /** Short weekday labels, Sunday-first; rotated to honour `weekStartsOn`. */
  weekDays: string[];
  /** Length of the default range in months, used when no `startDate` is given. */
  rangeMonths: number;
  /** Every nth weekday row carries a label, so dense grids stay legible; 1 labels every row. */
  weekdayLabelInterval: number;
  color: color;
  /** Cell size, driving the whole grid's density. */
  size: controlSize;
  showMonthLabels: boolean;
  showWeekdayLabels: boolean;
  showLegend: boolean;
  /** Whether hovering or focusing a day reveals its total in a tooltip. */
  showTooltip: boolean;
  labels: ActivityHeatmapLabels;
}

export const DEFAULT_ACTIVITY_HEATMAP_CONFIG: ActivityHeatmapConfig = {
  levels: 5,
  weekStartsOn: 0,
  weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  rangeMonths: 12,
  weekdayLabelInterval: 2,
  color: 'primary',
  size: 'md',
  showMonthLabels: true,
  showWeekdayLabels: true,
  showLegend: true,
  showTooltip: true,
  labels: {
    grid: 'Activity',
    day: (count, date) => `${count} ${count === 1 ? 'activity' : 'activities'} on ${date}`,
    outsideRange: 'Outside the selected range',
    less: 'Less',
    more: 'More',
  },
};
