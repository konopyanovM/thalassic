import {
  booleanAttribute,
  computed,
  Directive,
  input,
  InputSignal,
  InputSignalWithTransform,
  model,
  ModelSignal,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { FormUiControl, ValidationError, WithOptionalFieldTree } from '@angular/forms/signals';


@Directive()
export abstract class FormControl implements FormUiControl {
  // Models
  public readonly touched: ModelSignal<boolean> = model<boolean>(false);

  // Inputs
  public readonly name: InputSignal<string> = input<string>('');

  /**
   * Accessible name forwarded to the inner native control (`<input>`/`<textarea>`/trigger),
   * for controls used without an associated visible `<label>`. Placed on the inner control
   * because the host element is a non-interactive wrapper.
   */
  public readonly ariaLabel = input<string | undefined>(undefined);

  /**
   * `id` of an element whose text names the inner native control, for when the accessible
   * name already exists as visible text. Takes precedence over `ariaLabel` per the ARIA spec.
   */
  public readonly ariaLabelledby = input<string | undefined>(undefined);

  /** `id`(s) of element(s) describing the control (help text, hint), forwarded to `aria-describedby`. */
  public readonly ariaDescribedby = input<string | undefined>(undefined);

  /**
   * `id` of the validation-error element, set by an enclosing `tls-form-item` while it renders an
   * error. Merged with `ariaDescribedby` so the control's `aria-describedby` points at both the
   * consumer's description and the live error message.
   */
  public readonly errorMessageId: WritableSignal<string | null> = signal<string | null>(null);

  /**
   * `id` of the visible `<label>` element rendered by an enclosing `tls-form-item`. Merged with
   * `ariaLabelledby` so the control's `aria-labelledby` points at the form-item label while still
   * honouring any consumer-supplied labelling.
   */
  public readonly labelId: WritableSignal<string | null> = signal<string | null>(null);

  /** Combined `aria-describedby` value (consumer description + form-item error), or null when empty. */
  protected readonly describedBy: Signal<string | null> = computed<string | null>(() => {
    const ids: string[] = [];

    const describedby = this.ariaDescribedby();
    if (describedby) ids.push(describedby);

    const errorId = this.errorMessageId();
    if (errorId) ids.push(errorId);

    return ids.length > 0 ? ids.join(' ') : null;
  });

  /** Combined `aria-labelledby` value (consumer label id + form-item label), or null when empty. */
  protected readonly labelledBy: Signal<string | null> = computed<string | null>(() => {
    const ids: string[] = [];

    const labelledby = this.ariaLabelledby();
    if (labelledby) ids.push(labelledby);

    const formItemLabelId = this.labelId();
    if (formItemLabelId) ids.push(formItemLabelId);

    return ids.length > 0 ? ids.join(' ') : null;
  });

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
