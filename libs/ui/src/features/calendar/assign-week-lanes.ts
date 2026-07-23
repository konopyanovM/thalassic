import { differenceInCalendarDays, startOfDay } from 'date-fns';
import { CalendarEvent } from './calendar.types';

/** An event clipped to one week row and packed into a horizontal lane. */
export interface WeekEventSegment {
  event: CalendarEvent;
  /** 0-based first/last day column the bar covers within the week. */
  startColumn: number;
  endColumn: number;
  /** 0-based row the bar occupies; stable for every column it spans. */
  lane: number;
  /** The event extends past this week's start/end (bar is clipped on that edge). */
  continuesBefore: boolean;
  continuesAfter: boolean;
}

/**
 * Clips each event to the given week and packs them into shared lanes (first-fit): every event
 * gets the lowest lane whose occupied day-columns don't overlap it, so a multi-day event keeps
 * one continuous bar and non-overlapping events share a lane. Longer, earlier events settle into
 * the top lanes.
 */
export const assignWeekLanes = (weekDays: Date[], events: CalendarEvent[]): WeekEventSegment[] => {
  const weekStart = startOfDay(weekDays[0]);
  const lastColumn = weekDays.length - 1;

  const segments = events
    .map(event => {
      const startColumn = differenceInCalendarDays(startOfDay(event.start), weekStart);
      const endColumn = differenceInCalendarDays(startOfDay(event.end ?? event.start), weekStart);
      return { event, startColumn, endColumn, startTime: event.start.getTime() };
    })
    .filter(segment => segment.endColumn >= 0 && segment.startColumn <= lastColumn)
    .map(segment => ({
      event: segment.event,
      startColumn: Math.max(0, segment.startColumn),
      endColumn: Math.min(lastColumn, segment.endColumn),
      continuesBefore: segment.startColumn < 0,
      continuesAfter: segment.endColumn > lastColumn,
      startTime: segment.startTime,
    }));

  // Earliest column first, then longest span, then earliest real start — so bars settle top-down.
  segments.sort((first, second) => {
    if (first.startColumn !== second.startColumn) return first.startColumn - second.startColumn;
    const firstSpan = first.endColumn - first.startColumn;
    const secondSpan = second.endColumn - second.startColumn;
    if (firstSpan !== secondSpan) return secondSpan - firstSpan;
    return first.startTime - second.startTime;
  });

  const laneRanges: [number, number][][] = [];

  return segments.map(segment => {
    let lane = 0;
    for (;;) {
      if (laneRanges[lane] === undefined) laneRanges[lane] = [];
      const ranges = laneRanges[lane];
      const overlaps = ranges.some(
        ([start, end]) => segment.startColumn <= end && start <= segment.endColumn,
      );
      if (!overlaps) {
        ranges.push([segment.startColumn, segment.endColumn]);
        break;
      }
      lane++;
    }

    return {
      event: segment.event,
      startColumn: segment.startColumn,
      endColumn: segment.endColumn,
      lane,
      continuesBefore: segment.continuesBefore,
      continuesAfter: segment.continuesAfter,
    };
  });
};
