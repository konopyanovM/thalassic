import { ROLE_PALETTES } from '../theme-generator.constants';
import { colorRole } from '../types';

/** Whether a value names a color role. */
export function isColorRole(value: string): value is colorRole {
  return Object.keys(ROLE_PALETTES).includes(value);
}
