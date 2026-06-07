import {
  booleanAttribute,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  model,
  ModelSignal,
  Signal,
} from '@angular/core';
import { FORM_CONTROL, ValueFormControl } from '../../../abstract/form';
import { controlSize } from '../../../types';
import { INPUT_CONFIG } from './input.token';

@Component({
  selector: 'tls-input',
  templateUrl: './input.html',
  styleUrl: './input.scss',
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => Input) }],
})
export class Input extends ValueFormControl<string> {
  // Injections
  private _config = inject(INPUT_CONFIG);

  // Inputs
  public readonly type = input<string>(this._config.type);
  public readonly value: ModelSignal<string> = model<string>('');
  public readonly inputId = input<string | null>(null);
  public readonly placeholder = input<string>(this._config.placeholder);
  public readonly size: InputSignal<controlSize> = input<controlSize>(this._config.size);
  public readonly fluid: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.fluid,
    { transform: booleanAttribute },
  );

  protected readonly classes: Signal<string[]> = computed(() => {
    const array: string[] = [this.CLASS_NAME];

    array.push(`${this.CLASS_NAME}--${this.size()}`);
    if (this.fluid()) array.push(`${this.CLASS_NAME}--fluid`);

    return array.concat(this.controlClasses());
  });

  // Protected methods
  protected onInput(event: Event) {
    const target = event.target as HTMLInputElement;

    this.value.set(target.value);
  }
}
