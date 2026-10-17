import { hexFromArgb, TonalPalette } from '@material/material-color-utilities';
import { PALETTE_TONES } from '../theme-generator.constants';
import { paletteName, ScssFile } from '../types';

/**
 * Writes a palette as the SCSS partial the theme forwards: a `$<name>` map from
 * tone to lowercase `#rrggbb`, in the theme's own file layout.
 */
export function paletteToScss(name: paletteName, palette: TonalPalette): ScssFile {
  const entries = PALETTE_TONES.map(tone => `  ${tone}: ${hexFromArgb(palette.tone(tone))},`);

  return {
    fileName: `_${name}.scss`,
    content: [`$${name}: (`, ...entries, ');', ''].join('\n'),
  };
}
