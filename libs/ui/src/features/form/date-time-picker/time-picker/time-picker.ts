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
import { format, getHours, getMinutes, setHours, setMinutes, startOfDay } from 'date-fns';
import { isHour12, localeFormatOptions, LOCALE_CONFIG } from '../../../../abstract/locale';
import { Icon } from '../../../icon';
import { DAY_PERIOD_FORMAT, HOURS_PER_HALF_DAY } from '../date-time-picker.constants';

@Component({
  selector: 'tls-time-picker',
  imports: [Icon],
  templateUrl: './time-picker.html',
  host: { class: 'tls-time-picker' },
})
export class TimePicker {
  // Injections
  private readonly _locale = inject(LOCALE_CONFIG);

  // Inputs
  public readonly value: InputSignal<Date | null> = input.required<Date | null>();

  // Outputs
  public readonly timeChange: OutputEmitterRef<Date> = output<Date>();

  // State
  private readonly _dateOptions = localeFormatOptions(this._locale);
  /** Whether the hour column runs 1–12 alongside a day-period toggle. */
  protected readonly hour12: boolean = isHour12(this._locale);

  // Computed
  protected readonly hours: Signal<number> = computed(() => {
    const date = this.value();
    return date ? getHours(date) : 0;
  });

  protected readonly minutes: Signal<number> = computed(() => {
    const date = this.value();
    return date ? getMinutes(date) : 0;
  });

  protected readonly hoursLabel: Signal<string> = computed(() => {
    const hours = this.hours();
    if (!this.hour12) return String(hours).padStart(2, '0');
    // Midnight and noon read as 12, the rest as their remainder past the half-day.
    const displayHours = hours % HOURS_PER_HALF_DAY;
    return String(displayHours === 0 ? HOURS_PER_HALF_DAY : displayHours).padStart(2, '0');
  });

  protected readonly minutesLabel: Signal<string> = computed(() =>
    String(this.minutes()).padStart(2, '0'),
  );

  /** Localized day-period label ("AM"/"PM"), rendered only on a 12-hour clock. */
  protected readonly dayPeriodLabel: Signal<string> = computed(() =>
    format(this._withHours(this.hours()), DAY_PERIOD_FORMAT, this._dateOptions),
  );

  // Private accessors
  private get _baseDate(): Date {
    return this.value() ?? startOfDay(new Date());
  }

  // Protected methods
  protected incrementHours(): void {
    this.timeChange.emit(this._withHours((this.hours() + 1) % 24));
  }

  protected decrementHours(): void {
    this.timeChange.emit(this._withHours((this.hours() + 23) % 24));
  }

  protected incrementMinutes(): void {
    this.timeChange.emit(setMinutes(this._baseDate, (this.minutes() + 1) % 60));
  }

  protected decrementMinutes(): void {
    this.timeChange.emit(setMinutes(this._baseDate, (this.minutes() + 59) % 60));
  }

  /** Flips between the morning and afternoon half of the day, keeping the hour on the dial. */
  protected toggleDayPeriod(): void {
    this.timeChange.emit(this._withHours((this.hours() + HOURS_PER_HALF_DAY) % 24));
  }

  // Private methods
  private _withHours(hours: number): Date {
    return setHours(this._baseDate, hours);
  }
}
