import { RolePairView } from './role-pair-view';

/** A role group resolved against one mode's colors. */
export interface RoleGroupView {
  /** Heading of the group. */
  title: string;
  /** Resolved pairs in display order. */
  pairs: RolePairView[];
}
