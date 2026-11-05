import {
  booleanAttribute,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  linkedSignal,
  LOCALE_ID,
  model,
  ModelSignal,
  numberAttribute,
  Signal,
  WritableSignal,
} from '@angular/core';
import { FORM_CONTROL, ValueFormControl } from '../../../abstract/form';
import { controlSize } from '../../../types';
import { decimalPlaces } from '../../../utils';
import { inputVariant } from '../input/input.types';
import { Loader } from '../../loader';
import { INPUT_NUMBER_CONFIG } from './input-number.token';
import { numberInputMode } from './input-number.types';
import { isPartialNumberText, NumberTextRules, parseNumberText } from './input-number.utils';

/**
 * A field for a number, typed as text the field reads itself — the model React
 * Aria's and Base UI's number fields follow — rather than a native
 * `type="number"`, which reads the decimal separator by its own rules: WebKit
 * drops a typed comma, turning `62,5` into `625`, and Chromium rejects it,
 * while the decimal keypad of a device set to a comma region offers nothing
 * else. Here either separator reads as the decimal point, the value is shown
 * in the page's locale, and the virtual keyboard is the one the number needs.
 *
 * The step sets the precision: a whole step takes whole numbers, a fractional
 * one decimals. A minimum below zero, or none, admits a sign. ArrowUp and
 * ArrowDown move the value by a step, as a native number field's do; a typed
 * value is clamped into `[min, max]` once committed.
 */
@Component({
  selector: 'tls-input-number',
  templateUrl: './input-number.html',
  styleUrl: './input-number.scss',
  imports: [Loader],
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => InputNumber) }],
})
export class InputNumber extends ValueFormControl<number | null> {
  // Injections
  private readonly _config = inject(INPUT_NUMBER_CONFIG);
  private readonly _localeId = inject(LOCALE_ID);

  override readonly supportsLabelFor = true;

  // Inputs
  public readonly value: ModelSignal<number | null> = model<number | null>(null);
  public readonly placeholder = input<string>(this._config.placeholder);
  public readonly size: InputSignal<controlSize> = input<controlSize>(this._config.size);
  public readonly variant: InputSignal<inputVariant> = input<inputVariant>(this._config.variant);
  public readonly fluid: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.fluid,
    { transform: booleanAttribute },
  );
  public readonly min = input<number | undefined>(undefined);
  public readonly max = input<number | undefined>(undefined);
  public readonly step: InputSignalWithTransform<number, unknown> = input<number, unknown>(
    this._config.step,
    { transform: numberAttribute },
  );
  /**
   * The virtual keyboard to ask for. Left unset, it follows what the field
   * accepts: `decimal` for a fractional step, `numeric` for a whole one, and
   * `text` for a minimum below zero, since iOS's number keypads have no minus
   * key. A field with no minimum gets a number keypad all the same: most never
   * take a negative, and a form library that owns the bounds may not hand them
   * to the control — a field that does take negatives says so with its minimum.
   */
  public readonly inputMode = input<numberInputMode | undefined>(undefined);

  // State
  /**
   * The field's text. Follows the value whenever the value changes to one the
   * text does not already say, so a number still being typed — `62,` on its
   * way to `62,5` — is kept as typed instead of being rewritten as `62`.
   */
  protected readonly text: WritableSignal<string> = linkedSignal<number | null, string>({
    source: this.value,
    computation: (value, previous) => {
      if (previous && parseNumberText(previous.value) === value) return previous.value;
      return this._format(value);
    },
  });

  // Computed
  protected readonly classes: Signal<string[]> = computed(() => {
    const array: string[] = [this.CLASS_NAME, 'tls-input-number'];

    array.push(`${this.CLASS_NAME}--${this.size()}`);
    array.push(`${this.CLASS_NAME}--${this.variant()}`);
    if (this.fluid()) array.push(`${this.CLASS_NAME}--fluid`);

    return array.concat(this.controlClasses());
  });

  protected readonly effectiveInputMode: Signal<numberInputMode> = computed(() => {
    const inputMode = this.inputMode();
    if (inputMode) return inputMode;

    const min = this.min();
    if (min !== undefined && min < 0) return 'text';
    return this._rules().allowsFraction ? 'decimal' : 'numeric';
  });

  /** What may be typed, from the bounds and the step. */
  private readonly _rules: Signal<NumberTextRules> = computed(() => {
    const min = this.min();
    return {
      allowsNegative: min === undefined || min < 0,
      allowsFraction: !Number.isInteger(this.step()),
    };
  });

  /**
   * Writes a value in the page's locale, in the form the field reads back:
   * ungrouped, so a comma can only be the decimal point, and in Latin digits,
   * which are the only ones typing accepts — a locale that writes its own
   * (`ar-EG`, `fa`, `bn`) would otherwise show a figure no edit could follow.
   */
  private readonly _formatter: Signal<Intl.NumberFormat> = computed(
    () =>
      new Intl.NumberFormat(this._localeId, {
        useGrouping: false,
        maximumFractionDigits: 20,
        numberingSystem: 'latn',
      }),
  );

  // Protected methods
  /**
   * Refuses an insertion that would leave the text no number could become, so
   * a stray letter or a second separator never appears at all. A deletion
   * always leaves a part of a valid number, which is still valid.
   */
  protected onBeforeInput(event: InputEvent): void {
    if (!event.inputType.startsWith('insert')) return;

    const target = event.target as HTMLInputElement;
    const pasted = event.dataTransfer ? event.dataTransfer.getData('text/plain') : '';
    const inserted = event.data ?? pasted;
    const start = target.selectionStart ?? target.value.length;
    const end = target.selectionEnd ?? start;
    const next = target.value.slice(0, start) + inserted + target.value.slice(end);

    if (!isPartialNumberText(next, this._rules())) event.preventDefault();
  }

  /**
   * Takes the text as the new value. Text that reached the field past
   * `beforeinput` — an IME composition, which cannot be refused before it
   * lands — and is no number is put back to what the field held.
   */
  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!isPartialNumberText(target.value, this._rules())) {
      target.value = this.text();
      return;
    }

    this.text.set(target.value);
    this.value.set(parseNumberText(target.value));
  }

  /**
   * Clamps a typed value into `[min, max]` once editing is committed (`change`
   * fires on blur/Enter) and rewrites the text in the field's own form, so
   * `62,` reads `62`. Clamping only here keeps mid-typing values ("1" on the
   * way to "10") intact.
   */
  protected onChange(): void {
    const value = this.value();
    if (value === null) {
      this.text.set('');
      return;
    }

    this._commit(this._clamp(value));
  }

  /** ArrowUp and ArrowDown step the value, as they do in a native number field. */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;

    event.preventDefault();
    if (this.readonly()) return;

    this._stepBy(event.key === 'ArrowUp' ? 1 : -1);
  }

  // Private methods
  /**
   * Moves the value by one step in `direction`, rounded to the precision of the
   * step and the value so repeated steps never collect float error
   * (`0.1 + 0.2`). An empty field starts from the minimum, or zero.
   */
  private _stepBy(direction: 1 | -1): void {
    const value = this.value();
    if (value === null) {
      this._commit(this._clamp(this.min() ?? 0));
      return;
    }

    const step = this.step();
    const precision = Math.max(decimalPlaces(step), decimalPlaces(value));
    this._commit(this._clamp(Number((value + direction * step).toFixed(precision))));
  }

  /** Sets a value the field produced itself, and shows it in the field's own form. */
  private _commit(value: number): void {
    this.value.set(value);
    this.text.set(this._format(value));
  }

  /** Keeps `value` within `[min, max]`, where either is set. */
  private _clamp(value: number): number {
    const min = this.min();
    const max = this.max();

    if (min !== undefined && value < min) return min;
    if (max !== undefined && value > max) return max;
    return value;
  }

  /** The text the field shows for `value`: empty for none. */
  private _format(value: number | null): string {
    if (value === null) return '';
    return this._formatter().format(value);
  }
}
