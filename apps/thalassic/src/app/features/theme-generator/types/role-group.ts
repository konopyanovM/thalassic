import { colorRole } from './color-role';
import { RolePair } from './role-pair';

/** A titled run of roles shown together: their tones, then the pairs checked for contrast. */
export interface RoleGroup {
  /** Heading of the group. */
  title: string;
  /** Roles whose tones the group edits, in display order. */
  roles: colorRole[];
  /** Pairs in display order. */
  pairs: RolePair[];
}
