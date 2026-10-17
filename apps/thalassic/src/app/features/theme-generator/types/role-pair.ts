import { colorRole } from './color-role';
import { contrastRequirement } from './contrast-requirement';

/** A foreground role drawn on a background role, checked against a contrast requirement. */
export interface RolePair {
  /** Role painted behind. */
  background: colorRole;
  /** Role painted on top — text, an icon, or a boundary. */
  foreground: colorRole;
  /** Contrast the pair is held to. */
  requirement: contrastRequirement;
}
