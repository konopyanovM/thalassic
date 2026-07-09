import { Directive, ModelSignal } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { FormControl } from './form-control';

@Directive()
export abstract class ValueFormControl<T> extends FormControl<T> implements FormValueControl<T> {
  public abstract readonly value: ModelSignal<T>;
}
