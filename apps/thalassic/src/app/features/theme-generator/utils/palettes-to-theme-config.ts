import { PALETTE_NAMES, THEME_CONFIG_FILE_NAME, THEME_MODULE } from '../theme-generator.constants';
import { CodeFile, TonalPalettes } from '../types';
import { paletteEntries } from './palette-entries';

/** Writes the `@use … with (…)` that loads the theme configured with these palettes. */
export function palettesToThemeConfig(palettes: TonalPalettes): CodeFile {
  const configuration = PALETTE_NAMES.flatMap(name => [
    `  $${name}: (`,
    ...paletteEntries(palettes[name], '    '),
    '  ),',
  ]);

  return {
    fileName: THEME_CONFIG_FILE_NAME,
    content: [`@use '${THEME_MODULE}' with (`, ...configuration, ');', ''].join('\n'),
  };
}
