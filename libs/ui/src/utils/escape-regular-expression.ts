/** Escapes RegExp metacharacters so the string matches literally inside a pattern. */
export const escapeRegularExpression = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
