import { ComponentFixture, TestBed } from '@angular/core/testing';
import { hourCycle, LOCALE_CONFIG } from '../../../../abstract/locale';
import { TimePicker } from './time-picker';

describe('TimePicker', () => {
  let component: TimePicker;
  let fixture: ComponentFixture<TimePicker>;

  const createComponent = async (cycle: hourCycle, value: Date): Promise<void> => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [TimePicker],
      providers: [{ provide: LOCALE_CONFIG, useValue: { hourCycle: cycle } }],
    }).compileComponents();

    fixture = TestBed.createComponent(TimePicker);
    fixture.componentRef.setInput('value', value);
    component = fixture.componentInstance;
    await fixture.whenStable();
  };

  const values = (): string[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.tls-time-picker__value')).map(
      (element: unknown) => (element as HTMLElement).textContent?.trim() ?? '',
    );

  const dayPeriodButton = (): HTMLButtonElement | null =>
    fixture.nativeElement.querySelector('.tls-time-picker__day-period');

  it('should create', async () => {
    await createComponent(24, new Date(2024, 0, 1, 12, 0));
    expect(component).toBeTruthy();
  });

  it('renders a padded 24-hour value with no day-period toggle', async () => {
    await createComponent(24, new Date(2024, 0, 1, 21, 5));

    expect(values()).toEqual(['21', '05']);
    expect(dayPeriodButton()).toBeNull();
  });

  it('renders the hour on a 12-hour dial with a day-period toggle', async () => {
    await createComponent(12, new Date(2024, 0, 1, 21, 5));

    expect(values()).toEqual(['09', '05']);
    expect(dayPeriodButton()?.textContent?.trim()).toBe('PM');
  });

  it('renders midnight and noon as 12 on a 12-hour dial', async () => {
    await createComponent(12, new Date(2024, 0, 1, 0, 0));
    expect(values()[0]).toBe('12');
    expect(dayPeriodButton()?.textContent?.trim()).toBe('AM');

    await createComponent(12, new Date(2024, 0, 1, 12, 0));
    expect(values()[0]).toBe('12');
    expect(dayPeriodButton()?.textContent?.trim()).toBe('PM');
  });

  it('flips the half-day when the day-period toggle is clicked', async () => {
    await createComponent(12, new Date(2024, 0, 1, 9, 30));

    let emitted: Date | undefined;
    component.timeChange.subscribe(date => (emitted = date));
    dayPeriodButton()?.click();

    expect(emitted?.getHours()).toBe(21);
    expect(emitted?.getMinutes()).toBe(30);
  });
});
