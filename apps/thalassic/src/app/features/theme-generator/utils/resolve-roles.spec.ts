import { DEFAULT_THEME_SOURCE } from '../theme-generator.constants';
import { generatePalettes } from './generate-palettes';
import { resolveRoles } from './resolve-roles';
import { rolesToDeclarations } from './roles-to-declarations';

describe('resolveRoles', () => {
  const palettes = generatePalettes(DEFAULT_THEME_SOURCE);

  it('maps light roles to their palette tones', () => {
    const roles = resolveRoles(palettes, 'light');

    expect(roles.primary).toBe('#00658d');
    expect(roles['on-primary']).toBe('#ffffff');
    expect(roles.surface).toBe('#f6fafe');
    expect(roles['surface-container-lowest']).toBe('#ffffff');
  });

  it('maps dark roles to their palette tones', () => {
    const roles = resolveRoles(palettes, 'dark');

    expect(roles['on-surface']).toBe('#dfe3e7');
    expect(roles['surface-container-lowest']).toBe('#0a0f12');
    expect(roles['surface-container-highest']).toBe('#313539');
  });

  it('writes every role as a color custom property', () => {
    const declarations = rolesToDeclarations(resolveRoles(palettes, 'light')).split('\n');

    expect(declarations).toHaveLength(23);
    expect(declarations[0]).toBe('--color-primary: #00658d;');
  });
});
