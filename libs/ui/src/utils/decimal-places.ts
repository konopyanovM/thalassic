/**
 * How many digits a number carries after its decimal point, read from its
 * shortest round-trip form, so `0.1` has one even though its binary value does
 * not end there.
 *
 * @example
 * decimalPlaces(5);      // 0
 * decimalPlaces(0.25);   // 2
 * decimalPlaces(1e-7);   // 7 — exponent notation, not the "1e-7" text
 */
export const decimalPlaces = (value: number): number => {
  const [mantissa, exponent] = String(Math.abs(value)).split('e');
  const [, fraction = ''] = mantissa.split('.');
  return Math.max(0, fraction.length - Number(exponent ?? 0));
};
