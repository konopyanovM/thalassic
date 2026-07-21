import { getDay } from 'date-fns';
import { buildMonthDays } from './build-month-days';

describe('buildMonthDays', () => {
  // July 2026 starts on a Wednesday and spans a natural 5 weeks with a Sunday start.
  const anchor = new Date(2026, 6, 20);

  it('starts on the configured first day of the week', () => {
    expect(getDay(buildMonthDays(anchor, 1)[0])).toBe(1);
  });

  it('covers the natural month span when no week count is given', () => {
    expect(buildMonthDays(anchor, 0).length).toBe(35);
  });

  it('returns exactly the requested number of weeks when fixed', () => {
    expect(buildMonthDays(anchor, 0, 6).length).toBe(42);
  });
});
