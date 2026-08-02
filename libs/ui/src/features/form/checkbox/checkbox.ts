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
import { Icon } from '../../icon';
import { CHECKBOX_CONFIG } from './checkbox.token';

@Component({
  selector: 'tls-checkbox',
  imports: [Icon],
  templateUrl: './checkbox.html',
  // The native `<input type="checkbox">` in the template is the semantics
  // carrier; the host stays role-less so assistive technology sees exactly one
  // checkbox.
  host: {
    '[class]': 'hostClasses()',
  },
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => Checkbox) }],
})
export class Checkbox extends CheckboxFormControl {
  private _config = inject(CHECKBOX_CONFIG);

  protected override CLASS_NAME = 'tls-checkbox';

  override readonly supportsLabelFor = true;

  public indeterminate = model<boolean>(false);

  public readonly checked: ModelSignal<boolean> = model<boolean>(false);
  public readonly tabindex: InputSignal<string | number> = input<string | number>(0);

  protected readonly hostClasses: Signal<string[]> = computed(() => {
    const className = this.CLASS_NAME;

    const array: string[] = [className];

    if (this.indeterminate()) array.push(`${className}--indeterminate`);

    return array.concat(this.controlClasses());
  });

  // Protected methods
  protected toggle(event?: Event) {
    if (this.notInteractive()) {
      // Keep the native input from flipping its own checked state.
      if (event) event.preventDefault();
      return;
    }

    // Activating an indeterminate checkbox resolves it to checked.
    if (this.indeterminate()) {
      this.indeterminate.set(false);
      this.checked.set(true);
      return;
    }

    this.checked.update(prev => !prev);
  }

  protected onKeyboardToggle(event: Event) {
    event.preventDefault();
    this.toggle();
  }
}
