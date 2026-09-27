import { computed, signal } from '@angular/core';
import { createDaySignal } from './create-day-signal';

describe('createDaySignal', () => {
  it('holds the first moment of the day the time falls on', () => {
    const day = createDaySignal(signal(new Date(2026, 8, 27, 14, 35)));

    expect(day()).toEqual(new Date(2026, 8, 27));
  });

  it('notifies nothing downstream while the time moves within one day', () => {
    const time = signal(new Date(2026, 8, 27, 14, 35));
    const day = createDaySignal(time);
    let rebuilds = 0;
    const reader = computed(() => {
      rebuilds++;
      return day();
    });

    reader();
    time.set(new Date(2026, 8, 27, 14, 36));
    reader();
    time.set(new Date(2026, 8, 27, 23, 59));
    reader();

    expect(rebuilds).toBe(1);
  });

  it('moves on when the time crosses into the next day', () => {
    const time = signal(new Date(2026, 8, 27, 23, 59));
    const day = createDaySignal(time);

    time.set(new Date(2026, 8, 28, 0, 0));

    expect(day()).toEqual(new Date(2026, 8, 28));
  });
});
