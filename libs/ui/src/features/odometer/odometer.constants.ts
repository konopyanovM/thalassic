/** A single decimal wheel holds ten digits (0-9). */
export const ODOMETER_DIGITS_PER_REPETITION = 10;

/**
 * The wheel is rendered at least three times over so a roll always has a full
 * repetition of slack on either side of the visible digit. This is what lets
 * the column cross the 9→0 seam by traveling the short way instead of
 * unwinding all the way back through 8, 7, 6… Each full turn a roll makes
 * adds one more repetition on either side.
 */
export const ODOMETER_DIGIT_REPETITIONS = 3;

/**
 * Typographic minus (U+2212) reads better than a hyphen-minus for a numeric display.
 */
export const ODOMETER_MINUS_SIGN = '−';

/**
 * A character that rolls as a digit column; anything else is a fixed symbol.
 */
export const ODOMETER_DIGIT_PATTERN = /^[0-9]$/;
