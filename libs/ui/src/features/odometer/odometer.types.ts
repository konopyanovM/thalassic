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

/** A rendered slot paired with how long its roll lasts. */
export interface OdometerSlot {
  /** The slot itself. */
  token: OdometerToken;
  /** Duration of the slot's roll, in milliseconds; a symbol never rolls. */
  duration: number;
}

/**
 * Which way a digit column turns on its way to a new digit: `up` counts upward
 * through the wheel (4 → 5 → 6, 9 → 0), `down` counts downward (6 → 5 → 4,
 * 0 → 9), and `shortest` takes whichever arc is shorter.
 */
export type odometerDirection = 'shortest' | 'up' | 'down';
