import { hexFromArgb, TonalPalette } from '@material/material-color-utilities';

/** A palette's `tone: #rrggbb,` map entries, one line per tone, at the given indent. */
export function paletteEntries(palette: TonalPalette, tones: number[], indent: string): string[] {
  return tones.map(tone => `${indent}${tone}: ${hexFromArgb(palette.tone(tone))},`);
}
