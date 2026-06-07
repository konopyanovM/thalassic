import {
  Component,
  computed,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
} from '@angular/core';
import { addYears, format, getMonth, getYear, isSameMonth, setMonth, subYears } from 'date-fns';

const MONTH_INDEXES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

@Component({
  selector: 'tls-month-picker',
  imports: [],
  templateUrl: './month-picker.html',
  host: { class: 'tls-month-picker' },
})
export class MonthPicker {
  // Inputs
  public readonly viewDate: InputSignal<Date> = input.required<Date>();
  public readonly selectedDate: InputSignal<Date | null> = input.required<Date | null>();

  // Outputs
  public readonly monthSelect: OutputEmitterRef<Date> = output<Date>();
  public readonly viewDateChange: OutputEmitterRef<Date> = output<Date>();
  public readonly navigateUp: OutputEmitterRef<void> = output<void>();

  // Computed
  protected readonly months = MONTH_INDEXES;

  protected readonly yearLabel: Signal<string> = computed(() => format(this.viewDate(), 'yyyy'));

  // Protected methods
  protected getMonthLabel(monthIndex: number): string {
    return format(setMonth(new Date(2000, 0, 1), monthIndex), 'MMM');
  }

  protected prevYear(): void {
    this.viewDateChange.emit(subYears(this.viewDate(), 1));
  }

  protected nextYear(): void {
    this.viewDateChange.emit(addYears(this.viewDate(), 1));
  }

  protected selectMonth(monthIndex: number): void {
    this.monthSelect.emit(setMonth(this.viewDate(), monthIndex));
  }

  protected isSelectedMonth(monthIndex: number): boolean {
    const selected = this.selectedDate();
    return (
      selected !== null &&
      getYear(selected) === getYear(this.viewDate()) &&
      getMonth(selected) === monthIndex
    );
  }

  protected isCurrentMonth(monthIndex: number): boolean {
    return isSameMonth(new Date(), setMonth(this.viewDate(), monthIndex));
  }
}
