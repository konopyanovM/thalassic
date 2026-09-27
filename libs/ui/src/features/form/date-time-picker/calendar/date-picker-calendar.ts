import {
  Component,
  computed,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
} from '@angular/core';
import {
  addMonths,
  Day,
  endOfDay,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  subMonths,
} from 'date-fns';
import { LOCALE_CONFIG, localeFormatOptions } from '../../../../abstract/locale';
import { NOW_REFRESH_INTERVAL_MS } from '../../../../constants';
import {
  buildMonthDays,
  createDaySignal,
  createNowSignal,
  rotateWeekDays,
} from '../../../../utils';
import { Icon } from '../../../icon';
import { DatePickerDay } from './date-picker-calendar.types';

@Component({
  selector: 'tls-date-picker-calendar',
  imports: [Icon],
  templateUrl: './date-picker-calendar.html',
  host: { class: 'tls-date-picker-calendar' },
})
export class DatePickerCalendar {
  // Injections
  private readonly _locale = inject(LOCALE_CONFIG);

  private readonly _dateOptions = localeFormatOptions(this._locale);
  /** Today, so the today marker moves across midnight while the picker is open. */
  private readonly _today = createDaySignal(createNowSignal(NOW_REFRESH_INTERVAL_MS));

  // Inputs
  public readonly viewDate: InputSignal<Date> = input.required<Date>();
  public readonly selectedDate: InputSignal<Date | null> = input.required<Date | null>();
  public readonly weekStartsOn: InputSignal<Day> = input.required<Day>();
  public readonly weekDays: InputSignal<string[]> = input.required<string[]>();
  /** Earliest selectable day, inclusive; the time of day is ignored. */
  public readonly minDate: InputSignal<Date | null> = input<Date | null>(null);
  /** Latest selectable day, inclusive; the time of day is ignored. */
  public readonly maxDate: InputSignal<Date | null> = input<Date | null>(null);

  // Outputs
  public readonly daySelect: OutputEmitterRef<Date> = output<Date>();
  public readonly viewDateChange: OutputEmitterRef<Date> = output<Date>();
  public readonly navigateUp: OutputEmitterRef<void> = output<void>();

  // Computed
  protected readonly displayedWeekDays: Signal<string[]> = computed(() =>
    rotateWeekDays(this.weekDays(), this.weekStartsOn()),
  );

  protected readonly headerLabel: Signal<string> = computed(() =>
    format(this.viewDate(), 'MMMM yyyy', this._dateOptions),
  );

  /**
   * The grid's cells, resolved once per change of what they depend on rather than through
   * template calls re-run for every cell on every check.
   */
  protected readonly days: Signal<DatePickerDay[]> = computed(() => {
    const viewDate = this.viewDate();
    const selected = this.selectedDate();
    const today = this._today();
    const minDate = this.minDate();
    const maxDate = this.maxDate();
    const earliest = minDate ? startOfDay(minDate) : null;
    const latest = maxDate ? endOfDay(maxDate) : null;

    return buildMonthDays(viewDate, this.weekStartsOn()).map(date => ({
      date,
      label: format(date, 'd', this._dateOptions),
      inCurrentMonth: isSameMonth(date, viewDate),
      isToday: isSameDay(date, today),
      isSelected: selected !== null && isSameDay(date, selected),
      isDisabled:
        (earliest !== null && isBefore(date, earliest)) ||
        (latest !== null && isAfter(date, latest)),
    }));
  });

  // Protected methods
  protected prevMonth(): void {
    this.viewDateChange.emit(subMonths(this.viewDate(), 1));
  }

  protected nextMonth(): void {
    this.viewDateChange.emit(addMonths(this.viewDate(), 1));
  }
}
