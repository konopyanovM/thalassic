import { radius } from './radius';

/**
 * A border radius expressed as a theme scale token (`'md'`), a number of pixels (`8`),
 * or a raw CSS length (`'2rem'`). The `string & {}` member keeps token autocomplete
 * while still allowing any other CSS value.
 */
export type radiusValue = radius | number | (string & {});
