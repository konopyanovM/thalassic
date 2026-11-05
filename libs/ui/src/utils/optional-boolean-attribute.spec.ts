import { optionalBooleanAttribute } from './optional-boolean-attribute';

describe('optionalBooleanAttribute', () => {
  it('keeps an unwritten input unset', () => {
    expect(optionalBooleanAttribute(undefined)).toBeUndefined();
  });

  it('reads written values as booleanAttribute does', () => {
    expect(optionalBooleanAttribute('')).toBe(true);
    expect(optionalBooleanAttribute('true')).toBe(true);
    expect(optionalBooleanAttribute(true)).toBe(true);
    expect(optionalBooleanAttribute(false)).toBe(false);
    expect(optionalBooleanAttribute('false')).toBe(false);
    expect(optionalBooleanAttribute(null)).toBe(false);
  });
});
