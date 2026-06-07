import {
  Component,
  computed,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
} from '@angular/core';
import { addYears, getYear, setYear, subYears } from 'date-fns';

@Component({
  selector: 'tls-year-picker',
  imports: [],
  templateUrl: './year-picker.html',
  host: { class: 'tls-year-picker' },
})
export class YearPicker {
  // Inputs
  public readonly viewDate: InputSignal<Date> = input.required<Date>();
  public readonly selectedDate: InputSignal<Date | null> = input.required<Date | null>();
  public readonly yearsPerPage: InputSignal<number> = input.required<number>();

  // Outputs
  public readonly yearSelect: OutputEmitterRef<Date> = output<Date>();
  public readonly viewDateChange: OutputEmitterRef<Date> = output<Date>();

  // Computed
  protected readonly years: Signal<number[]> = computed(() => {
    const year = getYear(this.viewDate());
    const perPage = this.yearsPerPage();
    const start = Math.floor(year / perPage) * perPage;
    return Array.from({ length: perPage }, (_, index) => start + index);
  });

  protected readonly rangeLabel: Signal<string> = computed(() => {
    const yearsArray = this.years();
    return `${yearsArray[0]} – ${yearsArray[yearsArray.length - 1]}`;
  });

  // Protected methods
  protected prevPage(): void {
    this.viewDateChange.emit(subYears(this.viewDate(), this.yearsPerPage()));
  }

  protected nextPage(): void {
    this.viewDateChange.emit(addYears(this.viewDate(), this.yearsPerPage()));
  }

  protected selectYear(year: number): void {
    this.yearSelect.emit(setYear(this.viewDate(), year));
  }

  protected isSelectedYear(year: number): boolean {
    const selected = this.selectedDate();
    return selected !== null && getYear(selected) === year;
  }

  protected isCurrentYear(year: number): boolean {
    return getYear(new Date()) === year;
  }
}
