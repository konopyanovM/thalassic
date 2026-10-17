import { TonalPalette } from '@material/material-color-utilities';
import { PALETTE_TONES } from '../theme-generator.constants';
import { paletteToScss } from './palette-to-scss';

describe('paletteToScss', () => {
  it('writes the palette as a tone map named after the palette file', () => {
    const file = paletteToScss('neutral-variant', TonalPalette.fromHueAndChroma(240, 8));
    const lines = file.content.trimEnd().split('\n');

    expect(file.fileName).toBe('_neutral-variant.scss');
    expect(lines[0]).toBe('$neutral-variant: (');
    expect(lines[1]).toBe('  0: #000000,');
    expect(lines.at(-2)).toBe('  100: #ffffff,');
    expect(lines.at(-1)).toBe(');');
    expect(lines).toHaveLength(PALETTE_TONES.length + 2);
  });
});
