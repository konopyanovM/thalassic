import {
  Component,
  computed,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
} from '@angular/core';
import { getHours, getMinutes, setHours, setMinutes, startOfDay } from 'date-fns';

@Component({
  selector: 'tls-time-picker',
  imports: [],
  templateUrl: './time-picker.html',
  host: { class: 'tls-time-picker' },
})
export class TimePicker {
  // Inputs
  public readonly value: InputSignal<Date | null> = input.required<Date | null>();

  // Outputs
  public readonly timeChange: OutputEmitterRef<Date> = output<Date>();

  // Computed
  protected readonly hours: Signal<number> = computed(() => {
    const date = this.value();
    return date ? getHours(date) : 0;
  });

  protected readonly minutes: Signal<number> = computed(() => {
    const date = this.value();
    return date ? getMinutes(date) : 0;
  });

  protected readonly hoursLabel: Signal<string> = computed(() =>
    String(this.hours()).padStart(2, '0'),
  );

  protected readonly minutesLabel: Signal<string> = computed(() =>
    String(this.minutes()).padStart(2, '0'),
  );

  // Private accessors
  private get _baseDate(): Date {
    return this.value() ?? startOfDay(new Date());
  }

  // Protected methods
  protected incrementHours(): void {
    this.timeChange.emit(setHours(this._baseDate, (this.hours() + 1) % 24));
  }

  protected decrementHours(): void {
    this.timeChange.emit(setHours(this._baseDate, (this.hours() + 23) % 24));
  }

  protected incrementMinutes(): void {
    this.timeChange.emit(setMinutes(this._baseDate, (this.minutes() + 1) % 60));
  }

  protected decrementMinutes(): void {
    this.timeChange.emit(setMinutes(this._baseDate, (this.minutes() + 59) % 60));
  }
}
