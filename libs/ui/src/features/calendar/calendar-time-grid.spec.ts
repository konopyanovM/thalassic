import { ComponentFixture, TestBed } from '@angular/core/testing';
import { addDays, setHours, startOfWeek } from 'date-fns';
import { CalendarTimeGrid } from './calendar-time-grid';
import { CalendarEvent } from './calendar.types';

const anchor = new Date(2026, 6, 20);
const weekStart = startOfWeek(anchor, { weekStartsOn: 0 });

const timed = (id: string, dayOffset: number, startHour: number, endHour: number): CalendarEvent => ({
  id,
  title: id,
  start: setHours(addDays(weekStart, dayOffset), startHour),
  end: setHours(addDays(weekStart, dayOffset), endHour),
});

describe('CalendarTimeGrid', () => {
  let fixture: ComponentFixture<CalendarTimeGrid>;

  const setInputs = (days: Date[], events: CalendarEvent[]) => {
    fixture.componentRef.setInput('days', days);
    fixture.componentRef.setInput('events', events);
    fixture.componentRef.setInput('view', 'week');
    fixture.componentRef.setInput('hourStart', 0);
    fixture.componentRef.setInput('hourEnd', 24);
    fixture.componentRef.setInput('showAllDayRow', true);
  };

  const query = (selector: string) =>
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(selector));

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CalendarTimeGrid] }).compileComponents();
    fixture = TestBed.createComponent(CalendarTimeGrid);
  });

  it('renders one column per day', async () => {
    setInputs(
      [addDays(weekStart, 0), addDays(weekStart, 1), addDays(weekStart, 2)],
      [],
    );
    await fixture.whenStable();
    expect(query('.tls-calendar-time-grid__column').length).toBe(3);
  });

  it('positions a timed event by its start and duration', async () => {
    setInputs([addDays(weekStart, 1)], [timed('a', 1, 9, 11)]);
    await fixture.whenStable();

    const chips = query('.tls-calendar-time-grid__event');
    expect(chips.length).toBe(1);
    // 9:00 with a 48px hour → top 432px, height 96px.
    expect(chips[0].style.top).toBe('432px');
    expect(chips[0].style.height).toBe('96px');
  });

  it('lays overlapping events into half-width side-by-side lanes', async () => {
    setInputs([addDays(weekStart, 1)], [timed('a', 1, 9, 11), timed('b', 1, 10, 12)]);
    await fixture.whenStable();

    const chips = query('.tls-calendar-time-grid__event');
    expect(chips.length).toBe(2);
    expect(chips.every(chip => chip.style.width === '50%')).toBe(true);
  });

  it('routes all-day events to the all-day row', async () => {
    const allDay: CalendarEvent = {
      id: 'holiday',
      title: 'Holiday',
      start: addDays(weekStart, 1),
      allDay: true,
    };
    setInputs([addDays(weekStart, 1)], [allDay]);
    await fixture.whenStable();

    expect(query('.tls-calendar-time-grid__all-day-cell tls-calendar-event').length).toBe(1);
    expect(query('.tls-calendar-time-grid__event').length).toBe(0);
  });
});
