import { themeType } from '@thalassic/core';
import {
  PALETTE_NAMES,
  ROLE_PALETTES,
  THEME_CONFIG_FILE_NAME,
  THEME_MODULE,
} from '../theme-generator.constants';
import { CodeFile, colorRole, RoleToneOverrides, TonalPalettes } from '../types';
import { exportTones } from './export-tones';
import { paletteEntries } from './palette-entries';

/**
 * Writes the `@use … with (…)` that loads the theme configured with these
 * palettes and, when any role reads a tone other than its default, those tones.
 */
export function buildThemeConfig(palettes: TonalPalettes, roleTones: RoleToneOverrides): CodeFile {
  const tones = exportTones(roleTones);
  const paletteConfiguration = PALETTE_NAMES.flatMap(name => [
    `  $${name}: (`,
    ...paletteEntries(palettes[name], tones, '    '),
    '  ),',
  ]);

  return {
    fileName: THEME_CONFIG_FILE_NAME,
    content: [
      `@use '${THEME_MODULE}' with (`,
      ...paletteConfiguration,
      ...roleTonesConfiguration(roleTones),
      ');',
      '',
    ].join('\n'),
  };
}

/** The `$role-tones` configuration entry, or nothing when every role keeps its default tone. */
function roleTonesConfiguration(roleTones: RoleToneOverrides): string[] {
  const modeEntries = (Object.keys(roleTones) as themeType[]).flatMap(mode => {
    const roleEntries = (Object.keys(ROLE_PALETTES) as colorRole[]).flatMap(role => {
      const tone = roleTones[mode][role];
      return tone === undefined ? [] : [`      '${role}': ${tone},`];
    });
    if (roleEntries.length === 0) return [];

    return [`    '${mode}': (`, ...roleEntries, '    ),'];
  });
  if (modeEntries.length === 0) return [];

  return ['  $role-tones: (', ...modeEntries, '  ),'];
}
