import { DARK_THEME_CLASS } from '@thalassic/core';
import { THEME_CSS_FILE_NAME } from '../theme-generator.constants';
import { CodeFile, ThemeRoles } from '../types';
import { rolesToDeclarations } from './roles-to-declarations';

/**
 * Writes the roles as `:root` overrides for both modes. The selectors match the
 * theme's own, so the file wins by loading after it.
 */
export function rolesToCss(light: ThemeRoles, dark: ThemeRoles): CodeFile {
  // A rule block with one indented declaration per line.
  const block = (selector: string, roles: ThemeRoles): string =>
    [`${selector} {`, ...rolesToDeclarations(roles).split('\n').map(line => `  ${line}`), '}'].join(
      '\n',
    );

  return {
    fileName: THEME_CSS_FILE_NAME,
    content: [block(':root', light), '', block(`:root.${DARK_THEME_CLASS}`, dark), ''].join('\n'),
  };
}
