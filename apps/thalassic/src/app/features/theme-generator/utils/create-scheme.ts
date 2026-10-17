import {
  DynamicScheme,
  Hct,
  SchemeContent,
  SchemeExpressive,
  SchemeFidelity,
  SchemeFruitSalad,
  SchemeMonochrome,
  SchemeNeutral,
  SchemeRainbow,
  SchemeTonalSpot,
  SchemeVibrant,
} from '@material/material-color-utilities';
import { colorSpec, schemeVariant } from '../types';

/**
 * Builds the dynamic scheme of a variant around a seed, following a spec
 * revision. Only its palettes are read. The theme keeps a single palette set
 * for both modes, so the scheme is built for light at standard contrast and
 * dark roles read the same palettes. Under 2021 that is exactly the spec;
 * under 2025, where some variants derive less chromatic palettes for dark,
 * dark roles keep the light palettes' chroma.
 */
export function createScheme(seed: Hct, variant: schemeVariant, spec: colorSpec): DynamicScheme {
  switch (variant) {
    case 'tonal-spot':
      return new SchemeTonalSpot(seed, false, 0, spec);
    case 'neutral':
      return new SchemeNeutral(seed, false, 0, spec);
    case 'vibrant':
      return new SchemeVibrant(seed, false, 0, spec);
    case 'expressive':
      return new SchemeExpressive(seed, false, 0, spec);
    case 'fidelity':
      return new SchemeFidelity(seed, false, 0, spec);
    case 'content':
      return new SchemeContent(seed, false, 0, spec);
    case 'monochrome':
      return new SchemeMonochrome(seed, false, 0, spec);
    case 'rainbow':
      return new SchemeRainbow(seed, false, 0, spec);
    case 'fruit-salad':
      return new SchemeFruitSalad(seed, false, 0, spec);
  }
}
