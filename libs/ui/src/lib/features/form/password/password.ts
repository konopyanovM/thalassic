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
import { FORM_CONTROL, ValueFormControl } from '../../../abstract';
import { inputSize } from '../input/input.types';
import { PASSWORD_CONFIG } from './password.token';

@Component({
  selector: 'tls-password',
  templateUrl: './password.html',
  styleUrl: './password.scss',
  host: {
    '[class]': 'classes()',
  },
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => Password) }],
})
export class Password extends ValueFormControl<string> {
  private _config = inject(PASSWORD_CONFIG);

  public readonly value: ModelSignal<string> = model<string>('');
  public readonly visible: ModelSignal<boolean> = model<boolean>(false);
  public readonly inputId = input<string | null>(null);
  public readonly placeholder = input<string>(this._config.placeholder);
  public readonly size: InputSignal<inputSize> = input<inputSize>(this._config.size);

  protected readonly classes: Signal<string[]> = computed(() => {
    const className = 'tls-form-control-group';

    const array: string[] = [className];

    array.push(`${className}--${this.size()}`);

    return array;
  });

  protected type = computed(() => (this.visible() ? 'text' : 'password'));

  // Protected methods
  protected onInput(event: Event) {
    const target = event.target as HTMLInputElement;

    this.value.set(target.value);
  }

  protected toggle() {
    if (this.notInteractive()) return;

    this.visible.update(prev => !prev);
  }
}
