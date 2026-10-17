import { colorRole } from './color-role';
import { RolePairView } from './role-pair-view';

/** A role group resolved against one mode's colors. */
export interface RoleGroupView {
  /** Heading of the group. */
  title: string;
  /** Roles whose tones the group edits, in display order. */
  roles: colorRole[];
  /** Resolved pairs in display order. */
  pairs: RolePairView[];
}
