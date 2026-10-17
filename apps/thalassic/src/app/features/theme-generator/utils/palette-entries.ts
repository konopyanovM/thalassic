import { hexFromArgb, TonalPalette } from '@material/material-color-utilities';
import { PALETTE_TONES } from '../theme-generator.constants';

/** A palette's `tone: #rrggbb,` map entries, one line per exported tone, at the given indent. */
export function paletteEntries(palette: TonalPalette, indent: string): string[] {
  return PALETTE_TONES.map(tone => `${indent}${tone}: ${hexFromArgb(palette.tone(tone))},`);
}
