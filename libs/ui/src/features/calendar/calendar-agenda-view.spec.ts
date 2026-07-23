import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarAgendaView } from './calendar-agenda-view';
import { CalendarEvent } from './calendar.types';

describe('CalendarAgendaView', () => {
  let fixture: ComponentFixture<CalendarAgendaView>;

  const query = (selector: string) =>
    (fixture.nativeElement as HTMLElement).querySelectorAll(selector);

  const setEvents = (events: CalendarEvent[]) => {
    fixture.componentRef.setInput('activeDate', new Date(2026, 6, 20));
    fixture.componentRef.setInput('events', events);
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CalendarAgendaView] }).compileComponents();
    fixture = TestBed.createComponent(CalendarAgendaView);
  });

  it('renders one row per day that has events, omitting empty days', async () => {
    setEvents([
      { id: '1', title: 'A', start: new Date(2026, 6, 3) },
      { id: '2', title: 'B', start: new Date(2026, 6, 10) },
    ]);
    await fixture.whenStable();
    expect(query('.tls-calendar-agenda-view__day').length).toBe(2);
  });

  it('shows an empty state when the month has no events', async () => {
    setEvents([]);
    await fixture.whenStable();
    expect(query('.tls-calendar-agenda-view__day').length).toBe(0);
    expect(query('.tls-calendar-agenda-view__empty').length).toBe(1);
  });

  it('lists a multi-day event under each day it covers', async () => {
    setEvents([
      { id: '1', title: 'Conference', start: new Date(2026, 6, 20), end: new Date(2026, 6, 22) },
    ]);
    await fixture.whenStable();
    expect(query('.tls-calendar-agenda-view__day').length).toBe(3);
    expect(query('tls-calendar-event').length).toBe(3);
  });

  it('ignores events outside the active month', async () => {
    setEvents([
      { id: '1', title: 'In', start: new Date(2026, 6, 15) },
      { id: '2', title: 'Out', start: new Date(2026, 7, 15) },
    ]);
    await fixture.whenStable();
    expect(query('.tls-calendar-agenda-view__day').length).toBe(1);
  });
});
