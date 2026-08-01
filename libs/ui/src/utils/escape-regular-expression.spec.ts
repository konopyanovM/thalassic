import { escapeRegularExpression } from './escape-regular-expression';

describe('escapeRegularExpression', () => {
  it('leaves plain text untouched', () => {
    expect(escapeRegularExpression('hello world')).toBe('hello world');
  });

  it('escapes RegExp metacharacters', () => {
    expect(escapeRegularExpression('a.b*c?')).toBe('a\\.b\\*c\\?');
  });

  it('produces a pattern that matches the original string literally', () => {
    const value = '(1+1)^2 = [4]?';
    const pattern = new RegExp(escapeRegularExpression(value));
    expect(pattern.test(value)).toBe(true);
  });
});
