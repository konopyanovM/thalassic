import { ROLE_TONE_ENTRY_SEPARATOR, ROLE_TONE_VALUE_SEPARATOR } from '../theme-generator.constants';
import { RoleTones } from '../types';
import { isColorRole } from './is-color-role';
import { isTone } from './is-tone';

/**
 * Reads role tone overrides from a `role:tone,role:tone` param. An entry naming
 * no role or carrying no whole tone is skipped rather than failing the rest.
 */
export function parseRoleTones(value: string): Partial<RoleTones> {
  const overrides: Partial<RoleTones> = {};

  for (const entry of value.split(ROLE_TONE_ENTRY_SEPARATOR)) {
    const [role, tone] = entry.split(ROLE_TONE_VALUE_SEPARATOR);
    // `Number('')` is 0, so an entry with an empty tone must not read as black.
    if (!tone) continue;

    const parsedTone = Number(tone);
    if (isColorRole(role) && isTone(parsedTone)) overrides[role] = parsedTone;
  }

  return overrides;
}
