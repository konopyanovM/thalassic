import { themeType } from '@thalassic/core';
import { DEFAULT_ROLE_TONES } from '../theme-generator.constants';
import { RoleTones } from '../types';

/** Every role's tone in one mode: its override where it has one, its default otherwise. */
export function resolveRoleTones(overrides: Partial<RoleTones>, mode: themeType): RoleTones {
  return { ...DEFAULT_ROLE_TONES[mode], ...overrides };
}
