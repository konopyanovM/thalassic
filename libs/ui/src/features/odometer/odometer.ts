import {
  booleanAttribute,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  Signal,
} from '@angular/core';
import { OdometerDigit } from './odometer-digit';
import { OdometerConfig } from './odometer.config';
import { ODOMETER_DIGIT_PATTERN, ODOMETER_MINUS_SIGN } from './odometer.constants';
import { ODOMETER_CONFIG } from './odometer.token';
import { OdometerToken } from './odometer.types';

/**
 * Animated number whose digits roll to the new value, like a mechanical
 * odometer. Each digit column rolls through the values between the old and the
 * new one by the shortest path, so counting up or down reads naturally.
 *
 * Shows either a number (`value`, formatted by the inputs below) or text
 * written out by the caller (`text`), whose digits roll while every other
 * character stays put — a clock, a date, a formatted amount. `text` wins when
 * both are given.
 *
 * The value scales with the surrounding `font-size`. The roll is a functional
 * cue on the `essential` motion tier, so it is replaced by an instant swap when
 * the user has reduced motion. `animated` turns it off per change, for a value
 * that moves on its own and should roll only when someone moves it.
 *
 * @example
 * <!-- a live score -->
 * <tls-odometer [value]="score()" />
 *
 * @example
 * <!-- fixed-width counter with two decimals -->
 * <tls-odometer [value]="balance()" [minIntegerDigits]="4" [fractionDigits]="2" />
 *
 * @example
 * <!-- a countdown that ticks in place and rolls only when adjusted -->
 * <tls-odometer [text]="clock()" [animated]="adjusted()" />
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
  public readonly value: InputSignal<number | null> = input<number | null>(null);
  /**
   * Text to display as written, in place of `value`. Its digits roll; every
   * other character is a fixed symbol. The number formatting inputs do not
   * apply to it.
   */
  public readonly text: InputSignal<string | null> = input<string | null>(null);
  /**
   * Whether a change rolls. Read as each new value arrives, so turning it off
   * swaps the next values in place without cutting short a roll under way.
   */
  public readonly animated: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });
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
    const text = this.text();
    if (text !== null) return this._textTokens(text);

    const value = this.value();
    if (value === null) return [];

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

  // Private methods
  /**
   * Keyed by position from the end, as a number's columns are by place value,
   * so `9:59` turning into `10:00` keeps its right-hand columns rolling in
   * place instead of every slot being rebuilt.
   */
  private _textTokens(text: string): OdometerToken[] {
    const characters = Array.from(text);
    const length = characters.length;

    return characters.map((character, index) => {
      const key = `text-${length - index}`;
      if (ODOMETER_DIGIT_PATTERN.test(character)) {
        return { key, digit: Number(character), symbol: null };
      }

      return { key, digit: null, symbol: character };
    });
  }
}
