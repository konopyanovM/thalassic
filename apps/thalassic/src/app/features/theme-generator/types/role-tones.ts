import { colorRole } from './color-role';

/** HCT tone, 0 (black) to 100 (white), each color role reads from its palette in one mode. */
export type RoleTones = Record<colorRole, number>;
