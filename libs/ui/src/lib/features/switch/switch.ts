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
import { switchColor } from './switch.types';

@Component({
  selector: 'tls-switch',
  imports: [],
  templateUrl: './switch.html',
  styleUrls: ['./switch.scss', 'switch-color.scss'],
  host: {
    role: 'switch',
    '[tabindex]': 'isDisabled() ? -1 : 0',
    '[attr.aria-checked]': 'value()',
    '[attr.aria-disabled]': 'isDisabled()',
    '[attr.aria-readonly]': 'readonly()',
    '(keydown.space)': 'onKeyboardToggle($event)',
    '(keydown.enter)': 'onKeyboardToggle($event)',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Switch),
      multi: true,
    },
  ],
})
export class Switch extends FormControl<boolean> {
  public inputId = input<string>();
  public color: InputSignal<switchColor> = input<switchColor>('secondary');

  protected value: WritableSignal<boolean> = signal<boolean>(false);

  protected classes: Signal<string[]> = computed(() => {
    const className = 'tls-switch';

    const array: string[] = [className];

    array.push(`${className}--${this.color()}`);

    return array;
  });

  // Protected methods
  protected onInput(event: Event) {
    const target = event.target as HTMLInputElement;

    if (this.notInteractive()) {
      //  If the native input somehow fires an input event while disabled,
      //  reset value, so the input visual could stays in sync
      target.checked = this.value();
      return;
    }

    const newValue = target.checked;
    this.setValue(newValue);
  }

  protected onKeyboardToggle(event: Event) {
    event.preventDefault();

    if (this.notInteractive()) return;

    const newValue = !this.value();
    this.setValue(newValue);
  }
}
