/** A single activity record. Records falling on the same calendar day are summed. */
export interface ActivityHeatmapEntry {
  /** Day the activity happened on; the time of day is ignored. */
  date: Date;
  /** Amount of activity on that day. */
  count: number;
  /** Consumer payload, surfaced on the resolved day and in the selection output. */
  data?: unknown;
}

/** A day cell resolved for rendering. */
export interface ActivityHeatmapDay {
  date: Date;
  /** Summed count of every entry on this day. */
  count: number;
  /** Intensity step: 0 for no activity, up to `levels - 1` for the busiest days. */
  level: number;
  /** Whether the day falls inside the requested range; padding days complete the first and last week. */
  inRange: boolean;
  isToday: boolean;
  /** Accessible name and tooltip text for the cell, resolved from the configured labels. */
  label: string;
  /** Payload of the last entry contributing to this day, `undefined` when there is none. */
  data: unknown;
}

/** One weekday row of the grid: a single weekday across every week column. */
export interface ActivityHeatmapRow {
  /** Weekday label, empty when the row is skipped by the weekday label interval. */
  label: string;
  days: ActivityHeatmapDay[];
}

/** A month heading spanning the week columns that belong to that month. */
export interface ActivityHeatmapMonth {
  label: string;
  /** 1-based grid column of the month's first week. */
  column: number;
  /** Week columns the heading spans. */
  span: number;
}
