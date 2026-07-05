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
import { CheckboxFormControl, FORM_CONTROL } from '../../../abstract/form';
import { SWITCH_CONFIG } from './switch.token';
import { switchColor } from './switch.types';

@Component({
  selector: 'tls-switch',
  templateUrl: './switch.html',
  host: {
    role: 'switch',
    '[class]': 'hostClasses()',
    '[tabindex]': 'disabled() ? -1 : tabindex()',
    '[attr.aria-checked]': 'checked()',
    '[attr.aria-disabled]': 'disabled()',
    '[attr.aria-readonly]': 'readonly()',
    '(click)': 'toggle()',
    '(blur)': 'touched.set(true)',
    '(keydown.space)': 'onKeyboardToggle($event)',
    '(keydown.enter)': 'onKeyboardToggle($event)',
  },
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => Switch) }],
})
export class Switch extends CheckboxFormControl {
  private _config = inject(SWITCH_CONFIG);

  protected override CLASS_NAME = 'tls-switch';

  override readonly supportsLabelFor = true;

  public readonly checked: ModelSignal<boolean> = model<boolean>(false);
  public readonly color: InputSignal<switchColor> = input<switchColor>(this._config.color);
  public readonly tabindex: InputSignal<string | number> = input<string | number>(0);

  protected readonly hostClasses: Signal<string[]> = computed(() => {
    const className = this.CLASS_NAME;

    const array: string[] = [className];

    array.push(`${className}--${this.color()}`);

    return array.concat(this.controlClasses());
  });

  // Protected methods
  protected toggle() {
    if (this.notInteractive()) return;

    this.checked.update(prev => !prev);
  }

  protected onKeyboardToggle(event: Event) {
    event.preventDefault();
    this.toggle();
  }
}
