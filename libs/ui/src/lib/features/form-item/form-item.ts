import { Component, computed, contentChild, inject, input, Signal } from '@angular/core';
import { ValidationError, WithOptionalFieldTree } from '@angular/forms/signals';
import { FORM_CONTROL, FormControl } from '../../abstract';
import { FORM_ITEM_CONFIG } from './form-item.token';

@Component({
  selector: 'tls-form-item',
  imports: [],
  templateUrl: './form-item.html',
  host: { '[class]': 'classes()' },
})
export class FormItem {
  // Injections
  private _config = inject(FORM_ITEM_CONFIG);

  protected control: Signal<FormControl | undefined> = contentChild(FORM_CONTROL);

  // Inputs
  public label = input<string>();
  public reserveErrorSpace = input<boolean>(this._config.reserveErrorSpace);
  public displayErrors = input<boolean>(this._config.displayErrors);

  protected isInvalid = computed(() => this.control()?.invalid() && this.control()?.touched());

  protected isRequired = computed(() => {
    return Boolean(this.control()?.required());
  });

  protected classes = computed(() => {
    const className = 'tls-form-item';

    const array = [className];

    if (this.isInvalid()) array.push(`${className}--invalid`);
    if (this.isRequired()) array.push(`${className}--required`);
    if (this.reserveErrorSpace()) array.push(`${className}--error-space-reserved`);

    return array;
  });

  protected errorMessages = computed(() => {
    const errors = this.control()?.errors();

    if (errors) return this._getErrorMessages(errors);
    else return [];
  });
  protected firstErrorMessage = computed(() => {
    if (this.errorMessages().length > 0) return this.errorMessages()[0];
    else return null;
  });

  // Private methods
  private _getErrorMessages(errors: readonly WithOptionalFieldTree<ValidationError>[]) {
    const array: string[] = [];

    for (const error of errors) {
      if (error.message) array.push(error.message);
      else array.push(this._config.errorMessages[error.kind](error.fieldTree));
    }

    return array;
  }
}
