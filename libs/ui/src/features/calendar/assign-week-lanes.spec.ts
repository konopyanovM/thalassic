import { assignWeekLanes } from './assign-week-lanes';
import { CalendarEvent } from './calendar.types';

// A Sunday-start week: Jul 19–25, 2026.
const weekDays = Array.from({ length: 7 }, (_, index) => new Date(2026, 6, 19 + index));

const event = (id: string, startDay: number, endDay: number): CalendarEvent => ({
  id,
  title: id,
  start: new Date(2026, 6, startDay),
  end: new Date(2026, 6, endDay),
});

describe('assignWeekLanes', () => {
  it('spans a multi-day event across its day columns as one segment', () => {
    const [segment] = assignWeekLanes(weekDays, [event('a', 20, 22)]);
    expect(segment.startColumn).toBe(1);
    expect(segment.endColumn).toBe(3);
    expect(segment.lane).toBe(0);
  });

  it('pushes an overlapping event to the next lane', () => {
    const result = assignWeekLanes(weekDays, [event('a', 19, 22), event('b', 20, 23)]);
    const laneOf = (id: string): number => {
      const segment = result.find(entry => entry.event.id === id);
      return segment ? segment.lane : -1;
    };
    expect(laneOf('a')).toBe(0);
    expect(laneOf('b')).toBe(1);
  });

  it('reuses a lane for non-overlapping events', () => {
    const result = assignWeekLanes(weekDays, [event('a', 19, 20), event('b', 23, 24)]);
    expect(result.every(segment => segment.lane === 0)).toBe(true);
  });

  it('clips an event overflowing the week and flags the continuation edges', () => {
    // Jul 17–21 starts before the week (Sun Jul 19) and ends inside it.
    const [segment] = assignWeekLanes(weekDays, [event('a', 17, 21)]);
    expect(segment.startColumn).toBe(0);
    expect(segment.endColumn).toBe(2);
    expect(segment.continuesBefore).toBe(true);
    expect(segment.continuesAfter).toBe(false);
  });

  it('ignores events outside the week', () => {
    expect(assignWeekLanes(weekDays, [event('a', 1, 2)])).toEqual([]);
  });
});
