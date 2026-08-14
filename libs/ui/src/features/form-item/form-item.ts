import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  effect,
  inject,
  input,
  Signal,
  TemplateRef,
} from '@angular/core';
import { ValidationError, WithOptionalFieldTree } from '@angular/forms/signals';
import { FORM_CONTROL, FormControl, ValueFormControl } from '../../abstract/form';
import { FORM_ITEM_CONFIG } from './form-item.token';
import { FormItemLabelContext, labelPosition } from './form-item.types';

@Component({
  selector: 'tls-form-item',
  imports: [NgTemplateOutlet],
  templateUrl: './form-item.html',
  host: { '[class]': 'hostClasses()' },
})
export class FormItem {
  // Injections
  private static _counter = 0;
  private _config = inject(FORM_ITEM_CONFIG);

  protected control: Signal<FormControl | undefined> = contentChild(FORM_CONTROL);

  /**
   * Content of the label, rendered inside the item's own `<label>` element so the `for` /
   * `aria-labelledby` wiring is kept. Replaces the label text and the required / optional markers.
   */
  protected readonly labelTemplate = contentChild<TemplateRef<FormItemLabelContext>>('labelTemplate');

  /** Stable id for the label element, linked to the control via `aria-labelledby`. */
  protected readonly labelId = `tls-form-item-label-${FormItem._counter}`;

  /** Stable id assigned to the native control element, linked from the label via `for`. */
  protected readonly controlId = `tls-form-item-control-${FormItem._counter}`;

  /** Stable id for the error element, linked to the control via `aria-describedby`. */
  protected readonly errorId = `tls-form-item-error-${FormItem._counter++}`;

  // Inputs
  public label = input<string>();
  /**
   * Placement of the label relative to the control. `top` stacks the label above the control;
   * `start` / `end` place it inline before / after the control (typical for a checkbox or switch).
   */
  public labelPosition = input<labelPosition>('top');
  /**
   * Pushes the label and control to opposite ends of an inline row (`space-between`), spanning the
   * item to full width. Only applies to inline (`start` / `end`) label positions.
   */
  public spread = input<boolean, unknown>(false, { transform: booleanAttribute });
  public reserveErrorSpace = input<boolean>(this._config.reserveErrorSpace);
  public reserveLabelSpace = input<boolean>(this._config.reserveLabelSpace);
  public displayErrors = input<boolean>(this._config.displayErrors);
  public showRequiredMarker = input<boolean>(this._config.showRequiredMarker);
  public optionalText = input<string | undefined>(this._config.optionalText);
  /**
   * Character budget of the control's value. When set, a `current/max` counter is rendered on the
   * footer's trailing edge, tracking the projected control's string value as it is typed.
   */
  public maxLength = input<number | undefined>(undefined);

  protected isInvalid = computed(() => {
    const control = this.control();
    if (!control) return false;

    return control.showError();
  });

  protected showRequired = computed(() => {
    const control = this.control();
    if (!control) return false;

    return this.showRequiredMarker() && control.required();
  });

  protected showOptional = computed(() => {
    const control = this.control();
    if (!control) return false;
    if (!this.optionalText()) return false;

    return !control.required();
  });

  /** Whether a label is rendered, from either the `label` input or a custom label template. */
  protected hasLabel = computed(() => Boolean(this.label()) || Boolean(this.labelTemplate()));

  protected labelContext = computed<FormItemLabelContext>(() => ({
    $implicit: this.label(),
    required: this.showRequired(),
    optionalText: this.showOptional() ? this.optionalText() : undefined,
    invalid: this.isInvalid(),
  }));

  protected labelFor = computed(() => {
    const control = this.control();
    if (!control || !control.supportsLabelFor) return null;
    return control.effectiveInputId();
  });

  protected hostClasses = computed(() => {
    const className = 'tls-form-item';

    const array = [className];

    if (this.isInvalid()) array.push(`${className}--invalid`);
    if (this.labelPosition() !== 'top') {
      array.push(`${className}--label-${this.labelPosition()}`);
      if (this.spread()) array.push(`${className}--spread`);
    }
    if (this.reserveErrorSpace()) array.push(`${className}--error-space-reserved`);
    if (this.reserveLabelSpace()) array.push(`${className}--label-space-reserved`);

    return array;
  });

  protected hasCounter = computed(() => this.maxLength() !== undefined);

  /**
   * Length of the control's current value. Only a string value has a character count; any
   * other control type under a counter reads as empty rather than failing.
   */
  protected characterCount = computed(() => {
    const control = this.control();
    if (!(control instanceof ValueFormControl)) return 0;

    const value: unknown = control.value();
    return typeof value === 'string' ? value.length : 0;
  });

  protected overLimit = computed(() => {
    const maxLength = this.maxLength();
    if (maxLength === undefined) return false;
    return this.characterCount() > maxLength;
  });

  protected errorMessages = computed(() => {
    const control = this.control();
    if (!control) return [];

    return this._getErrorMessages(control.errors());
  });
  protected firstErrorMessage = computed(() => {
    if (this.errorMessages().length > 0) return this.errorMessages()[0];
    else return null;
  });

  // constructor
  constructor() {
    effect(() => {
      const control = this.control();
      if (!control) return;

      // Point the control's aria-labelledby at the rendered label element so screen readers
      // announce the visible label text when the control receives focus.
      control.labelId.set(this.hasLabel() ? this.labelId : null);

      // Assign the stable control id so the label's `for` attribute can target the native element.
      control.formItemInputId.set(control.supportsLabelFor ? this.controlId : null);

      // Point the control's aria-describedby at the rendered error element (and clear it when no
      // error is shown) so screen readers announce the validation message on focus.
      const describesError = this.displayErrors() && this.isInvalid();
      control.errorMessageId.set(describesError ? this.errorId : null);
    });
  }

  // Private methods
  private _getErrorMessages(errors: readonly WithOptionalFieldTree<ValidationError>[]): string[] {
    const array: string[] = [];

    for (const error of errors) {
      if (error.message) {
        array.push(error.message);
        continue;
      }

      // A custom validator's kind may have no configured message; fall back to
      // the generic one rather than failing on the missing entry.
      const messageFunction =
        this._config.errorMessages[error.kind] ?? this._config.unknownErrorMessage;
      array.push(messageFunction(error.fieldTree));
    }

    return array;
  }
}
