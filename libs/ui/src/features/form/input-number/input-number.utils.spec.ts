import { isPartialNumberText, parseNumberText } from './input-number.utils';

describe('isPartialNumberText', () => {
  const anyNumber = { allowsNegative: true, allowsFraction: true };

  it('accepts a number at every stage of typing it', () => {
    for (const text of ['', '-', '6', '62', '62.', '62.5', '-.5', '62,5']) {
      expect(isPartialNumberText(text, anyNumber)).toBe(true);
    }
  });

  it('refuses what no number can become', () => {
    for (const text of ['a', '6a', '1.2.3', '1,2.3', '--1', '1-', ' 1', '1e5']) {
      expect(isPartialNumberText(text, anyNumber)).toBe(false);
    }
  });

  it('refuses a sign where negatives are not allowed', () => {
    expect(isPartialNumberText('-1', { allowsNegative: false, allowsFraction: true })).toBe(false);
  });

  it('refuses a separator where only whole numbers are allowed', () => {
    expect(isPartialNumberText('1.', { allowsNegative: true, allowsFraction: false })).toBe(false);
    expect(isPartialNumberText('1,', { allowsNegative: true, allowsFraction: false })).toBe(false);
  });
});

describe('parseNumberText', () => {
  it('reads either separator as the decimal point', () => {
    expect(parseNumberText('62,5')).toBe(62.5);
    expect(parseNumberText('62.5')).toBe(62.5);
  });

  it('holds no number until a digit is typed', () => {
    expect(parseNumberText('')).toBeNull();
    expect(parseNumberText('-')).toBeNull();
    expect(parseNumberText(',')).toBeNull();
  });

  it('reads a number still being typed as far as it goes', () => {
    expect(parseNumberText('3.')).toBe(3);
    expect(parseNumberText('-.5')).toBe(-0.5);
  });
});
