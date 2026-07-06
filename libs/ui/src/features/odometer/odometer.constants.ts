// A single decimal wheel holds ten digits (0-9).
export const ODOMETER_DIGITS_PER_REPETITION = 10;

// The wheel is rendered three times over so a roll always has a full repetition
// of slack on either side of the visible digit. This is what lets the column
// cross the 9→0 seam by traveling the short way instead of unwinding all the
// way back through 8, 7, 6…
export const ODOMETER_DIGIT_REPETITIONS = 3;

// Row offset of the middle repetition. Every roll re-centers here first, so the
// travel afterward is at most five rows in either direction and never runs off
// the rendered strip.
export const ODOMETER_CENTER_OFFSET = ODOMETER_DIGITS_PER_REPETITION;

// The stacked digits of a column, from top to bottom: 0-9 repeated three times.
export const ODOMETER_STRIP: readonly number[] = Array.from(
  { length: ODOMETER_DIGIT_REPETITIONS * ODOMETER_DIGITS_PER_REPETITION },
  (_unused, index) => index % ODOMETER_DIGITS_PER_REPETITION,
);

// Typographic minus (U+2212) reads better than a hyphen-minus for a numeric display.
export const ODOMETER_MINUS_SIGN = '−';
