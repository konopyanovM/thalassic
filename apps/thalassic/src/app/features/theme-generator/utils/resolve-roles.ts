import { hexFromArgb } from '@material/material-color-utilities';
import { themeType } from '@thalassic/core';
import { ROLE_TONES } from '../theme-generator.constants';
import { colorRole, ThemeRoles, TonalPalettes } from '../types';

/** Resolves every color role of one mode to its `#rrggbb` value. */
export function resolveRoles(palettes: TonalPalettes, mode: themeType): ThemeRoles {
  const tones = ROLE_TONES[mode];
  const roles = {} as ThemeRoles;

  for (const role of Object.keys(tones) as colorRole[]) {
    const { palette, tone } = tones[role];
    roles[role] = hexFromArgb(palettes[palette].tone(tone));
  }

  return roles;
}
