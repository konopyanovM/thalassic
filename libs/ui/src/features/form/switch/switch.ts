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
  // The native input in the template (stretched invisibly over the track) is the
  // focusable `role="switch"` semantics carrier; the host stays role-less so
  // assistive technology sees exactly one switch. The host click covers the
  // touch-target overflow around the control.
  host: {
    '[class]': 'hostClasses()',
    '(click)': 'toggle($event)',
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
  protected toggle(event?: Event) {
    if (this.notInteractive()) {
      // Keep the native input from flipping its own checked state.
      if (event) event.preventDefault();
      return;
    }

    this.checked.update(prev => !prev);
  }

  protected onKeyboardToggle(event: Event) {
    event.preventDefault();
    this.toggle();
  }
}
