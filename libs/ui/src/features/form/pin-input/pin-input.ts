import {
  Component,
  computed,
  ElementRef,
  forwardRef,
  inject,
  input,
  InputSignal,
  model,
  ModelSignal,
  Signal,
  viewChildren,
} from '@angular/core';
import { FORM_CONTROL, ValueFormControl } from '../../../abstract/form';
import { PIN_INPUT_ALPHANUMERIC_REGEX, PIN_INPUT_NUMERIC_REGEX } from './pin-input.constants';
import { PIN_INPUT_CONFIG } from './pin-input.token';
import { pinInputType } from './pin-input.types';

@Component({
  selector: 'tls-pin-input',
  imports: [],
  templateUrl: './pin-input.html',
  host: {
    role: 'group',
    '[class]': 'hostClasses()',
    '[attr.aria-label]': 'ariaLabel() ?? null',
    '[attr.aria-labelledby]': 'ariaLabelledby() ?? null',
    '[attr.aria-invalid]': "invalid() ? 'true' : null",
    '[attr.aria-describedby]': 'describedBy()',
  },
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => PinInput) }],
})
export class PinInput extends ValueFormControl<string> {
  private _config = inject(PIN_INPUT_CONFIG);

  private readonly _inputs = viewChildren<ElementRef<HTMLInputElement>>('cell');

  // Inputs
  public readonly value: ModelSignal<string> = model<string>('');

  public readonly length: InputSignal<number> = input<number>(this._config.length);
  public readonly type: InputSignal<pinInputType> = input<pinInputType>(this._config.type);
  public readonly placeholder: InputSignal<string> = input<string>(this._config.placeholder);

  protected override CLASS_NAME = 'tls-pin-input';

  // Computed
  protected readonly cells: Signal<number[]> = computed(() =>
    Array.from({ length: this.length() }, (_, index) => index),
  );

  protected readonly hostClasses: Signal<string[]> = computed(() => {
    const className = this.CLASS_NAME;

    const array: string[] = [className];

    return array.concat(this.controlClasses());
  });

  // Protected methods
  protected getCellValue(index: number): string {
    return this.value()[index] ?? '';
  }

  protected onInput(event: Event, index: number): void {
    const element = event.target as HTMLInputElement;
    const char = element.value;

    const allowedRegExp = this._getAllowedRegularExpression();

    if (char && !allowedRegExp.test(char)) {
      element.value = this.getCellValue(index);
      return;
    }

    this._setCell(index, char);
    element.value = this.getCellValue(index);

    if (char) this._focusCell(index + 1);
  }

  protected onKeydown(event: KeyboardEvent, index: number): void {
    const element = event.target as HTMLInputElement;

    if (event.key === 'Backspace') {
      event.preventDefault();
      if (this.getCellValue(index)) {
        this._setCell(index, '');
      } else {
        this._setCell(index - 1, '');
        this._focusCell(index - 1);
      }
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this._focusCell(index - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this._focusCell(index + 1);
    }

    element.value = this.getCellValue(index);
  }

  protected onPaste(event: ClipboardEvent, index: number): void {
    event.preventDefault();

    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    const text = clipboardData.getData('text');
    const allowedRegExp = this._getAllowedRegularExpression();
    if (!allowedRegExp.test(text)) return;

    const chars = text.slice(0, this.length() - this.value().length).split('');

    if (!chars.length) return;

    const array = this._getValueArray();
    for (let i = 0; i < chars.length; i++) {
      array[index + i] = chars[i];
    }

    this._commitArray(array);
    this._focusCell(Math.min(this.value().length, this.length()));
  }

  protected onFocus(event: FocusEvent): void {
    (event.target as HTMLInputElement).select();
  }

  // Private methods
  private _setCell(index: number, char: string): void {
    if (index < 0 || index >= this.length()) return;

    const array = this._getValueArray();
    array[index] = char[1] ?? char[0];
    this._commitArray(array);
  }

  private _commitArray(array: string[]): void {
    let end = array.length;
    while (end > 0 && array[end - 1] === '') end--;

    this.value.set(array.slice(0, end).join(''));
  }

  private _focusCell(index: number): void {
    const clamped = Math.max(0, Math.min(index, this.length() - 1));
    this._inputs()[clamped].nativeElement.focus();
  }

  private _getAllowedRegularExpression(): RegExp {
    const type = this.type();
    if (type instanceof RegExp) return type;

    switch (type) {
      case 'numeric':
        return PIN_INPUT_NUMERIC_REGEX;
      case 'alphanumeric':
        return PIN_INPUT_ALPHANUMERIC_REGEX;
    }
  }

  private _getValueArray(): string[] {
    return Array.from({ length: this.length() }, (_, i) => this.value()[i] ?? '');
  }
}
