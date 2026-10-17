import { colorSpec } from './color-spec';
import { RoleToneOverrides } from './role-tone-overrides';
import { schemeVariant } from './scheme-variant';

/** Everything a generated theme is derived from. */
export interface ThemeSource {
  /** Seed color as `#rrggbb`; every palette without an override is derived from it. */
  primary: string;
  /** `#rrggbb` override for the secondary palette, or `null` to derive it from the seed. */
  secondary: string | null;
  /** `#rrggbb` override for the tertiary palette, or `null` to derive it from the seed. */
  tertiary: string | null;
  /** `#rrggbb` override setting the hue of both neutral palettes, or `null` to derive them from the seed. */
  neutral: string | null;
  /** Scheme rule deriving the palettes that have no override. */
  variant: schemeVariant;
  /** Color spec revision the variant follows. */
  spec: colorSpec;
  /**
   * Whether an input color keeps its own chroma. Off, an input only contributes
   * its hue and the variant decides how colorful the palette is.
   */
  colorMatch: boolean;
  /** Tones replacing the default each color role reads from its palette, per mode. */
  roleTones: RoleToneOverrides;
}
