import { buildMonthWindow } from './build-month-window';

/** Monday-start: August 2026 opens on Sat the 1st, so its window starts Mon Jul 27. */
const MONDAY = 1;

describe('buildMonthWindow', () => {
  it('opens on the week holding the 1st and spans six weeks', () => {
    expect(buildMonthWindow(new Date(2026, 7, 15), MONDAY, { before: 0, after: 0 })).toEqual({
      start: new Date(2026, 6, 27),
      weekCount: 6,
    });
  });

  it('widens by the peek weeks on both sides', () => {
    expect(buildMonthWindow(new Date(2026, 7, 15), MONDAY, { before: 1, after: 1 })).toEqual({
      start: new Date(2026, 6, 20),
      weekCount: 8,
    });
    expect(buildMonthWindow(new Date(2026, 7, 15), MONDAY, { before: 2, after: 2 })).toEqual({
      start: new Date(2026, 6, 13),
      weekCount: 10,
    });
  });

  it('widens each edge by its own count', () => {
    // A week above alone: the window opens a week early and closes where the month's own does.
    expect(buildMonthWindow(new Date(2026, 7, 15), MONDAY, { before: 1, after: 0 })).toEqual({
      start: new Date(2026, 6, 20),
      weekCount: 7,
    });
    // A week below alone: the window opens with the month's own and runs a week longer.
    expect(buildMonthWindow(new Date(2026, 7, 15), MONDAY, { before: 0, after: 1 })).toEqual({
      start: new Date(2026, 6, 27),
      weekCount: 7,
    });
  });

  it('respects the week start when locating the window', () => {
    // Sunday-start: August 2026's first week opens on Sun Jul 26.
    expect(buildMonthWindow(new Date(2026, 7, 15), 0, { before: 1, after: 1 })).toEqual({
      start: new Date(2026, 6, 19),
      weekCount: 8,
    });
  });
});
