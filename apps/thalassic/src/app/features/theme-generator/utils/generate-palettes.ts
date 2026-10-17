import { argbFromHex, Hct, TonalPalette } from '@material/material-color-utilities';
import { ThemeSource, TonalPalettes } from '../types';
import { createScheme } from './create-scheme';

/**
 * Derives the five tonal palettes of a theme. The variant's scheme supplies
 * every palette without an override. An override contributes its hue, and —
 * with `colorMatch` on — its own chroma too; otherwise the variant's chroma
 * for that palette is kept. The seed itself counts as the primary override.
 */
export function generatePalettes(source: ThemeSource): TonalPalettes {
  const seed = Hct.fromInt(argbFromHex(source.primary));
  const scheme = createScheme(seed, source.variant, source.spec);

  /** Palette for an input color: its hue, with its own chroma or the fallback palette's. */
  const fromInput = (hex: string, fallback: TonalPalette): TonalPalette => {
    const color = Hct.fromInt(argbFromHex(hex));
    if (source.colorMatch) return TonalPalette.fromHct(color);
    return TonalPalette.fromHueAndChroma(color.hue, fallback.chroma);
  };

  return {
    primary: source.colorMatch ? TonalPalette.fromHct(seed) : scheme.primaryPalette,
    secondary: source.secondary
      ? fromInput(source.secondary, scheme.secondaryPalette)
      : scheme.secondaryPalette,
    tertiary: source.tertiary
      ? fromInput(source.tertiary, scheme.tertiaryPalette)
      : scheme.tertiaryPalette,
    ...generateNeutralPalettes(source, scheme.neutralPalette, scheme.neutralVariantPalette),
  };
}

/**
 * Neutral and neutral-variant palettes. A neutral override sets the hue of
 * both; the variant palette keeps the scheme's chroma offset over the neutral
 * one, so its surfaces stay a step more tinted than the plain ones.
 */
function generateNeutralPalettes(
  source: ThemeSource,
  neutral: TonalPalette,
  neutralVariant: TonalPalette,
): Pick<TonalPalettes, 'neutral' | 'neutral-variant'> {
  if (!source.neutral) return { neutral, 'neutral-variant': neutralVariant };

  const color = Hct.fromInt(argbFromHex(source.neutral));
  const chroma = source.colorMatch ? color.chroma : neutral.chroma;
  const variantOffset = neutralVariant.chroma - neutral.chroma;

  return {
    neutral: TonalPalette.fromHueAndChroma(color.hue, chroma),
    'neutral-variant': TonalPalette.fromHueAndChroma(color.hue, chroma + variantOffset),
  };
}
