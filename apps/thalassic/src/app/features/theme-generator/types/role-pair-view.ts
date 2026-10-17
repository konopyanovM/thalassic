import { contrastVerdict } from './contrast-verdict';
import { RolePair } from './role-pair';

/** A role pair resolved against one mode's colors, with its measured contrast. */
export interface RolePairView extends RolePair {
  /** Background role's color as `#rrggbb`. */
  backgroundHex: string;
  /** Foreground role's color as `#rrggbb`. */
  foregroundHex: string;
  /** WCAG contrast ratio of the two colors. */
  ratio: number;
  /** Grade the ratio earns for the pair's requirement. */
  verdict: contrastVerdict;
}
