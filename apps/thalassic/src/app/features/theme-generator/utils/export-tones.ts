import { PALETTE_TONES } from '../theme-generator.constants';
import { RoleToneOverrides } from '../types';

/**
 * Tones written into every exported palette: the standard steps plus any tone a
 * role override reads, so each role resolves against the exported palettes.
 */
export function exportTones(roleTones: RoleToneOverrides): number[] {
  const overrideTones = [...Object.values(roleTones.light), ...Object.values(roleTones.dark)];

  return [...new Set([...PALETTE_TONES, ...overrideTones])].sort((first, second) => first - second);
}
