import { Component, computed, inject, input, InputSignal, Signal } from '@angular/core';
import { OdometerDigit } from './odometer-digit';
import { OdometerConfig } from './odometer.config';
import { ODOMETER_MINUS_SIGN } from './odometer.constants';
import { ODOMETER_CONFIG } from './odometer.token';
import { OdometerToken } from './odometer.types';

/**
 * Animated number whose digits roll to the new value, like a mechanical
 * odometer. Each digit column rolls through the values between the old and the
 * new one by the shortest path, so counting up or down reads naturally.
 *
 * The value scales with the surrounding `font-size`. The roll is a functional
 * cue on the `essential` motion tier, so it is replaced by an instant swap when
 * the user has reduced motion.
 *
 * @example
 * <!-- a live score -->
 * <tls-odometer [value]="score()" />
 *
 * @example
 * <!-- fixed-width counter with two decimals -->
 * <tls-odometer [value]="balance()" [minIntegerDigits]="4" [fractionDigits]="2" />
 */
@Component({
  selector: 'tls-odometer',
  imports: [OdometerDigit],
  templateUrl: './odometer.html',
  host: {
    class: 'tls-odometer',
  },
})
export class Odometer {
  // Injections
  private readonly _config: OdometerConfig = inject(ODOMETER_CONFIG);

  // Inputs
  /** The number to display. Changes roll the affected digit columns. */
  public readonly value: InputSignal<number> = input.required<number>();
  /** Duration of a single-digit roll, in milliseconds. */
  public readonly duration: InputSignal<number> = input<number>(this._config.duration);
  /** Delay before a digit roll starts, in milliseconds. */
  public readonly delay: InputSignal<number> = input<number>(this._config.delay);
  /** Minimum number of integer digits, left-padded with zeros (`007`). */
  public readonly minIntegerDigits: InputSignal<number> = input<number>(
    this._config.minIntegerDigits,
  );
  /** Number of fraction digits to display. `0` hides the decimal part. */
  public readonly fractionDigits: InputSignal<number> = input<number>(this._config.fractionDigits);
  /** Character rendered between the integer and fraction parts. */
  public readonly decimalSeparator: InputSignal<string> = input<string>(
    this._config.decimalSeparator,
  );
  /** Overrides the text announced to screen readers (defaults to the formatted value). */
  public readonly ariaLabel: InputSignal<string | undefined> = input<string | undefined>(undefined);

  // Computed
  protected readonly tokens: Signal<OdometerToken[]> = computed(() => {
    const value = this.value();
    const fractionDigits = this.fractionDigits();
    const minIntegerDigits = this.minIntegerDigits();

    const isNegative = value < 0;
    const [integerText, fractionText = ''] = Math.abs(value).toFixed(fractionDigits).split('.');
    const paddedInteger = integerText.padStart(minIntegerDigits, '0');

    const tokens: OdometerToken[] = [];

    if (isNegative) tokens.push({ key: 'sign', digit: null, symbol: ODOMETER_MINUS_SIGN });

    const integerLength = paddedInteger.length;
    for (let index = 0; index < integerLength; index++) {
      // Key by place value counting from the units digit, so a column keeps its
      // identity when the number gains or loses leading digits.
      const place = integerLength - index;
      tokens.push({ key: `integer-${place}`, digit: Number(paddedInteger[index]), symbol: null });
    }

    if (fractionDigits > 0) {
      tokens.push({ key: 'point', digit: null, symbol: this.decimalSeparator() });
      for (let index = 0; index < fractionText.length; index++) {
        tokens.push({
          key: `fraction-${index + 1}`,
          digit: Number(fractionText[index]),
          symbol: null,
        });
      }
    }

    return tokens;
  });

  protected readonly formattedValue: Signal<string> = computed(() =>
    this.tokens()
      .map(token => (token.digit === null ? token.symbol : String(token.digit)))
      .join(''),
  );
}
