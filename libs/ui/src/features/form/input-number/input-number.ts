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
  numberAttribute,
  Signal,
} from '@angular/core';
import { FORM_CONTROL, ValueFormControl } from '../../../abstract/form';
import { controlSize } from '../../../types';
import { Loader } from '../../loader';
import { INPUT_NUMBER_CONFIG } from './input-number.token';

@Component({
  selector: 'tls-input-number',
  templateUrl: './input-number.html',
  styleUrl: './input-number.scss',
  imports: [Loader],
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => InputNumber) }],
})
export class InputNumber extends ValueFormControl<number | null> {
  // Injections
  private _config = inject(INPUT_NUMBER_CONFIG);

  override readonly supportsLabelFor = true;

  // Inputs
  public readonly value: ModelSignal<number | null> = model<number | null>(null);
  public readonly placeholder = input<string>(this._config.placeholder);
  public readonly size: InputSignal<controlSize> = input<controlSize>(this._config.size);
  public readonly fluid: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.fluid,
    { transform: booleanAttribute },
  );
  public readonly min = input<number | undefined>(undefined);
  public readonly max = input<number | undefined>(undefined);
  public readonly step: InputSignalWithTransform<number, unknown> = input<number, unknown>(
    this._config.step,
    { transform: numberAttribute },
  );
  public readonly hideArrows: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.hideArrows,
    { transform: booleanAttribute },
  );

  // Computed
  protected readonly classes: Signal<string[]> = computed(() => {
    const array: string[] = [this.CLASS_NAME, 'tls-input-number'];

    array.push(`${this.CLASS_NAME}--${this.size()}`);
    if (this.fluid()) array.push(`${this.CLASS_NAME}--fluid`);
    if (this.hideArrows()) array.push('tls-input-number--no-arrows');

    return array.concat(this.controlClasses());
  });

  // Protected methods
  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const parsed = target.valueAsNumber;
    this.value.set(isNaN(parsed) ? null : parsed);
  }
}
