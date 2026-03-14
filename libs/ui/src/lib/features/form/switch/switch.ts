import { Component, computed, inject, input, InputSignal, model, ModelSignal, Signal } from '@angular/core';
import { CheckboxFormControl } from '../../../abstract';
import { SWITCH_CONFIG } from './switch.token';
import { switchColor } from './switch.types';

@Component({
  selector: 'tls-switch',
  templateUrl: './switch.html',
  styleUrls: ['./switch.scss', 'switch-color.scss'],
  host: {
    role: 'switch',
    '[class]': 'classes()',
    '[tabindex]': 'disabled() ? -1 : tabindex()',
    '[attr.aria-checked]': 'checked()',
    '[attr.aria-disabled]': 'disabled()',
    '[attr.aria-readonly]': 'readonly()',
    '(click)': 'toggle()',
    '(keydown.space)': 'onKeyboardToggle($event)',
    '(keydown.enter)': 'onKeyboardToggle($event)',
  },
})
export class Switch extends CheckboxFormControl {
  private _config = inject(SWITCH_CONFIG);

  public readonly checked: ModelSignal<boolean> = model<boolean>(false);
  public readonly inputId = input<string>();
  public readonly color: InputSignal<switchColor> = input<switchColor>(this._config.color);
  public readonly tabindex: InputSignal<string | number> = input<string | number>(0);

  protected readonly classes: Signal<string[]> = computed(() => {
    const className = 'tls-switch';

    const array: string[] = [className];

    array.push(`${className}--${this.color()}`);
    if (this.checked()) array.push(`${className}--checked`);

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
