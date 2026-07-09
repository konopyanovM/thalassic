import { computed, Directive, ModelSignal } from '@angular/core';
import { FormCheckboxControl } from '@angular/forms/signals';
import { FormControl } from './form-control';

@Directive()
export abstract class CheckboxFormControl extends FormControl<boolean> implements FormCheckboxControl {
  public abstract readonly checked: ModelSignal<boolean>;

  protected override controlClasses = computed(() => {
    const classes = this.baseControlClasses();

    if (this.checked()) classes.push(`${this.CLASS_NAME}--checked`);

    return classes;
  });
}
