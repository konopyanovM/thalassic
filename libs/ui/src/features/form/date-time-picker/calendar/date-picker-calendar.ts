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
import { addMonths, Day, format, isSameDay, isSameMonth, isToday, subMonths } from 'date-fns';
import { LOCALE_CONFIG, localeFormatOptions } from '../../../../abstract/locale';
import { buildMonthDays, rotateWeekDays } from '../../../../utils';
import { Icon } from '../../../icon';

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

  // Inputs
  public readonly viewDate: InputSignal<Date> = input.required<Date>();
  public readonly selectedDate: InputSignal<Date | null> = input.required<Date | null>();
  public readonly weekStartsOn: InputSignal<Day> = input.required<Day>();
  public readonly weekDays: InputSignal<string[]> = input.required<string[]>();

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

  protected readonly days: Signal<Date[]> = computed(() =>
    buildMonthDays(this.viewDate(), this.weekStartsOn()),
  );

  // Protected methods
  protected prevMonth(): void {
    this.viewDateChange.emit(subMonths(this.viewDate(), 1));
  }

  protected nextMonth(): void {
    this.viewDateChange.emit(addMonths(this.viewDate(), 1));
  }

  protected getDayLabel(day: Date): string {
    return format(day, 'd', this._dateOptions);
  }

  protected isSelectedDay(day: Date): boolean {
    const selected = this.selectedDate();
    return selected !== null && isSameDay(day, selected);
  }

  protected isInCurrentMonth(day: Date): boolean {
    return isSameMonth(day, this.viewDate());
  }

  protected isTodayDay(day: Date): boolean {
    return isToday(day);
  }
}
