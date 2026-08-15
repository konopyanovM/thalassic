import { buildMonthScrollPlan } from './build-month-scroll-plan';

// Monday-start windows: August 2026 spans Mon Jul 27 – Sun Sep 6, September's
// window starts Mon Aug 31 — five week rows further down.
const MONDAY = 1;

describe('buildMonthScrollPlan', () => {
  it('plans a forward scroll from the outgoing window down to the incoming one', () => {
    const plan = buildMonthScrollPlan(new Date(2026, 7, 15), new Date(2026, 8, 15), MONDAY);
    expect(plan).toEqual({
      unionStart: new Date(2026, 6, 27),
      weekCount: 11,
      fromRow: 0,
      toRow: 5,
    });
  });

  it('plans a backward scroll anchored on the incoming window', () => {
    const plan = buildMonthScrollPlan(new Date(2026, 8, 15), new Date(2026, 7, 15), MONDAY);
    expect(plan).toEqual({
      unionStart: new Date(2026, 6, 27),
      weekCount: 11,
      fromRow: 5,
      toRow: 0,
    });
  });

  it('returns null when both dates render the same window', () => {
    expect(buildMonthScrollPlan(new Date(2026, 7, 3), new Date(2026, 7, 28), MONDAY)).toBeNull();
  });

  it('returns null for a jump whose windows no longer touch', () => {
    expect(buildMonthScrollPlan(new Date(2026, 6, 15), new Date(2026, 9, 15), MONDAY)).toBeNull();
  });

  it('respects the week start when locating the windows', () => {
    // Sunday-start: August 2026's window opens on Sun Jul 26, September's on Sun Aug 30.
    const plan = buildMonthScrollPlan(new Date(2026, 7, 15), new Date(2026, 8, 15), 0);
    expect(plan).toEqual({
      unionStart: new Date(2026, 6, 26),
      weekCount: 11,
      fromRow: 0,
      toRow: 5,
    });
  });
});
