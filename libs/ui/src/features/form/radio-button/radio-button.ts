import {
  Component,
  computed,
  forwardRef,
  inject,
  input,
  InputSignal,
  model,
  ModelSignal,
  Signal,
} from '@angular/core';
import { FORM_CONTROL, ValueFormControl } from '../../../abstract/form';
import { RADIO_BUTTON_CONFIG } from './radio-button.token';

/**
 * A single radio option bound to a shared `value` model; the option whose
 * `radioValue` equals the model is checked. When several radio buttons form one
 * group, wrap each in its own `tls-form-item` (the item's label names that
 * option), rather than one item around the whole group.
 */
@Component({
  selector: 'tls-radio-button',
  imports: [],
  templateUrl: './radio-button.html',
  host: {
    '[class]': 'hostClasses()',
    '[tabindex]': '-1',
  },
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => RadioButton) }],
})
export class RadioButton extends ValueFormControl<unknown> {
  private _config = inject(RADIO_BUTTON_CONFIG);

  protected override CLASS_NAME = 'tls-radio-button';

  override readonly supportsLabelFor = true;

  public readonly radioValue: InputSignal<unknown> = input.required<unknown>();
  public readonly value: ModelSignal<unknown> = model<unknown>('');
  public readonly tabindex: InputSignal<string | number> = input<string | number>(0);

  protected readonly checked: Signal<boolean> = computed(() => this.radioValue() === this.value());

  protected readonly hostClasses: Signal<string[]> = computed(() => {
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
