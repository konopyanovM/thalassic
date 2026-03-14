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
import { INPUT_CONFIG } from './input.token';
import { inputSize } from './input.types';

@Component({
  selector: 'tls-input',
  templateUrl: './input.html',
  styleUrl: './input.scss',
})
export class Input extends ValueFormControl<string> {
  // Injections
  private _config = inject(INPUT_CONFIG);

  // Inputs
  public readonly type = input<string>(this._config.type);
  public readonly value: ModelSignal<string> = model<string>('');
  public readonly inputId = input<string | null>(null);
  public readonly placeholder = input<string>(this._config.placeholder);
  public readonly size: InputSignal<inputSize> = input<inputSize>(this._config.size);

  protected readonly classes: Signal<string[]> = computed(() => {
    const className = 'tls-form-field';

    const array: string[] = [className];

    array.push(`${className}--${this.size()}`);

    return array.concat(this.controlClasses());
  });

  // Protected methods
  protected onInput(event: Event) {
    const target = event.target as HTMLInputElement;

    this.value.set(target.value);
  }
}
