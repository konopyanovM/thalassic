import { isSemanticColor } from './is-semantic-color';

describe('isSemanticColor', () => {
  it('accepts semantic color tokens', () => {
    expect(isSemanticColor('primary')).toBe(true);
    expect(isSemanticColor('danger')).toBe(true);
  });

  it('rejects raw CSS colors', () => {
    expect(isSemanticColor('#7c3aed')).toBe(false);
    expect(isSemanticColor('var(--color-primary)')).toBe(false);
    expect(isSemanticColor('rebeccapurple')).toBe(false);
  });
});
