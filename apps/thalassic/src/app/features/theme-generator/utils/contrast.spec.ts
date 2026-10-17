import { contrastRatio } from './contrast-ratio';
import { contrastVerdictOf } from './contrast-verdict';

describe('contrastRatio', () => {
  it('spans 1 to 21', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1, 5);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#00658d', '#ffffff')).toBeCloseTo(contrastRatio('#ffffff', '#00658d'), 10);
  });

  it('matches the WCAG reference value for #777 on white', () => {
    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
  });
});

describe('contrastVerdictOf', () => {
  it('grades text against AA and AAA', () => {
    expect(contrastVerdictOf(7.2, 'text')).toBe('AAA');
    expect(contrastVerdictOf(5, 'text')).toBe('AA');
    expect(contrastVerdictOf(4.4, 'text')).toBe('fail');
  });

  it('grades non-text against 3:1 only', () => {
    expect(contrastVerdictOf(12, 'non-text')).toBe('AA');
    expect(contrastVerdictOf(2.9, 'non-text')).toBe('fail');
  });

  it('never grades a decorative pair', () => {
    expect(contrastVerdictOf(1.2, 'decorative')).toBe('none');
  });
});
