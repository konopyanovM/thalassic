import {
  Component,
  computed,
  forwardRef,
  input,
  InputSignal,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { FormControl } from '../../abstract';
import { inputSize } from './input.types';

@Component({
  selector: 'tls-input',
  imports: [],
  templateUrl: './input.html',
  styleUrls: ['./input.scss', './input-size.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Input),
      multi: true,
    },
  ],
})
export class Input extends FormControl<string> {
  public inputId = input<string>();
  public placeholder = input<string>('');
  public size: InputSignal<inputSize> = input<inputSize>('md');

  protected value: WritableSignal<string> = signal<string>('');

  protected classes: Signal<string[]> = computed(() => {
    const className = 'tls-input';

    const array: string[] = [className];

    array.push(`${className}--${this.size()}`);

    return array;
  });

  // Protected methods
  protected onInput(event: Event) {
    const target = event.target as HTMLInputElement;

    if (this.notInteractive()) {
      //  If the native input somehow fires an input event while disabled,
      //  reset value, so the input visual could stays in sync
      target.value = this.value();
      return;
    }

    const newValue = target.value;
    this.setValue(newValue);
  }
}
