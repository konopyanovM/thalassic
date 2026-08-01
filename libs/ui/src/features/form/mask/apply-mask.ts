import { MASK_TOKENS } from './mask.constants';

export interface MaskResult {
  maskedValue: string;
  unmaskedValue: string;
  caret: number;
}

/**
 * Formats `rawText` against a token `pattern` (`0` digit, `A` letter, `*`
 * alphanumeric; every other character is a literal) and computes where the caret
 * should land. `rawText` may itself already contain literals (the previously
 * masked value plus the latest keystroke) — literals are absorbed and any
 * character that does not satisfy the current slot's token is skipped.
 *
 * A separator is inserted only once the value character that follows it arrives,
 * so an in-progress value never shows a dangling separator. The caret is derived
 * by formatting only the portion of `rawText` before `caretPosition`.
 */
export function applyMask(pattern: string, rawText: string, caretPosition: number): MaskResult {
  const full = conform(pattern, rawText);
  const prefix = conform(pattern, rawText.slice(0, caretPosition));

  return {
    maskedValue: full.masked,
    unmaskedValue: full.unmasked,
    caret: prefix.masked.length,
  };
}

/** Walks `pattern` and `rawText` in parallel, emitting the masked and unmasked strings. */
function conform(pattern: string, rawText: string): { masked: string; unmasked: string } {
  let masked = '';
  let unmasked = '';
  let pendingLiterals = '';
  let rawIndex = 0;

  for (const patternChar of pattern) {
    const token = MASK_TOKENS[patternChar];

    if (token) {
      // Skip raw characters that don't satisfy this slot's token.
      while (rawIndex < rawText.length && !token.test(rawText[rawIndex])) rawIndex++;
      if (rawIndex >= rawText.length) break;

      // Flush literals only once a value character actually fills the slot after
      // them, so a rejected character never leaves a dangling separator behind.
      masked += pendingLiterals + rawText[rawIndex];
      pendingLiterals = '';
      unmasked += rawText[rawIndex];
      rawIndex++;
    } else if (rawIndex < rawText.length && rawText[rawIndex] === patternChar) {
      // Literal the user typed explicitly — absorb it rather than doubling it.
      masked += pendingLiterals + patternChar;
      pendingLiterals = '';
      rawIndex++;
    } else if (rawIndex < rawText.length) {
      // Hold the literal until the value character that follows it arrives.
      pendingLiterals += patternChar;
    } else {
      break;
    }
  }

  return { masked, unmasked };
}
