import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Calendar } from './calendar';
import { DAYS_PER_WEEK, MAX_DAY_MARKERS, MONTH_GRID_ROWS } from './calendar.constants';
import { CalendarEvent, CalendarRange } from './calendar.types';

describe('Calendar', () => {
  let component: Calendar;
  let fixture: ComponentFixture<Calendar>;

  const queryDayCells = () =>
    (fixture.nativeElement as HTMLElement).querySelectorAll('.tls-calendar-month-view__day');
  const queryTitle = () =>
    (fixture.nativeElement as HTMLElement).querySelector('.tls-calendar__title');
  const hostClasses = () => Array.from((fixture.nativeElement as HTMLElement).classList);
  const queryMonthView = () =>
    (fixture.nativeElement as HTMLElement).querySelector('tls-calendar-month-view');
  const queryHeader = () =>
    (fixture.nativeElement as HTMLElement).querySelector('.tls-calendar__header');
  const queryNav = () => (fixture.nativeElement as HTMLElement).querySelector('.tls-calendar__nav');
  const querySwitcher = () =>
    (fixture.nativeElement as HTMLElement).querySelector('.tls-calendar__views');
  const querySwitcherLabels = () =>
    Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.tls-toggle-group__option'),
    ).map(option => (option.textContent ?? '').trim());

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

  it('offers only the views it was given, in that order', async () => {
    fixture.componentRef.setInput('views', ['agenda', 'day']);
    await fixture.whenStable();

    expect(querySwitcherLabels()).toEqual(['Agenda', 'Day']);
  });

  it('pulls the active view back into the offered set', async () => {
    fixture.componentRef.setInput('views', ['week', 'day']);
    await fixture.whenStable();

    expect(component.view()).toBe('week');
  });

  it('hides the switcher when a single view is offered', async () => {
    fixture.componentRef.setInput('views', ['month']);
    await fixture.whenStable();

    expect(querySwitcher()).toBeNull();
    expect(queryHeader()).not.toBeNull();
  });

  it('hides individual header parts on request', async () => {
    fixture.componentRef.setInput('showNavigation', false);
    fixture.componentRef.setInput('showTitle', false);
    await fixture.whenStable();

    expect(queryNav()).toBeNull();
    expect(queryTitle()).toBeNull();
    expect(querySwitcher()).not.toBeNull();
  });

  it('drops the header once every part of it is hidden', async () => {
    fixture.componentRef.setInput('showNavigation', false);
    fixture.componentRef.setInput('showTitle', false);
    fixture.componentRef.setInput('showViewSwitcher', false);
    await fixture.whenStable();

    expect(queryHeader()).toBeNull();
    // The view itself is untouched by header composition.
    expect(queryDayCells().length).toBe(MONTH_GRID_ROWS * DAYS_PER_WEEK);
  });

  it('keeps navigating with the header hidden', async () => {
    fixture.componentRef.setInput('showHeader', false);
    await fixture.whenStable();
    component.next();
    await fixture.whenStable();

    expect(component.activeDate().getMonth()).toBe(7);
  });

  it('defers the density decision to the rendered width by default', () => {
    expect(hostClasses()).toContain('tls-calendar--compact-auto');
    expect(hostClasses()).not.toContain('tls-calendar--compact');
  });

  it('pins the dense layout on', async () => {
    fixture.componentRef.setInput('compact', true);
    await fixture.whenStable();

    expect(hostClasses()).toContain('tls-calendar--compact');
    expect(hostClasses()).not.toContain('tls-calendar--compact-auto');
  });

  it('pins the dense layout off, leaving neither density class to match', async () => {
    fixture.componentRef.setInput('compact', false);
    await fixture.whenStable();

    expect(hostClasses()).not.toContain('tls-calendar--compact');
    expect(hostClasses()).not.toContain('tls-calendar--compact-auto');
  });

  it('lets day cells size to their events by default', () => {
    expect(queryMonthView()?.classList).not.toContain('tls-calendar-month-view--square');
  });

  it('holds day cells to a square on request', async () => {
    fixture.componentRef.setInput('squareCells', true);
    await fixture.whenStable();

    expect(queryMonthView()?.classList).toContain('tls-calendar-month-view--square');
  });

  it('marks a day with one dot per event, capped', async () => {
    const start = new Date(2026, 6, 20);
    fixture.componentRef.setInput('events', [
      { id: '1', title: 'A', start, color: 'success' },
      { id: '2', title: 'B', start },
      { id: '3', title: 'C', start },
      { id: '4', title: 'D', start },
    ]);
    await fixture.whenStable();

    const markers = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.tls-calendar-month-view__marker'),
    );
    expect(markers.length).toBe(MAX_DAY_MARKERS);
    expect(markers[0].classList).toContain('tls-calendar-month-view__marker--success');
    expect(markers[1].className).toBe('tls-calendar-month-view__marker');
  });

  it('summarises a marked day for assistive technology, counting past the dot cap', async () => {
    const start = new Date(2026, 6, 20);
    fixture.componentRef.setInput('events', [
      { id: '1', title: 'A', start },
      { id: '2', title: 'B', start },
      { id: '3', title: 'C', start },
      { id: '4', title: 'D', start },
    ]);
    await fixture.whenStable();

    const label = (fixture.nativeElement as HTMLElement).querySelector(
      '.tls-calendar-month-view__markers-label',
    );
    expect(label?.textContent?.trim()).toBe('4 events');
  });

  it('leaves an unmarked day without a marker group at all', async () => {
    fixture.componentRef.setInput('events', []);
    await fixture.whenStable();

    expect(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.tls-calendar-month-view__markers')
        .length,
    ).toBe(0);
  });

  it('hands a day cell over to a consumer template, with that day and its events', async () => {
    @Component({
      selector: 'tls-day-template-host',
      imports: [Calendar],
      template: `
        <tls-calendar [activeDate]="date" [events]="events">
          <ng-template #dayTemplate let-day let-events="events" let-isToday="isToday">
            <span class="custom-day" [class.custom-day--today]="isToday">
              {{ day.getDate() }}/{{ events.length }}
            </span>
          </ng-template>
        </tls-calendar>
      `,
    })
    class DayTemplateHost {
      readonly date = new Date(2026, 6, 20);
      readonly events: CalendarEvent[] = [
        { id: '1', title: 'A', start: new Date(2026, 6, 20) },
        { id: '2', title: 'B', start: new Date(2026, 6, 20) },
      ];
    }

    const host = TestBed.createComponent(DayTemplateHost);
    await host.whenStable();
    const element = host.nativeElement as HTMLElement;

    // The slot replaces the default cell content everywhere, not just on days that have events.
    expect(element.querySelectorAll('.custom-day').length).toBe(MONTH_GRID_ROWS * DAYS_PER_WEEK);
    expect(element.querySelector('.tls-calendar-month-view__day-number')).toBeNull();

    const cells = Array.from(element.querySelectorAll('.custom-day')).map(cell =>
      (cell.textContent ?? '').trim(),
    );
    expect(cells).toContain('20/2');
    expect(cells).toContain('21/0');
  });

  it('renders a multi-day event as one bar spanning its days', async () => {
    const event: CalendarEvent = {
      id: '1',
      title: 'Conference',
      start: new Date(2026, 6, 20),
      end: new Date(2026, 6, 22),
    };
    fixture.componentRef.setInput('events', [event]);
    await fixture.whenStable();

    const bars = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
      'tls-calendar-event',
    );
    expect(bars.length).toBe(1);
    // Jul 20 is a Monday → column 2, spanning 3 days (Mon–Wed).
    expect(bars[0].style.gridColumn).toBe('2 / span 3');
  });

  it('applies a modifier class for a semantic color and none for an uncolored event', async () => {
    fixture.componentRef.setInput('events', [
      { id: 'token', title: 'Token', start: new Date(2026, 6, 20), color: 'success' },
      { id: 'plain', title: 'Plain', start: new Date(2026, 6, 21) },
    ]);
    await fixture.whenStable();

    const chips = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        '.tls-calendar-event__button',
      ),
    );
    const tokenChip = chips.find(chip => (chip.textContent ?? '').includes('Token'));
    const plainChip = chips.find(chip => (chip.textContent ?? '').includes('Plain'));

    expect(tokenChip).toBeTruthy();
    expect(plainChip).toBeTruthy();
    if (!tokenChip || !plainChip) return;

    expect(tokenChip.classList).toContain('tls-calendar-event__button--success');
    expect(plainChip.classList).not.toContain('tls-calendar-event__button--success');
    expect(plainChip.className).toBe('tls-calendar-event__button');
  });
});
