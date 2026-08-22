import {
  contrastForeground,
  formatHsl,
  formatRgb,
  hslToHsv,
  hsvToHsl,
  hsvToRgb,
  parseColor,
  rgbToHsv,
  rgbaToHex,
} from './color.utils';

describe('color.utils', () => {
  describe('parseColor', () => {
    it('parses 6-digit hex', () => {
      expect(parseColor('#3b82f6')).toEqual({ red: 59, green: 130, blue: 246, alpha: 1 });
    });

    it('parses 8-digit hex with alpha', () => {
      expect(parseColor('#3b82f680')).toEqual({
        red: 59,
        green: 130,
        blue: 246,
        alpha: 128 / 255,
      });
    });

    it('parses 3-digit shorthand hex', () => {
      expect(parseColor('#f80')).toEqual({ red: 255, green: 136, blue: 0, alpha: 1 });
    });

    it('parses 4-digit shorthand hex with alpha', () => {
      expect(parseColor('#f808')).toEqual({ red: 255, green: 136, blue: 0, alpha: 136 / 255 });
    });

    it('parses hex without a leading hash and with surrounding whitespace', () => {
      expect(parseColor('  3b82f6 ')).toEqual({ red: 59, green: 130, blue: 246, alpha: 1 });
    });

    it('parses rgb() and rgba() notation', () => {
      expect(parseColor('rgb(59, 130, 246)')).toEqual({ red: 59, green: 130, blue: 246, alpha: 1 });
      expect(parseColor('rgba(59, 130, 246, 0.5)')).toEqual({
        red: 59,
        green: 130,
        blue: 246,
        alpha: 0.5,
      });
    });

    it('parses hsl() and hsla() notation', () => {
      expect(parseColor('hsl(0, 100%, 50%)')).toEqual({ red: 255, green: 0, blue: 0, alpha: 1 });
      expect(parseColor('hsla(120, 100%, 50%, 0.25)')).toEqual({
        red: 0,
        green: 255,
        blue: 0,
        alpha: 0.25,
      });
    });

    it('clamps out-of-range channels', () => {
      expect(parseColor('rgb(300, -20, 128)')).toEqual({ red: 255, green: 0, blue: 128, alpha: 1 });
      expect(parseColor('rgba(0, 0, 0, 3)')).toEqual({ red: 0, green: 0, blue: 0, alpha: 1 });
    });

    it('returns null for invalid input', () => {
      expect(parseColor('')).toBeNull();
      expect(parseColor('not a color')).toBeNull();
      expect(parseColor('#12345')).toBeNull();
      expect(parseColor('rgb(1, 2)')).toBeNull();
    });
  });

  describe('rgbaToHex', () => {
    it('formats a lowercase 6-digit hex', () => {
      expect(rgbaToHex({ red: 59, green: 130, blue: 246, alpha: 1 })).toBe('#3b82f6');
    });

    it('formats an 8-digit hex when alpha is included', () => {
      expect(rgbaToHex({ red: 255, green: 0, blue: 0, alpha: 0.5 }, true)).toBe('#ff000080');
    });

    it('omits the alpha digits when alpha is excluded', () => {
      expect(rgbaToHex({ red: 255, green: 0, blue: 0, alpha: 0.5 })).toBe('#ff0000');
    });

    it('rounds fractional channels', () => {
      expect(rgbaToHex({ red: 12.6, green: 0.4, blue: 255, alpha: 1 })).toBe('#0d00ff');
    });
  });

  describe('rgbToHsv / hsvToRgb', () => {
    it('converts pure red', () => {
      expect(rgbToHsv({ red: 255, green: 0, blue: 0, alpha: 1 })).toEqual({
        hue: 0,
        saturation: 1,
        value: 1,
        alpha: 1,
      });
    });

    it('converts gray with zero saturation', () => {
      const hsv = rgbToHsv({ red: 128, green: 128, blue: 128, alpha: 1 });
      expect(hsv.saturation).toBe(0);
      expect(hsv.value).toBeCloseTo(128 / 255);
    });

    it('round-trips through hsvToRgb', () => {
      const original = { red: 59, green: 130, blue: 246, alpha: 0.5 };
      const roundTripped = hsvToRgb(rgbToHsv(original));
      expect(roundTripped.red).toBeCloseTo(original.red, 0);
      expect(roundTripped.green).toBeCloseTo(original.green, 0);
      expect(roundTripped.blue).toBeCloseTo(original.blue, 0);
      expect(roundTripped.alpha).toBe(original.alpha);
    });

    it('converts full-value hue extremes', () => {
      expect(hsvToRgb({ hue: 120, saturation: 1, value: 1, alpha: 1 })).toEqual({
        red: 0,
        green: 255,
        blue: 0,
        alpha: 1,
      });
      expect(hsvToRgb({ hue: 240, saturation: 1, value: 1, alpha: 1 })).toEqual({
        red: 0,
        green: 0,
        blue: 255,
        alpha: 1,
      });
    });
  });

  describe('hsvToHsl / hslToHsv', () => {
    it('converts full-saturation HSV to HSL', () => {
      expect(hsvToHsl({ hue: 0, saturation: 1, value: 1, alpha: 1 })).toEqual({
        hue: 0,
        saturation: 1,
        lightness: 0.5,
        alpha: 1,
      });
    });

    it('round-trips through hslToHsv', () => {
      const original = { hue: 210, saturation: 0.7, value: 0.9, alpha: 0.5 };
      const roundTripped = hslToHsv(hsvToHsl(original));
      expect(roundTripped.hue).toBeCloseTo(original.hue);
      expect(roundTripped.saturation).toBeCloseTo(original.saturation);
      expect(roundTripped.value).toBeCloseTo(original.value);
      expect(roundTripped.alpha).toBe(original.alpha);
    });
  });

  describe('contrastForeground', () => {
    it('chooses white on dark colors', () => {
      expect(contrastForeground({ red: 0, green: 0, blue: 0, alpha: 1 })).toBe('#ffffff');
      expect(contrastForeground({ red: 30, green: 30, blue: 160, alpha: 1 })).toBe('#ffffff');
    });

    it('chooses white on mid-tone saturated colors', () => {
      expect(contrastForeground({ red: 59, green: 130, blue: 246, alpha: 1 })).toBe('#ffffff');
      expect(contrastForeground({ red: 239, green: 68, blue: 68, alpha: 1 })).toBe('#ffffff');
      expect(contrastForeground({ red: 34, green: 197, blue: 94, alpha: 1 })).toBe('#ffffff');
    });

    it('chooses black on light colors', () => {
      expect(contrastForeground({ red: 255, green: 255, blue: 255, alpha: 1 })).toBe('#000000');
      expect(contrastForeground({ red: 234, green: 179, blue: 8, alpha: 1 })).toBe('#000000');
    });
  });

  describe('formatRgb', () => {
    it('formats opaque colors as rgb()', () => {
      expect(formatRgb({ red: 59, green: 130, blue: 246, alpha: 1 })).toBe('rgb(59, 130, 246)');
    });

    it('formats translucent colors as rgba()', () => {
      expect(formatRgb({ red: 59, green: 130, blue: 246, alpha: 0.5 })).toBe(
        'rgba(59, 130, 246, 0.5)',
      );
    });
  });

  describe('formatHsl', () => {
    it('formats opaque colors as hsl()', () => {
      expect(formatHsl({ hue: 0, saturation: 1, lightness: 0.5, alpha: 1 })).toBe(
        'hsl(0, 100%, 50%)',
      );
    });

    it('formats translucent colors as hsla()', () => {
      expect(formatHsl({ hue: 210, saturation: 0.5, lightness: 0.4, alpha: 0.25 })).toBe(
        'hsla(210, 50%, 40%, 0.25)',
      );
    });
  });
});
