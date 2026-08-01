// Token characters recognised inside a mask pattern; every other character is a
// literal rendered verbatim. Each token maps to the RegExp a raw character must
// satisfy to fill that slot.
export const MASK_TOKENS: Readonly<Record<string, RegExp>> = {
  '0': /\d/, // digit
  A: /[a-zA-Z]/, // letter
  '*': /[a-zA-Z0-9]/, // alphanumeric
};
