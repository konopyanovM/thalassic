import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivityHeatmap } from './activity-heatmap';
import { DAYS_PER_WEEK } from './activity-heatmap.constants';
import { ActivityHeatmapDay, ActivityHeatmapEntry } from './activity-heatmap.types';

describe('ActivityHeatmap', () => {
  let component: ActivityHeatmap;
  let fixture: ComponentFixture<ActivityHeatmap>;

  // A fixed range of exactly four aligned weeks (Sunday 1 March – Saturday 28 March 2026).
  const start = new Date(2026, 2, 1);
  const end = new Date(2026, 2, 28);

  const queryDayCells = () =>
    (fixture.nativeElement as HTMLElement).querySelectorAll('.tls-activity-heatmap__day');
  const queryRows = () =>
    (fixture.nativeElement as HTMLElement).querySelectorAll('.tls-activity-heatmap__row');
  const queryWeekdayLabels = () =>
    Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.tls-activity-heatmap__weekday'),
    ).map(weekday => weekday.textContent?.trim() ?? '');
  const queryCellByLabel = (label: string) =>
    (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(`[aria-label="${label}"]`);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityHeatmap],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityHeatmap);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('startDate', start);
    fixture.componentRef.setInput('endDate', end);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders one row per weekday and one cell per day in the aligned range', async () => {
    expect(queryRows().length).toBe(DAYS_PER_WEEK);
    expect(queryDayCells().length).toBe(4 * DAYS_PER_WEEK);
  });

  it('pads the first and last week out of range', async () => {
    // The range is already week-aligned, so every rendered day sits inside it.
    const outside = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '.tls-activity-heatmap__day--outside',
    );
    expect(outside.length).toBe(0);

    fixture.componentRef.setInput('startDate', new Date(2026, 2, 3));
    await fixture.whenStable();

    expect(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.tls-activity-heatmap__day--outside')
        .length,
    ).toBe(2);
  });

  it('sums entries falling on the same day', async () => {
    const entries: ActivityHeatmapEntry[] = [
      { date: new Date(2026, 2, 10, 9), count: 2 },
      { date: new Date(2026, 2, 10, 18), count: 3 },
    ];
    fixture.componentRef.setInput('entries', entries);
    await fixture.whenStable();

    expect(queryCellByLabel('5 activities on March 10th, 2026')).toBeTruthy();
  });

  it('scales levels so the busiest day reaches the top level', async () => {
    const entries: ActivityHeatmapEntry[] = [
      { date: new Date(2026, 2, 10), count: 1 },
      { date: new Date(2026, 2, 11), count: 12 },
    ];
    fixture.componentRef.setInput('entries', entries);
    fixture.componentRef.setInput('levels', 5);
    await fixture.whenStable();

    const quietDay = queryCellByLabel('1 activity on March 10th, 2026');
    const busiestDay = queryCellByLabel('12 activities on March 11th, 2026');

    // Level 1 sits at the minimum intensity, the top level at the full color.
    expect(quietDay?.style.getPropertyValue('--tls-activity-heatmap-intensity')).toBe('0.35');
    expect(busiestDay?.style.getPropertyValue('--tls-activity-heatmap-intensity')).toBe('1');
  });

  it('leaves days without activity at the empty level', async () => {
    const emptyDay = queryCellByLabel('0 activities on March 10th, 2026');
    expect(emptyDay?.style.getPropertyValue('--tls-activity-heatmap-intensity')).toBe('0');
  });

  it('emits the activated day', async () => {
    fixture.componentRef.setInput('entries', [{ date: new Date(2026, 2, 10), count: 4 }]);
    await fixture.whenStable();

    const days: ActivityHeatmapDay[] = [];
    component.daySelect.subscribe(day => days.push(day));
    queryCellByLabel('4 activities on March 10th, 2026')?.click();

    expect(days.length).toBe(1);
    expect(days[0].count).toBe(4);
  });

  it('does not emit for a padding day outside the range', async () => {
    fixture.componentRef.setInput('startDate', new Date(2026, 2, 3));
    await fixture.whenStable();

    const days: ActivityHeatmapDay[] = [];
    component.daySelect.subscribe(day => days.push(day));
    queryCellByLabel('Outside the selected range')?.click();

    expect(days.length).toBe(0);
  });

  it('labels every other weekday row by default', () => {
    expect(queryWeekdayLabels()).toEqual(['', 'Mon', '', 'Wed', '', 'Fri', '']);
  });

  it('labels every weekday row at an interval of 1', async () => {
    fixture.componentRef.setInput('weekdayLabelInterval', 1);
    await fixture.whenStable();

    expect(queryWeekdayLabels()).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  });

  it('rotates the weekday rows to honour weekStartsOn', async () => {
    fixture.componentRef.setInput('weekdayLabelInterval', 1);
    fixture.componentRef.setInput('weekStartsOn', 1);
    await fixture.whenStable();

    expect(queryWeekdayLabels()).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  });

  it('labels each month spanning at least two week columns', async () => {
    const months = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '.tls-activity-heatmap__month',
    );
    expect(Array.from(months).map(month => month.textContent?.trim())).toEqual(['Mar']);
  });
});
