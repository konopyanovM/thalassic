import { HEX_COLOR_PATTERN } from '../theme-generator.constants';

/** Whether a value is a six-digit `#rrggbb` color. */
export function isHexColor(value: string): boolean {
  return HEX_COLOR_PATTERN.test(value);
}
