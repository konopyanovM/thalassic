import {
  afterNextRender,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Renderer2,
  Signal,
  signal,
} from '@angular/core';
import { applyMask } from './apply-mask';

/**
 * Formats a native `<input>` as the user types against a token pattern
 * (`0` digit, `A` letter, `*` alphanumeric; any other character is a literal).
 *
 * Works both directly on a native `<input>` and on the `tls-input` component: it
 * operates purely at the DOM level, resolving the native control (the host, or
 * the `<input>` nested inside it) and re-dispatching a native `input` event so
 * the host's own value handling captures the masked string. Programmatic
 * `element.value = …` writes (a form `setValue`, a direct DOM assignment) are
 * intercepted and masked as well, and the value is reformatted whenever the
 * pattern changes at runtime. The field value therefore holds the masked text;
 * the separator-free value is exposed via the `unmasked` signal (through
 * `exportAs: 'tlsMask'`) and the `unmaskedChange` output.
 *
 * Deleting a separator is a no-op (the reformat re-inserts it); delete a value
 * character instead.
 */
@Directive({
  selector: '[tlsMask]',
  exportAs: 'tlsMask',
})
export class MaskDirective {
  // Injections
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _renderer = inject(Renderer2);
  private readonly _destroyRef = inject(DestroyRef);

  // Inputs
  public readonly pattern: InputSignal<string> = input<string>('', { alias: 'tlsMask' });

  // Outputs
  public readonly unmaskedChange: OutputEmitterRef<string> = output<string>();

  // State
  private readonly _masked = signal<string>('');
  private readonly _unmasked = signal<string>('');

  public readonly masked: Signal<string> = this._masked.asReadonly();
  public readonly unmasked: Signal<string> = this._unmasked.asReadonly();

  private _input: HTMLInputElement | null = null;
  private _isFormatting = false;

  // Constructor
  constructor() {
    afterNextRender(() => {
      const host = this._elementRef.nativeElement;
      this._input = host instanceof HTMLInputElement ? host : host.querySelector('input');
      if (!this._input) return;

      this._renderer.listen(this._input, 'input', () => this._format());
      this._interceptValueWrites(this._input);

      // Mask any value already present at mount (e.g. a pre-filled raw value).
      if (this._input.value) this._format();
    });

    // Reformat the current value whenever the pattern changes at runtime.
    effect(() => {
      this.pattern();
      if (this._input) this._format();
    });
  }

  // Private methods
  private _format(): void {
    if (this._isFormatting) return;

    const element = this._input;
    if (!element) return;

    const caretPosition = element.selectionStart ?? element.value.length;
    const { maskedValue, unmaskedValue, caret } = applyMask(
      this.pattern(),
      element.value,
      caretPosition,
    );

    this._isFormatting = true;

    if (element.value !== maskedValue) {
      element.value = maskedValue;
      element.setSelectionRange(caret, caret);

      // Re-dispatch so the host's own `input` handler (tls-input's `onInput`, or
      // a native signal-forms control) captures the masked value. The re-entry
      // is swallowed by the `_isFormatting` guard above.
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }

    this._masked.set(maskedValue);
    if (unmaskedValue !== this._unmasked()) {
      this._unmasked.set(unmaskedValue);
      this.unmaskedChange.emit(unmaskedValue);
    }

    this._isFormatting = false;
  }

  /**
   * Programmatic `element.value = …` writes fire no `input` event, so masking
   * would otherwise be bypassed. Redefining the instance's `value` property
   * routes every write through the formatter; the instance override is removed
   * on destroy, falling back to the prototype accessor.
   */
  private _interceptValueWrites(element: HTMLInputElement): void {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    if (!descriptor) return;

    const setter = descriptor.set;
    if (!setter) return;

    Object.defineProperty(element, 'value', {
      ...descriptor,
      set: (value: string) => {
        setter.call(element, value);
        this._format();
      },
    });

    this._destroyRef.onDestroy(() => Reflect.deleteProperty(element, 'value'));
  }
}
