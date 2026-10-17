import { hexFromArgb } from '@material/material-color-utilities';
import { DEFAULT_THEME_SOURCE } from '../theme-generator.constants';
import { generatePalettes } from './generate-palettes';
import { resolveRoleTones } from './resolve-role-tones';
import { resolveRoles } from './resolve-roles';
import { rolesToDeclarations } from './roles-to-declarations';

describe('resolveRoles', () => {
  const palettes = generatePalettes(DEFAULT_THEME_SOURCE);

  it('maps light roles to their default palette tones', () => {
    const roles = resolveRoles(palettes, resolveRoleTones({}, 'light'));

    expect(roles.primary).toBe('#00658d');
    expect(roles['on-primary']).toBe('#ffffff');
    expect(roles.surface).toBe('#f6fafe');
    expect(roles['surface-container-lowest']).toBe('#ffffff');
  });

  it('maps dark roles to their default palette tones', () => {
    const roles = resolveRoles(palettes, resolveRoleTones({}, 'dark'));

    expect(roles['on-surface']).toBe('#dfe3e7');
    expect(roles['surface-container-lowest']).toBe('#0a0f12');
    expect(roles['surface-container-highest']).toBe('#313539');
  });

  it('reads an overridden role at its override and leaves the rest at their defaults', () => {
    const roles = resolveRoles(palettes, resolveRoleTones({ primary: 65 }, 'dark'));
    const defaults = resolveRoles(palettes, resolveRoleTones({}, 'dark'));

    expect(roles.primary).toBe(hexFromArgb(palettes.primary.tone(65)));
    expect(roles.primary).not.toBe(defaults.primary);
    expect(roles['on-primary']).toBe(defaults['on-primary']);
  });

  it('writes every role as a color custom property', () => {
    const declarations = rolesToDeclarations(
      resolveRoles(palettes, resolveRoleTones({}, 'light')),
    ).split('\n');

    expect(declarations).toHaveLength(23);
    expect(declarations[0]).toBe('--color-primary: #00658d;');
  });
});
