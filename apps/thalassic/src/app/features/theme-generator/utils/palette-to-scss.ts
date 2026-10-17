import { TonalPalette } from '@material/material-color-utilities';
import { CodeFile, paletteName } from '../types';
import { paletteEntries } from './palette-entries';

/**
 * Writes a palette as the SCSS partial the theme forwards: a `$<name>` map from
 * tone to lowercase `#rrggbb`, `!default` so the theme stays configurable.
 */
export function paletteToScss(name: paletteName, palette: TonalPalette): CodeFile {
  return {
    fileName: `_${name}.scss`,
    content: [`$${name}: (`, ...paletteEntries(palette, '  '), ') !default;', ''].join('\n'),
  };
}
