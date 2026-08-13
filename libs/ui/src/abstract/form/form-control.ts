import {
  booleanAttribute,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  model,
  ModelSignal,
  signal,
  Signal,
  WritableSignal
} from '@angular/core';
import { FormUiControl, ValidationError, WithOptionalFieldTree } from '@angular/forms/signals';
import { FOCUSABLE_CONTROL_SELECTOR } from './form-control.constants';
import { FORM_CONTROL_CONFIG } from './form-control.config.token';

@Directive()
export abstract class FormControl<TValue = unknown> implements FormUiControl<TValue> {
  // Injections
  private readonly _formControlConfig = inject(FORM_CONTROL_CONFIG);

  /**
   * The control's host element. Public because a container that arranges controls — a
   * form control group placing an addon beside one — has to locate a control in its own
   * layout before it can hand anything to it.
   */
  public readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef);

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

  /** Consumer-provided `id` for the inner native control element (e.g. to wire up an external label). */
  public readonly inputId = input<string | null>(null);

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

  /**
   * `id` assigned to the native control element by an enclosing `tls-form-item`, so the label's
   * `for` attribute can point at the control. Consumer's `inputId` takes precedence.
   */
  public readonly formItemInputId: WritableSignal<string | null> = signal<string | null>(null);

  /** Whether this control has a single native labelable element that a `<label for>` can target. */
  readonly supportsLabelFor: boolean = false;

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

  /** Resolved `id` for the native control element: consumer's `inputId` first, then form-item's assigned id. */
  readonly effectiveInputId: Signal<string | null> = computed<string | null>(
    () => this.inputId() ?? this.formItemInputId(),
  );

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

  // Computed
  /**
   * Whether the control's invalid state should be surfaced (red styling and form-item error message).
   * Always requires the field to be invalid and touched; the `touched-dirty` trigger additionally
   * requires it to be dirty, keeping an untouched, empty field silent until the user has engaged.
   */
  public readonly showError: Signal<boolean> = computed<boolean>(() => {
    if (!this.invalid() || !this.touched()) return false;
    if (this._formControlConfig.errorTrigger === 'touched-dirty') return this.dirty();
    return true;
  });

  protected CLASS_NAME = 'tls-form-control';

  protected notInteractive: Signal<boolean> = computed<boolean>(
    () => this.disabled() || this.readonly(),
  );
  protected controlClasses: Signal<string[]> = computed<string[]>(() => this.baseControlClasses());

  // Public methods
  /**
   * Moves focus to the control. Focus lands on the element that actually takes it — the
   * native input a wrapper renders, or a composite's trigger — never on the host, which
   * is only a wrapper.
   */
  public focus(): void {
    const target: HTMLElement | null = this.focusTarget();
    if (!target) return;

    target.focus();
  }

  /**
   * Hands the control over as though the user had reached for it directly. Focus alone
   * for a control whose value is edited in place; a control that keeps its value behind
   * a panel — a select, a picker — also opens that panel, since focus on its own leaves
   * such a control looking untouched and the user still a click away from the value.
   */
  public activate(): void {
    this.focus();
  }

  // Protected methods
  /**
   * The element focus lands on. Defaults to the first focusable element the control
   * renders, which is the right one for a control built around a single native element;
   * a control with a more elaborate view names its own.
   */
  protected focusTarget(): HTMLElement | null {
    return this.elementRef.nativeElement.querySelector<HTMLElement>(FOCUSABLE_CONTROL_SELECTOR);
  }

  protected baseControlClasses() {
    const className = this.CLASS_NAME;
    const array = [className];

    if (this.disabled()) array.push(`${className}--disabled`);
    if (this.readonly()) array.push(`${className}--readonly`);
    if (this.invalid()) array.push(`${className}--invalid`);
    if (this.pending()) array.push(`${className}--pending`);
    if (this.touched()) array.push(`${className}--touched`);
    if (this.dirty()) array.push(`${className}--dirty`);
    if (this.showError()) array.push(`${className}--show-error`);

    return array;
  }
}
