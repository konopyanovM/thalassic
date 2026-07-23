import { assignEventLanes } from './assign-event-lanes';
import { CalendarEvent } from './calendar.types';

const event = (id: string, startHour: number, endHour: number): CalendarEvent => ({
  id,
  title: id,
  start: new Date(2026, 6, 20, startHour),
  end: new Date(2026, 6, 20, endHour),
});

describe('assignEventLanes', () => {
  it('gives non-overlapping events a single full-width lane', () => {
    const result = assignEventLanes([event('a', 9, 10), event('b', 11, 12)]);
    expect(result.every(item => item.laneCount === 1 && item.lane === 0)).toBe(true);
  });

  it('splits two overlapping events into two lanes', () => {
    const result = assignEventLanes([event('a', 9, 11), event('b', 10, 12)]);
    expect(result.map(item => item.laneCount)).toEqual([2, 2]);
    expect(new Set(result.map(item => item.lane))).toEqual(new Set([0, 1]));
  });

  it('reuses a lane for touching events (one ends as the next starts)', () => {
    const result = assignEventLanes([event('a', 9, 10), event('b', 10, 11)]);
    expect(result.every(item => item.laneCount === 1)).toBe(true);
  });

  it('keeps overlap clusters independent', () => {
    // a/b overlap (2 lanes); c is separate (1 lane).
    const result = assignEventLanes([event('a', 9, 11), event('b', 10, 12), event('c', 14, 15)]);
    const laneCountOf = (id: string): number => {
      const item = result.find(entry => entry.event.id === id);
      return item ? item.laneCount : 0;
    };
    expect(laneCountOf('a')).toBe(2);
    expect(laneCountOf('b')).toBe(2);
    expect(laneCountOf('c')).toBe(1);
  });
});
