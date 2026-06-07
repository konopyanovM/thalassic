import {
  Component,
  computed,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
} from '@angular/core';
import {
  addMonths,
  Day,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';

@Component({
  selector: 'tls-calendar',
  imports: [],
  templateUrl: './calendar.html',
  host: { class: 'tls-calendar' },
})
export class Calendar {
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
  protected readonly displayedWeekDays: Signal<string[]> = computed(() => {
    const startDay = this.weekStartsOn();
    const days = this.weekDays();
    return [...days.slice(startDay), ...days.slice(0, startDay)];
  });

  protected readonly headerLabel: Signal<string> = computed(() =>
    format(this.viewDate(), 'MMMM yyyy'),
  );

  protected readonly days: Signal<Date[]> = computed(() => {
    const monthStart = startOfMonth(this.viewDate());
    const monthEnd = endOfMonth(this.viewDate());
    const weekStartsOn = this.weekStartsOn();
    return eachDayOfInterval({
      start: startOfWeek(monthStart, { weekStartsOn }),
      end: endOfWeek(monthEnd, { weekStartsOn }),
    });
  });

  // Protected methods
  protected prevMonth(): void {
    this.viewDateChange.emit(subMonths(this.viewDate(), 1));
  }

  protected nextMonth(): void {
    this.viewDateChange.emit(addMonths(this.viewDate(), 1));
  }

  protected getDayLabel(day: Date): string {
    return format(day, 'd');
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
