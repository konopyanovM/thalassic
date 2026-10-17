import { TONE_MAX, TONE_MIN } from '../theme-generator.constants';

/** Whether a value is a whole HCT tone, from black to white. */
export function isTone(value: number): boolean {
  return Number.isInteger(value) && value >= TONE_MIN && value <= TONE_MAX;
}
