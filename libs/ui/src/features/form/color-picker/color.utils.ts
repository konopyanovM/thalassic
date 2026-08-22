import { Hsla, Hsva, Rgba } from './color-picker.types';

const HEX_PATTERN = /^([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/;
const RGB_PATTERN = /^rgba?\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*(?:,\s*(-?[\d.]+)\s*)?\)$/;
const HSL_PATTERN = /^hsla?\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)%\s*,\s*(-?[\d.]+)%\s*(?:,\s*(-?[\d.]+)\s*)?\)$/;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function channelToHex(channel: number): string {
  return Math.round(clamp(channel, 0, 255)).toString(16).padStart(2, '0');
}

/**
 * Parses a color from hex (`#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, hash
 * optional), `rgb()`/`rgba()`, or `hsl()`/`hsla()` notation. Out-of-range
 * channels are clamped; unrecognized input yields null.
 */
export function parseColor(text: string): Rgba | null {
  const trimmed = text.trim().toLowerCase();
  if (!trimmed) return null;

  const hex = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;
  if (HEX_PATTERN.test(hex)) return parseHex(hex);

  const rgbMatch = trimmed.match(RGB_PATTERN);
  if (rgbMatch) {
    return {
      red: clamp(Number(rgbMatch[1]), 0, 255),
      green: clamp(Number(rgbMatch[2]), 0, 255),
      blue: clamp(Number(rgbMatch[3]), 0, 255),
      alpha: rgbMatch[4] === undefined ? 1 : clamp(Number(rgbMatch[4]), 0, 1),
    };
  }

  const hslMatch = trimmed.match(HSL_PATTERN);
  if (hslMatch) {
    const hsl: Hsla = {
      hue: clamp(Number(hslMatch[1]), 0, 360),
      saturation: clamp(Number(hslMatch[2]), 0, 100) / 100,
      lightness: clamp(Number(hslMatch[3]), 0, 100) / 100,
      alpha: hslMatch[4] === undefined ? 1 : clamp(Number(hslMatch[4]), 0, 1),
    };
    return hsvToRgb(hslToHsv(hsl));
  }

  return null;
}

function parseHex(hex: string): Rgba {
  const long =
    hex.length <= 4
      ? hex
          .split('')
          .map(digit => digit + digit)
          .join('')
      : hex;

  return {
    red: parseInt(long.slice(0, 2), 16),
    green: parseInt(long.slice(2, 4), 16),
    blue: parseInt(long.slice(4, 6), 16),
    alpha: long.length === 8 ? parseInt(long.slice(6, 8), 16) / 255 : 1,
  };
}

/** Formats a color as lowercase `#rrggbb`, or `#rrggbbaa` when `includeAlpha`. */
export function rgbaToHex(rgba: Rgba, includeAlpha = false): string {
  const base = `#${channelToHex(rgba.red)}${channelToHex(rgba.green)}${channelToHex(rgba.blue)}`;
  if (!includeAlpha) return base;
  return `${base}${channelToHex(clamp(rgba.alpha, 0, 1) * 255)}`;
}

export function rgbToHsv(rgba: Rgba): Hsva {
  const red = clamp(rgba.red, 0, 255) / 255;
  const green = clamp(rgba.green, 0, 255) / 255;
  const blue = clamp(rgba.blue, 0, 255) / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let hue = 0;
  if (delta > 0) {
    if (max === red) hue = 60 * (((green - blue) / delta) % 6);
    else if (max === green) hue = 60 * ((blue - red) / delta + 2);
    else hue = 60 * ((red - green) / delta + 4);
  }
  if (hue < 0) hue += 360;

  return {
    hue,
    saturation: max === 0 ? 0 : delta / max,
    value: max,
    alpha: rgba.alpha,
  };
}

export function hsvToRgb(hsva: Hsva): Rgba {
  const hue = ((hsva.hue % 360) + 360) % 360;
  const saturation = clamp(hsva.saturation, 0, 1);
  const value = clamp(hsva.value, 0, 1);

  const chroma = value * saturation;
  const secondary = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const offset = value - chroma;

  let red = 0;
  let green = 0;
  let blue = 0;
  if (hue < 60) [red, green, blue] = [chroma, secondary, 0];
  else if (hue < 120) [red, green, blue] = [secondary, chroma, 0];
  else if (hue < 180) [red, green, blue] = [0, chroma, secondary];
  else if (hue < 240) [red, green, blue] = [0, secondary, chroma];
  else if (hue < 300) [red, green, blue] = [secondary, 0, chroma];
  else [red, green, blue] = [chroma, 0, secondary];

  return {
    red: Math.round((red + offset) * 255),
    green: Math.round((green + offset) * 255),
    blue: Math.round((blue + offset) * 255),
    alpha: hsva.alpha,
  };
}

export function hsvToHsl(hsva: Hsva): Hsla {
  const lightness = hsva.value * (1 - hsva.saturation / 2);
  const saturation =
    lightness === 0 || lightness === 1 ? 0 : (hsva.value - lightness) / Math.min(lightness, 1 - lightness);

  return { hue: hsva.hue, saturation, lightness, alpha: hsva.alpha };
}

export function hslToHsv(hsla: Hsla): Hsva {
  const value = hsla.lightness + hsla.saturation * Math.min(hsla.lightness, 1 - hsla.lightness);
  const saturation = value === 0 ? 0 : 2 * (1 - hsla.lightness / value);

  return { hue: hsla.hue, saturation, value, alpha: hsla.alpha };
}

// Luminance above which a black foreground reads better than a white one.
// Deliberately far above the WCAG contrast tie point (≈ 0.179): by raw
// contrast ratio black wins on almost every mid-tone saturated color, yet a
// white mark is what reads as correct there — so black is reserved for
// genuinely light backgrounds (yellows, pastels, near-whites).
const BLACK_FOREGROUND_LUMINANCE = 0.45;

/**
 * Foreground — black or white — that reads best against the given color:
 * white on dark and mid-tone saturated colors, black on light ones.
 */
export function contrastForeground(rgba: Rgba): string {
  return relativeLuminance(rgba) > BLACK_FOREGROUND_LUMINANCE ? '#000000' : '#ffffff';
}

/** WCAG relative luminance (0–1) of a color; alpha is ignored. */
export function relativeLuminance(rgba: Rgba): number {
  const [red, green, blue] = [rgba.red, rgba.green, rgba.blue].map(channel => {
    const scaled = clamp(channel, 0, 255) / 255;
    return scaled <= 0.03928 ? scaled / 12.92 : Math.pow((scaled + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/** Formats as `rgb(r, g, b)`, or `rgba(r, g, b, a)` when translucent. */
export function formatRgb(rgba: Rgba): string {
  const red = Math.round(rgba.red);
  const green = Math.round(rgba.green);
  const blue = Math.round(rgba.blue);
  if (rgba.alpha >= 1) return `rgb(${red}, ${green}, ${blue})`;
  return `rgba(${red}, ${green}, ${blue}, ${roundAlpha(rgba.alpha)})`;
}

/** Formats as `hsl(h, s%, l%)`, or `hsla(h, s%, l%, a)` when translucent. */
export function formatHsl(hsla: Hsla): string {
  const hue = Math.round(hsla.hue);
  const saturation = Math.round(hsla.saturation * 100);
  const lightness = Math.round(hsla.lightness * 100);
  if (hsla.alpha >= 1) return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  return `hsla(${hue}, ${saturation}%, ${lightness}%, ${roundAlpha(hsla.alpha)})`;
}

function roundAlpha(alpha: number): number {
  return Math.round(alpha * 100) / 100;
}
