import { decimalPlaces } from './decimal-places';

describe('decimalPlaces', () => {
  it('counts the digits after the point', () => {
    expect(decimalPlaces(5)).toBe(0);
    expect(decimalPlaces(0.5)).toBe(1);
    expect(decimalPlaces(-2.25)).toBe(2);
  });

  it('reads exponent notation as the number it stands for', () => {
    expect(decimalPlaces(1e-7)).toBe(7);
    expect(decimalPlaces(1.5e-7)).toBe(8);
    expect(decimalPlaces(1e21)).toBe(0);
  });
});
