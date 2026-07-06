/**
 * One rendered slot of an odometer: either a rolling digit column or a static
 * symbol (sign, decimal separator).
 */
export interface OdometerToken {
  /**
   * Stable identity tied to the slot's place value, so a column keeps its
   * element (and its roll animation) as the number grows or shrinks.
   */
  key: string;
  /** Digit `0-9` for a rolling column, or `null` when the slot is a symbol. */
  digit: number | null;
  /** Literal character for a static symbol, or `null` when the slot is a digit. */
  symbol: string | null;
}
