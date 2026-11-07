import { computed, Directive, ModelSignal } from '@angular/core';
import { FormCheckboxControl } from '@angular/forms/signals';
import { FormControl } from './form-control';

@Directive()
export abstract class CheckboxFormControl extends FormControl<boolean> implements FormCheckboxControl {
  public abstract readonly checked: ModelSignal<boolean>;

  /** Unchecked is as much an answer as checked, so the control is never left unanswered. */
  override readonly alwaysAnswered = true;

  protected override controlClasses = computed(() => {
    const classes = this.baseControlClasses();

    if (this.checked()) classes.push(`${this.CLASS_NAME}--checked`);

    return classes;
  });
}
