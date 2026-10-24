import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RelativeTimePipe } from './relative-time.pipe';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

/** A fixed local "now" late enough in the day that small hour offsets stay on the same date. */
const NOW = new Date(2026, 4, 20, 13, 0, 0);

function transform(value: Date | string | number, locale = 'en-US'): string {
  // A test may phrase several values, each through a freshly configured module.
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: locale }] });
  const pipe = TestBed.runInInjectionContext(() => new RelativeTimePipe());
  return pipe.transform(value);
}

function at(year: number, month: number, day: number, hours = 0): Date {
  return new Date(year, month, day, hours);
}

describe('RelativeTimePipe', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reads a sub-minute gap in either direction as now', () => {
    expect(transform(new Date(NOW.getTime() - 10_000))).toBe('now');
    expect(transform(new Date(NOW.getTime() + 10_000))).toBe('now');
  });

  it('counts minutes and hours in the past', () => {
    expect(transform(new Date(NOW.getTime() - 5 * MINUTE_MS))).toBe('5 minutes ago');
    expect(transform(new Date(NOW.getTime() - 3 * HOUR_MS))).toBe('3 hours ago');
  });

  it('counts minutes and hours in the future', () => {
    expect(transform(new Date(NOW.getTime() + 5 * MINUTE_MS))).toBe('in 5 minutes');
    expect(transform(new Date(NOW.getTime() + 3 * HOUR_MS))).toBe('in 3 hours');
  });

  it('names the neighbouring calendar days', () => {
    expect(transform(at(2026, 4, 19, 9))).toBe('yesterday');
    expect(transform(at(2026, 4, 21, 18))).toBe('tomorrow');
  });

  it('counts calendar days rather than 24-hour spans', () => {
    vi.setSystemTime(at(2026, 4, 20, 1));
    // 47 hours earlier lands two dates back.
    expect(transform(at(2026, 4, 18, 2))).toBe('2 days ago');
  });

  it('counts days up to a week away', () => {
    expect(transform(at(2026, 4, 14, 12))).toBe('6 days ago');
    expect(transform(at(2026, 4, 26, 12))).toBe('in 6 days');
  });

  it('falls back to an absolute date a week or more away', () => {
    expect(transform(at(2026, 4, 13, 12))).toBe('May 13, 2026');
    expect(transform(at(2026, 4, 27, 12))).toBe('May 27, 2026');
  });

  it('accepts an ISO string and a timestamp the same as a Date', () => {
    const date = new Date(NOW.getTime() - 5 * MINUTE_MS);
    expect(transform(date.toISOString())).toBe('5 minutes ago');
    expect(transform(date.getTime())).toBe('5 minutes ago');
  });

  // Russian carries real plural categories (one/few/many) and its own word for "now", so this pins
  // that the active locale drives the phrasing rather than a hardcoded English string.
  it("uses the active locale's own words and plural rules", () => {
    expect(transform(new Date(NOW.getTime() - 10_000), 'ru')).toBe('сейчас');
    expect(transform(new Date(NOW.getTime() - MINUTE_MS), 'ru')).toBe('1 минуту назад');
    expect(transform(new Date(NOW.getTime() - 3 * MINUTE_MS), 'ru')).toBe('3 минуты назад');
  });
});
