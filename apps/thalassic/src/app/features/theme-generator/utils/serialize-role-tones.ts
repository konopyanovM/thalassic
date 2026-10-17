import {
  ROLE_PALETTES,
  ROLE_TONE_ENTRY_SEPARATOR,
  ROLE_TONE_VALUE_SEPARATOR,
} from '../theme-generator.constants';
import { colorRole, RoleTones } from '../types';

/**
 * Writes role tone overrides as a `role:tone,role:tone` param, in role order so
 * the same overrides always serialize alike.
 */
export function serializeRoleTones(overrides: Partial<RoleTones>): string {
  return (Object.keys(ROLE_PALETTES) as colorRole[])
    .flatMap(role => {
      const tone = overrides[role];
      return tone === undefined ? [] : [`${role}${ROLE_TONE_VALUE_SEPARATOR}${tone}`];
    })
    .join(ROLE_TONE_ENTRY_SEPARATOR);
}
