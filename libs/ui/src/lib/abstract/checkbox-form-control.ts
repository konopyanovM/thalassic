import { Directive, ModelSignal } from '@angular/core';
import { FormCheckboxControl } from '@angular/forms/signals';
import { FormControl } from './form-control';

@Directive()
export abstract class CheckboxFormControl extends FormControl implements FormCheckboxControl {
  public abstract readonly checked: ModelSignal<boolean>;
}
