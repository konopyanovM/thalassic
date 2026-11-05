import { booleanAttribute } from '@angular/core';

/**
 * `booleanAttribute` for an input whose absence means something: an unwritten
 * input stays `undefined` instead of collapsing to `false`, so the component can
 * fall back to a configured default only where the template said nothing.
 *
 * @example
 * optionalBooleanAttribute(undefined); // undefined — not written
 * optionalBooleanAttribute('');        // true — the bare attribute
 * optionalBooleanAttribute(false);     // false — an explicit binding
 */
export const optionalBooleanAttribute = (value: unknown): boolean | undefined => {
  if (value === undefined) return undefined;
  return booleanAttribute(value);
};
