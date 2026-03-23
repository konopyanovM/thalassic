import {
  Component,
  computed,
  inject,
  input,
  InputSignal,
  model,
  ModelSignal,
  Signal,
} from '@angular/core';
import { ValueFormControl } from '../../../abstract';
import { RADIO_BUTTON_CONFIG } from './radio-button.token';

@Component({
  selector: 'tls-radio-button',
  imports: [],
  templateUrl: './radio-button.html',
  host: {
    '[class]': 'classes()',
    '[tabindex]': '-1',
  },
})
export class RadioButton extends ValueFormControl<unknown> {
  private _config = inject(RADIO_BUTTON_CONFIG);

  protected override CLASS_NAME = 'tls-radio-button';

  public readonly radioValue: InputSignal<unknown> = input.required<unknown>();
  public readonly value: ModelSignal<unknown> = model<unknown>('');
  public readonly inputId = input<string>();
  public readonly tabindex: InputSignal<string | number> = input<string | number>(0);

  protected readonly checked: Signal<boolean> = computed(() => this.radioValue() === this.value());

  protected readonly classes: Signal<string[]> = computed(() => {
    const className = this.CLASS_NAME;

    const array: string[] = [className];

    if (this.checked()) array.push(`${className}--checked`);

    return array.concat(this.controlClasses());
  });

  // Protected methods
  protected check() {
    if (this.notInteractive()) return;

    this.value.set(this.radioValue());
  }
}
