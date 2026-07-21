import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Calendar } from './calendar';
import { DAYS_PER_WEEK, MONTH_GRID_ROWS } from './calendar.constants';
import { CalendarEvent, CalendarRange } from './calendar.types';

describe('Calendar', () => {
  let component: Calendar;
  let fixture: ComponentFixture<Calendar>;

  const queryDayCells = () =>
    (fixture.nativeElement as HTMLElement).querySelectorAll('.tls-calendar-month-view__day');
  const queryTitle = () =>
    (fixture.nativeElement as HTMLElement).querySelector('.tls-calendar__title');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Calendar],
    }).compileComponents();

    fixture = TestBed.createComponent(Calendar);
    component = fixture.componentInstance;
    // A fixed anchor so the rendered month is deterministic.
    fixture.componentRef.setInput('activeDate', new Date(2026, 6, 20));
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a full 6-week month grid', () => {
    expect(queryDayCells().length).toBe(MONTH_GRID_ROWS * DAYS_PER_WEEK);
  });

  it('titles the header with the active month', () => {
    expect(queryTitle()?.textContent).toContain('July 2026');
  });

  it('advances the anchor month with next()', async () => {
    component.next();
    await fixture.whenStable();
    expect(queryTitle()?.textContent).toContain('August 2026');
  });

  it('rewinds the anchor month with previous()', async () => {
    component.previous();
    await fixture.whenStable();
    expect(queryTitle()?.textContent).toContain('June 2026');
  });

  it('emits the visible range covering the active month', async () => {
    const ranges: CalendarRange[] = [];
    component.rangeChange.subscribe(range => ranges.push(range));
    component.next();
    await fixture.whenStable();

    const latest = ranges[ranges.length - 1];
    expect(latest.start.getTime()).toBeLessThanOrEqual(new Date(2026, 7, 1).getTime());
    expect(latest.end.getTime()).toBeGreaterThan(new Date(2026, 7, 31).getTime());
  });

  it('buckets a multi-day event onto every day it covers', async () => {
    const event: CalendarEvent = {
      id: '1',
      title: 'Conference',
      start: new Date(2026, 6, 20),
      end: new Date(2026, 6, 22),
    };
    fixture.componentRef.setInput('events', [event]);
    await fixture.whenStable();

    const chips = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '.tls-calendar-month-view__event',
    );
    expect(chips.length).toBe(3);
  });

  it('applies a modifier class for a semantic color and an inline var for a raw one', async () => {
    fixture.componentRef.setInput('events', [
      { id: 'token', title: 'Token', start: new Date(2026, 6, 20), color: 'success' },
      { id: 'raw', title: 'Raw', start: new Date(2026, 6, 21), color: '#7c3aed' },
    ]);
    await fixture.whenStable();

    const chips = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        '.tls-calendar-month-view__event',
      ),
    );
    const tokenChip = chips.find(chip => (chip.textContent ?? '').includes('Token'));
    const rawChip = chips.find(chip => (chip.textContent ?? '').includes('Raw'));

    expect(tokenChip).toBeTruthy();
    expect(rawChip).toBeTruthy();
    if (!tokenChip || !rawChip) return;

    expect(tokenChip.classList).toContain('tls-calendar-month-view__event--success');
    expect(tokenChip.style.getPropertyValue('--tls-calendar-event-color')).toBe('');
    expect(rawChip.classList).not.toContain('tls-calendar-month-view__event--success');
    expect(rawChip.style.getPropertyValue('--tls-calendar-event-color')).toBe('#7c3aed');
  });
});
