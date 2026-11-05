/** What a number field lets be typed into it. */
export interface NumberTextRules {
  /** Whether a leading minus sign may be typed. */
  allowsNegative: boolean;
  /** Whether a decimal separator and a fraction may be typed. */
  allowsFraction: boolean;
}

/**
 * Whether `text` is a number on its way to being typed — empty, a lone sign,
 * digits with or without a trailing separator — that the field may hold.
 *
 * Both `.` and `,` count as the decimal separator in every locale. The field
 * never groups digits, so a comma cannot be a thousands separator in it; and
 * the separator a virtual keypad offers follows the device's region, not the
 * page's language, so either may arrive.
 *
 * @example
 * isPartialNumberText('-', { allowsNegative: true, allowsFraction: true });   // true
 * isPartialNumberText('62,', { allowsNegative: false, allowsFraction: true }); // true
 * isPartialNumberText('6.2', { allowsNegative: false, allowsFraction: false }); // false — whole numbers only
 * isPartialNumberText('1.2.3', { allowsNegative: true, allowsFraction: true }); // false — two separators
 */
export const isPartialNumberText = (text: string, rules: NumberTextRules): boolean => {
  const sign = rules.allowsNegative ? '-?' : '';
  const fraction = rules.allowsFraction ? '(?:[.,]\\d*)?' : '';
  return new RegExp(`^${sign}\\d*${fraction}$`).test(text);
};

/**
 * The number partial text stands for, or null while it holds no digit yet.
 *
 * @example
 * parseNumberText('62,5'); // 62.5
 * parseNumberText('-');    // null
 * parseNumberText('3.');   // 3
 */
export const parseNumberText = (text: string): number | null => {
  if (!/\d/.test(text)) return null;

  const parsed = Number(text.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
};
