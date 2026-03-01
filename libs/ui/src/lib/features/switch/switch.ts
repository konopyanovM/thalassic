import {
  booleanAttribute,
  Component,
  computed,
  input,
  InputSignalWithTransform,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { switchColor } from './switch.types';

@Component({
  selector: 'tls-switch',
  imports: [],
  templateUrl: './switch.html',
  styleUrls: ['./switch.scss', 'switch-color.scss'],
  host: {
    role: 'switch',
    '[tabindex]': 'disabled() ? -1 : 0',
    '[attr.aria-checked]': 'value()',
    '[attr.aria-disabled]': 'disabled()',
    '(keydown.space)': 'onKeyboardToggle($event)',
    '(keydown.enter)': 'onKeyboardToggle($event)',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: Switch,
      multi: true,
    },
  ],
})
export class Switch implements ControlValueAccessor {
  public disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });
  public color = input<switchColor>('secondary');

  protected value = signal<boolean>(false);
  private _controlDisabled = signal<boolean | null>(null);

  protected className = computed(() => {
    const className = 'tls-switch';

    const array: string[] = [className];

    array.push(`${className}--${this.color()}`);

    return array;
  });
  protected isDisabled = computed<boolean>(() => {
    const controlDisabled = this._controlDisabled();
    if (controlDisabled !== null) return controlDisabled;
    return this.disabled();
  });

  private _onChange: ((value: unknown) => void) | null = null;
  private _onTouched: (() => void) | null = null;

  // Control Value Accessor methods
  public writeValue(value: boolean) {
    this.value.set(value);
  }

  public setDisabledState(isDisabled: boolean) {
    this._controlDisabled.set(isDisabled);
  }

  public registerOnChange(fn: (value: unknown) => void) {
    this._onChange = fn;
  }

  public registerOnTouched(fn: () => void) {
    this._onTouched = fn;
  }

  // Protected methods
  protected onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const newValue = target.checked;
    this._setValue(newValue);
  }

  protected onKeyboardToggle(event: Event) {
    event.preventDefault();

    if (this.disabled()) return;

    const newValue = !this.value();
    this._setValue(newValue);
  }

  // Private methods
  private _setValue(value: boolean) {
    this.value.set(value);

    if (this._onChange) this._onChange(value);
    if (this._onTouched) this._onTouched();
  }
}
