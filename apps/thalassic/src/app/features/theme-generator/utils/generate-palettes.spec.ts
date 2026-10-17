import { hexFromArgb } from '@material/material-color-utilities';
import { DEFAULT_THEME_SOURCE } from '../theme-generator.constants';
import { ThemeSource } from '../types';
import { generatePalettes } from './generate-palettes';

describe('generatePalettes', () => {
  const source = (overrides: Partial<ThemeSource> = {}): ThemeSource => ({
    ...DEFAULT_THEME_SOURCE,
    ...overrides,
  });

  it('keeps an input color at its own tone when color match is on', () => {
    const palettes = generatePalettes(source());

    expect(hexFromArgb(palettes.primary.tone(40))).toBe('#00658d');
    expect(hexFromArgb(palettes.tertiary.tone(40))).toBe('#ac2471');
  });

  it("produces the shipped theme's surfaces from the default seed", () => {
    const palettes = generatePalettes(source());

    expect(hexFromArgb(palettes.neutral.tone(98))).toBe('#f6fafe');
    expect(hexFromArgb(palettes.neutral.tone(10))).toBe('#181c1f');
    expect(hexFromArgb(palettes['neutral-variant'].tone(90))).toBe('#dde3ea');
  });

  it("caps an input at the variant's chroma when color match is off", () => {
    const matched = generatePalettes(source({ colorMatch: true }));
    const capped = generatePalettes(source({ colorMatch: false }));

    expect(capped.primary.chroma).toBeLessThan(matched.primary.chroma);
    expect(capped.tertiary.hue).toBeCloseTo(matched.tertiary.hue, 0);
  });

  it('derives secondary and tertiary from the seed when they have no override', () => {
    const palettes = generatePalettes(source({ secondary: null, tertiary: null }));

    expect(palettes.secondary.hue).toBeCloseTo(palettes.primary.hue, 0);
    expect(palettes.tertiary.hue).not.toBeCloseTo(palettes.primary.hue, 0);
  });

  it('tints both neutral palettes with the hue of a neutral override', () => {
    const palettes = generatePalettes(source({ neutral: '#8a6a4a' }));

    expect(palettes.neutral.hue).toBeCloseTo(palettes['neutral-variant'].hue, 5);
    expect(palettes['neutral-variant'].chroma).toBeGreaterThan(palettes.neutral.chroma);
  });

  it('follows the 2025 spec only for the variants it revises', () => {
    const palettesOf = (variant: ThemeSource['variant'], spec: ThemeSource['spec']) =>
      generatePalettes(
        source({ variant, spec, colorMatch: false, secondary: null, tertiary: null }),
      );

    expect(palettesOf('vibrant', '2025').primary.chroma).not.toBeCloseTo(
      palettesOf('vibrant', '2021').primary.chroma,
      0,
    );
    expect(palettesOf('fidelity', '2025').tertiary.hue).toBeCloseTo(
      palettesOf('fidelity', '2021').tertiary.hue,
      5,
    );
  });

  it('builds every variant under both specs', () => {
    const variants: ThemeSource['variant'][] = [
      'tonal-spot',
      'neutral',
      'vibrant',
      'expressive',
      'fidelity',
      'content',
      'monochrome',
      'rainbow',
      'fruit-salad',
    ];

    for (const variant of variants) {
      for (const spec of ['2021', '2025'] as const) {
        expect(() => generatePalettes(source({ variant, spec }))).not.toThrow();
      }
    }
  });
});
