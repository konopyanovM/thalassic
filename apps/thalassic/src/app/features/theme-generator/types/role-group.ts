import { RolePair } from './role-pair';

/** A titled run of role pairs shown together. */
export interface RoleGroup {
  /** Heading of the group. */
  title: string;
  /** Pairs in display order. */
  pairs: RolePair[];
}
