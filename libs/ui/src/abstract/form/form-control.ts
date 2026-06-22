import {
  booleanAttribute,
  computed,
  Directive,
  input,
  InputSignal,
  InputSignalWithTransform,
  model,
  ModelSignal,
  Signal,
} from '@angular/core';
import { FormUiControl, ValidationError, WithOptionalFieldTree } from '@angular/forms/signals';


@Directive()
export abstract class FormControl implements FormUiControl {
  // Models
  public readonly touched: ModelSignal<boolean> = model<boolean>(false);

  // Inputs
  public readonly name: InputSignal<string> = input<string>('');

  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );

  public readonly readonly: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );

  public readonly hidden: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );

  public readonly invalid: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );

  public readonly pending: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );

  public readonly dirty: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );

  public readonly errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);

  public readonly required: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );

  protected CLASS_NAME = 'tls-form-control';

  protected notInteractive: Signal<boolean> = computed<boolean>(
    () => this.disabled() || this.readonly(),
  );
  protected controlClasses: Signal<string[]> = computed<string[]>(() => this.baseControlClasses());

  // Protected methods
  protected baseControlClasses() {
    const className = this.CLASS_NAME;
    const array = [className];

    if (this.disabled()) array.push(`${className}--disabled`);
    if (this.readonly()) array.push(`${className}--readonly`);
    if (this.invalid()) array.push(`${className}--invalid`);
    if (this.pending()) array.push(`${className}--pending`);
    if (this.touched()) array.push(`${className}--touched`);
    if (this.dirty()) array.push(`${className}--dirty`);

    return array;
  }
}
