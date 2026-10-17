import { hexFromArgb } from '@material/material-color-utilities';
import { ROLE_PALETTES } from '../theme-generator.constants';
import { colorRole, RoleTones, ThemeRoles, TonalPalettes } from '../types';

/** Resolves every color role to its `#rrggbb` value: the role's tone read from its palette. */
export function resolveRoles(palettes: TonalPalettes, tones: RoleTones): ThemeRoles {
  const roles = {} as ThemeRoles;

  for (const role of Object.keys(ROLE_PALETTES) as colorRole[]) {
    roles[role] = hexFromArgb(palettes[ROLE_PALETTES[role]].tone(tones[role]));
  }

  return roles;
}
