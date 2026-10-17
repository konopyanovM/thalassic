import { colorRole, ThemeRoles } from '../types';

/** Writes roles as `--color-<role>: <hex>;` custom-property declarations, one per line. */
export function rolesToDeclarations(roles: ThemeRoles): string {
  return (Object.keys(roles) as colorRole[])
    .map(role => `--color-${role}: ${roles[role]};`)
    .join('\n');
}
