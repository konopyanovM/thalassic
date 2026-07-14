export interface OdometerConfig {
  /** Duration of a single digit roll, in milliseconds. */
  duration: number;
  /** Delay before a digit roll starts, in milliseconds. */
  delay: number;
  /** Minimum number of integer digits, left-padded with zeros (`007`). */
  minIntegerDigits: number;
  /** Number of fraction digits to display. `0` hides the decimal part. */
  fractionDigits: number;
  /** Character rendered between the integer and fraction parts. */
  decimalSeparator: string;
}

export const DEFAULT_ODOMETER_CONFIG: OdometerConfig = {
  duration: 600,
  delay: 0,
  minIntegerDigits: 1,
  fractionDigits: 0,
  decimalSeparator: '.',
};
