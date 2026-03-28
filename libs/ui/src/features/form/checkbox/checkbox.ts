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
import { CheckboxFormControl } from '../../../abstract';
import { CHECKBOX_CONFIG } from './checkbox.token';

@Component({
  selector: 'tls-checkbox',
  imports: [],
  templateUrl: './checkbox.html',
  host: {
    role: 'checkbox',
    '[class]': 'hostClasses()',
    '[tabindex]': '-1',
  },
})
export class Checkbox extends CheckboxFormControl {
  private _config = inject(CHECKBOX_CONFIG);

  protected override CLASS_NAME = 'tls-checkbox';

  public indeterminate = model<boolean>(false);

  public readonly checked: ModelSignal<boolean> = model<boolean>(false);
  public readonly inputId = input<string>();
  public readonly tabindex: InputSignal<string | number> = input<string | number>(0);

  protected readonly hostClasses: Signal<string[]> = computed(() => {
    const className = this.CLASS_NAME;

    const array: string[] = [className];

    if (this.indeterminate()) array.push(`${className}--indeterminate`);

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
