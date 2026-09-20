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
import { Loader } from '../../loader';
import { INPUT_CONFIG } from './input.token';
import { inputVariant } from './input.types';

@Component({
  selector: 'tls-input',
  templateUrl: './input.html',
  styleUrl: './input.scss',
  imports: [Loader],
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => Input) }],
})
export class Input extends ValueFormControl<string> {
  // Injections
  private _config = inject(INPUT_CONFIG);

  override readonly supportsLabelFor = true;

  // Inputs
  public readonly type = input<string>(this._config.type);
  public readonly value: ModelSignal<string> = model<string>('');
  public readonly placeholder = input<string>(this._config.placeholder);
  public readonly size: InputSignal<controlSize> = input<controlSize>(this._config.size);
  public readonly variant: InputSignal<inputVariant> = input<inputVariant>(this._config.variant);
  public readonly fluid: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.fluid,
    { transform: booleanAttribute },
  );
  /**
   * Sizes the field to the text it holds — or to its placeholder while empty —
   * instead of to a set width, so whatever follows the field follows the text.
   */
  public readonly autosize: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.autosize,
    { transform: booleanAttribute },
  );

  /**
   * The most characters the field accepts, enforced by the browser: typing stops
   * at the limit and a paste is cut to it. Unset, the field takes any length.
   */
  public readonly maxLength = input<number | undefined>(undefined);

  protected readonly classes: Signal<string[]> = computed(() => {
    const array: string[] = [this.CLASS_NAME];

    array.push(`${this.CLASS_NAME}--${this.size()}`);
    array.push(`${this.CLASS_NAME}--${this.variant()}`);
    if (this.fluid()) array.push(`${this.CLASS_NAME}--fluid`);
    if (this.autosize()) array.push(`${this.CLASS_NAME}--autosize`);

    return array.concat(this.controlClasses());
  });

  // Protected methods
  protected onInput(event: Event) {
    const target = event.target as HTMLInputElement;

    this.value.set(target.value);
  }
}
