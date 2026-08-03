import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  model,
  ModelSignal,
  Signal,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { Day, format } from 'date-fns';
import { FORM_CONTROL, ValueFormControl } from '../../../abstract/form';
import { isHour12, localeFormatOptions, LOCALE_CONFIG } from '../../../abstract/locale';
import { controlSize } from '../../../types';
import { Loader } from '../../loader';
import { Popover } from '../../popover';
import { DatePickerCalendar } from './calendar';
import {
  DATE_LABEL_FORMAT,
  MONTH_LABEL_FORMAT,
  TIME_LABEL_FORMAT_12,
  TIME_LABEL_FORMAT_24,
  YEAR_LABEL_FORMAT,
} from './date-time-picker.constants';
import { DATE_TIME_PICKER_CONFIG } from './date-time-picker.token';
import { dateTimePickerMode } from './date-time-picker.types';
import { MonthPicker } from './month-picker';
import { TimePicker } from './time-picker';
import { YearPicker } from './year-picker';

type ActiveView = 'calendar' | 'month-picker' | 'year-picker' | 'time-picker' | 'date-time';

@Component({
  selector: 'tls-date-time-picker',
  imports: [
    DatePickerCalendar,
    MonthPicker,
    YearPicker,
    TimePicker,
    Popover,
    NgTemplateOutlet,
    Loader,
  ],
  templateUrl: './date-time-picker.html',
  host: { '[class]': 'hostClasses()' },
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => DateTimePicker) }],
})
export class DateTimePicker extends ValueFormControl<Date | null> {
  // Injections
  private readonly config = inject(DATE_TIME_PICKER_CONFIG);
  private readonly _locale = inject(LOCALE_CONFIG);

  private readonly _dateOptions = localeFormatOptions(this._locale);
  private readonly _timeFormat = isHour12(this._locale)
    ? TIME_LABEL_FORMAT_12
    : TIME_LABEL_FORMAT_24;

  // View children
  private readonly popoverComponent: Signal<Popover | undefined> = viewChild<Popover>('popoverRef');

  // Inputs
  public readonly value: ModelSignal<Date | null> = model<Date | null>(null);
  public readonly mode: InputSignal<dateTimePickerMode> = input<dateTimePickerMode>(
    this.config.mode,
  );
  public readonly inline: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this.config.inline,
    { transform: booleanAttribute },
  );
  public readonly placeholder: InputSignal<string> = input<string>(this.config.placeholder);
  public readonly size: InputSignal<controlSize> = input<controlSize>(this.config.size);
  public readonly fluid: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );
  public readonly yearsPerPage: InputSignal<number> = input<number>(this.config.yearsPerPage);
  public readonly weekStartsOn: InputSignal<Day> = input<Day>(this.config.weekStartsOn);
  public readonly weekDays: InputSignal<string[]> = input<string[]>(this.config.weekDays);

  // State
  protected readonly viewDate: WritableSignal<Date> = signal(new Date());
  protected readonly activeView: WritableSignal<ActiveView> = signal(this.config.mode);

  // Computed
  protected readonly hostClasses: Signal<string[]> = computed(() => {
    const classes: string[] = ['tls-date-time-picker'];

    if (!this.inline()) {
      classes.push(`${this.CLASS_NAME}--${this.size()}`);
      if (this.fluid()) classes.push(`${this.CLASS_NAME}--fluid`);
      return classes.concat(this.controlClasses());
    }

    return classes;
  });

  protected readonly triggerLabel: Signal<string> = computed(() => {
    const value = this.value();
    if (!value) return this.placeholder();
    const mode = this.mode();
    if (mode === 'calendar') return format(value, DATE_LABEL_FORMAT, this._dateOptions);
    if (mode === 'month-picker') return format(value, MONTH_LABEL_FORMAT, this._dateOptions);
    if (mode === 'year-picker') return format(value, YEAR_LABEL_FORMAT, this._dateOptions);
    if (mode === 'time-picker') return format(value, this._timeFormat, this._dateOptions);
    return format(value, `${DATE_LABEL_FORMAT} ${this._timeFormat}`, this._dateOptions);
  });

  constructor() {
    super();

    effect(() => {
      this.activeView.set(this.mode());
    });
  }

  // Protected methods
  protected onViewDateChange(date: Date): void {
    this.viewDate.set(date);
  }

  protected onDaySelect(date: Date): void {
    if (this.notInteractive()) return;
    this.value.set(date);
    if (this.mode() === 'calendar') {
      this.popoverComponent()?.close();
    }
  }

  protected onMonthSelect(date: Date): void {
    this.viewDate.set(date);
    if (this.notInteractive()) return;
    if (this.mode() === 'month-picker') {
      this.value.set(date);
      this.popoverComponent()?.close();
    } else if (this.mode() === 'date-time') {
      this.activeView.set('date-time');
    } else {
      this.activeView.set('calendar');
    }
  }

  protected onYearSelect(date: Date): void {
    this.viewDate.set(date);
    if (this.notInteractive()) return;
    if (this.mode() === 'year-picker') {
      this.value.set(date);
      this.popoverComponent()?.close();
    } else {
      this.activeView.set('month-picker');
    }
  }

  protected onTimeChange(date: Date): void {
    if (this.notInteractive()) return;
    this.value.set(date);
  }
}
